import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface DataPoint {
  value: number;
}

interface MiniSparklineProps {
  data: DataPoint[];
  positive?: boolean;
  height?: number;
}

export function MiniSparkline({ data, positive = true, height = 40 }: MiniSparklineProps) {
  const color = positive ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={`sparkline-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sparkline-${positive})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
