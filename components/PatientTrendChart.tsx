"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Session } from "./SessionTable";

interface Props {
  sessions: Session[];
  patientName: string;
}

export default function PatientTrendChart({ sessions, patientName }: Props) {
  // Sort sessions oldest → newest and build chart data
  const data = [...sessions]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((s, i) => ({
      session: `S${i + 1}`,
      mei: parseFloat(s.mei.toFixed(1)),
      date: new Date(s.created_at).toLocaleDateString(),
    }));

  const avg = parseFloat((data.reduce((sum, d) => sum + d.mei, 0) / data.length).toFixed(1));
  const trend = data.length >= 2 ? data[data.length - 1].mei - data[0].mei : 0;
  const trendLabel = trend > 0 ? `↑ ${trend.toFixed(1)}` : trend < 0 ? `↓ ${Math.abs(trend).toFixed(1)}` : "→ stable";
  const trendColor = trend > 0 ? "text-cyan-400" : trend < 0 ? "text-red-400" : "text-slate-400";

  return (
    <div className="bg-[#111827] border border-[#1e2d45] rounded-lg p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">
            MEI Trend
          </h2>
          <p className="text-sm font-mono text-slate-200 mt-0.5">{patientName}</p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 block">Avg MEI</span>
            <span className="text-lg font-mono text-cyan-400">{avg}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 block">Trend</span>
            <span className={`text-lg font-mono ${trendColor}`}>{trendLabel}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 block">Sessions</span>
            <span className="text-lg font-mono text-slate-200">{data.length}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis
            dataKey="session"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#1e2d45" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#1e2d45" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d1829",
              border: "1px solid #1e2d45",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#94a3b8" }}
            itemStyle={{ color: "#22d3ee" }}
            formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : "—", "MEI"]}
            labelFormatter={(label, payload) => {
              const item = payload?.[0]?.payload;
              return item ? `${label} · ${item.date}` : label;
            }}
          />
          {/* Threshold lines */}
          <ReferenceLine y={80} stroke="#22d3ee" strokeDasharray="4 4" strokeOpacity={0.3} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.3} />
          <Line
            type="monotone"
            dataKey="mei"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={{ fill: "#22d3ee", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#22d3ee" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px bg-cyan-400 opacity-30" style={{ borderTop: "1px dashed" }} />
          <span className="text-xs font-mono text-slate-600">80 healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px bg-amber-400 opacity-30" style={{ borderTop: "1px dashed" }} />
          <span className="text-xs font-mono text-slate-600">60 threshold</span>
        </div>
      </div>
    </div>
  );
}
