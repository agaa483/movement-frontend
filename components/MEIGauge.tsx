"use client";

interface Props {
  mei: number | null;
}

function getMeiColor(mei: number): string {
  if (mei >= 80) return "#22d3ee"; // cyan-400
  if (mei >= 60) return "#f59e0b"; // amber-400
  return "#ef4444"; // red-400
}

function getMeiLabel(mei: number): string {
  if (mei >= 80) return "Optimal";
  if (mei >= 60) return "Suboptimal";
  return "Critical";
}

export default function MEIGauge({ mei }: Props) {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;

  const value = mei ?? 0;
  const progress = value / 100;
  const dashOffset = circumference - progress * circumference;
  const color = getMeiColor(value);
  const label = getMeiLabel(value);

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
        Movement Efficiency Index
      </span>
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        {/* Background ring */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg]"
        >
          <circle
            stroke="#1e2d45"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
          />
        </svg>
        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-mono font-bold"
            style={{ color, transition: "color 0.4s ease" }}
          >
            {mei !== null ? value.toFixed(0) : "—"}
          </span>
          {mei !== null && (
            <span className="text-xs font-mono" style={{ color }}>
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
