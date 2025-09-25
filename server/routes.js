import express from 'express';
import { callApi } from './apiClient.js';

const router = express.Router();

// ヘルス＆切り分け用
router.get('/status', async (_req, res) => {
  try {
    const data = await callApi('/api/status', { method: 'GET' });
    res.json(data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({ error: String(e) });
  }
});

// 比較エンドポイント（UI→API プロキシ）
router.post('/compare', async (req, res) => {
  try {
    const data = await callApi('/api/compare', { data: req.body });
    res.json(data);
  } catch (e) {
    res.status(e?.response?.status || 500).json({
      error: e?.message,
      detail: e?.response?.data
    });
  }
});

export default router;
