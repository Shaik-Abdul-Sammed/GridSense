
export default function GridStateBadge({ mode, timestamp, demand }) {
  const isRenewable = mode === 'RENEWABLE_STORAGE_MODE';
  const isMainGrid = mode === 'MAIN_GRID_MODE';

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden backdrop-blur-xs">
      {/* Decorative gradient glow in background */}
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 ${
          isRenewable ? 'bg-blue-500' : isMainGrid ? 'bg-emerald-500' : 'bg-slate-600'
        }`}
      />

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Grid Operating State
        </span>
        {timestamp && (
          <span className="text-xs font-mono text-slate-500">
            Hour: {timestamp.split(' ')[1]?.slice(0, 5) || timestamp}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 my-2">
        {isRenewable ? (
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0 shadow-inner shadow-blue-500/20">
              {/* Solar / Battery hybrid icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/50">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                RENEWABLE_STORAGE_MODE
              </span>
              <p className="text-xs text-slate-300 mt-1.5">
                Clean energy dispatch & localized BESS battery discharge active.
              </p>
            </div>
          </div>
        ) : isMainGrid ? (
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner shadow-emerald-500/20">
              {/* Transmission Grid tower icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                MAIN_GRID_MODE
              </span>
              <p className="text-xs text-slate-300 mt-1.5">
                Primary utility transmission line serving base distribution.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-12 h-12 rounded-xl bg-slate-700/40 border border-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-700/60 text-slate-300">
                Awaiting Forecast Data
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Click Generate 24-Hour Forecast to observe state.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <span>Current Hour Load:</span>
        <span className="font-mono font-semibold text-white">
          {demand != null ? `${Number(demand).toFixed(1)} kW` : '--'}
        </span>
      </div>
    </div>
  );
}
