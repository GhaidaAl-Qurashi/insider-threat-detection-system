import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { List } from "lucide-react";

const EMPLOYEES = [
  { key: "Al-Rashidi", color: "#3b82f6" },
  { key: "Al-Mutairi", color: "#14b8a6" },
  { key: "Mansour",    color: "#22c55e" },
  { key: "Bint Fahad", color: "#eab308" },
  { key: "Al-Qahtani", color: "#a78bfa" },
];

// Generate 24 hourly buckets
function buildData() {
  const hours = [];
  for (let h = 0; h < 24; h += 1) {
    const label = `${String(h).padStart(2, "0")}:00`;
    const row: Record<string, string | number> = { time: label };
    EMPLOYEES.forEach(({ key }, i) => {
      const base = [3200, 1800, 900, 600, 300][i];
      const noise = Math.sin(h * 0.4 + i) * base * 0.3 + Math.random() * base * 0.2;
      row[key] = Math.max(0, Math.round(base + noise));
    });
    hours.push(row);
  }
  return hours;
}

const data = buildData();

export function AlertsEvolutionChart() {
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
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Alerts evolution - Top 5 employees</span>
      </div>
      <div style={{ flex: 1, padding: "12px 8px 8px" }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 12, left: -10, bottom: 20 }} barSize={10} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "#718096", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={3}
              label={{ value: "timestamp per 60 minutes", position: "insideBottom", offset: -12, fill: "#718096", fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: "#718096", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Count", angle: -90, position: "insideLeft", offset: 16, fill: "#718096", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 11 }}
              labelStyle={{ color: "#1a1a2e", fontWeight: 600 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "#4a5568", paddingTop: 4 }}
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
            {EMPLOYEES.map(({ key, color }) => (
              <Bar key={key} dataKey={key} stackId="a" fill={color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ padding: "6px 12px", borderTop: "1px solid #f0f4f8" }}>
        <List size={13} color="#718096" />
      </div>
    </div>
  );
}
