import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { List } from "lucide-react";
import type { Employee } from "../hooks/useDashboardData";

function riskColor(score: number) {
  if (score >= 80) return "#e53e3e";
  if (score >= 60) return "#dd6b20";
  if (score >= 40) return "#d69e2e";
  if (score >= 15) return "#38a169";
  return "#718096";
}

function scoreLabel(s: number) {
  if (s >= 80) return "Critical";
  if (s >= 60) return "High";
  if (s >= 40) return "Medium";
  return "Low";
}

interface Props {
  employees: Employee[];
}

export function TopEmployeesPanel({ employees }: Props) {
  const top5 = [...employees]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map((e) => ({
      name: e.name,
      score: e.riskScore,
      color: riskColor(e.riskScore),
    }));

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f0f4f8" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Top 5 employees by risk</span>
      </div>

      {top5.length === 0 ? (
        <div style={{ padding: "24px 16px", textAlign: "center", color: "#718096", fontSize: 12 }}>
          No employee data yet
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", padding: "8px 0 0" }}>
          <div style={{ width: 140, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={top5}
                  dataKey="score"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  stroke="none"
                >
                  {top5.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 11 }}
                  formatter={(val: number, name: string) => [`${val} — ${scoreLabel(val)}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ flex: 1, padding: "0 16px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
            {top5.map((e) => (
              <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: "#4a5568" }}>{e.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: e.color }}>{e.score}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: e.color,
                    background: `${e.color}18`,
                    padding: "1px 6px",
                    borderRadius: 3,
                    letterSpacing: "0.05em",
                    minWidth: 46,
                    textAlign: "center",
                  }}
                >
                  {scoreLabel(e.score).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "8px 12px", borderTop: "1px solid #f0f4f8", marginTop: "auto" }}>
        <List size={13} color="#718096" />
      </div>
    </div>
  );
}
