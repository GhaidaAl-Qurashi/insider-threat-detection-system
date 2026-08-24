import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { List } from "lucide-react";
import type { TacticSlice } from "../hooks/useDashboardData";

interface Props {
  data: TacticSlice[];
}

export function RiskTacticsPie({ data }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f0f4f8" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Top Risk Tactics</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="38%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 11 }}
              formatter={(val: number) => [`${val}%`, ""]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "#4a5568" }}
              formatter={(value) => <span style={{ color: "#4a5568" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ padding: "6px 12px", borderTop: "1px solid #f0f4f8" }}>
        <List size={13} color="#718096" />
      </div>
    </div>
  );
}
