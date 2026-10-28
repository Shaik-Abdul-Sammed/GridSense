
export default function BatteryGauge({ latestDemand, soc: propSoc }) {
  // Use backend provided SOC if available; otherwise calculate SOC = Math.max(0, 100 - (latestDemand / 3)).toFixed(1)
  const hasDemand = latestDemand !== undefined && latestDemand !== null;
  const demandNum = hasDemand ? Number(latestDemand) : 0;
  const socStr =
    propSoc !== undefined && propSoc !== null
      ? Number(propSoc).toFixed(1)
      : hasDemand
      ? Math.max(0, 100 - demandNum / 3).toFixed(1)
      : '100.0';
  const socVal = parseFloat(socStr);

  // Requirement: Color it green > 50%, yellow > 20%, red below.
  let colorTheme = {
    text: 'text-emerald-400',
    stroke: '#10b981', // emerald-500
    bgRing: 'stroke-emerald-950/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    status: 'Optimal Reserve',
  };

  if (socVal <= 20) {
    colorTheme = {
      text: 'text-rose-400',
      stroke: '#f43f5e', // rose-500
      bgRing: 'stroke-rose-950/40',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      status: 'Critical Depletion',
    };
  } else if (socVal <= 50) {
    colorTheme = {
      text: 'text-amber-400',
      stroke: '#f59e0b', // amber-500
      bgRing: 'stroke-amber-950/40',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      status: 'Moderate Reserve',
    };
  }

  // SVG circular gauge geometry
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc calculation (fill from 0 to 100%)
  const offset = circumference - (socVal / 100) * circumference;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Battery Storage SOC
        </span>
        <span
          className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${colorTheme.badge}`}
        >
          {colorTheme.status}
        </span>
      </div>

      <div className="flex items-center justify-center my-3 relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 drop-shadow-md"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b" // slate-800
            strokeWidth={strokeWidth}
          />
          {/* Subtle colored track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className={colorTheme.bgRing}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={colorTheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={hasDemand ? offset : 0}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-slate-400 mb-0.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-[10px] tracking-widest uppercase font-semibold">SOC</span>
          </div>
          <span className={`text-3xl font-extrabold tracking-tight ${colorTheme.text}`}>
            {socStr}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {hasDemand ? `${(socVal * 2.5).toFixed(0)} / 250 kWh` : 'Standing By'}
          </span>
        </div>
      </div>

      <div className="mt-2 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <span>Formula: 100 - (Demand / 3)</span>
        <span className="font-mono text-slate-300">
          Load: {hasDemand ? `${demandNum.toFixed(1)} kW` : '--'}
        </span>
      </div>
    </div>
  );
}
