"use client";

import { useEffect, useRef } from "react";

export interface AlertEntry {
  id: string;
  time: number;
  message: string;
  type: "info" | "warning" | "critical";
}

interface Props {
  alerts: AlertEntry[];
}

function alertStyle(type: AlertEntry["type"]) {
  switch (type) {
    case "info":
      return "text-emerald-400 border-emerald-800 bg-emerald-950/40";
    case "warning":
      return "text-amber-400 border-amber-800 bg-amber-950/40";
    case "critical":
      return "text-red-400 border-red-800 bg-red-950/40";
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function AlertFeed({ alerts }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [alerts]);

  return (
    <div className="bg-[#111827] border border-[#1e2d45] rounded-lg p-4 flex flex-col h-full">
      <span className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
        Alert Feed
      </span>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0 max-h-[500px]">
        {alerts.length === 0 ? (
          <span className="text-xs text-slate-600 font-mono">
            No alerts — awaiting session data…
          </span>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-slide-in border rounded px-3 py-2 text-xs font-mono ${alertStyle(alert.type)}`}
            >
              <span className="opacity-60">[{formatTime(alert.time)}]</span>{" "}
              {alert.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
