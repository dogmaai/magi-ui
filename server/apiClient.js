import { GoogleAuth } from 'google-auth-library';

const targetAudience = process.env.API_URL; // 例: https://magi-app-xxxx.a.run.app

export async function callApi(path, { method = 'POST', data, headers = {} } = {}) {
  if (!targetAudience) throw new Error('API_URL is undefined');
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(targetAudience); // ★UI実行SAのIDトークン
  const url = `${targetAudience}${path}`;
  const res = await client.request({
    url, method,
    headers: { 'Content-Type': 'application/json', ...headers },
    data
  });
  return res.data;
}
