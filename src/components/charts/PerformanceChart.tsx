import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  date: string;
  portfolio: number;
  benchmark?: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  showBenchmark?: boolean;
}

export function PerformanceChart({ data, showBenchmark = true }: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.3}
        />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          formatter={(value: number, name: string) => [
            `${value > 0 ? "+" : ""}${value.toFixed(2)}%`,
            name === "portfolio" ? "Portfolio" : "S&P 500",
          ]}
        />
        {showBenchmark && (
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            formatter={(value) => (
              <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "12px" }}>
                {value === "portfolio" ? "Portfolio" : "S&P 500"}
              </span>
            )}
          />
        )}
        <Line
          type="monotone"
          dataKey="portfolio"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
        />
        {showBenchmark && (
          <Line
            type="monotone"
            dataKey="benchmark"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--secondary))" }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
