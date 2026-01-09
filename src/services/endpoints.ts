// MAGI System API Endpoints (via proxy)
export const ENDPOINTS = {
  MAGI_AC: '/api/magi-ac',
  MAGI_SYS: '/api/magi-sys',
  MAGI_STG: '/api/magi-stg',
  MAGI_EXECUTOR: '/api/magi-executor',
  MAGI_DECISION: '/api/magi-decision',
  MAGI_MONI: '/api/magi-moni',
  MAGI_RISK: '/api/magi-risk',
};

export const API = {
  // Health checks
  HEALTH_AC: `${ENDPOINTS.MAGI_AC}/health`,
  HEALTH_SYS: `${ENDPOINTS.MAGI_SYS}/health`,
  HEALTH_STG: `${ENDPOINTS.MAGI_STG}/health`,
  HEALTH_EXECUTOR: `${ENDPOINTS.MAGI_EXECUTOR}/health`,
  HEALTH_DECISION: `${ENDPOINTS.MAGI_DECISION}/health`,
  HEALTH_MONI: `${ENDPOINTS.MAGI_MONI}/health`,
  HEALTH_RISK: `${ENDPOINTS.MAGI_RISK}/health`,

  // Stock Analysis (magi-ac) - /api/analyze is the correct endpoint
  ANALYZE: `${ENDPOINTS.MAGI_AC}/api/analyze`,
  TECHNICAL: `${ENDPOINTS.MAGI_AC}/api/technical`,
  HISTORY: `${ENDPOINTS.MAGI_AC}/api/history`,

  // Algo Prediction (magi-ac v7.0)
  ALGO_PATTERN: `${ENDPOINTS.MAGI_AC}/api/algo-pattern`,
  ALGO_PREDICTION_HISTORY: `${ENDPOINTS.MAGI_AC}/api/algo-prediction/history`,
  ALGO_PREDICTION_STATS: `${ENDPOINTS.MAGI_AC}/api/algo-prediction/stats`,

  // ISABEL Document Analysis (magi-ac)
  DOCUMENT_SENTIMENT: `${ENDPOINTS.MAGI_AC}/api/document/sentiment`,
  DOCUMENT_SUMMARIZE: `${ENDPOINTS.MAGI_AC}/api/document/summarize`,

  // 5AI Consensus (magi-sys)
  CONSENSUS: `${ENDPOINTS.MAGI_SYS}/api/consensus`,

  // Alpaca Trading (magi-ac)
  ALPACA_ACCOUNT: `${ENDPOINTS.MAGI_AC}/alpaca/account`,
  ALPACA_POSITIONS: `${ENDPOINTS.MAGI_AC}/alpaca/positions`,
  ALPACA_ORDERS: `${ENDPOINTS.MAGI_AC}/alpaca/orders`,
  ALPACA_ORDER: `${ENDPOINTS.MAGI_AC}/alpaca/order`,
  ALPACA_QUOTE: `${ENDPOINTS.MAGI_AC}/alpaca/quote`,
  ALPACA_TRADE: `${ENDPOINTS.MAGI_AC}/alpaca/trade`,
  ALPACA_BRACKET: `${ENDPOINTS.MAGI_AC}/alpaca/bracket`,
  ALPACA_PORTFOLIO_HISTORY: `${ENDPOINTS.MAGI_AC}/alpaca/portfolio-history`,

  // LLM Config (magi-stg)
  LLM_CONFIG: `${ENDPOINTS.MAGI_STG}/admin/llm-config`,

  // Specs (magi-stg)
  SPECS: `${ENDPOINTS.MAGI_STG}/public/specs`,
  CONSTITUTION: `${ENDPOINTS.MAGI_STG}/public/constitution`,

  // Auto Trading (magi-ac)
  AUTO_TRADE: `${ENDPOINTS.MAGI_AC}/api/auto-trade`,
  AUTO_TRADE_CONFIG: `${ENDPOINTS.MAGI_AC}/api/auto-trade/config`,

  // Risk Manager (magi-risk-manager)
  RISK_DASHBOARD: `${ENDPOINTS.MAGI_RISK}/api/dashboard`,
  RISK_VALIDATE: `${ENDPOINTS.MAGI_RISK}/api/validate`,
  RISK_CONFIG: `${ENDPOINTS.MAGI_RISK}/api/config`,
  KILLSWITCH_STATUS: `${ENDPOINTS.MAGI_RISK}/api/killswitch/status`,
  KILLSWITCH_ACTIVATE: `${ENDPOINTS.MAGI_RISK}/api/killswitch/activate`,
  KILLSWITCH_DEACTIVATE: `${ENDPOINTS.MAGI_RISK}/api/killswitch/deactivate`,
};