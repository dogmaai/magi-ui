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
    throw new Error('API Error: ' + response.status + ' ' + response.statusText);
  }

  return response.json();
}

// Health check for all services
export async function checkServiceHealth(serviceName: string): Promise<{ status: string; latency: number }> {
  const healthUrls: Record<string, string> = {
    'magi-ac': API.HEALTH_AC,
    'magi-sys': API.HEALTH_SYS,
    'magi-stg': API.HEALTH_STG,
    'magi-exec': API.HEALTH_EXECUTOR,
  };

  const url = healthUrls[serviceName];
  if (!url) throw new Error('Unknown service: ' + serviceName);

  const start = Date.now();
  try {
    await fetch(url);
    return { status: 'online', latency: Date.now() - start };
  } catch {
    return { status: 'offline', latency: 0 };
  }
}

// Stock Analysis (4AI)
export async function analyzeStock(symbol: string) {
  return apiCall(API.ANALYZE, {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
}

// ISABEL RAG Q&A
export async function askIsabel(question: string, symbol: string) {
  return apiCall(API.ISABEL_QA, {
    method: 'POST',
    body: JSON.stringify({ question, symbol }),
  });
}

// ISABEL Search
export async function searchIsabel(query: string, symbol: string) {
  return apiCall(API.ISABEL_SEARCH, {
    method: 'POST',
    body: JSON.stringify({ query, symbol }),
  });
}

// 5AI Consensus
export async function getConsensus(question: string, mode: string = 'integration') {
  return apiCall(API.CONSENSUS, {
    method: 'POST',
    body: JSON.stringify({ question, mode }),
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
  return apiCall(API.ALPACA_QUOTE + '/' + symbol);
}

// Place Order
export async function placeOrder(symbol: string, qty: number, side: 'buy' | 'sell') {
  return apiCall(API.ALPACA_ORDER, {
    method: 'POST',
    body: JSON.stringify({ symbol, qty, side, type: 'market', time_in_force: 'day' }),
  });
}

// LLM Config
export async function getLLMConfig() {
  return apiCall(API.LLM_CONFIG);
}

export async function updateLLMConfig(provider: string, config: { model?: string; temperature?: number }) {
  return apiCall(API.LLM_CONFIG + '/' + provider, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function toggleLLMProvider(provider: string) {
  return apiCall(API.LLM_CONFIG + '/' + provider + '/toggle', {
    method: 'POST',
  });
}