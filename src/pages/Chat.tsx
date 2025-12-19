import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { Loading } from "@/components/common/Loading";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: { title: string; source: string; date: string }[];
}

const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "What are the latest news about Apple?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    role: "assistant",
    content: `Based on recent news articles, here are the key developments for Apple:

1. Q4 earnings exceeded expectations with record services revenue reaching $23.5 billion, representing a 14% year-over-year growth.

2. New AI features announced for iOS 19, including enhanced Siri capabilities and on-device machine learning improvements.

3. Supply chain improvements in Vietnam have reduced manufacturing dependencies, with 25% of iPhones now produced outside China.

4. Apple Vision Pro 2 development is on track for 2025 release with improved display technology and reduced weight.`,
    timestamp: new Date(Date.now() - 240000),
    sources: [
      { title: "Apple Q4 Results", source: "Reuters", date: "2025-12-15" },
      { title: "iPhone Sales Rise", source: "Bloomberg", date: "2025-12-14" },
      { title: "Apple AI Strategy", source: "TechCrunch", date: "2025-12-13" },
    ],
  },
];

const symbols = ["AAPL", "NVDA", "GOOGL", "MSFT", "TSLA", "AMZN"];

export default function Chat() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Based on my analysis of recent documents and news for ${selectedSymbol}, here is the relevant information regarding your query about "${input}":

The current market sentiment appears positive with strong institutional support. Technical indicators suggest continued momentum, though volatility may increase in the short term.

I found 8 relevant sources that support this analysis.`,
      timestamp: new Date(),
      sources: [
        { title: "Market Analysis Report", source: "MarketWatch", date: "2025-12-18" },
        { title: "Sector Overview", source: "Financial Times", date: "2025-12-17" },
      ],
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-foreground">ISABEL Chat</h1>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {symbols.map((sym) => (
            <option key={sym} value={sym}>
              {sym}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-muted/30 border border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {message.role === "user" ? "You" : "ISABEL"}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {message.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground block mb-2">
                      Sources:
                    </span>
                    <div className="space-y-2">
                      {message.sources.map((source, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs bg-background/50 rounded px-3 py-2"
                        >
                          <span className="text-foreground">{source.title}</span>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{source.source}</span>
                            <span>{source.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <Loading size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${selectedSymbol}...`}
              className="flex-1 bg-card/50 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
