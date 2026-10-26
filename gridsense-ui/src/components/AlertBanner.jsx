import PropTypes from 'prop-types';

export default function AlertBanner({
  isCurrentOverload = false,
  currentDemand = 0,
  hasFutureOverload = false,
  criticalHours = [],
  maxDemand = 0,
  peakHour = null,
}) {
  const displayPeakHour = peakHour || criticalHours[0] || '19:00';
  const displayPeakKw = Number(maxDemand || 200).toFixed(1);
  const displayCurrentKw = Number(currentDemand || 0).toFixed(1);

  // Scenario 1: Active hour is >= 200 kW (or Cyberattack) -> Massive pulsing red alert
  if (isCurrentOverload) {
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
                  🚨 CRITICAL OVERLOAD: Peak demand of {displayPeakKw} kW occurred at {displayPeakHour}.
                </h2>
              </div>
              <p className="text-xs md:text-sm text-red-100 font-semibold mt-1">
                Active feeder demand ({displayCurrentKw} kW) exceeds continuous safe threshold. Emergency battery storage dispatch engaged to prevent transformer burnout.
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

  // Scenario 2: Active hour is safe (< 200 kW), but future hour breaches 200 kW -> Smaller non-pulsing yellow warning
  if (hasFutureOverload) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="relative overflow-hidden bg-amber-950/70 backdrop-blur-md text-amber-200 p-4 rounded-xl border border-amber-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-lg select-none" aria-hidden="true">
              ⚠️
            </span>
          </div>
          <div className="text-xs sm:text-sm font-medium">
            <span className="font-bold text-amber-300">Notice:</span> Peak demand of{' '}
            <span className="font-mono font-black text-amber-100">
              {displayPeakKw} kW
            </span>{' '}
            expected at <span className="font-mono font-bold text-amber-100">{displayPeakHour}</span>. Current active load ({displayCurrentKw} kW) is within normal limits.
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Peak Advisory
          </span>
        </div>
      </div>
    );
  }

  return null;
}

AlertBanner.propTypes = {
  isCurrentOverload: PropTypes.bool,
  currentDemand: PropTypes.number,
  hasFutureOverload: PropTypes.bool,
  criticalHours: PropTypes.arrayOf(PropTypes.string),
  maxDemand: PropTypes.number,
  peakHour: PropTypes.string,
};
