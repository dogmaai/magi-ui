import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

const accountData = {
  portfolioValue: 100004.67,
  cashBalance: 99721.57,
  buyingPower: 199726.24,
  dayPL: 4.67,
  dayPLPercent: 0.01,
};

const holdings = [
  {
    symbol: "AAPL",
    qty: 1,
    avgCost: 250.0,
    currentPrice: 254.67,
    pl: 4.67,
    plPercent: 1.87,
  },
];

const orders = [
  {
    date: "12/17 14:30",
    symbol: "AAPL",
    side: "BUY",
    qty: 1,
    price: 250.0,
    status: "Filled",
  },
  {
    date: "12/16 10:15",
    symbol: "NVDA",
    side: "SELL",
    qty: 2,
    price: 138.5,
    status: "Filled",
  },
  {
    date: "12/15 09:30",
    symbol: "GOOGL",
    side: "BUY",
    qty: 3,
    price: 195.25,
    status: "Filled",
  },
  {
    date: "12/14 11:45",
    symbol: "MSFT",
    side: "SELL",
    qty: 1,
    price: 445.0,
    status: "Filled",
  },
];

const performanceData = [
  { date: "Mon", portfolio: 0, benchmark: 0 },
  { date: "Tue", portfolio: 0.5, benchmark: 0.3 },
  { date: "Wed", portfolio: -0.2, benchmark: 0.1 },
  { date: "Thu", portfolio: 0.8, benchmark: 0.5 },
  { date: "Fri", portfolio: 1.2, benchmark: 0.8 },
  { date: "Sat", portfolio: 1.5, benchmark: 1.0 },
  { date: "Sun", portfolio: 1.87, benchmark: 1.2 },
];

export default function Portfolio() {
  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-semibold text-foreground">Portfolio</h1>

      {/* Account Summary */}
      <GlassCard title="Account Summary" glow>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">
              Portfolio Value
            </span>
            <span className="text-2xl font-mono text-foreground">
              ${accountData.portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">
              Cash Balance
            </span>
            <span className="text-2xl font-mono text-foreground">
              ${accountData.cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">
              Day P/L
            </span>
            <span className={`text-xl font-mono ${accountData.dayPL >= 0 ? "text-success" : "text-destructive"}`}>
              {accountData.dayPL >= 0 ? "+" : ""}${accountData.dayPL.toFixed(2)} ({accountData.dayPL >= 0 ? "+" : ""}{accountData.dayPLPercent.toFixed(2)}%)
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">
              Buying Power
            </span>
            <span className="text-xl font-mono text-foreground">
              ${accountData.buyingPower.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Weekly Performance Chart */}
      <GlassCard title="Weekly Performance">
        <PerformanceChart data={performanceData} />
      </GlassCard>

      {/* Holdings */}
      <GlassCard title="Holdings">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4 text-right">Qty</th>
                <th className="pb-3 pr-4 text-right">Avg Cost</th>
                <th className="pb-3 pr-4 text-right">Current</th>
                <th className="pb-3 text-right">P/L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.symbol} className="border-t border-border/50">
                  <td className="py-4 pr-4">
                    <span className="font-mono font-medium text-foreground">
                      {holding.symbol}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right font-mono text-foreground">
                    {holding.qty}
                  </td>
                  <td className="py-4 pr-4 text-right font-mono text-foreground">
                    ${holding.avgCost.toFixed(2)}
                  </td>
                  <td className="py-4 pr-4 text-right font-mono text-foreground">
                    ${holding.currentPrice.toFixed(2)}
                  </td>
                  <td className="py-4 text-right">
                    <span className={`font-mono ${holding.pl >= 0 ? "text-success" : "text-destructive"}`}>
                      {holding.pl >= 0 ? "+" : ""}${holding.pl.toFixed(2)} ({holding.pl >= 0 ? "+" : ""}{holding.plPercent.toFixed(1)}%)
                    </span>
                  </td>
                </tr>
              ))}
              {holdings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    No current holdings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Recent Orders */}
      <GlassCard title="Recent Orders">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4">Side</th>
                <th className="pb-3 pr-4 text-right">Qty</th>
                <th className="pb-3 pr-4 text-right">Price</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-t border-border/50">
                  <td className="py-4 pr-4">
                    <span className="text-sm text-muted-foreground">
                      {order.date}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="font-mono font-medium text-foreground">
                      {order.symbol}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <StatusBadge type={order.side as "BUY" | "SELL"} />
                  </td>
                  <td className="py-4 pr-4 text-right font-mono text-foreground">
                    {order.qty}
                  </td>
                  <td className="py-4 pr-4 text-right font-mono text-foreground">
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xs text-success">{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
