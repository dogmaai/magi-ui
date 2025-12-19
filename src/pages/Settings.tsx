import { useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";

const llmConfigs = [
  { provider: "Grok", model: "grok-2-latest", status: "active" as const },
  { provider: "Gemini", model: "gemini-2.0-flash-exp", status: "active" as const },
  { provider: "Claude", model: "claude-sonnet-4-20250514", status: "active" as const },
  { provider: "GPT-4", model: "gpt-4o-mini", status: "active" as const },
  { provider: "Mistral", model: "mistral-large-latest", status: "active" as const },
  { provider: "Cohere", model: "command-r-plus", status: "active" as const },
];

const targetSymbols = ["AAPL", "NVDA", "GOOGL", "MSFT", "TSLA", "AMZN"];

export default function Settings() {
  const [autoTrade, setAutoTrade] = useState(false);
  const [symbols, setSymbols] = useState(targetSymbols);
  const [editingSymbols, setEditingSymbols] = useState(false);
  const [symbolInput, setSymbolInput] = useState(targetSymbols.join(", "));

  const handleSaveSymbols = () => {
    const newSymbols = symbolInput
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);
    setSymbols(newSymbols);
    setEditingSymbols(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      {/* LLM Configuration */}
      <GlassCard title="LLM Configuration">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 pr-4">Provider</th>
                <th className="pb-3 pr-4">Model</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {llmConfigs.map((config) => (
                <tr key={config.provider} className="border-t border-border/50">
                  <td className="py-4 pr-4">
                    <span className="font-medium text-foreground">
                      {config.provider}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="font-mono text-sm text-muted-foreground">
                      {config.model}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <StatusBadge
                      type={config.status === "active" ? "online" : "offline"}
                    />
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* API Configuration */}
      <GlassCard title="API Configuration">
        <div className="space-y-6">
          {/* Target Symbols */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                Target Symbols
              </span>
              {!editingSymbols && (
                <button
                  onClick={() => setEditingSymbols(true)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Edit Symbols
                </button>
              )}
            </div>

            {editingSymbols ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  className="flex-1 bg-card/50 border border-border rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <button
                  onClick={handleSaveSymbols}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingSymbols(false);
                    setSymbolInput(symbols.join(", "));
                  }}
                  className="px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {symbols.map((symbol) => (
                  <span
                    key={symbol}
                    className="px-3 py-1.5 bg-muted/50 text-foreground font-mono text-sm rounded-lg"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Auto Trade Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <span className="text-sm text-foreground block">Auto-Trade</span>
              <span className="text-xs text-muted-foreground">
                Automatically execute trades based on AI consensus
              </span>
            </div>
            <button
              onClick={() => setAutoTrade(!autoTrade)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoTrade ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-foreground rounded-full transition-transform ${
                  autoTrade ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* System Information */}
      <GlassCard title="System Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Environment</span>
            <span className="font-mono text-foreground">Production</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">API Status</span>
            <StatusBadge type="online" />
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-mono text-foreground">2025-12-19</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
