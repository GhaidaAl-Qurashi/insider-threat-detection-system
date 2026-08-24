import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { Alert } from "../hooks/useDashboardData";

const LINK_BLUE = "#2d9cdb";

interface Props {
  alerts: Alert[];
}

function levelColor(level: number) {
  if (level >= 12) return "#e53e3e";
  if (level >= 9)  return "#dd6b20";
  if (level >= 6)  return "#d69e2e";
  return "#718096";
}

function riskBadge(score: number) {
  if (score >= 80) return { bg: "#fff5f5", color: "#e53e3e", border: "#fed7d7" };
  if (score >= 60) return { bg: "#fffaf0", color: "#dd6b20", border: "#feebc8" };
  if (score >= 40) return { bg: "#fffff0", color: "#d69e2e", border: "#fefcbf" };
  return { bg: "#f0fff4", color: "#38a169", border: "#c6f6d5" };
}

export function SecurityAlertsTable({ alerts }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Security alerts</span>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "20px 200px 90px 100px 160px 160px 1fr 70px 80px",
          padding: "8px 16px",
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc",
          gap: 8,
          alignItems: "center",
        }}
      >
        {["", "Time ↓", "Agent", "Agent name", "Technique(s)", "Tactic(s)", "Description", "Level", "Rule ID"].map((h) => (
          <span
            key={h}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#4a5568",
              display: "flex",
              alignItems: "center",
              gap: 3,
              cursor: h === "Time ↓" ? "pointer" : "default",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {alerts.map((alert) => {
        const isOpen = expanded === alert.id;
        const rb = riskBadge(alert.riskScore);
        return (
          <div key={alert.id}>
            <div
              onClick={() => setExpanded(isOpen ? null : alert.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "20px 200px 90px 100px 160px 160px 1fr 70px 80px",
                padding: "10px 16px",
                borderBottom: "1px solid #f0f4f8",
                gap: 8,
                alignItems: "center",
                cursor: "pointer",
                background: isOpen ? "#f8fafc" : "#fff",
                transition: "background 0.1s",
              }}
            >
              <span style={{ color: "#718096" }}>
                {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <span style={{ fontSize: 11, color: "#4a5568", fontFamily: "'JetBrains Mono', monospace" }}>
                {alert.time}
              </span>
              <span style={{ fontSize: 11, color: LINK_BLUE, fontWeight: 500, cursor: "pointer" }}>
                {alert.agentId}
              </span>
              <span style={{ fontSize: 11, color: LINK_BLUE, fontWeight: 500 }}>
                {alert.agentName}
              </span>
              <span style={{ fontSize: 11, color: LINK_BLUE, fontWeight: 500 }}>
                {alert.mitreTechnique}
              </span>
              <span style={{ fontSize: 11, color: "#4a5568" }}>{alert.mitreTactic}</span>
              <span style={{ fontSize: 11, color: "#1a1a2e" }}>{alert.description}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: levelColor(alert.level) }}>
                {alert.level}
              </span>
              <span style={{ fontSize: 11, color: LINK_BLUE, fontWeight: 500 }}>{alert.ruleId}</span>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div
                style={{
                  padding: "12px 36px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  ["Agent ID", alert.agentId],
                  ["Agent name", alert.agentName],
                  ["MITRE technique", alert.mitreTechnique],
                  ["MITRE tactic", alert.mitreTactic],
                  ["Rule level", String(alert.level)],
                  ["Rule ID", alert.ruleId],
                  ["Risk score", String(alert.riskScore)],
                  ["Timestamp", alert.time],
                  ["Description", alert.description],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: "#718096", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: label === "Risk score" ? rb.color : label === "Rule ID" || label === "MITRE technique" ? LINK_BLUE : "#1a1a2e",
                        fontWeight: label === "Risk score" ? 700 : 400,
                        fontFamily: label === "Timestamp" ? "'JetBrains Mono', monospace" : "inherit",
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
