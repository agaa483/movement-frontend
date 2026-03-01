"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  time: number;
  mei: number;
}

interface Props {
  data: DataPoint[];
}

export default function LiveChart({ data }: Props) {
  return (
    <div className="bg-[#111827] border border-[#1e2d45] rounded-lg p-4">
      <span className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3 block">
        MEI Over Time (last 60s)
      </span>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}s`}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e2d45",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 12,
            }}
            labelStyle={{ color: "#94a3b8" }}
            itemStyle={{ color: "#22d3ee" }}
            formatter={(value: number | undefined) => [value != null ? (value as number).toFixed(1) : "—", "MEI"]}
            labelFormatter={(label) => `t=${label}s`}
          />
          <ReferenceLine y={80} stroke="#22d3ee" strokeDasharray="4 4" strokeOpacity={0.3} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.3} />
          <Line
            type="monotone"
            dataKey="mei"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
