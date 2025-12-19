// API Endpoints
export const ENDPOINTS = {
  MAGI_AC: 'https://magi-ac-398890937507.asia-northeast1.run.app',
  MAGI_SYS: 'https://magi-app-398890937507.run.app',
  MAGI_STG: 'https://magi-stg-398890937507.asia-northeast1.run.app',
  MAGI_DATA: 'https://magi-data-collector-398890937507.asia-northeast1.run.app',
  MAGI_EXECUTOR: 'https://magi-executor-398890937507.asia-northeast1.run.app'
};

export const API = {
  // 証券分析
  ANALYZE: `${ENDPOINTS.MAGI_AC}/api/analyze`,
  
  // ISABEL RAG
  ISABEL_SEARCH: `${ENDPOINTS.MAGI_AC}/api/isabel/search-v2`,
  ISABEL_QA: `${ENDPOINTS.MAGI_AC}/api/isabel/qa`,
  ISABEL_HEALTH: `${ENDPOINTS.MAGI_AC}/api/isabel/health`,
  
  // 5AI合議
  CONSENSUS: `${ENDPOINTS.MAGI_SYS}/api/consensus`,
  
  // Alpaca
  ALPACA_ACCOUNT: `${ENDPOINTS.MAGI_AC}/alpaca/account`,
  ALPACA_POSITIONS: `${ENDPOINTS.MAGI_AC}/alpaca/positions`,
  ALPACA_ORDERS: `${ENDPOINTS.MAGI_AC}/alpaca/orders`,
  ALPACA_ORDER: `${ENDPOINTS.MAGI_AC}/alpaca/order`,
  ALPACA_QUOTE: `${ENDPOINTS.MAGI_AC}/alpaca/quote`,
  
  // LLM設定
  LLM_CONFIG: `${ENDPOINTS.MAGI_STG}/admin/llm-config`,
  
  // ヘルスチェック
  HEALTH_AC: `${ENDPOINTS.MAGI_AC}/health`,
  HEALTH_SYS: `${ENDPOINTS.MAGI_SYS}/health`,
  HEALTH_STG: `${ENDPOINTS.MAGI_STG}/health`
};

// Vote Types
export type VoteType = 'BUY' | 'HOLD' | 'SELL';

// Service Status
export interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  latency?: number;
}

// AI Vote
export interface AIVote {
  unit: string;
  provider: string;
  vote: VoteType;
  confidence: number;
  reasoning: string;
}

// Analysis Result
export interface AnalysisResult {
  symbol: string;
  consensus: VoteType;
  confidence: number;
  votes: AIVote[];
  isabel?: {
    sentiment: number;
    articleCount: number;
    topics: string[];
  };
}

// Portfolio
export interface Account {
  equity: number;
  cash: number;
  buyingPower: number;
  dayPL: number;
  dayPLPercent: number;
}

export interface Position {
  symbol: string;
  qty: number;
  avgCost: number;
  currentPrice: number;
  pl: number;
  plPercent: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  status: string;
  createdAt: string;
}

// Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Source {
  title: string;
  source: string;
  date: string;
  score: number;
}

// Consensus
export interface ConsensusResponse {
  integratedAnswer: string;
  responses: {
    unit: string;
    provider: string;
    answer: string;
  }[];
}

// LLM Config
export interface LLMConfig {
  provider: string;
  model: string;
  status: 'active' | 'inactive';
}
