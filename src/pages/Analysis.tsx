import { useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Loading } from "@/components/common/Loading";
import { Input } from "@/components/common/Input";
import { VoteType } from "@/types";
import { StockPriceChart } from "@/components/charts/StockPriceChart";
import { VoteDistributionChart } from "@/components/charts/VoteDistributionChart";

const quickSymbols = ["AAPL", "NVDA", "GOOGL", "MSFT", "TSLA", "AMZN"];

interface AIVote {
  unit: string;
  provider: string;
  vote: VoteType;
  confidence: number;
  reasoning: string;
}

const mockPriceData = [
  { date: "9:30", price: 248.5 },
  { date: "10:00", price: 249.2 },
  { date: "10:30", price: 248.8 },
  { date: "11:00", price: 250.1 },
  { date: "11:30", price: 251.3 },
  { date: "12:00", price: 250.8 },
  { date: "12:30", price: 251.5 },
  { date: "13:00", price: 252.1 },
  { date: "13:30", price: 251.8 },
  { date: "14:00", price: 253.2 },
  { date: "14:30", price: 252.9 },
  { date: "15:00", price: 254.1 },
  { date: "15:30", price: 254.67 },
];

const mockVoteDistribution = [
  { name: "BUY", value: 75, color: "hsl(142, 71%, 45%)" },
  { name: "HOLD", value: 25, color: "hsl(48, 96%, 53%)" },
  { name: "SELL", value: 0, color: "hsl(0, 84%, 60%)" },
];

const mockAnalysis = {
  consensus: "BUY" as VoteType,
  confidence: 75,
  priceData: mockPriceData,
  voteDistribution: mockVoteDistribution,
  votes: [
    {
      unit: "Unit-B2",
      provider: "Grok",
      vote: "BUY" as VoteType,
      confidence: 85,
      reasoning:
        "Trend analysis shows strong upward momentum. Technical indicators suggest continued bullish sentiment with RSI at healthy levels.",
    },
    {
      unit: "Unit-M1",
      provider: "Gemini",
      vote: "BUY" as VoteType,
      confidence: 70,
      reasoning:
        "Financial data indicates solid fundamentals. Revenue growth exceeds market expectations with strong margin improvement.",
    },
    {
      unit: "Unit-C3",
      provider: "Claude",
      vote: "HOLD" as VoteType,
      confidence: 60,
      reasoning:
        "ESG concerns and regulatory challenges present moderate risk. Recommend cautious approach despite positive financials.",
    },
    {
      unit: "Unit-R4",
      provider: "Mistral",
      vote: "BUY" as VoteType,
      confidence: 80,
      reasoning:
        "Risk assessment favorable. Market position remains dominant with significant competitive advantages.",
    },
  ],
  isabel: {
    sentiment: 0.72,
    articleCount: 15,
    topics: ["Q4 earnings", "iPhone sales", "AI strategy"],
  },
};

export default function Analysis() {
  const [symbol, setSymbol] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<typeof mockAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!symbol.trim()) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResult(mockAnalysis);
    setIsLoading(false);
  };

  const handleQuickSelect = (sym: string) => {
    setSymbol(sym);
  };

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-semibold text-foreground">Stock Analysis</h1>

      {/* Search Section */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!symbol.trim() || isLoading}
            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loading size="sm" /> : "Analyze"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Quick Select:</span>
          {quickSymbols.map((sym) => (
            <button
              key={sym}
              onClick={() => handleQuickSelect(sym)}
              className="px-3 py-1 text-xs font-mono border border-border rounded-md hover:bg-muted/50 hover:border-primary/30 transition-colors"
            >
              {sym}
            </button>
          ))}
        </div>
      </GlassCard>

      {isLoading && (
        <GlassCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Loading size="lg" />
            <p className="text-muted-foreground mt-4 text-sm">
              Analyzing {symbol}...
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Gathering 4AI consensus
            </p>
          </div>
        </GlassCard>
      )}

      {result && !isLoading && (
        <>
          {/* Stock Price Chart */}
          <GlassCard title={`${symbol} - Intraday Price`}>
            <StockPriceChart data={result.priceData} symbol={symbol} />
          </GlassCard>

          {/* Consensus Result */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard glow className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Consensus:</span>
                  <StatusBadge type={result.consensus} className="text-lg px-4 py-1" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                    <span className="font-mono text-foreground">
                      {result.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Vote Distribution">
              <VoteDistributionChart data={result.voteDistribution} />
            </GlassCard>
          </div>

          {/* AI Votes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.votes.map((vote) => (
              <GlassCard key={vote.unit}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {vote.unit}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({vote.provider})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge type={vote.vote} />
                    <span className="font-mono text-sm text-foreground">
                      {vote.confidence}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {vote.reasoning}
                </p>
              </GlassCard>
            ))}
          </div>

          {/* ISABEL Analysis */}
          <GlassCard title="ISABEL RAG Analysis">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Sentiment
                </span>
                <span className="text-lg font-mono text-success">
                  Positive ({result.isabel.sentiment.toFixed(2)})
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Articles Analyzed
                </span>
                <span className="text-lg font-mono text-foreground">
                  {result.isabel.articleCount} articles
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Key Topics
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.isabel.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 text-xs bg-muted/50 text-foreground rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Execute Trade */}
          <div className="flex justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Execute Trade: BUY 1 share of {symbol}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
