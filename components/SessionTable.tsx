"use client";

import { useState } from "react";

export interface Session {
  id: string;
  patient_name: string;
  profile: string;
  duration: number;
  mei: number;
  avg_cadence: number;
  avg_symmetry: number;
  avg_impact: number;
  avg_smoothness: number;
  alert_count: number;
  alerts?: { time: number; message: string }[];
  metrics_history?: { time: number; cadence: number; symmetry: number; impact: number; smoothness: number; mei: number }[];
  created_at: string;
}

interface Props {
  sessions: Session[];
  onDelete: (id: string) => void;
  onExpand: (id: string) => Promise<Session>;
}

const PROFILE_LABELS: Record<string, string> = {
  normal_walk_recovery: "Normal Walk",
  normal_run_recovery: "Normal Run",
  compensating_gait: "Compensating",
  post_exercise_fatigue: "Post-Fatigue",
};

function meiColor(mei: number): string {
  if (mei >= 80) return "text-cyan-400";
  if (mei >= 60) return "text-amber-400";
  return "text-red-400";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function SessionTable({ sessions, onDelete, onExpand }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Session | null>(null);

  async function handleRowClick(id: string) {
    if (expanded === id) {
      setExpanded(null);
      setExpandedData(null);
      return;
    }
    const data = await onExpand(id);
    setExpanded(id);
    setExpandedData(data);
  }

  if (sessions.length === 0) {
    return (
      <div className="text-slate-500 font-mono text-sm text-center py-12">
        No sessions saved yet. Start a monitoring session to see data here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="grid grid-cols-6 gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest text-slate-500">
        <span>Date</span>
        <span>Patient</span>
        <span>Profile</span>
        <span>Duration</span>
        <span>MEI</span>
        <span>Alerts</span>
      </div>

      {sessions.map((session) => (
        <div key={session.id}>
          {/* Row */}
          <div
            onClick={() => handleRowClick(session.id)}
            className="grid grid-cols-6 gap-2 items-center px-4 py-3 bg-[#111827] border border-[#1e2d45] rounded-lg cursor-pointer hover:border-cyan-900 transition-colors"
          >
            <span className="text-xs font-mono text-slate-400">
              {new Date(session.created_at).toLocaleDateString()}
            </span>
            <span className="text-sm font-mono text-slate-200 truncate">
              {session.patient_name}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {PROFILE_LABELS[session.profile] ?? session.profile}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {formatDuration(session.duration)}
            </span>
            <span className={`text-sm font-mono font-bold ${meiColor(session.mei)}`}>
              {session.mei?.toFixed(1)}
            </span>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-mono ${
                  session.alert_count > 0 ? "text-amber-400" : "text-slate-500"
                }`}
              >
                {session.alert_count}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="text-xs text-red-600 hover:text-red-400 font-mono transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Expanded detail */}
          {expanded === session.id && expandedData && (
            <div className="border border-[#1e2d45] border-t-0 rounded-b-lg bg-[#0d1829] px-4 py-4 flex flex-col gap-4">
              {/* Summary metrics */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Avg Cadence", value: expandedData.avg_cadence?.toFixed(1), unit: "spm" },
                  { label: "Avg Symmetry", value: expandedData.avg_symmetry?.toFixed(1), unit: "%" },
                  { label: "Avg Impact", value: expandedData.avg_impact?.toFixed(2), unit: "g" },
                  { label: "Avg Smoothness", value: expandedData.avg_smoothness?.toFixed(1), unit: "/100" },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-xs font-mono text-slate-500">{label}</span>
                    <span className="text-lg font-mono text-cyan-400">
                      {value} <span className="text-xs text-slate-500">{unit}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              {expandedData.alerts && expandedData.alerts.length > 0 && (
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2 block">
                    Session Alerts
                  </span>
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {expandedData.alerts.map((a, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono text-amber-400 border border-amber-900 bg-amber-950/30 rounded px-3 py-1"
                      >
                        [{String(Math.floor(a.time / 60)).padStart(2, "0")}:
                        {String(a.time % 60).padStart(2, "0")}] {a.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
