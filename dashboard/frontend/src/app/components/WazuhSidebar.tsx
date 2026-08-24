import { Shield, Activity, AlertTriangle, Users, BarChart2, Search, Settings, Bell, ChevronRight, Radio } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: <BarChart2 size={16} />, label: "Overview" },
  { icon: <Shield size={16} />, label: "Insider Threat", active: true },
  { icon: <Activity size={16} />, label: "Security Events", badge: 43 },
  { icon: <AlertTriangle size={16} />, label: "Alerts", badge: 12 },
  { icon: <Users size={16} />, label: "Employees" },
  { icon: <Search size={16} />, label: "Discover" },
];

export function WazuhSidebar() {
  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 220,
        minWidth: 220,
        background: "#060c1a",
        borderRight: "1px solid rgba(30,184,208,0.1)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(30,184,208,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 4,
            background: "linear-gradient(135deg, #1eb8d0, #0d7a8a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Shield size={16} color="#fff" />
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}>WAZUH</div>
          <div style={{ color: "#1eb8d0", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>Security Platform</div>
        </div>
      </div>

      {/* Agent selector */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid rgba(30,184,208,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <Radio size={10} color="#4caf50" />
        <span style={{ color: "#8892a4", fontSize: 11 }}>All agents</span>
        <ChevronRight size={11} color="#8892a4" style={{ marginLeft: "auto" }} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {navItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 16px",
              cursor: "pointer",
              background: item.active ? "rgba(30,184,208,0.08)" : "transparent",
              borderLeft: item.active ? "2px solid #1eb8d0" : "2px solid transparent",
              color: item.active ? "#1eb8d0" : "#8892a4",
              fontSize: 12,
              fontWeight: item.active ? 500 : 400,
              transition: "all 0.15s",
            }}
          >
            {item.icon}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  background: item.label === "Alerts" ? "#e53935" : "#1eb8d0",
                  color: "#fff",
                  fontSize: 9,
                  padding: "1px 5px",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid rgba(30,184,208,0.1)", padding: "10px 16px", display: "flex", gap: 14, alignItems: "center" }}>
        <Settings size={14} color="#8892a4" style={{ cursor: "pointer" }} />
        <Bell size={14} color="#8892a4" style={{ cursor: "pointer" }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1eb8d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#080e1f", fontWeight: 700 }}>AD</div>
        </div>
      </div>
    </div>
  );
}
