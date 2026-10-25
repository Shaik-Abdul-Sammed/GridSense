export default function AlertBanner({ criticalHours = [], maxDemand = 0 }) {
  if (!criticalHours || criticalHours.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 rounded-2xl shadow-2xl shadow-red-950 ring-4 ring-red-500/60 ring-offset-2 ring-offset-slate-900 animate-pulse transition-all duration-300 border border-red-400"
    >
      {/* Dynamic Strobe Backdrop Line */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-2xl animate-bounce select-none" aria-hidden="true">
              🚨
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                🚨 CRITICAL OVERLOAD: Demand exceeds 200kW!
              </h2>
            </div>
            <p className="text-xs md:text-sm text-red-100 font-semibold mt-1">
              Severe grid stress forecasted in{' '}
              <span className="font-extrabold text-white px-2 py-0.5 rounded-md bg-black/40 border border-white/20">
                {criticalHours.length} hour{criticalHours.length > 1 ? 's' : ''}
              </span>{' '}
              ({criticalHours.slice(0, 6).join(', ')}{criticalHours.length > 6 ? ` +${criticalHours.length - 6} more` : ''}). Peak projected:{' '}
              <span className="font-mono font-black text-amber-200 text-base">
                {maxDemand.toFixed(1)} kW
              </span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <span className="px-3.5 py-1.5 bg-black/50 backdrop-blur-md rounded-xl text-xs font-bold tracking-widest uppercase border border-red-300/40 text-red-200 shadow-md">
            Emergency Dispatch Active
          </span>
        </div>
      </div>
    </div>
  );
}
