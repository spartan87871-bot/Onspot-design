interface ScoreDialProps {
  score: number;
  max?: number;
  label?: string;
}

export default function ScoreDial({ score, max = 10, label = "Feasibility" }: ScoreDialProps) {
  const pct = Math.max(0, Math.min(1, score / max));
  const color = pct >= 0.75 ? "#2f3b77" : pct >= 0.5 ? "#ad8a4e" : "#9c3b34";
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex items-center gap-4">
      <svg width="88" height="88" viewBox="0 0 96 96" className="-rotate-90 shrink-0">
        <circle cx="48" cy="48" r="42" fill="none" stroke="#e8dcc2" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="48"
          y="54"
          textAnchor="middle"
          fontSize="24"
          fontWeight="600"
          fill={color}
          transform="rotate(90 48 48)"
        >
          {score}
        </text>
      </svg>
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-ink-soft text-sm">out of {max}</p>
      </div>
    </div>
  );
}
