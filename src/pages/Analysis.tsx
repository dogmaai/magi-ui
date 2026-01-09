import { useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { StockPriceChart } from "@/components/charts/StockPriceChart";
import { VoteDistributionChart } from "@/components/charts/VoteDistributionChart";
import { analyzeStock, getAlpacaQuote } from "@/services/api";

interface AIRecommendation {
  provider: string;
  action: string;
  confidence: number;
  reasoning: string;
}

interface AnalysisResult {
  symbol: string;
  timestamp: string;
  current_price?: number;
  financialData?: {
    currentPrice: number;
    previousClose: number;
  };
  ai_recommendations?: AIRecommendation[];
  consensus?: {
    recommendation: string;
    buy: number;
    hold: number;
    sell: number;
    average_confidence: string;
  };
  algo_analysis?: {
    volumeAnomaly: { detected: boolean; score: number; reason: string };
    algoPattern: { pattern: string; confidence: number; description: string };
    predictedAction: { action: string; confidence: number; reasoning: string };
  };
}

const providerColors: Record<string, string> = {
  grok: "text-orange-400",
  gemini: "text-blue-400",
  claude: "text-purple-400",
  mistral: "text-cyan-400",
};

const providerUnits: Record<string, string> = {
  grok: "BALTHASAR-2",
  gemini: "MELCHIOR-1",
  claude: "CASPER-3",
  mistral: "SOPHIA-5",
};

export default function Analysis() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [quote, setQuote] = useState<{ AskPrice: number; BidPrice: number } | null>(null);

  async function handleAnalyze() {
    if (!symbol.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get quote first
      const quoteRes = await getAlpacaQuote(symbol.toUpperCase()) as { ok: boolean; data: any };
      if (quoteRes.ok) {
        setQuote(quoteRes.data);
      }

      // Run analysis
      const analysisRes = await analyzeStock(symbol.toUpperCase()) as AnalysisResult;
      setResult(analysisRes);
    } catch (err) {
      setError("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const voteData = result?.consensus ? [
    { name: "BUY", value: result.consensus.buy, color: "#4ade80" },
    { name: "HOLD", value: result.consensus.hold, color: "#facc15" },
    { name: "SELL", value: result.consensus.sell, color: "#f87171" },
  ].filter(v => v.value > 0) : [];

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-semibold text-foreground">Stock Analysis</h1>

      {/* Search */}
      <GlassCard>
        <div className="flex gap-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Enter symbol (e.g., AAPL)"
            className="flex-1 px-4 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !symbol.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </GlassCard>

      {error && (
        <div className="p-4 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* Stock Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-2" glow>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{result.symbol}</h2>
                  <p className="text-muted-foreground">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    ${(result.current_price || result.financialData?.currentPrice || quote?.BidPrice || 0).toFixed(2)}
                  </p>
                  {quote && (
                    <p className="text-sm text-muted-foreground">
                      Bid: ${quote.BidPrice.toFixed(2)} / Ask: ${quote.AskPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Consensus Result */}
              {result.consensus && (
                <div className={`p-4 rounded-lg ${
                  result.consensus.recommendation === "BUY" ? "bg-green-400/20 border border-green-400/50" :
                  result.consensus.recommendation === "SELL" ? "bg-red-400/20 border border-red-400/50" :
                  "bg-yellow-400/20 border border-yellow-400/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">4AI Consensus</p>
                      <p className={`text-2xl font-bold ${
                        result.consensus.recommendation === "BUY" ? "text-green-400" :
                        result.consensus.recommendation === "SELL" ? "text-red-400" :
                        "text-yellow-400"
                      }`}>
                        {result.consensus.recommendation}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold text-foreground">
                        {(parseFloat(result.consensus.average_confidence) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Vote Distribution */}
            <GlassCard title="Vote Distribution">
              {voteData.length > 0 ? (
                <VoteDistributionChart data={voteData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">No vote data</div>
              )}
            </GlassCard>
          </div>

          {/* AI Recommendations */}
          {result.ai_recommendations && (
            <GlassCard title="AI Recommendations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.ai_recommendations.map((rec) => (
                  <div key={rec.provider} className="p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className={`font-mono font-bold ${providerColors[rec.provider] || "text-foreground"}`}>
                          {providerUnits[rec.provider] || rec.provider}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">({rec.provider})</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        rec.action === "BUY" ? "bg-green-400/20 text-green-400" :
                        rec.action === "SELL" ? "bg-red-400/20 text-red-400" :
                        "bg-yellow-400/20 text-yellow-400"
                      }`}>
                        {rec.action} ({(rec.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Algo Analysis */}
          {result.algo_analysis && (
            <GlassCard title="Algorithm Pattern Analysis">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Volume Anomaly</p>
                  <p className={`text-xl font-bold ${result.algo_analysis.volumeAnomaly.detected ? "text-orange-400" : "text-green-400"}`}>
                    {result.algo_analysis.volumeAnomaly.detected ? "Detected" : "Normal"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{result.algo_analysis.volumeAnomaly.reason}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pattern</p>
                  <p className="text-xl font-bold text-primary">{result.algo_analysis.algoPattern.pattern}</p>
                  <p className="text-xs text-muted-foreground mt-1">{result.algo_analysis.algoPattern.description}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Predicted Action</p>
                  <p className="text-xl font-bold text-secondary">{result.algo_analysis.predictedAction.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{result.algo_analysis.predictedAction.reasoning}</p>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {!result && !loading && (
        <GlassCard>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Enter a stock symbol to analyze</p>
            <p className="text-sm mt-2">Example: AAPL, NVDA, GOOGL, MSFT, TSLA</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
