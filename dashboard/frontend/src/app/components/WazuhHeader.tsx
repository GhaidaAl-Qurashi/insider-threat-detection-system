import { useState } from "react";
import { Menu, Radio, FileText, Search, RefreshCw, ChevronDown, Plus, X, Calendar } from "lucide-react";

interface Props {
  activeTab: "dashboard" | "events";
  onTabChange: (tab: "dashboard" | "events") => void;
}

const BLUE = "#1d6fa4";

export function WazuhHeader({ activeTab, onTabChange }: Props) {
  const [search, setSearch] = useState("");

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", fontFamily: "'Inter', sans-serif", position: "sticky", top: 0, zIndex: 100 }}>

      {/* Top bar: logo + module + actions */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 20px", height: 50, gap: 12 }}>
        <Menu size={18} color="#718096" style={{ cursor: "pointer", flexShrink: 0 }} />

        {/* W. logo */}
        <span style={{ fontSize: 22, fontWeight: 800, color: BLUE, letterSpacing: "-0.05em", lineHeight: 1 }}>
          W<span style={{ color: "#e53e3e" }}>.</span>
        </span>

        {/* Module pill */}
        <div style={{ background: "#e8f4fd", color: BLUE, fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 20 }}>
          Insider Threat Monitor
        </div>

        <div style={{ flex: 1 }} />

        <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: BLUE, fontSize: 12, fontWeight: 500, cursor: "pointer", padding: "4px 8px" }}>
          <Radio size={13} color={BLUE} />
          Explore agent
        </button>
        <div style={{ width: 1, height: 18, background: "#e2e8f0" }} />
        <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: BLUE, fontSize: 12, fontWeight: 500, cursor: "pointer", padding: "4px 8px" }}>
          <FileText size={13} color={BLUE} />
          Generate report
        </button>
      </div>

      {/* Tab bar: Dashboard | Events + time range + refresh */}
      <div style={{ display: "flex", alignItems: "stretch", padding: "0 20px", borderTop: "1px solid #f0f4f8", height: 40 }}>
        {(["dashboard", "events"] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                background: "none",
                border: "none",
                borderBottom: active ? `2px solid ${BLUE}` : "2px solid transparent",
                color: active ? BLUE : "#718096",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                padding: "0 16px",
                marginBottom: -1,
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e2e8f0", borderRadius: 4, padding: "4px 10px", width: 220 }}>
            <Search size={12} color="#718096" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              style={{ border: "none", outline: "none", fontSize: 12, color: "#1a1a2e", background: "transparent", flex: 1, fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #e2e8f0", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "#4a5568" }}>
            <Calendar size={12} color="#718096" />
            <span>Last 24 hours</span>
            <ChevronDown size={11} color="#718096" />
          </div>
          <button
            style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #e2e8f0", borderRadius: 4, padding: "4px 12px", background: "#fff", cursor: "pointer", fontSize: 12, color: BLUE, fontWeight: 500 }}
          >
            <RefreshCw size={11} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter chips bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "5px 20px", gap: 8, background: "#fafbfc", borderTop: "1px solid #f0f4f8" }}>
        <span style={{ fontSize: 11, color: "#718096" }}>cluster.name:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#e8f4fd", border: "1px solid #bee3f8", borderRadius: 3, padding: "2px 8px", fontSize: 11, color: BLUE }}>
          <span>insider-threat</span>
          <X size={10} color="#718096" style={{ cursor: "pointer" }} />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: BLUE, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
          <Plus size={11} />
          Add filter
        </button>
      </div>
    </div>
  );
}
