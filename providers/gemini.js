// providers/gemini.js
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

async function chat({ system, content, max_tokens = 512, temperature = 0 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  
  const prompt = system ? `${system}\n\n${content}` : content;
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: max_tokens
    }
  };

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Gemini API ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { text, raw: data };
}

async function ping() {
  const r = await chat({ content: 'pong only', max_tokens: 8 });
  return { ok: true, sample: r.text.slice(0, 120) };
}

module.exports = { chat, ping };
