"use client";

const PROFILES = [
  { value: "normal_walk_recovery", label: "Normal Walk Recovery" },
  { value: "normal_run_recovery", label: "Normal Run Recovery" },
  { value: "compensating_gait", label: "Compensating Gait" },
  { value: "post_exercise_fatigue", label: "Post-Exercise Fatigue" },
];

interface Props {
  patientName: string;
  setPatientName: (name: string) => void;
  profile: string;
  setProfile: (profile: string) => void;
  isConnected: boolean;
  isActive: boolean;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onSimulate: (profile: string) => void;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ControlPanel({
  patientName,
  setPatientName,
  profile,
  setProfile,
  isConnected,
  isActive,
  elapsed,
  onStart,
  onStop,
  onSimulate,
}: Props) {
  return (
    <div className="bg-[#111827] border border-[#1e2d45] rounded-lg p-5 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">
          Session Control
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-400" : "bg-slate-600"
            }`}
          />
          <span className="text-xs font-mono text-slate-400">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Patient Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Patient Identifier
        </label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="e.g. PT-0042"
          disabled={isActive}
          className="bg-[#0a0f1c] border border-[#1e2d45] rounded px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-700 disabled:opacity-50"
        />
      </div>

      {/* Profile Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Patient Profile
        </label>
        <select
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          disabled={isActive}
          className="bg-[#0a0f1c] border border-[#1e2d45] rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-700 disabled:opacity-50"
        >
          {PROFILES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Timer */}
      {isActive && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Session Duration
          </span>
          <span className="text-2xl font-mono text-cyan-400">
            {formatElapsed(elapsed)}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {!isActive ? (
          <button
            onClick={onStart}
            disabled={!patientName.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-semibold py-3 rounded transition-colors"
          >
            ▶ Start Monitoring
          </button>
        ) : (
          <>
            <button
              onClick={onStop}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-mono font-semibold py-3 rounded transition-colors"
            >
              ■ Stop Monitoring
            </button>
            <button
              onClick={() => onSimulate("compensating_gait")}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white font-mono text-sm py-2 rounded transition-colors"
            >
              ⚠ Simulate Compensation
            </button>
            <button
              onClick={() => onSimulate("post_exercise_fatigue")}
              className="w-full bg-orange-800 hover:bg-orange-700 text-white font-mono text-sm py-2 rounded transition-colors"
            >
              ↓ Simulate Fatigue
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <a
        href="/history"
        className="text-xs font-mono text-slate-500 hover:text-cyan-400 underline underline-offset-2 transition-colors text-center"
      >
        View Session History →
      </a>
    </div>
  );
}
