interface Props {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  trackColor?: string;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  size = 96,
  stroke = 10,
  trackColor = "rgba(255,255,255,0.08)",
  color = "#22D3EE",
  label,
  sublabel,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const dash = c * v;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: "stroke-dasharray 600ms cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <div className="display-num text-lg font-bold text-white">{label}</div>
        )}
        {sublabel && (
          <div className="text-[10px] uppercase tracking-[0.15em] text-mist-400 mt-0.5">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
