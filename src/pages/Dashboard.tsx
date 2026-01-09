import { useEffect, useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Link } from "react-router-dom";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { checkServiceHealth, getAlpacaAccount, getAlpacaPositions, getAutoTradeConfig, runAutoTrade, getRiskDashboard, activateKillswitch, deactivateKillswitch, getPortfolioHistory } from "@/services/api";

interface ServiceStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  latency: number;
}

interface Position {
  symbol: string;
  qty: string;
  current_price: string;
  unrealized_plpc: string;
  market_value: string;
}

interface Account {
  equity: string;
  cash: string;
  buying_power: string;
  portfolio_value: string;
}

interface AutoTradeConfig {
  watchList: string[];
  qtyPerTrade: number;
  buyThreshold: number;
  sellThreshold: number;
}

interface AutoTradeResult {
  timestamp: string;
  analyzed: Array<{
    symbol: string;
    votes: { BUY: number; HOLD: number; SELL: number };
  }>;
  orders: Array<{ symbol: string; side: string; orderId: string }>;
  errors: Array<{ symbol: string; error: string }>;
}

interface RiskDashboard {
  account: { equity: number; cash: number };
  dailyStats: { trades: number; realizedPnL: number };
  weeklyStats: { realizedPnL: number };
  killswitch: { active: boolean; level: number; reason: string | null };
  config: {
    MAX_SINGLE_TRADE_RISK: number;
    MAX_DAILY_LOSS: number;
    MAX_WEEKLY_LOSS: number;
    MAX_DAILY_TRADES: number;
  };
}

interface PerformanceDataPoint {
  date: string;
  portfolio: number;
  benchmark: number;
}

export default function Dashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoTradeConfig, setAutoTradeConfig] = useState<AutoTradeConfig | null>(null);
  const [autoTradeResult, setAutoTradeResult] = useState<AutoTradeResult | null>(null);
  const [autoTradeRunning, setAutoTradeRunning] = useState(false);
  const [riskData, setRiskData] = useState<RiskDashboard | null>(null);
  const [killswitchLoading, setKillswitchLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const serviceNames = ["magi-ac", "magi-sys", "magi-stg", "magi-executor", "magi-risk"];
        const healthResults = await Promise.all(
          serviceNames.map(async (name) => {
            const result = await checkServiceHealth(name);
            return { name, status: result.status as "online" | "offline" | "degraded", latency: result.latency };
          })
        );
        setServices(healthResults);

        const accountRes = await getAlpacaAccount() as { ok: boolean; data: Account };
        if (accountRes.ok) setAccount(accountRes.data);

        const positionsRes = await getAlpacaPositions() as { ok: boolean; data: Position[] };
        if (positionsRes.ok) setPositions(positionsRes.data);

        const configRes = await getAutoTradeConfig() as { ok: boolean; config: AutoTradeConfig };
        if (configRes.ok) setAutoTradeConfig(configRes.config);

        try {
          const riskRes = await getRiskDashboard() as RiskDashboard;
          setRiskData(riskRes);
        } catch (e) {
          console.error("Risk dashboard unavailable:", e);
        }

        try {
          const historyRes = await getPortfolioHistory('1M', '1D') as { ok: boolean; chartData: Array<{date: string; portfolio: string}> };
          if (historyRes.ok && historyRes.chartData) {
            setPerformanceData(historyRes.chartData.map(d => ({
              date: d.date,
              portfolio: parseFloat(d.portfolio),
              benchmark: 0
            })));
          }
        } catch (e) {
          console.error("Portfolio history unavailable:", e);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRunAutoTrade = async () => {
    setAutoTradeRunning(true);
    try {
      const result = await runAutoTrade() as { ok: boolean; data: AutoTradeResult };
      if (result.ok) setAutoTradeResult(result.data);
    } catch (error) {
      console.error("Auto trade failed:", error);
    } finally {
      setAutoTradeRunning(false);
    }
  };

  const handleKillswitch = async (level: number) => {
    setKillswitchLoading(true);
    try {
      if (level === 0) {
        await deactivateKillswitch("MAGI_RESTART_CONFIRMED");
      } else {
        await activateKillswitch(level, "Manual activation from dashboard");
      }
      const riskRes = await getRiskDashboard() as RiskDashboard;
      setRiskData(riskRes);
    } catch (error) {
      console.error("Killswitch action failed:", error);
    } finally {
      setKillswitchLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <span className="text-sm text-muted-foreground font-mono">
          {new Date().toLocaleString("ja-JP")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Manager */}
          <GlassCard title="Risk Manager" glow>
            {riskData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Kill Switch</span>
                  <div className="flex items-center gap-2">
                    {riskData.killswitch.level === 0 ? (
                      <StatusBadge type="online" />
                    ) : riskData.killswitch.level === 1 ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">LEVEL 1 - ALL STOP</span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">LEVEL 2 - BUY BLOCKED</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Daily Trades</p>
                    <p className="font-mono text-lg">{riskData.dailyStats.trades}/{riskData.config.MAX_DAILY_TRADES}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Daily P&L</p>
                    <p className={`font-mono text-lg ${riskData.dailyStats.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {riskData.dailyStats.realizedPnL >= 0 ? '+' : ''}${riskData.dailyStats.realizedPnL.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weekly P&L</p>
                    <p className={`font-mono text-lg ${riskData.weeklyStats.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {riskData.weeklyStats.realizedPnL >= 0 ? '+' : ''}${riskData.weeklyStats.realizedPnL.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trade Risk</p>
                    <p className="font-mono text-lg">{(riskData.config.MAX_SINGLE_TRADE_RISK * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {riskData.killswitch.level === 0 ? (
                    <>
                      <button
                        onClick={() => handleKillswitch(2)}
                        disabled={killswitchLoading}
                        className="flex-1 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg font-semibold transition-colors"
                      >
                        Block BUY
                      </button>
                      <button
                        onClick={() => handleKillswitch(1)}
                        disabled={killswitchLoading}
                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-colors"
                      >
                        STOP ALL
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleKillswitch(0)}
                      disabled={killswitchLoading}
                      className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-colors"
                    >
                      {killswitchLoading ? "Processing..." : "Resume Trading"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">Loading risk data...</div>
            )}
          </GlassCard>

          {/* System Status */}
          <GlassCard title="System Status">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="font-mono text-sm text-foreground">{service.name}</span>
                    <div className="flex items-center gap-4">
                      <StatusBadge type={service.status} />
                      <span className="text-xs text-muted-foreground font-mono w-16 text-right">{service.latency}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Auto Trading */}
          <GlassCard title="Auto Trading">
            <div className="space-y-4">
              {autoTradeConfig && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Watch List</p>
                    <p className="font-mono">{autoTradeConfig.watchList.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Qty/Trade</p>
                    <p className="font-mono">{autoTradeConfig.qtyPerTrade}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">BUY Threshold</p>
                    <p className="font-mono">{autoTradeConfig.buyThreshold}/4 AI</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SELL Threshold</p>
                    <p className="font-mono">{autoTradeConfig.sellThreshold}/4 AI</p>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleRunAutoTrade}
                disabled={autoTradeRunning || (riskData?.killswitch.level === 1)}
                className="w-full px-4 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg text-primary-foreground font-semibold transition-colors"
              >
                {autoTradeRunning ? "Analyzing..." : riskData?.killswitch.level === 1 ? "Trading Stopped" : "Run Auto Trade Now"}
              </button>

              {autoTradeResult && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-muted-foreground">Last run: {new Date(autoTradeResult.timestamp).toLocaleString("ja-JP")}</p>
                  <div className="space-y-2">
                    {autoTradeResult.analyzed.map((item) => (
                      <div key={item.symbol} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                        <span className="font-mono font-semibold">{item.symbol}</span>
                        <div className="flex gap-3 text-xs">
                          <span className="text-green-400">BUY:{item.votes.BUY}</span>
                          <span className="text-yellow-400">HOLD:{item.votes.HOLD}</span>
                          <span className="text-red-400">SELL:{item.votes.SELL}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {autoTradeResult.orders.length > 0 && (
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <p className="text-green-400 font-semibold">Orders Executed:</p>
                      {autoTradeResult.orders.map((order, i) => (
                        <p key={i} className="text-sm">{order.side.toUpperCase()} {order.symbol}</p>
                      ))}
                    </div>
                  )}
                  {autoTradeResult.orders.length === 0 && (
                    <p className="text-sm text-muted-foreground">No orders - thresholds not met</p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Portfolio Summary */}
          <GlassCard title="Portfolio Summary">
            {account ? (
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold text-primary">
                    ${parseFloat(account.portfolio_value || account.equity).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cash</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${parseFloat(account.cash).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Buying Power</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${parseFloat(account.buying_power).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Equity</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${parseFloat(account.equity).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">Loading account...</div>
            )}
            <PerformanceChart data={performanceData} />
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Positions */}
          <GlassCard title="Positions">
            {positions.length > 0 ? (
              <div className="space-y-3">
                {positions.map((pos) => (
                  <div key={pos.symbol} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <span className="font-mono text-sm font-semibold text-foreground">{pos.symbol}</span>
                      <p className="text-xs text-muted-foreground">{pos.qty} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${parseFloat(pos.current_price).toFixed(2)}</p>
                      <p className={`text-xs ${parseFloat(pos.unrealized_plpc) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(parseFloat(pos.unrealized_plpc) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No positions</div>
            )}
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard title="Quick Actions">
            <div className="space-y-2">
              <Link to="/analysis" className="block w-full px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-center text-primary transition-colors">
                Stock Analysis
              </Link>
              <Link to="/consensus" className="block w-full px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-lg text-center text-secondary transition-colors">
                5AI Consensus
              </Link>
              <Link to="/portfolio" className="block w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-center text-foreground transition-colors">
                Portfolio
              </Link>
            </div>
          </GlassCard>

          {/* Schedule Info */}
          <GlassCard title="Auto Trade Schedule">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schedule</span>
                <span className="font-mono">Hourly (NY Market)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours</span>
                <span className="font-mono">14:30-21:30 EST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days</span>
                <span className="font-mono">Mon-Fri</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge type="online" />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
