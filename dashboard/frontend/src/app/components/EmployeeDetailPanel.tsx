import { RiskGauge } from "./RiskGauge";
import type { Employee } from "./EmployeeRiskPanel";
import { Activity, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const riskHistoryByEmployee: Record<string, { time: string; score: number }[]> = {
  "EMP-001": [
    { time: "06:00", score: 12 },
    { time: "08:00", score: 18 },
    { time: "10:00", score: 24 },
    { time: "12:00", score: 20 },
    { time: "14:00", score: 22 },
    { time: "16:00", score: 35 },
    { time: "18:00", score: 38 },
    { time: "20:00", score: 42 },
    { time: "22:00", score: 55 },
    { time: "00:00", score: 68 },
    { time: "02:00", score: 71 },
    { time: "02:47", score: 87 },
  ],
  "EMP-002": [
    { time: "06:00", score: 10 },
    { time: "07:00", score: 14 },
    { time: "08:00", score: 63 },
    { time: "09:00", score: 60 },
  ],
  "EMP-003": [
    { time: "09:00", score: 10 },
    { time: "12:00", score: 18 },
    { time: "15:00", score: 30 },
    { time: "17:00", score: 42 },
    { time: "17:30", score: 42 },
  ],
  "EMP-004": [
    { time: "08:00", score: 5 },
    { time: "10:00", score: 8 },
    { time: "12:00", score: 12 },
    { time: "14:00", score: 19 },
  ],
};

const recentEventsByEmployee: Record<string, { time: string; event: string; host: string; level: "critical" | "high" | "medium" | "low" }[]> = {
  "EMP-001": [
    { time: "02:51:03", event: "Windows Event Log cleared", host: "WS-FIN-044", level: "critical" },
    { time: "02:48:39", event: "3412 files copied to removable media", host: "WS-FIN-044", level: "critical" },
    { time: "02:47:58", event: "Admin token used on \\\\fileserver\\Finance", host: "WS-FIN-044", level: "high" },
    { time: "02:47:11", event: "Authentication success (off-hours)", host: "WS-FIN-044", level: "high" },
    { time: "02:45:00", event: "USB storage device connected", host: "WS-FIN-044", level: "medium" },
    { time: "22:12:33", event: "VPN connection established", host: "WS-FIN-044", level: "low" },
  ],
  "EMP-002": [
    { time: "08:11:22", event: "Auth from external IP 185.213.44.12 (UAE)", host: "SRV-IT-01", level: "high" },
    { time: "08:00:14", event: "Auth success from 192.168.12.44 (Riyadh)", host: "SRV-IT-01", level: "medium" },
    { time: "07:58:02", event: "sudo command executed: passwd root", host: "SRV-IT-01", level: "high" },
  ],
  "EMP-003": [
    { time: "17:29:44", event: "HR_Employee_PII_Full.csv exported (2.4MB)", host: "WS-HR-012", level: "medium" },
    { time: "17:21:10", event: "Access to /HR/Confidential directory", host: "WS-HR-012", level: "medium" },
    { time: "15:04:33", event: "Normal workstation usage", host: "WS-HR-012", level: "low" },
  ],
  "EMP-004": [
    { time: "09:05:44", event: "Normal login", host: "WS-RD-007", level: "low" },
    { time: "08:30:12", event: "Code repository push", host: "WS-RD-007", level: "low" },
  ],
};

const levelConfig = {
  critical: { color: "#e53935", bg: "rgba(229,57,53,0.15)" },
  high: { color: "#ff9800", bg: "rgba(255,152,0,0.12)" },
  medium: { color: "#ffeb3b", bg: "rgba(255,235,59,0.1)" },
  low: { color: "#4caf50", bg: "rgba(76,175,80,0.1)" },
};

interface Props {
  employee: Employee | null;
}

export function EmployeeDetailPanel({ employee }: Props) {
  if (!employee) {
    return (
      <div
        style={{
          background: "#0d1526",
          border: "1px solid rgba(30,184,208,0.15)",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8892a4",
          fontSize: 12,
          fontFamily: "'Inter', sans-serif",
          minHeight: 200,
        }}
      >
        Select an employee to view details
      </div>
    );
  }

  const history = riskHistoryByEmployee[employee.id] || [];
  const events = recentEventsByEmployee[employee.id] || [];

  const color =
    employee.riskScore >= 80
      ? "#e53935"
      : employee.riskScore >= 60
      ? "#ff9800"
      : employee.riskScore >= 40
      ? "#ffeb3b"
      : "#4caf50";

  return (
    <div
      style={{
        background: "#0d1526",
        border: "1px solid rgba(30,184,208,0.15)",
        borderRadius: 4,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid rgba(30,184,208,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ width: 3, height: 14, background: "#1eb8d0", borderRadius: 2 }} />
        <span style={{ color: "#c9d1e0", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Employee Detail
        </span>
        <span style={{ marginLeft: "auto", color: "#8892a4", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          {employee.id}
        </span>
      </div>

      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Top: gauge + info */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <RiskGauge score={employee.riskScore} size={110} />
            <span style={{ color: "#8892a4", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Risk Score</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#c9d1e0", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{employee.name}</div>
            <div style={{ color: "#8892a4", fontSize: 11, marginBottom: 10 }}>{employee.role} · {employee.department}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {employee.triggers.map((t) => (
                <span
                  key={t}
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}44`,
                    color,
                    fontSize: 9,
                    padding: "2px 7px",
                    borderRadius: 2,
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {t}
                </span>
              ))}
              {employee.triggers.length === 0 && (
                <span style={{ color: "#4caf50", fontSize: 10 }}>No active triggers</span>
              )}
            </div>
          </div>
        </div>

        {/* Risk trend chart */}
        <div>
          <div style={{ color: "#8892a4", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={10} />
            Risk Score Timeline (Today)
          </div>
          <div style={{ height: 70 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 2, right: 4, left: -30, bottom: 0 }}>
                <XAxis dataKey="time" tick={{ fill: "#8892a4", fontSize: 8, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#8892a4", fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d1526", border: "1px solid rgba(30,184,208,0.2)", borderRadius: 3, fontSize: 10 }}
                  labelStyle={{ color: "#8892a4" }}
                  itemStyle={{ color }}
                />
                <Area type="monotone" dataKey="score" stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.12} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent events */}
        <div>
          <div style={{ color: "#8892a4", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={10} />
            Recent Events
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {events.map((ev, i) => {
              const lc = levelConfig[ev.level];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "5px 8px",
                    background: lc.bg,
                    borderRadius: 2,
                    borderLeft: `2px solid ${lc.color}`,
                  }}
                >
                  <span
                    style={{
                      color: lc.color,
                      fontSize: 8,
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0,
                      marginTop: 1,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {ev.time}
                  </span>
                  <span style={{ color: "#c9d1e0", fontSize: 10, flex: 1 }}>{ev.event}</span>
                  <span style={{ color: "#8892a4", fontSize: 9, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                    {ev.host}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
