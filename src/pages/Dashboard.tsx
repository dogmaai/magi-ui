import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Link } from "react-router-dom";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { MiniSparkline } from "@/components/charts/MiniSparkline";

const services = [
  { name: "magi-ac", status: "online" as const, latency: 45 },
  { name: "magi-sys", status: "online" as const, latency: 120 },
  { name: "magi-stg", status: "online" as const, latency: 32 },
  { name: "magi-exec", status: "online" as const, latency: 67 },
];

const marketData = [
  { symbol: "AAPL", price: 250.48, change: 1.23, sparkline: [{ value: 245 }, { value: 247 }, { value: 246 }, { value: 249 }, { value: 248 }, { value: 250 }, { value: 250.48 }] },
  { symbol: "NVDA", price: 138.25, change: -0.45, sparkline: [{ value: 140 }, { value: 139 }, { value: 141 }, { value: 139 }, { value: 138 }, { value: 137 }, { value: 138.25 }] },
  { symbol: "GOOGL", price: 197.82, change: 2.15, sparkline: [{ value: 192 }, { value: 194 }, { value: 193 }, { value: 195 }, { value: 196 }, { value: 197 }, { value: 197.82 }] },
  { symbol: "MSFT", price: 448.12, change: 0.89, sparkline: [{ value: 442 }, { value: 444 }, { value: 443 }, { value: 445 }, { value: 447 }, { value: 446 }, { value: 448.12 }] },
];

const performanceData = [
  { date: "Jan", portfolio: 0, benchmark: 0 },
  { date: "Feb", portfolio: 2.1, benchmark: 1.8 },
  { date: "Mar", portfolio: 1.5, benchmark: 2.2 },
  { date: "Apr", portfolio: 4.2, benchmark: 3.1 },
  { date: "May", portfolio: 3.8, benchmark: 2.9 },
  { date: "Jun", portfolio: 5.5, benchmark: 4.2 },
  { date: "Jul", portfolio: 7.2, benchmark: 5.8 },
  { date: "Aug", portfolio: 6.8, benchmark: 5.5 },
  { date: "Sep", portfolio: 8.4, benchmark: 6.2 },
  { date: "Oct", portfolio: 9.1, benchmark: 7.0 },
  { date: "Nov", portfolio: 10.5, benchmark: 8.1 },
  { date: "Dec", portfolio: 11.2, benchmark: 8.9 },
];

const recentActivity = [
  { time: "12:34", message: "Analysis completed: AAPL - BUY (75%)" },
  { time: "12:30", message: "News collected: 15 articles" },
  { time: "12:15", message: "Order executed: AAPL 1 share @ $250.00" },
  { time: "11:45", message: "System health check: All services online" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <span className="text-sm text-muted-foreground font-mono">
          {new Date().toLocaleString("ja-JP")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Status */}
          <GlassCard title="System Status">
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <span className="font-mono text-sm text-foreground">
                    {service.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <StatusBadge type={service.status} />
                    <span className="text-xs text-muted-foreground font-mono w-16 text-right">
                      {service.latency}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Portfolio Summary */}
          <GlassCard title="Portfolio Summary" glow>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Portfolio Value
                </span>
                <span className="text-2xl font-mono text-foreground">
                  $100,004.67
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Cash Balance
                </span>
                <span className="text-2xl font-mono text-foreground">
                  $99,721.57
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Day P/L
                </span>
                <span className="text-lg font-mono text-success">
                  +$4.67 (+0.01%)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Buying Power
                </span>
                <span className="text-lg font-mono text-foreground">
                  $199,726.24
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Performance Chart */}
          <GlassCard title="YTD Performance">
            <PerformanceChart data={performanceData} />
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard title="Recent Activity">
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-xs text-muted-foreground font-mono w-12 flex-shrink-0">
                    {activity.time}
                  </span>
                  <span className="text-sm text-foreground">
                    {activity.message}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <GlassCard title="Quick Actions">
            <div className="space-y-3">
              <Link
                to="/analysis"
                className="block w-full py-3 px-4 text-center text-sm font-medium bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Analyze Stock
              </Link>
              <Link
                to="/chat"
                className="block w-full py-3 px-4 text-center text-sm font-medium border border-primary/50 text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Ask ISABEL
              </Link>
              <Link
                to="/consensus"
                className="block w-full py-3 px-4 text-center text-sm font-medium border border-border text-muted-foreground rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                5AI Consensus
              </Link>
            </div>
          </GlassCard>

          {/* Market Data */}
          <GlassCard title="Market Data">
            <div className="space-y-3">
              {marketData.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <span className="font-mono text-sm font-medium text-foreground w-14">
                    {stock.symbol}
                  </span>
                  <div className="w-20">
                    <MiniSparkline data={stock.sparkline} positive={stock.change >= 0} />
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm text-foreground block">
                      ${stock.price.toFixed(2)}
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        stock.change >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
