import { API } from './endpoints';

// Generic API call function
async function apiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();}


// Health check for all services
export async function checkServiceHealth(serviceName: string): Promise<{ status: string; latency: number }> {
  const healthUrls: Record<string, string> = {
    'magi-ac': API.HEALTH_AC,
    'magi-sys': API.HEALTH_SYS,
    'magi-stg': API.HEALTH_STG,
    'magi-executor': API.HEALTH_EXECUTOR,
    'magi-decision': API.HEALTH_DECISION,
    'magi-moni': API.HEALTH_MONI,
    'magi-risk': API.HEALTH_RISK,
  };

  const url = healthUrls[serviceName];
  if (!url) throw new Error('Unknown service: ' + serviceName);

  const start = Date.now();
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { status: 'online', latency: Date.now() - start };
    }
    return { status: 'degraded', latency: Date.now() - start };
  } catch {
    return { status: 'offline', latency: 0 };
  }
}

// Stock Analysis - uses /api/analyze (NOT /api/ai-consensus)
export async function analyzeStock(symbol: string) {
  return apiCall(API.ANALYZE, {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
}

// Technical Analysis
export async function getTechnical(symbol: string) {
  return apiCall(`${API.TECHNICAL}/${symbol}`);
}

// Analysis History
export async function getAnalysisHistory(symbol: string) {
  return apiCall(`${API.HISTORY}/${symbol}`);
}

// Algo Pattern Analysis (v7.0)
export async function getAlgoPattern(symbol: string) {
  return apiCall(`${API.ALGO_PATTERN}/${symbol}`);
}

// Algo Prediction Stats
export async function getAlgoPredictionStats(days: number = 30) {
  return apiCall(`${API.ALGO_PREDICTION_STATS}?days=${days}`);
}

// Document Sentiment (ISABEL)
export async function analyzeSentiment(symbol: string, text: string) {
  return apiCall(API.DOCUMENT_SENTIMENT, {
    method: 'POST',
    body: JSON.stringify({ symbol, text }),
  });
}

// Document Summarize (ISABEL)
export async function summarizeDocument(symbol: string, text: string) {
  return apiCall(API.DOCUMENT_SUMMARIZE, {
    method: 'POST',
    body: JSON.stringify({ symbol, text }),
  });
}

// 5AI Consensus (magi-sys)
export async function getConsensus(prompt: string, mode: string = 'integration') {
  return apiCall(API.CONSENSUS, {
    method: 'POST',
    body: JSON.stringify({ prompt, meta: { mode } }),
  });
}

// Alpaca Account
export async function getAlpacaAccount() {
  return apiCall(API.ALPACA_ACCOUNT);
}

// Alpaca Positions
export async function getAlpacaPositions() {
  return apiCall(API.ALPACA_POSITIONS);
}

// Alpaca Orders
export async function getAlpacaOrders() {
  return apiCall(API.ALPACA_ORDERS);
}

// Alpaca Quote
export async function getAlpacaQuote(symbol: string) {
  return apiCall(`${API.ALPACA_QUOTE}/${symbol}`);
}

// Place Trade Order
export async function placeTrade(symbol: string, qty: number, side: 'buy' | 'sell') {
  return apiCall(API.ALPACA_TRADE, {
    method: 'POST',
    body: JSON.stringify({ symbol, qty, side }),
  });
}

// Place Bracket Order
export async function placeBracketOrder(
  symbol: string,
  qty: number,
  side: 'buy' | 'sell',
  takeProfit: number,
  stopLoss: number
) {
  return apiCall(API.ALPACA_BRACKET, {
    method: 'POST',
    body: JSON.stringify({
      symbol,
      qty,
      side,
      take_profit: takeProfit,
      stop_loss: stopLoss,
    }),
  });
}

// LLM Config
export async function getLLMConfig() {
  return apiCall(API.LLM_CONFIG);
}

export async function updateLLMConfig(provider: string, config: { model?: string; temperature?: number }) {
  return apiCall(`${API.LLM_CONFIG}/${provider}`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

// Get System Specs
export async function getSpecs() {
  return apiCall(API.SPECS);
}

// Auto Trading
export async function getAutoTradeConfig() {
  return apiCall(API.AUTO_TRADE_CONFIG);
}

export async function runAutoTrade(symbols?: string[]) {
  return apiCall(API.AUTO_TRADE, {
    method: 'POST',
    body: JSON.stringify({ symbols }),
  });
}

// Get Constitution
export async function getConstitution() {
  return apiCall(API.CONSTITUTION);
}
// Risk Manager Dashboard
export async function getRiskDashboard() {
  return apiCall(API.RISK_DASHBOARD);
}

// Risk Validation
export async function validateTrade(symbol: string, qty: number, price: number, side: 'buy' | 'sell') {
  return apiCall(API.RISK_VALIDATE, {
    method: 'POST',
    body: JSON.stringify({ symbol, qty, price, side }),
  });
}

// Risk Config
export async function getRiskConfig() {
  return apiCall(API.RISK_CONFIG);
}

// Killswitch Status
export async function getKillswitchStatus() {
  return apiCall(API.KILLSWITCH_STATUS);
}

// Activate Killswitch
export async function activateKillswitch(level: number, reason: string) {
  return apiCall(API.KILLSWITCH_ACTIVATE, {
    method: 'POST',
    body: JSON.stringify({ level, reason }),
  });
}

// Deactivate Killswitch
export async function deactivateKillswitch(confirmCode: string) {
  return apiCall(API.KILLSWITCH_DEACTIVATE, {
    method: 'POST',
    body: JSON.stringify({ confirmCode }),
  });
}
// Portfolio History for Charts
export async function getPortfolioHistory(period: string = '1M', timeframe: string = '1D') {
  return apiCall(`${API.ALPACA_PORTFOLIO_HISTORY}?period=${period}&timeframe=${timeframe}`);
}
