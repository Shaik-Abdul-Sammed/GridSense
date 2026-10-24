
export default function Header({ lastUpdated, isOnline }) {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-xl shadow-lg shadow-cyan-500/20 text-white flex items-center justify-center">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              GridSense Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              v2.4 Real-Time
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Autonomous Smart Grid Load Forecasting & Storage Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
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

        {lastUpdated && (
          <div className="text-xs text-slate-400 font-mono bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-800">
            Last Sync: {lastUpdated}
          </div>
        )}
      </div>
    </header>
  );
}
