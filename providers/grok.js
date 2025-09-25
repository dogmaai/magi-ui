// providers/grok.js
const API_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = process.env.XAI_MODEL || 'grok-beta';

async function chat({ system, content, max_tokens = 512, temperature = 0 }) {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error('XAI_API_KEY not set');
  
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content });

  const body = {
    model: MODEL,
    messages,
    max_tokens,
    temperature
  };

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`xAI API ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content || '';
  return { text, raw: data };
}

async function ping() {
  const r = await chat({ content: 'pong only', max_tokens: 8 });
  return { ok: true, sample: r.text.slice(0, 120) };
}

module.exports = { chat, ping };
