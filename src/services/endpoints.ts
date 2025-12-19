// MAGI System API Endpoints
export const ENDPOINTS = {
  MAGI_AC: 'https://magi-ac-398890937507.asia-northeast1.run.app',
  MAGI_SYS: 'https://magi-app-398890937507.run.app',
  MAGI_STG: 'https://magi-stg-398890937507.asia-northeast1.run.app',
  MAGI_DATA: 'https://magi-data-collector-398890937507.asia-northeast1.run.app',
  MAGI_EXECUTOR: 'https://magi-executor-398890937507.asia-northeast1.run.app'
};

export const API = {
  // Health checks
  HEALTH_AC: `${ENDPOINTS.MAGI_AC}/health`,
  HEALTH_SYS: `${ENDPOINTS.MAGI_SYS}/health`,
  HEALTH_STG: `${ENDPOINTS.MAGI_STG}/health`,
  HEALTH_EXECUTOR: `${ENDPOINTS.MAGI_EXECUTOR}/health`,

  // Stock Analysis (magi-ac)
  ANALYZE: `${ENDPOINTS.MAGI_AC}/api/analyze`,

  // ISABEL RAG (magi-ac)
  ISABEL_SEARCH: `${ENDPOINTS.MAGI_AC}/api/isabel/search-v2`,
  ISABEL_QA: `${ENDPOINTS.MAGI_AC}/api/isabel/qa`,
  ISABEL_HEALTH: `${ENDPOINTS.MAGI_AC}/api/isabel/health`,

  // 5AI Consensus (magi-sys)
  CONSENSUS: `${ENDPOINTS.MAGI_SYS}/api/consensus`,

  // Alpaca Trading (magi-ac)
  ALPACA_ACCOUNT: `${ENDPOINTS.MAGI_AC}/alpaca/account`,
  ALPACA_POSITIONS: `${ENDPOINTS.MAGI_AC}/alpaca/positions`,
  ALPACA_ORDERS: `${ENDPOINTS.MAGI_AC}/alpaca/orders`,
  ALPACA_ORDER: `${ENDPOINTS.MAGI_AC}/alpaca/order`,
  ALPACA_QUOTE: `${ENDPOINTS.MAGI_AC}/alpaca/quote`,

  // LLM Config (magi-stg)
  LLM_CONFIG: `${ENDPOINTS.MAGI_STG}/admin/llm-config`,
  LLM_CONFIG_HISTORY: `${ENDPOINTS.MAGI_STG}/admin/llm-config-history`,
};
