interface RiskGaugeProps {
  score: number;
  size?: number;
}

function getRiskColor(score: number) {
  if (score >= 80) return "#e53935";
  if (score >= 60) return "#ff9800";
  if (score >= 40) return "#ffeb3b";
  return "#4caf50";
}

function getRiskLabel(score: number) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

export function RiskGauge({ score, size = 100 }: RiskGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = Math.PI * radius; // half circle
  const strokeWidth = 8;
  const cx = size / 2;
  const cy = size / 2;

  // Arc: half circle from left to right (bottom half hidden)
  const offset = circumference - (score / 100) * circumference;
  const color = getRiskColor(score);
  const label = getRiskLabel(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s" }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="'JetBrains Mono', monospace"
        >
          {score}
        </text>
        {/* Label */}
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.085}
          fontWeight="600"
          fontFamily="'Inter', sans-serif"
          letterSpacing="0.08em"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
