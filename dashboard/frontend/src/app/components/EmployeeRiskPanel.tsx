import { useState } from "react";
import { User, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { RiskGauge } from "./RiskGauge";

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  riskScore: number;
  prevScore: number;
  triggers: string[];
  lastActivity: string;
  status: "active" | "inactive";
}

const employees: Employee[] = [
  {
    id: "EMP-001",
    name: "Ahmed Al-Rashidi",
    department: "Finance",
    role: "Senior Analyst",
    riskScore: 87,
    prevScore: 61,
    triggers: ["Off-hours access", "Mass file copy", "Log tampering"],
    lastActivity: "2026-07-29 02:47:11",
    status: "active",
  },
  {
    id: "EMP-002",
    name: "Sara Al-Mutairi",
    department: "IT",
    role: "Sysadmin",
    riskScore: 63,
    prevScore: 58,
    triggers: ["Privilege escalation", "Unusual login location"],
    lastActivity: "2026-07-29 08:12:03",
    status: "active",
  },
  {
    id: "EMP-003",
    name: "Khalid Mansour",
    department: "HR",
    role: "HR Manager",
    riskScore: 42,
    prevScore: 45,
    triggers: ["Bulk data export"],
    lastActivity: "2026-07-28 17:30:55",
    status: "inactive",
  },
  {
    id: "EMP-004",
    name: "Nora Bint Fahad",
    department: "R&D",
    role: "Engineer",
    riskScore: 19,
    prevScore: 22,
    triggers: [],
    lastActivity: "2026-07-29 09:05:44",
    status: "active",
  },
];

function getRiskColor(score: number) {
  if (score >= 80) return "#e53935";
  if (score >= 60) return "#ff9800";
  if (score >= 40) return "#ffeb3b";
  return "#4caf50";
}

function getTrendIcon(current: number, prev: number) {
  const diff = current - prev;
  if (diff > 5) return <TrendingUp size={11} color="#e53935" />;
  if (diff < -5) return <TrendingDown size={11} color="#4caf50" />;
  return <Minus size={11} color="#8892a4" />;
}

interface Props {
  onSelectEmployee: (emp: Employee) => void;
  selectedId: string | null;
}

export function EmployeeRiskPanel({ onSelectEmployee, selectedId }: Props) {
  return (
    <div
      style={{
        background: "#0d1526",
        border: "1px solid rgba(30,184,208,0.15)",
        borderRadius: 4,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid rgba(30,184,208,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 14, background: "#1eb8d0", borderRadius: 2 }} />
          <span style={{ color: "#c9d1e0", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Employee Risk Scores
          </span>
        </div>
        <span style={{ color: "#8892a4", fontSize: 11 }}>{employees.length} monitored</span>
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px 80px 90px 24px",
          padding: "6px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        {["EMPLOYEE", "DEPT", "SCORE", "LAST SEEN", ""].map((h) => (
          <span key={h} style={{ color: "#8892a4", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {employees.map((emp) => {
        const isSelected = emp.id === selectedId;
        const color = getRiskColor(emp.riskScore);
        return (
          <div
            key={emp.id}
            onClick={() => onSelectEmployee(emp)}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 80px 90px 24px",
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.03)",
              background: isSelected ? "rgba(30,184,208,0.07)" : "transparent",
              borderLeft: isSelected ? "2px solid #1eb8d0" : "2px solid transparent",
              cursor: "pointer",
              alignItems: "center",
              transition: "background 0.15s",
            }}
          >
            {/* Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: `${color}22`,
                  border: `1px solid ${color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={12} color={color} />
              </div>
              <div>
                <div style={{ color: "#c9d1e0", fontSize: 12, fontWeight: 500 }}>{emp.name}</div>
                <div style={{ color: "#8892a4", fontSize: 10 }}>{emp.id}</div>
              </div>
            </div>

            {/* Dept */}
            <span style={{ color: "#8892a4", fontSize: 11 }}>{emp.department}</span>

            {/* Score */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  color,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {emp.riskScore}
              </span>
              {getTrendIcon(emp.riskScore, emp.prevScore)}
            </div>

            {/* Last seen */}
            <span style={{ color: "#8892a4", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              {emp.lastActivity.split(" ")[1]}
            </span>

            {/* Arrow */}
            <ChevronRight size={13} color={isSelected ? "#1eb8d0" : "#8892a4"} />
          </div>
        );
      })}
    </div>
  );
}

export { employees };
export type { Employee };
