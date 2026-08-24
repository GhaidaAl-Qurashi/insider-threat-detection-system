import { AlertTriangle, Users, Activity, ShieldAlert } from "lucide-react";

const stats = [
  {
    label: "Critical Employees",
    value: "1",
    sub: "+1 since yesterday",
    color: "#e53935",
    bg: "rgba(229,57,53,0.08)",
    border: "rgba(229,57,53,0.2)",
    icon: <ShieldAlert size={16} />,
  },
  {
    label: "High Risk",
    value: "2",
    sub: "Requires review",
    color: "#ff9800",
    bg: "rgba(255,152,0,0.08)",
    border: "rgba(255,152,0,0.2)",
    icon: <AlertTriangle size={16} />,
  },
  {
    label: "Monitored Users",
    value: "4",
    sub: "3 active sessions",
    color: "#1eb8d0",
    bg: "rgba(30,184,208,0.08)",
    border: "rgba(30,184,208,0.2)",
    icon: <Users size={16} />,
  },
  {
    label: "Correlated Rules",
    value: "4",
    sub: "Matched today",
    color: "#ab47bc",
    bg: "rgba(171,71,188,0.08)",
    border: "rgba(171,71,188,0.2)",
    icon: <Activity size={16} />,
  },
];

export function SummaryCards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontFamily: "'Inter', sans-serif" }}>
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 4,
              background: `${s.color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: s.color,
              flexShrink: 0,
            }}
          >
            {s.icon}
          </div>
          <div>
            <div style={{ color: s.color, fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 }}>
              {s.value}
            </div>
            <div style={{ color: "#c9d1e0", fontSize: 11, fontWeight: 500 }}>{s.label}</div>
            <div style={{ color: "#8892a4", fontSize: 9 }}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
