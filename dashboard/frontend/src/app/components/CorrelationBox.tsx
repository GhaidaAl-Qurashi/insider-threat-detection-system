import { AlertTriangle, Clock, Copy, FileX, MapPin, Key, Link2, ArrowRight, ShieldAlert } from "lucide-react";
import type { Employee, CorrelationRule } from "../hooks/useDashboardData";

// JSON ما يقدر يحمل React nodes، فنستنتج الأيقونة المناسبة من نص الـ label
// اللي جاي من risk_scorer.py (زي "Off-hours access", "Mass file copy"...)
function iconForLabel(label: string) {
  const l = label.toLowerCase();
  if (l.includes("off-hours") || l.includes("login") || l.includes("time")) return <Clock size={13} />;
  if (l.includes("copy") || l.includes("export") || l.includes("bulk")) return <Copy size={13} />;
  if (l.includes("log") || l.includes("tamper")) return <FileX size={13} />;
  if (l.includes("privilege") || l.includes("admin")) return <Key size={13} />;
  if (l.includes("location") || l.includes("dir") || l.includes("travel") || l.includes("media")) return <MapPin size={13} />;
  return <ShieldAlert size={13} />;
}

const severityConfig = {
  critical: { color: "#e53e3e", bg: "#fff5f5", border: "#fed7d7", label: "CRITICAL" },
  high:     { color: "#dd6b20", bg: "#fffaf0", border: "#feebc8", label: "HIGH" },
  medium:   { color: "#d69e2e", bg: "#fffff0", border: "#fefcbf", label: "MEDIUM" },
};

interface Props {
  employee: Employee | null;
  correlations: CorrelationRule[];
}

export function CorrelationBox({ employee, correlations }: Props) {
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
      {/* Card header */}
      <div
        style={{
          padding: "14px 16px 10px",
          borderBottom: "1px solid #f0f4f8",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Correlation Engine</span>
        {employee && (
          <span style={{ fontSize: 12, color: "#718096" }}>— {employee.name}</span>
        )}
        {correlations.length > 0 && (
          <span
            style={{
              marginLeft: "auto",
              background: "#fff5f5",
              color: "#e53e3e",
              border: "1px solid #fed7d7",
              borderRadius: 3,
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 10px",
              letterSpacing: "0.06em",
            }}
          >
            {correlations.length} RULE{correlations.length !== 1 ? "S" : ""} MATCHED
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      {!employee && (
        <div style={{ color: "#718096", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
          Select an employee to view correlation results
        </div>
      )}

      {employee && correlations.length === 0 && (
        <div style={{ color: "#38a169", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
          No correlation rules matched — risk score is LOW
        </div>
      )}

      {correlations.map((rule) => {
        const sev = severityConfig[rule.severity];
        return (
          <div
            key={rule.id}
            style={{
              background: sev.bg,
              border: `1px solid ${sev.border}`,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {/* Rule header */}
            <div
              style={{
                padding: "8px 12px",
                borderBottom: `1px solid ${sev.border}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <AlertTriangle size={13} color={sev.color} />
              <span style={{ color: sev.color, fontSize: 12, fontWeight: 600 }}>{rule.name}</span>
              <span
                style={{
                  background: sev.color,
                  color: "#fff",
                  fontSize: 9,
                  padding: "1px 7px",
                  borderRadius: 3,
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  marginLeft: "auto",
                }}
              >
                {sev.label}
              </span>
              <span style={{ color: "#718096", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
                {rule.ruleId}
              </span>
            </div>

            <div style={{ padding: 12 }}>
              <p style={{ color: "#4a5568", fontSize: 11, marginBottom: 12, lineHeight: 1.6 }}>{rule.description}</p>

              {/* Trigger chain */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                <div style={{ color: "#718096", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Trigger Chain
                </div>
                {rule.triggers.map((trigger, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "7px 10px",
                        background: "#fff",
                        borderRadius: 4,
                        border: `1px solid ${sev.border}`,
                      }}
                    >
                      <span style={{ color: sev.color, marginTop: 1 }}>{iconForLabel(trigger.label)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#1a1a2e", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{trigger.label}</div>
                        <div style={{ color: "#718096", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{trigger.detail}</div>
                      </div>
                      <span style={{ color: "#718096", fontSize: 9, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                        {trigger.timestamp}
                      </span>
                    </div>
                    {i < rule.triggers.length - 1 && (
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <Link2 size={10} color={`${sev.color}80`} style={{ transform: "rotate(90deg)" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Result */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  background: "#fff",
                  border: `1px solid ${sev.border}`,
                  borderRadius: 4,
                }}
              >
                <ArrowRight size={11} color={sev.color} />
                <span style={{ color: sev.color, fontSize: 11, fontWeight: 600 }}>{rule.result}</span>
                <span style={{ marginLeft: "auto", color: "#718096", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
                  {rule.matchTime}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
