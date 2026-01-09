import { useEffect, useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { getAlpacaAccount, getAlpacaPositions, getAlpacaOrders } from "@/services/api";

interface Account {
  equity: string;
  cash: string;
  buying_power: string;
  portfolio_value: string;
  last_equity: string;
  daytrade_count: number;
}

interface Position {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  side: string;
}

interface Order {
  id: string;
  symbol: string;
  side: string;
  qty: string;
  filled_qty: string;
  type: string;
  status: string;
  created_at: string;
  limit_price?: string;
  stop_price?: string;
}

export default function Portfolio() {
  const [account, setAccount] = useState<Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [accountRes, positionsRes, ordersRes] = await Promise.all([
          getAlpacaAccount() as Promise<{ ok: boolean; data: Account; error?: string }>,
          getAlpacaPositions() as Promise<{ ok: boolean; data: Position[] }>,
          getAlpacaOrders() as Promise<{ ok: boolean; data: Order[] }>,
        ]);

        if (accountRes.ok) setAccount(accountRes.data);
        else setError(accountRes.error || "Failed to load account");

        if (positionsRes.ok) setPositions(positionsRes.data);
        if (ordersRes.ok) setOrders(ordersRes.data.slice(0, 10)); // Last 10 orders
      } catch (err) {
        setError("Failed to connect to Alpaca API");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalUnrealizedPL = positions.reduce(
    (sum, pos) => sum + parseFloat(pos.unrealized_pl || "0"),
    0
  );

  const performanceData = [
    { date: "Mon", portfolio: 0, benchmark: 0 },
    { date: "Tue", portfolio: 0.5, benchmark: 0.3 },
    { date: "Wed", portfolio: 0.8, benchmark: 0.6 },
    { date: "Thu", portfolio: 0.3, benchmark: 0.4 },
    { date: "Fri", portfolio: 1.2, benchmark: 0.9 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-semibold text-foreground">Portfolio</h1>

      {/* Account Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <p className="text-sm text-muted-foreground">Portfolio Value</p>
          <p className="text-2xl font-bold text-primary">
            ${account ? parseFloat(account.portfolio_value || account.equity).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Cash</p>
          <p className="text-2xl font-bold text-foreground">
            ${account ? parseFloat(account.cash).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Buying Power</p>
          <p className="text-2xl font-bold text-foreground">
            ${account ? parseFloat(account.buying_power).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Unrealized P/L</p>
          <p className={`text-2xl font-bold ${totalUnrealizedPL >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalUnrealizedPL >= 0 ? "+" : ""}${totalUnrealizedPL.toFixed(2)}
          </p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positions */}
        <GlassCard title="Positions" glow>
          {positions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Avg Cost</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.symbol} className="border-b border-border/50">
                      <td className="py-3 font-mono font-semibold text-primary">{pos.symbol}</td>
                      <td className="py-3 text-right">{pos.qty}</td>
                      <td className="py-3 text-right">${parseFloat(pos.avg_entry_price).toFixed(2)}</td>
                      <td className="py-3 text-right">${parseFloat(pos.current_price).toFixed(2)}</td>
                      <td className={`py-3 text-right font-semibold ${parseFloat(pos.unrealized_pl) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {parseFloat(pos.unrealized_pl) >= 0 ? "+" : ""}${parseFloat(pos.unrealized_pl).toFixed(2)}
                        <span className="text-xs ml-1">({(parseFloat(pos.unrealized_plpc) * 100).toFixed(1)}%)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No open positions
            </div>
          )}
        </GlassCard>

        {/* Recent Orders */}
        <GlassCard title="Recent Orders">
          {orders.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <span className={`font-mono font-semibold ${order.side === "buy" ? "text-green-400" : "text-red-400"}`}>
                      {order.side.toUpperCase()}
                    </span>
                    <span className="ml-2 text-foreground">{order.symbol}</span>
                    <span className="ml-2 text-muted-foreground">x{order.qty}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === "filled" ? "bg-green-400/20 text-green-400" :
                      order.status === "canceled" ? "bg-red-400/20 text-red-400" :
                      "bg-yellow-400/20 text-yellow-400"
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent orders
            </div>
          )}
        </GlassCard>
      </div>

      {/* Performance Chart */}
      <GlassCard title="Weekly Performance">
        <PerformanceChart data={performanceData} />
      </GlassCard>
    </div>
  );
}
