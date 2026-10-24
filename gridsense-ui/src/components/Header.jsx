import { Zap, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header({
  lastUpdated,
  isOnline,
  latestDemand = 0,
  criticalThreshold = 200,
}) {
  const { isDark, toggleTheme } = useTheme();

  // Grid Frequency Simulation (Feature 4)
  // When demand exceeds critical threshold (e.g. 200 kW), frequency drops into the 49.50 - 49.80 Hz range.
  const isOverloaded = latestDemand >= criticalThreshold;
  const simulatedFrequency = isOverloaded
    ? (49.5 + Math.max(0, 0.3 * (1 - (latestDemand - criticalThreshold) / 100))).toFixed(2)
    : '50.00';

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-xl shadow-lg shadow-cyan-500/20 text-white flex items-center justify-center">
          <Zap className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              GridSense Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
              v2.5 Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Autonomous Smart Grid Load Forecasting & Storage Management
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
        {/* Grid Frequency Monitor (Feature 4) */}
        <div
          title={
            isOverloaded
              ? 'High demand is causing grid generator frequency decay below nominal threshold!'
              : 'Grid frequency is synchronized and stable at nominal 50.00 Hz'
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            isOverloaded
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-lg shadow-rose-950/50 animate-pulse'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <Activity
            className={`w-4 h-4 ${
              isOverloaded ? 'text-rose-400 animate-bounce' : 'text-emerald-400'
            }`}
          />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-wider">
              {simulatedFrequency} Hz
            </span>
            <span className="text-[10px] hidden sm:inline text-slate-300">
              {isOverloaded ? 'FREQ DROP' : 'NOMINAL'}
            </span>
          </div>
        </div>

        {/* Live API Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-slate-300">
            {isOnline ? 'Live API Connected' : 'Ready / Standby'}
          </span>
        </div>

        {/* Theme Toggle Button (Feature 6) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer select-none"
          aria-label="Toggle theme mode"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-300" />
          )}
        </button>

        {lastUpdated && (
          <div className="text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/10">
            Sync: {lastUpdated}
          </div>
        )}
      </div>
    </header>
  );
}
