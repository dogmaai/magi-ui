// Re-export API endpoints from services
export { ENDPOINTS, API } from '../services/endpoints';

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

// Analysis Result (magi-ac /api/ai-consensus response)
export interface AnalysisResult {
  symbol: string;
  timestamp: string;
  prediction_id?: string;
  algo_analysis?: {
    volumeAnomaly: { detected: boolean; score: number; reason: string };
    algoPattern: { pattern: string; confidence: number; description: string };
    predictedAction: { action: string; confidence: number; reasoning: string };
  };
  ai_recommendations: {
    provider: string;
    action: VoteType;
    confidence: number;
    reasoning: string;
  }[];
  consensus: {
    recommendation: VoteType;
    buy: number;
    hold: number;
    sell: number;
    average_confidence: string;
  };
  current_price: number;
}

// Portfolio - Alpaca Account
export interface Account {
  equity: number;
  cash: number;
  buying_power: number;
  portfolio_value: number;
  last_equity: number;
  daytrade_count: number;
}

// Alpaca Position
export interface Position {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  side: string;
}

// Alpaca Order
export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: string;
  filled_qty: string;
  type: string;
  status: string;
  created_at: string;
  filled_at?: string;
  limit_price?: string;
  stop_price?: string;
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

// Consensus Response (magi-sys)
export interface ConsensusResponse {
  final: string;
  balthasar: string;
  melchior: string;
  casper: string;
  mary: string;
  sophia: string;
  metrics: {
    response_time_ms: number;
    valid_responses: number;
  };
}

// LLM Config
export interface LLMConfig {
  provider: string;
  model: string;
  temperature: number;
  role: string;
  specialty: string;
}
