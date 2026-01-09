import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

const SERVICES = {
  'magi-ac': 'https://magi-ac-398890937507.asia-northeast1.run.app',
  'magi-sys': 'https://magi-app-398890937507.asia-northeast1.run.app',
  'magi-stg': 'https://magi-stg-398890937507.asia-northeast1.run.app',
  'magi-executor': 'https://magi-executor-398890937507.asia-northeast1.run.app',
  'magi-decision': 'https://magi-decision-398890937507.asia-northeast1.run.app',
  'magi-moni': 'https://magi-moni-398890937507.asia-northeast1.run.app',
  'magi-risk': 'https://magi-risk-manager-398890937507.asia-northeast1.run.app',
};

// Get Identity Token from metadata server (Cloud Run recommended way)
async function getIdentityToken(targetAudience) {
  const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(targetAudience)}`;
  
  try {
    const response = await fetch(metadataUrl, {
      headers: { 'Metadata-Flavor': 'Google' }
    });
    
    if (!response.ok) {
      console.error(`[Auth] Metadata server error: ${response.status}`);
      return null;
    }
    
    const token = await response.text();
    console.log(`[Auth] Got token for ${targetAudience}, length: ${token.length}`);
    return `Bearer ${token}`;
  } catch (error) {
    console.error(`[Auth] Error: ${error.message}`);
    return null;
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'magi-ui', timestamp: new Date().toISOString() });
});

app.use('/api', async (req, res) => {
  const pathParts = req.path.split('/').filter(Boolean);
  const service = pathParts[0];
  const targetBase = SERVICES[service];
  
  if (!targetBase) {
    return res.status(404).json({ error: `Unknown service: ${service}` });
  }

  const targetPath = '/' + pathParts.slice(1).join('/');
  const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  const targetUrl = `${targetBase}${targetPath}${queryString}`;

  console.log(`[Proxy] ${req.method} -> ${targetUrl}`);

  try {
    const authHeader = await getIdentityToken(targetBase);
    
    const headers = { 'Content-Type': 'application/json' };
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`[Proxy] Auth added`);
    } else {
      console.log(`[Proxy] No auth!`);
    }

    const fetchOptions = { method: req.method, headers };
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    console.log(`[Proxy] Status: ${response.status}`);
    
    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      res.json(await response.json());
    } else {
      res.send(await response.text());
    }
  } catch (error) {
    console.error(`[Proxy Error] ${error.message}`);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`magi-ui running on port ${PORT}`);
});
