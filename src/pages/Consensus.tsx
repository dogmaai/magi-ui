import { useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { getConsensus } from "@/services/api";

interface AIResponse {
  unit: string;
  provider: string;
  answer: string;
}

interface ConsensusResult {
  final?: string;
  balthasar?: string;
  melchior?: string;
  casper?: string;
  mary?: string;
  sophia?: string;
  metrics?: {
    response_time_ms: number;
    valid_responses: number;
  };
}

const unitInfo: Record<string, { name: string; role: string; color: string }> = {
  balthasar: { name: "BALTHASAR-2", role: "Creative Analysis (Grok)", color: "text-orange-400" },
  melchior: { name: "MELCHIOR-1", role: "Logical Analysis (Gemini)", color: "text-blue-400" },
  casper: { name: "CASPER-3", role: "Human-centric Analysis (Claude)", color: "text-purple-400" },
  mary: { name: "MARY-4", role: "Integration & Judge (GPT-4)", color: "text-green-400" },
  sophia: { name: "SOPHIA-5", role: "Strategic Analysis (Mistral)", color: "text-cyan-400" },
};

export default function Consensus() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"consensus" | "integration" | "synthesis">("integration");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConsensusResult | null>(null);

  async function handleSubmit() {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await getConsensus(prompt, mode) as ConsensusResult;
      setResult(res);
    } catch (err) {
      setError("Failed to get consensus. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const aiResponses = result ? [
    { key: "balthasar", content: result.balthasar },
    { key: "melchior", content: result.melchior },
    { key: "casper", content: result.casper },
    { key: "sophia", content: result.sophia },
    { key: "mary", content: result.mary },
  ].filter(r => r.content) : [];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">5AI Consensus</h1>
        {result?.metrics && (
          <span className="text-sm text-muted-foreground">
            {result.metrics.valid_responses} AIs responded in {result.metrics.response_time_ms}ms
          </span>
        )}
      </div>

      {/* Input */}
      <GlassCard>
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question for 5 AI consensus analysis..."
            rows={4}
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(["consensus", "integration", "synthesis"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || !prompt.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Get Consensus"}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Mode Description */}
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Mode: </span>
        {mode === "consensus" && "Individual responses - majority vote decides"}
        {mode === "integration" && "GPT-4 synthesizes all responses into unified answer"}
        {mode === "synthesis" && "Create new insights from combined perspectives"}
      </div>

      {error && (
        <div className="p-4 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Integrated Answer */}
      {result?.final && (
        <GlassCard title="Integrated Answer" glow>
          <div className="prose prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{result.final}</p>
          </div>
        </GlassCard>
      )}

      {/* Individual AI Responses */}
      {aiResponses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Individual AI Responses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {aiResponses.map(({ key, content }) => {
              const info = unitInfo[key];
              return (
                <GlassCard key={key}>
                  <div className="mb-3">
                    <span className={`font-mono font-bold ${info?.color || "text-foreground"}`}>
                      {info?.name || key}
                    </span>
                    <p className="text-xs text-muted-foreground">{info?.role || ""}</p>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-6">
                    {content}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {!result && !loading && (
        <GlassCard>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Ask any question to get insights from 5 AI models</p>
            <p className="text-sm mt-2">
              Examples: "AIの未来について分析して", "ビットコインの長期投資価値は？"
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
