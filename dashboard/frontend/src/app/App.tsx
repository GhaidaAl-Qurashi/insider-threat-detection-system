import { useState } from "react";
import { WazuhHeader } from "./components/WazuhHeader";
import { StatRow } from "./components/StatRow";
import { TopEmployeesPanel } from "./components/TopEmployeesPanel";
import { RiskTacticsPie } from "./components/RiskTacticsPie";
import { CorrelationBox } from "./components/CorrelationBox";
import { SecurityAlertsTable } from "./components/SecurityAlertsTable";
import { useDashboardData } from "./hooks/useDashboardData";


const DATA_SOURCE_URL = "http://100.115.168.118:8000/dashboard_data.json";
const POLL_INTERVAL_MS = 30_000;

export default function App() {
  const { data, loading, error } = useDashboardData(DATA_SOURCE_URL, POLL_INTERVAL_MS);
  const [activeTab, setActiveTab] = useState<"dashboard" | "events">("dashboard");
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", color: "#718096" }}>
       Downloading data..
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", color: "#e53e3e" }}>
       Failed: {error ?? "No data"}
      </div>
    );
  }

  const selectedEmployee = data.employees[selectedIdx] ?? null;
  const selectedCorrelations = selectedEmployee ? (data.correlations[selectedEmployee.id] ?? []) : [];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>
      <WazuhHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 1440, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* Stats row */}
        <StatRow stats={data.stats} />

        {/* Row: top employees donut + correlation engine */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TopEmployeesPanel employees={data.employees} />
            <RiskTacticsPie data={data.tacticsBreakdown} />
          </div>
          <CorrelationBox employee={selectedEmployee} correlations={selectedCorrelations} />
        </div>

        {/* Security alerts table */}
        <SecurityAlertsTable alerts={data.alerts} />

      </div>
    </div>
  );
}
