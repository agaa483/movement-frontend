"use client";

interface Metrics {
  cadence: number;
  symmetry: number;
  impact: number;
  smoothness: number;
}

interface Props {
  metrics: Metrics | null;
}

interface CardProps {
  label: string;
  value: string | number;
  unit: string;
  color: string;
  description: string;
}

function Card({ label, value, unit, color, description }: CardProps) {
  return (
    <div className="bg-[#111827] border border-[#1e2d45] rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-mono font-bold ${color}`}>
          {value ?? "—"}
        </span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
      <span className="text-xs text-slate-600">{description}</span>
    </div>
  );
}

export default function MetricCards({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card
        label="Cadence"
        value={metrics?.cadence ?? "—"}
        unit="spm"
        color="text-cyan-400"
        description="Steps per minute"
      />
      <Card
        label="Symmetry"
        value={metrics?.symmetry ?? "—"}
        unit="%"
        color={
          metrics && Math.abs(metrics.symmetry - 50) > 5
            ? "text-amber-400"
            : "text-cyan-400"
        }
        description="L/R balance (50% ideal)"
      />
      <Card
        label="Impact"
        value={metrics?.impact ?? "—"}
        unit="g"
        color={
          metrics && metrics.impact > 3.0 ? "text-red-400" : "text-cyan-400"
        }
        description="Footstrike force"
      />
      <Card
        label="Smoothness"
        value={metrics?.smoothness ?? "—"}
        unit="/100"
        color={
          metrics && metrics.smoothness < 65
            ? "text-amber-400"
            : "text-cyan-400"
        }
        description="Movement fluidity"
      />
    </div>
  );
}
