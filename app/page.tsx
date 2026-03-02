"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ControlPanel from "@/components/ControlPanel";
import MetricCards from "@/components/MetricCards";
import MEIGauge from "@/components/MEIGauge";
import LiveChart from "@/components/LiveChart";
import AlertFeed, { AlertEntry } from "@/components/AlertFeed";

interface Metrics {
  cadence: number;
  symmetry: number;
  impact: number;
  smoothness: number;
  mei: number;
  alerts: string[];
  elapsed: number;
}

interface ChartPoint {
  time: number;
  mei: number;
}

const MAX_CHART_POINTS = 60;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://web-production-43f13.up.railway.app";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "wss://web-production-43f13.up.railway.app/ws";

export default function DashboardPage() {
  const [patientName, setPatientName] = useState("");
  const profile = "normal_walk_recovery";
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<Metrics[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const alertCounterRef = useRef(0);
  const metricsHistoryRef = useRef<Metrics[]>([]);
  const alertsRef = useRef<AlertEntry[]>([]);

  const addAlert = useCallback(
    (message: string, type: AlertEntry["type"], time: number) => {
      const entry: AlertEntry = {
        id: `${Date.now()}-${alertCounterRef.current++}`,
        time,
        message,
        type,
      };
      setAlerts((prev) => {
        const next = [...prev, entry];
        alertsRef.current = next;
        return next;
      });
    },
    []
  );

  const stopSession = useCallback(async (history: Metrics[], currentAlerts: AlertEntry[], currentElapsed: number, name: string, prof: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    setIsActive(false);
    addAlert("Monitoring session ended", "info", currentElapsed);

    if (history.length === 0) return;

    const avg = (key: keyof Metrics) =>
      history.reduce((s, m) => s + (m[key] as number), 0) / history.length;

    const sessionData = {
      patient_name: name,
      profile: prof,
      duration: currentElapsed,
      mei: parseFloat(avg("mei").toFixed(1)),
      avg_cadence: parseFloat(avg("cadence").toFixed(1)),
      avg_symmetry: parseFloat(avg("symmetry").toFixed(1)),
      avg_impact: parseFloat(avg("impact").toFixed(2)),
      avg_smoothness: parseFloat(avg("smoothness").toFixed(1)),
      alerts: currentAlerts
        .filter((a) => a.type !== "info")
        .map((a) => ({ time: a.time, message: a.message })),
      metrics_history: history.map((m, i) => ({
        time: i,
        cadence: m.cadence,
        symmetry: m.symmetry,
        impact: m.impact,
        smoothness: m.smoothness,
        mei: m.mei,
      })),
    };

    try {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      if (res.ok) {
        const saved = await res.json();
        addAlert(`Session saved (ID: ${saved.id?.slice(0, 8)}…)`, "info", currentElapsed);
      }
    } catch {
      addAlert("Could not save session — database not configured", "warning", currentElapsed);
    }
  }, [addAlert]);

  const startSession = useCallback(() => {
    elapsedRef.current = 0;
    metricsHistoryRef.current = [];
    alertsRef.current = [];
    setElapsed(0);
    setMetrics(null);
    setChartData([]);
    setAlerts([]);
    setMetricsHistory([]);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsActive(true);
      addAlert("Monitoring session started", "info", 0);

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed((e) => e + 1);
      }, 1000);
    };

    ws.onmessage = (event) => {
      const data: Metrics = JSON.parse(event.data);
      setMetrics(data);

      const point: ChartPoint = {
        time: Math.round(elapsedRef.current),
        mei: data.mei,
      };

      setChartData((prev) => {
        const next = [...prev, point];
        return next.length > MAX_CHART_POINTS
          ? next.slice(next.length - MAX_CHART_POINTS)
          : next;
      });

      setMetricsHistory((prev) => {
        const next = [...prev, data];
        metricsHistoryRef.current = next;
        return next;
      });

      if (data.alerts.length > 0) {
        data.alerts.forEach((msg) => {
          const severity =
            msg.includes("MEI") || msg.includes("Impact")
              ? "critical"
              : "warning";
          addAlert(msg, severity, Math.round(elapsedRef.current));
        });
      }
    };

    ws.onerror = () => {
      addAlert("WebSocket error — check backend connection", "critical", elapsedRef.current);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };
  }, [addAlert]);

  const handleStop = useCallback(() => {
    stopSession(
      metricsHistoryRef.current,
      alertsRef.current,
      elapsedRef.current,
      patientName,
      profile
    );
  }, [stopSession, patientName, profile]);

  const simulateProfile = useCallback((newProfile: string) => {
    wsRef.current?.send(
      JSON.stringify({ action: "change_profile", profile: newProfile })
    );
    addAlert(`Profile switched → ${newProfile.replace(/_/g, " ")}`, "warning", elapsedRef.current);
  }, [addAlert]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      wsRef.current?.close();
    };
  }, []);

  // suppress unused state warning for metricsHistory — it's tracked via ref
  void metricsHistory;

  return (
    <div className="min-h-screen bg-[#0a0f1c] p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold text-slate-100 tracking-wide">
            Movement Efficiency Pipeline
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            Remote Gait Analysis · Real-Time Monitoring System
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 border border-[#1e2d45] px-3 py-1 rounded">
          v1.0.0
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-4">
        <ControlPanel
          patientName={patientName}
          setPatientName={setPatientName}
          isConnected={isConnected}
          isActive={isActive}
          elapsed={elapsed}
          onStart={startSession}
          onStop={handleStop}
          onSimulate={simulateProfile}
        />

        <div className="flex flex-col gap-4">
          <MetricCards metrics={metrics} />
          <div className="bg-[#111827] border border-[#1e2d45] rounded-lg">
            <MEIGauge mei={metrics?.mei ?? null} />
          </div>
          <LiveChart data={chartData} />
        </div>

        <AlertFeed alerts={alerts} />
      </div>
    </div>
  );
}
