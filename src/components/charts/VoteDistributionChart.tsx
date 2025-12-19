import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface VoteData {
  name: string;
  value: number;
  color: string;
}

interface VoteDistributionChartProps {
  data: VoteData[];
}

export function VoteDistributionChart({ data }: VoteDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number, name: string) => [
            `${value}%`,
            name,
          ]}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value) => (
            <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "12px" }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
