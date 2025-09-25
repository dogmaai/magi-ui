<<<<<<< HEAD
console.log('[MAGI] Starting MAGI System initialization...');

const express = require('express');
const path = require('path');

// MAGI Providers
const OpenAIProvider = require('./magi-system/providers/openai.js');
const GeminiProvider = require('./magi-system/providers/gemini.js');
const AnthropicProvider = require('./magi-system/providers/anthropic.js');
const MAGIConsensus = require('./magi-system/consensus.js');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MAGI System initialization
let providers = [];
const consensus = new MAGIConsensus();

// Initialize providers with API keys
function initializeProviders() {
  try {
    if (process.env.OPENAI_API_KEY) {
      providers.push(new OpenAIProvider(process.env.OPENAI_API_KEY));
      console.log('[MAGI] Melchior (OpenAI) initialized');
    }
    
    if (process.env.GEMINI_API_KEY) {
      providers.push(new GeminiProvider(process.env.GEMINI_API_KEY));
      console.log('[MAGI] Balthasar (Gemini) initialized');
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      providers.push(new AnthropicProvider(process.env.ANTHROPIC_API_KEY));
      console.log('[MAGI] Caspar (Anthropic) initialized');
    }
    
    console.log(`[MAGI] ${providers.length} providers initialized`);
  } catch (error) {
    console.error('[MAGI] Provider initialization error:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'MAGI System',
    status: 'operational',
    providers: providers.length,
    message: 'Multi-Agent Generative Intelligence System Active'
  });
});

app.get('/status', (req, res) => {
  res.json({
    system: 'MAGI',
    status: 'operational',
    providers: providers.map(p => ({
      name: p.name,
      model: p.model,
      status: 'ready'
    })),
    consensus: 'semantic_majority',
    timestamp: new Date().toISOString()
  });
});

// MAGI Query endpoint - The core functionality
app.post('/compare', async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        system: 'MAGI'
      });
    }

    console.log(`[MAGI] Processing query: ${query.substring(0, 50)}...`);
    
    if (providers.length === 0) {
      return res.status(500).json({
        error: 'No providers available',
        system: 'MAGI'
      });
    }

    // Query all providers in parallel
    const startTime = Date.now();
    const promises = providers.map(provider => 
      provider.query(query).catch(error => ({
        provider: provider.name,
        response: `Error: ${error.message}`,
        confidence: 0.0,
        status: 'error'
      }))
    );
    
    const responses = await Promise.all(promises);
    const processingTime = Date.now() - startTime;
    
    console.log(`[MAGI] All providers responded in ${processingTime}ms`);
    
    // Perform consensus
    const consensusResult = await consensus.performConsensus(responses);
    
    res.json({
      system: 'MAGI',
      query: query,
      consensus: consensusResult.consensus,
      confidence: consensusResult.confidence,
      method: consensusResult.method,
      processingTime: processingTime,
      details: consensusResult.details,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[MAGI] Query processing error:', error);
    res.status(500).json({
      error: 'Internal MAGI system error',
      message: error.message,
      system: 'MAGI'
    });
  }
});

// Individual provider endpoints for debugging
app.post('/melchior', async (req, res) => {
  if (providers.length === 0 || !providers.find(p => p.name === 'Melchior')) {
    return res.status(404).json({ error: 'Melchior not available' });
  }
  
  const provider = providers.find(p => p.name === 'Melchior');
  const result = await provider.query(req.body.query);
  res.json(result);
});

app.post('/balthasar', async (req, res) => {
  if (providers.length === 0 || !providers.find(p => p.name === 'Balthasar')) {
    return res.status(404).json({ error: 'Balthasar not available' });
  }
  
  const provider = providers.find(p => p.name === 'Balthasar');
  const result = await provider.query(req.body.query);
  res.json(result);
});

app.post('/caspar', async (req, res) => {
  if (providers.length === 0 || !providers.find(p => p.name === 'Caspar')) {
    return res.status(404).json({ error: 'Caspar not available' });
  }
  
  const provider = providers.find(p => p.name === 'Caspar');
  const result = await provider.query(req.body.query);
  res.json(result);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    providers: providers.length,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Initialize providers and start server
initializeProviders();

app.listen(port, '0.0.0.0', () => {
  console.log(`[MAGI] System operational on port ${port}`);
  console.log(`[MAGI] Providers initialized: ${providers.length}`);
  console.log('[MAGI] Ready to process queries...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[MAGI] Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});
=======
const { GoogleAuth } = require('google-auth-library');
const express = require('express');
const path = require('path');
const morgan = require('morgan');

const app = express();
const port = Number(process.env.PORT) || 8080;
const host = '0.0.0.0';
app.use(express.json({ limit: '1mb' }));


/* ---------- magi-app 呼び出し（ID トークン） ---------- */
const targetAudience = process.env.API_URL; // 例: https://magi-app-398890937507.asia-northeast1.run.app
if (!targetAudience) {
  console.error('FATAL: API_URL is undefined'); process.exit(1);
}
async function callInternalApi(path, { method = 'POST', body, headers = {} } = {}) {
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(targetAudience);
  const url = `${targetAudience}${path}`;
  const res = await client.request({
    url, method,
    headers: { 'Content-Type': 'application/json', ...headers },
    data: body
  });
  return res.data;
}

/* ---------------------- ヘルスチェック / ステータス ---------------------- */
app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.get('/status', (_req, res) => {
  res.json({
    service: 'magi-ui',
    region: process.env.GOOGLE_CLOUD_REGION || 'unknown',
    api_url: targetAudience
  });
});

/* --------------------------- UI→API 委譲エンドポイント --------------------------- */
app.post('/compare', async (req, res) => {
  try {
    const data = await callInternalApi('/compare', { body: req.body });
    res.json(data);
  } catch (e) {
    const code = e?.response?.status || 500;
    res.status(code).json({ error: e?.message, detail: e?.response?.data });
  }
});

app.post('/consensus', async (req, res) => {
  try {
    const data = await callInternalApi('/consensus', { body: req.body });
    res.json(data);
  } catch (e) {
    const code = e?.response?.status || 500;
    res.status(code).json({ error: e?.message, detail: e?.response?.data });
  }
});

/* ----------------------------- 静的配信 / 画面 ---------------------------- */
app.use('/static', express.static(path.join(__dirname, 'public')));
app.get('/ui', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/', (_req, res) => res.redirect('/ui'));

/* -------------------------------- listen --------------------------------- */
process.on('uncaughtException', (e) => { console.error('uncaughtException', e); process.exit(1); });
process.on('unhandledRejection', (e) => { console.error('unhandledRejection', e); });
app.listen(port, host, () => console.log('magi-ui listening on :8080'));

// ======== [BEGIN] API proxy (UI -> magi-app with ID token) ========

if (!targetAudience) {
  console.error('[FATAL] API_URL is not set. Set env var API_URL to magi-app base URL.');
}

async function idTokenRequest(path, init = {}) {
  const auth = new GoogleAuth();
  // audience は magi-app の “完全 URL”（https から、末尾スラなし）
  const client = await auth.getIdTokenClient(targetAudience);
  return client.request({
    url: `${targetAudience}${path}`,
    method: init.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    data: init.body || undefined,
    timeout: 60000,
    validateStatus: () => true,
  });
}

// Express が未設定なら落ちるので、最低限のガード
try { if (typeof app?.use !== 'function') throw new Error('app is not defined'); } catch (e) {
  console.error('[FATAL] Express app is not initialized before proxy block.');
}

app.use(require('express').json());

app.get('/api/status', async (_req, res) => {
  try {
    const r = await idTokenRequest('/status');
    res.status(r.status).send(r.data);
  } catch (e) {
    console.error('status proxy error:', e?.response?.data || e?.message || e);
    res.status(502).send({ error: 'bad_gateway' });
  }
});

app.post('/api/compare', async (req, res) => {
  try {
    const r = await idTokenRequest('/compare', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    res.status(r.status).send(r.data);
  } catch (e) {
    console.error('compare proxy error:', e?.response?.data || e?.message || e);
    res.status(502).send({ error: 'bad_gateway' });
  }
});

app.post('/api/consensus', async (req, res) => {
  try {
    const r = await idTokenRequest('/consensus', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    res.status(r.status).send(r.data);
  } catch (e) {
    console.error('consensus proxy error:', e?.response?.data || e?.message || e);
    res.status(502).send({ error: 'bad_gateway' });
  }
});
// ======== [END] API proxy ========
>>>>>>> 5149a1ee4f083a1d7e6fea418c9669c939f794d6
