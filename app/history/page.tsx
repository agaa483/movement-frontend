"use client";

import { useState, useEffect, useCallback } from "react";
import SessionTable, { Session } from "@/components/SessionTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://web-production-43f13.up.railway.app";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/sessions`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setSessions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await fetch(`${API_URL}/api/sessions/${id}`, { method: "DELETE" });
        setSessions((prev) => prev.filter((s) => s.id !== id));
      } catch {
        alert("Failed to delete session");
      }
    },
    []
  );

  const handleExpand = useCallback(async (id: string): Promise<Session> => {
    const res = await fetch(`${API_URL}/api/sessions/${id}`);
    return res.json();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1c] p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold text-slate-100 tracking-wide">
            Session History
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            Gait Analysis · Saved Sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSessions}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 border border-[#1e2d45] px-3 py-1 rounded transition-colors"
          >
            ↺ Refresh
          </button>
          <a
            href="/"
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 border border-[#1e2d45] px-3 py-1 rounded transition-colors"
          >
            ← Dashboard
          </a>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="text-slate-500 font-mono text-sm animate-pulse">
            Loading sessions…
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-400 font-mono text-sm">{error}</p>
          <p className="text-slate-500 font-mono text-xs mt-2">
            Make sure the backend is running and Supabase is configured.
          </p>
        </div>
      ) : (
        <SessionTable
          sessions={sessions}
          onDelete={handleDelete}
          onExpand={handleExpand}
        />
      )}
    </div>
  );
}
