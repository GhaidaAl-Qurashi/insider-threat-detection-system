interface Stat {
  label: string;
  value: string;
  color: string;
}

interface Props {
  stats: Stat[];
}

export function StatRow({ stats }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            padding: "20px 24px",
            textAlign: "center",
            borderRight: i < stats.length - 1 ? "1px solid #e2e8f0" : "none",
          }}
        >
          <div style={{ color: "#718096", fontSize: 12, marginBottom: 6, fontWeight: 400 }}>{s.label}</div>
          <div style={{ color: s.color, fontSize: 30, fontWeight: 700, fontFamily: "'Inter', sans-serif", lineHeight: 1.1 }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
