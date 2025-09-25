 import { GoogleAuth } from 'google-auth-library';
 import express from 'express';
 import path from 'path';
 import { fileURLToPath } from 'url';
+import helmet from 'helmet';
+import rateLimit from 'express-rate-limit';

 const app = express();
 const port = Number(process.env.PORT) || 8080;
 const host = '0.0.0.0';
+app.set('trust proxy', 1);

 // 環境変数の検証
 const targetAudience = process.env.API_URL;
-if (!targetAudience) {
+if (!targetAudience) {
   console.error('FATAL: API_URL environment variable is required');
   process.exit(1);
 }
+// 末尾スラ削除 & 形式検証（https://<service>-<hash>-<region>.run.app）
+const normalizedAudience = targetAudience.replace(/\/+$/, '');
+if (!/^https:\/\/.+\.run\.app$/.test(normalizedAudience)) {
+  console.error(`FATAL: API_URL must be a Cloud Run URL without path. got=${targetAudience}`);
+  process.exit(1);
+}

 // ミドルウェア設定
 app.use(express.json({ limit: '1mb' }));
+app.use(helmet({
+  crossOriginEmbedderPolicy: false, // SPAで困る場合があるため
+}));

 // ログミドルウェア（Google Cloud Logging準拠）
 app.use((req, res, next) => {
-  console.log(JSON.stringify({
-    timestamp: new Date().toISOString(),
-    method: req.method,
-    url: req.url,
-    userAgent: req.get('User-Agent'),
-    'logging.googleapis.com/trace': req.get('X-Cloud-Trace-Context')
-  }));
+  const traceCtx = req.get('X-Cloud-Trace-Context'); // TRACE_ID/SPAN_ID;o=1
+  const traceId = traceCtx ? traceCtx.split('/')[0] : undefined;
+  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
+  const log = {
+    severity: 'INFO',
+    message: 'request',
+    timestamp: new Date().toISOString(),
+    httpRequest: {
+      requestMethod: req.method,
+      requestUrl: req.originalUrl || req.url,
+      userAgent: req.get('User-Agent'),
+      remoteIp: req.ip,
+      referer: req.get('Referer'),
+      protocol: `HTTP/${req.httpVersion}`,
+    },
+  };
+  if (traceId && projectId) {
+    log['logging.googleapis.com/trace'] = `projects/${projectId}/traces/${traceId}`;
+  }
+  console.log(JSON.stringify(log));
   next();
 });

 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

 /* ---------- 内部API呼び出し（IDトークン認証） ---------- */
-async function callInternalApi(path, { method = 'POST', body, headers = {} } = {}) {
+async function callInternalApi(p, { method = 'POST', body, headers = {} } = {}) {
   try {
     const auth = new GoogleAuth();
-    const client = await auth.getIdTokenClient(targetAudience);
-    const url = `${targetAudience}${path}`;
+    const client = await auth.getIdTokenClient(normalizedAudience);
+    const url = `${normalizedAudience}${p}`;
     
     console.log(JSON.stringify({
       message: 'Calling internal API',
       url,
       method,
       timestamp: new Date().toISOString()
     }));
-    
-    const res = await client.request({
-      url,
-      method,
-      headers: { 'Content-Type': 'application/json', ...headers },
-      data: body,
-      timeout: 30000 // 30秒タイムアウト
-    });
-    
-    return res.data;
+    // 簡易リトライ（最大3回、指数バックオフ）
+    const max = 3;
+    let lastErr;
+    for (let i = 0; i < max; i++) {
+      try {
+        const res = await client.request({
+          url,
+          method,
+          headers: { 'Content-Type': 'application/json', ...headers },
+          data: body,
+          timeout: 30000
+        });
+        return res.data;
+      } catch (e) {
+        lastErr = e;
+        const status = e?.response?.status;
+        const retriable = !status || (status >= 500) || ['ECONNRESET','ETIMEDOUT'].includes(e.code);
+        if (!retriable || i === max - 1) break;
+        await new Promise(r => setTimeout(r, 300 * Math.pow(2, i))); // 300ms, 600ms, 1200ms
+      }
+    }
+    throw lastErr;
   } catch (error) {
     console.error(JSON.stringify({
       message: 'Internal API call failed',
       error: error.message,
-      url: `${targetAudience}${path}`,
+      url: `${normalizedAudience}${p}`,
       method,
       timestamp: new Date().toISOString()
     }));
     throw error;
   }
 }

 /* ---------------------- ヘルスチェック / ステータス ---------------------- */
@@
   res.json({
     service: 'magi-ui',
     version: process.env.VERSION || '1.0.0',
     region: process.env.GOOGLE_CLOUD_REGION || 'unknown',
-    api_url: targetAudience,
+    api_url: normalizedAudience,
     timestamp: new Date().toISOString()
   });
 });
@@
-app.post('/compare', createProxyEndpoint('/compare'));
-app.post('/consensus', createProxyEndpoint('/consensus'));
+const limiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false });
+app.post('/compare', limiter, createProxyEndpoint('/compare'));
+app.post('/consensus', limiter, createProxyEndpoint('/consensus'));

 /* ----------------------------- 静的配信 / 画面 ---------------------------- */
-app.use('/static', express.static(path.join(__dirname, 'public'), {
-  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
-}));
+app.use('/static', express.static(path.join(__dirname, 'public'), {
+  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
+  immutable: process.env.NODE_ENV === 'production'
+}));

@@
-const server = app.listen(port, host, () => {
+const server = app.listen(port, host, () => {
   console.log(JSON.stringify({
     message: 'Server started',
     service: 'magi-ui',
     host,
     port,
-    api_url: targetAudience,
+    api_url: normalizedAudience,
     timestamp: new Date().toISOString()
   }));
 });
+// Node18のデフォルトを短縮して疎通切替を早める（任意）
+server.keepAliveTimeout = 60000;   // 60s
+server.headersTimeout   = 65000;

 // Graceful shutdown
 process.on('SIGTERM', () => {
   console.log('SIGTERM received, shutting down gracefully');
   server.close(() => {
     console.log('Process terminated');
     process.exit(0);
   });
 });
+process.on('SIGINT', () => {
+  console.log('SIGINT received, shutting down gracefully');
+  server.close(() => process.exit(0));
+});
