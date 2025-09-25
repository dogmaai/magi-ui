const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// 全リクエストをログ
app.use((req, _res, next) => {
  console.log(`[req] ${req.method} ${req.url}`);
  next();
});

// 健康チェック: 複数エイリアス
const ok = (_req, res) => res.status(200).send('ok');
app.get('/healthz', ok);
app.get('/health', ok);
app.get('/_ah/health', ok); // 互換パス

app.get('/status', (_req, res) => {
  res.json({
    service: 'magi-app',
    secretsBound: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      XAI_API_KEY: !!process.env.XAI_API_KEY,
    },
    region: 'asia-northeast1'
  });
});

app.get('/', (_req, res) => res.type('text').send('magi-app up'));

app.listen(port, () => console.log(`listening on :${port}`));
