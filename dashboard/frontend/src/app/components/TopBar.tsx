import { Search, RefreshCw, Filter, Download, Shield, Radio } from "lucide-react";
import { useState, useEffect } from "react";

export function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n: number) => String(n).padStart(2, "0");
  const timeStr = `${fmt(time.getHours())}:${fmt(time.getMinutes())}:${fmt(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString("en-SA", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div
      style={{
        background: "#060c1a",
        borderBottom: "1px solid rgba(30,184,208,0.12)",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: "'Inter', sans-serif",
        flexShrink: 0,
      }}
    >
      {/* Module path */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Shield size={13} color="#1eb8d0" />
        <span style={{ color: "#8892a4", fontSize: 11 }}>Threat Intelligence</span>
        <span style={{ color: "#8892a4", fontSize: 11 }}>/</span>
        <span style={{ color: "#c9d1e0", fontSize: 11, fontWeight: 500 }}>Insider Threat Monitor</span>
      </div>

      {/* Time range */}
      <div
        style={{
          marginLeft: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          background: "#111d34",
          border: "1px solid rgba(30,184,208,0.15)",
          borderRadius: 3,
          cursor: "pointer",
        }}
      >
        <Filter size={10} color="#8892a4" />
        <span style={{ color: "#8892a4", fontSize: 10 }}>Last 24 hours</span>
      </div>

      {/* Search */}
      <div
        style={{
          flex: 1,
          maxWidth: 320,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px",
          background: "#111d34",
          border: "1px solid rgba(30,184,208,0.15)",
          borderRadius: 3,
        }}
      >
        <Search size={11} color="#8892a4" />
        <span style={{ color: "#8892a4", fontSize: 11 }}>Search agents, users, events...</span>
      </div>

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Radio size={9} color="#4caf50" />
          <span style={{ color: "#4caf50", fontSize: 9, letterSpacing: "0.1em" }}>LIVE</span>
        </div>
        <span style={{ color: "#8892a4", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{dateStr}</span>
        <span style={{ color: "#1eb8d0", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{timeStr}</span>
        <RefreshCw size={12} color="#8892a4" style={{ cursor: "pointer" }} />
        <Download size={12} color="#8892a4" style={{ cursor: "pointer" }} />
      </div>
    </div>
  );
}
