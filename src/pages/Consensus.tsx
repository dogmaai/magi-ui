import { useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { Loading } from "@/components/common/Loading";

interface AIResponse {
  unit: string;
  provider: string;
  role: string;
  answer: string;
}

const mockResponse = {
  integratedAnswer: `Based on the collective analysis from all MAGI units, investing in AI-focused companies shows strong potential but requires careful consideration of several factors:

1. Market Position: Companies with established AI infrastructure and proprietary data have significant competitive advantages.

2. Risk Factors: Regulatory uncertainty, especially in the EU and China, presents moderate risk. Hardware dependencies on specific chip manufacturers also create supply chain vulnerabilities.

3. Growth Trajectory: The AI market is projected to grow at 37% CAGR through 2030, with enterprise AI adoption accelerating.

4. Recommendation: A balanced approach is advised - focusing on diversified AI exposure through a mix of infrastructure providers, application developers, and emerging leaders. Position sizing should account for volatility.`,
  responses: [
    {
      unit: "BALTHASAR-2",
      provider: "Grok",
      role: "Creative Perspective",
      answer:
        "The AI revolution is comparable to the internet boom of the 90s, but with faster adoption curves. Look for companies disrupting traditional industries with AI - healthcare, legal, and education are particularly promising verticals.",
    },
    {
      unit: "MELCHIOR-1",
      provider: "Gemini",
      role: "Logical Analysis",
      answer:
        "Quantitative analysis shows AI companies outperforming the S&P 500 by 23% YTD. However, P/E ratios are elevated. Focus on companies with proven revenue from AI products rather than those still in R&D phases.",
    },
    {
      unit: "CASPER-3",
      provider: "Claude",
      role: "Human-Centric View",
      answer:
        "Consider the societal implications of AI investments. Companies with responsible AI practices and clear ethical guidelines tend to have more sustainable long-term growth and face fewer regulatory headwinds.",
    },
    {
      unit: "SOPHIA-5",
      provider: "Mistral",
      role: "Strategic Approach",
      answer:
        "Geographic diversification is key. While US companies lead in AI development, Asian markets offer growth opportunities. Consider emerging players in India and Southeast Asia for balanced exposure.",
    },
    {
      unit: "MARY-4",
      provider: "GPT-4",
      role: "Integration Judge",
      answer:
        "Synthesizing all perspectives: AI investment requires a multi-layered approach. Core holdings should be established leaders, with satellite positions in innovative disruptors. Risk management through sector diversification is essential.",
    },
  ],
};

const modes = [
  { value: "integration", label: "Integration" },
  { value: "synthesis", label: "Synthesis" },
  { value: "consensus", label: "Consensus" },
];

export default function Consensus() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("integration");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<typeof mockResponse | null>(null);

  const handleSubmit = async () => {
    if (!question.trim() || isLoading) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setResult(mockResponse);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-semibold text-foreground">
        MAGI Consensus Q&A
      </h1>

      {/* Mode Selection */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mode:</span>
            <div className="flex gap-2">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    mode === m.value
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your question..."
            className="flex-1 bg-card/50 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </GlassCard>

      {isLoading && (
        <GlassCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Loading size="lg" />
            <p className="text-muted-foreground mt-4 text-sm">
              Gathering 5AI consensus...
            </p>
            <div className="flex gap-2 mt-2">
              {["BALTHASAR", "MELCHIOR", "CASPER", "SOPHIA", "MARY"].map(
                (name, i) => (
                  <span
                    key={name}
                    className="text-xs text-muted-foreground/60 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {result && !isLoading && (
        <>
          {/* Integrated Answer */}
          <GlassCard title="Integrated Answer (MARY-4)" glow>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {result.integratedAnswer}
            </p>
          </GlassCard>

          {/* Individual Responses */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Individual Responses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.responses.map((response) => (
                <GlassCard key={response.unit}>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-foreground block">
                      {response.unit}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {response.provider} / {response.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {response.answer}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
