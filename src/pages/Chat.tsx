import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { analyzeSentiment, summarizeDocument } from "@/services/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "sentiment" | "summary";
  data?: any;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [symbol, setSymbol] = useState("AAPL");
  const [mode, setMode] = useState<"sentiment" | "summary">("sentiment");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let response: any;
      let assistantContent: string;

      if (mode === "sentiment") {
        response = await analyzeSentiment(symbol, input);
        assistantContent = formatSentimentResponse(response);
      } else {
        response = await summarizeDocument(symbol, input);
        assistantContent = formatSummaryResponse(response);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
        type: mode,
        data: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatSentimentResponse(data: any): string {
    if (data.error) return `Error: ${data.error}`;
    
    const sentiment = data.sentiment || data;
    const score = sentiment.score || sentiment.sentiment_score || 0;
    const label = score > 0.3 ? "Positive 📈" : score < -0.3 ? "Negative 📉" : "Neutral ➡️";
    
    return `**Sentiment Analysis for ${symbol}**\n\n` +
           `**Overall Sentiment:** ${label}\n` +
           `**Score:** ${(score * 100).toFixed(1)}%\n\n` +
           `${sentiment.summary || sentiment.analysis || "Analysis complete."}`;
  }

  function formatSummaryResponse(data: any): string {
    if (data.error) return `Error: ${data.error}`;
    
    return `**Document Summary for ${symbol}**\n\n` +
           `${data.summary || data.text || "Summary generated."}`;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-foreground">ISABEL Chat</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Symbol:</span>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-20 px-2 py-1 bg-background/50 border border-border rounded text-sm text-foreground"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setMode("sentiment")}
              className={`px-3 py-1 rounded text-sm ${
                mode === "sentiment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Sentiment
            </button>
            <button
              onClick={() => setMode("summary")}
              className={`px-3 py-1 rounded text-sm ${
                mode === "summary" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Summary
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-lg">Welcome to ISABEL Chat</p>
              <p className="text-sm mt-2">
                Paste news articles or text for {mode === "sentiment" ? "sentiment analysis" : "summarization"}
              </p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary/20 border border-primary/50"
                    : "bg-secondary/20 border border-secondary/50"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary/20 border border-secondary/50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                  <span className="text-sm text-muted-foreground ml-2">ISABEL is analyzing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={`Paste text for ${mode} analysis...`}
              rows={2}
              className="flex-1 px-4 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
