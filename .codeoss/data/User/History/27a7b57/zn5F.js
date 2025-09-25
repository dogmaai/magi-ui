import express from 'express';

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json({ limit: '1mb' }));

/* --------------------------- 共通ユーティリティ --------------------------- */
async function httpPostJson(url, { headers = {}, body = {}, timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const started = Date.now();
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const latency = Date.now() - started;
    const text = await resp.text().catch(() => '');
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
    return { ok: resp.ok, status: resp.status, data, text, latency };
  } catch (e) {
    const msg = e?.message || String(e);
    const isAbort = msg.includes('abort') || msg.includes('aborted');
    return { ok: false, status: isAbort ? 504 : 500, data: null, text: msg, latency: null };
  } finally {
    clearTimeout(t);
  }
}

function normalizeText(x) {
  if (!x) return '';
  if (Array.isArray(x)) return x.filter(Boolean).join('\n');
  return String(x);
}

/* ------------------------------ ヘルス/状態 ------------------------------- */
app.get('/healthz', (_ ,res)=>res.status(200).send('ok'));

app.get('/status', (_ ,res) => {
  res.json({
    service: 'magi-app',
    region: process.env.GOOGLE_CLOUD_REGION || 'unknown',
    secretsBound: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      XAI_API_KEY: !!process.env.XAI_API_KEY
    }
  });
});

/* -------------------------------- /ask ----------------------------------- */
/* OpenAI 単体プロキシ（既存動作を維持） */
app.post('/ask', async (req, res) => {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is not set' });

    const { prompt, model, system, temperature = 0.2, timeout_ms = 30000, max_tokens } = req.body || {};
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt is required (string)' });

    const mdl = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const body = {
      model: mdl,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ],
      temperature
    };
    if (max_tokens) body.max_tokens = max_tokens;

    const r = await httpPostJson('https://api.openai.com/v1/chat/completions', {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body,
      timeoutMs: timeout_ms
    });

    if (!r.ok) {
      const msg = r.data?.error?.message || `upstream_error_${r.status}`;
      return res.status(r.status).json({ error: msg, upstream: r.data || r.text });
    }

    const out = r.data?.choices?.[0]?.message?.content ?? '';
    return res.json({ model: r.data?.model || mdl, output: out, usage: r.data?.usage || null });
  } catch (e) {
    const msg = e?.message || String(e);
    const isAbort = msg.includes('abort');
    return res.status(isAbort ? 504 : 500).json({ error: msg });
  }
});

/* ------------------------------ /compare --------------------------------- */
/**
 * リクエスト: {
 *   prompt: string,
 *   system?: string,
 *   providers?: ("openai"|"gemini"|"xai")[],  // 省略時は全て
 *   models?: { openai?: string, gemini?: string, xai?: string },
 *   temperature?: number,
 *   timeout_ms?: number,
 *   max_tokens?: number
 * }
 *
 * レスポンス: {
 *   prompt: string,
 *   started_at: string,
 *   finished_at: string,
 *   results: Array<{ provider, model, output, latency_ms, error? }>
 * }
 */
app.post('/compare', async (req, res) => {
  try {
    const {
      prompt, system,
      providers,
      models = {},
      temperature = 0.2,
      timeout_ms = 30000,
      max_tokens
    } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required (string)' });
    }
    const targetProviders = (providers && providers.length)
      ? providers
      : ['openai', 'gemini', 'xai'];

    const tasks = [];

    /* ---- OpenAI ---- */
    if (targetProviders.includes('openai')) {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        tasks.push(Promise.resolve({ provider: 'openai', model: models.openai || null, output: '', latency_ms: null, error: 'OPENAI_API_KEY not set' }));
      } else {
        const mdl = models.openai || process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const body = {
          model: mdl,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt }
          ],
          temperature
        };
        if (max_tokens) body.max_tokens = max_tokens;

        const started = Date.now();
        const p = httpPostJson('https://api.openai.com/v1/chat/completions', {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          body,
          timeoutMs: timeout_ms
        }).then(r => {
          if (!r.ok) {
            return { provider: 'openai', model: mdl, output: '', latency_ms: r.latency ?? (Date.now()-started), error: r.data?.error?.message || r.text || `upstream_error_${r.status}` };
          }
          const out = r.data?.choices?.[0]?.message?.content ?? '';
          return { provider: 'openai', model: r.data?.model || mdl, output: normalizeText(out), latency_ms: r.latency ?? (Date.now()-started) };
        });
        tasks.push(p);
      }
    }

    /* ---- Gemini ---- */
    if (targetProviders.includes('gemini')) {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        tasks.push(Promise.resolve({ provider: 'gemini', model: models.gemini || null, output: '', latency_ms: null, error: 'GEMINI_API_KEY not set' }));
      } else {
        const mdl = models.gemini || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        // v1beta generateContent
        const body = {
          model: mdl,
          contents: [
            ...(system ? [{ role: 'user', parts: [{ text: `SYSTEM: ${system}` }] }] : []),
            { role: 'user', parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature
          }
        };
        if (max_tokens) body.generationConfig.maxOutputTokens = max_tokens;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(mdl)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
        const started = Date.now();
        const p = httpPostJson(url, {
          headers: { },
          body,
          timeoutMs: timeout_ms
        }).then(r => {
          if (!r.ok) {
            const msg = r.data?.error?.message || r.text || `upstream_error_${r.status}`;
            return { provider: 'gemini', model: mdl, output: '', latency_ms: r.latency ?? (Date.now()-started), error: msg };
          }
          const parts = r.data?.candidates?.[0]?.content?.parts || [];
          const out = normalizeText(parts.map(p => p.text));
          return { provider: 'gemini', model: mdl, output: out, latency_ms: r.latency ?? (Date.now()-started) };
        });
        tasks.push(p);
      }
    }

    /* ---- xAI (Grok) ---- */
    if (targetProviders.includes('xai')) {
      const XAI_API_KEY = process.env.XAI_API_KEY;
      if (!XAI_API_KEY) {
        tasks.push(Promise.resolve({ provider: 'xai', model: models.xai || null, output: '', latency_ms: null, error: 'XAI_API_KEY not set' }));
      } else {
        const mdl = models.xai || process.env.XAI_MODEL || 'grok-2-latest';
        const body = {
          model: mdl,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt }
          ],
          temperature
        };
        if (max_tokens) body.max_tokens = max_tokens;

        // xAI は OpenAI 互換エンドポイントの /v1/chat/completions を想定
        const started = Date.now();
        const p = httpPostJson('https://api.x.ai/v1/chat/completions', {
          headers: { Authorization: `Bearer ${XAI_API_KEY}` },
          body,
          timeoutMs: timeout_ms
        }).then(r => {
          if (!r.ok) {
            const msg = r.data?.error?.message || r.text || `upstream_error_${r.status}`;
            return { provider: 'xai', model: mdl, output: '', latency_ms: r.latency ?? (Date.now()-started), error: msg };
          }
          const out = r.data?.choices?.[0]?.message?.content ?? '';
          return { provider: 'xai', model: r.data?.model || mdl, output: normalizeText(out), latency_ms: r.latency ?? (Date.now()-started) };
        });
        tasks.push(p);
      }
    }

    const started_at = new Date().toISOString();
    const settled = await Promise.allSettled(tasks);
    const results = settled.map(s => s.status === 'fulfilled' ? s.value : ({
      provider: 'unknown',
      model: null,
      output: '',
      latency_ms: null,
      error: s.reason?.message || String(s.reason)
    }));
    const finished_at = new Date().toISOString();

    // provider の順序を固定（openai, gemini, xai）
    const order = { openai: 1, gemini: 2, xai: 3 };
    results.sort((a, b) => (order[a.provider] ?? 99) - (order[b.provider] ?? 99));

    return res.json({ prompt, started_at, finished_at, results });
  } catch (e) {
    const msg = e?.message || String(e);
    return res.status(500).json({ error: msg });
  }
});

/* --------------------------------- root ---------------------------------- */
app.get('/', (_ ,res)=>res.type('text').send('magi-app up'));
app.listen(port, ()=>console.log(`listening on :${port}`));

// --- static UI ---
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/static', express.static(path.join(__dirname, 'public')));
app.get('/ui', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
