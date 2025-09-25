// providers/anthropic.js
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';

async function chat({ system, content, max_tokens = 512, temperature = 0 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');

  const body = {
    model: MODEL,
    max_tokens,
    temperature,
    system: system || undefined,
    messages: [{ role: 'user', content }]
  };

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Anthropic API ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const text = Array.isArray(data.content)
    ? data.content.map(c => c.text || '').join('\n')
    : '';
  return { text, raw: data };
}

async function ping() {
  const r = await chat({ content: 'pong only', max_tokens: 8 });
  return { ok: true, sample: r.text.slice(0, 120) };
}

module.exports = { chat, ping };


