export default function PowerFlowDiagram({
  mode,
  timestamp,
  demand,
  batterySoc,
}) {
  const isRenewable = mode === 'RENEWABLE_STORAGE_MODE';
  const isMainGrid = mode === 'MAIN_GRID_MODE';

  // SVG Coordinates for nodes
  // ViewBox: 0 0 500 240
  // Main Grid node center: (80, 60)
  // Battery node center: (420, 60)
  // House / Load node center: (250, 195)
  // Left path: M 80 60 C 80 145, 230 145, 250 195
  // Right path: M 420 60 C 420 145, 270 145, 250 195
  const gridPath = 'M 90 70 C 90 145, 230 150, 245 190';
  const batteryPath = 'M 410 70 C 410 145, 270 150, 255 190';

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
      {/* Dynamic ambient backdrop illumination */}
      <div
        className={`absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-1000 opacity-20 ${
          isRenewable ? 'bg-cyan-500' : isMainGrid ? 'bg-emerald-500' : 'bg-slate-700'
        }`}
      />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-2 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
            Real-Time Power Flow
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>
        {timestamp && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
            {timestamp.split(' ')[1]?.slice(0, 5) || timestamp}
          </span>
        )}
      </div>

      {/* Interactive Power Routing Diagram */}
      <div className="w-full relative my-1 z-10 flex items-center justify-center">
        <svg
          viewBox="0 0 500 240"
          className="w-full max-w-[480px] h-auto overflow-visible select-none"
        >
          <defs>
            {/* Glow Filters */}
            <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Path Gradients */}
            <linearGradient id="gridGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="batteryGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Background Dormant Paths */}
          <path
            d={gridPath}
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={batteryPath}
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* ACTIVE FLOW: Main Grid -> House */}
          {isMainGrid && (
            <>
              {/* Glowing Outer Pipe */}
              <path
                d={gridPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeOpacity="0.3"
                filter="url(#glowGreen)"
              />
              {/* Animated Dashed Core */}
              <path
                d={gridPath}
                fill="none"
                stroke="url(#gridGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-flow-dash"
              />
              {/* Traveling Energy Pulse Particles */}
              <circle r="4.5" fill="#a7f3d0" filter="url(#glowGreen)">
                <animateMotion
                  path={gridPath}
                  dur="1.2s"
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                />
              </circle>
              <circle r="3" fill="#ffffff">
                <animateMotion
                  path={gridPath}
                  dur="1.2s"
                  begin="0.6s"
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                />
              </circle>
            </>
          )}

          {/* ACTIVE FLOW: Battery -> House */}
          {isRenewable && (
            <>
              {/* Glowing Outer Pipe */}
              <path
                d={batteryPath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="6"
                strokeOpacity="0.35"
                filter="url(#glowBlue)"
              />
              {/* Animated Dashed Core */}
              <path
                d={batteryPath}
                fill="none"
                stroke="url(#batteryGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-flow-dash"
              />
              {/* Traveling Energy Pulse Particles */}
              <circle r="4.5" fill="#bae6fd" filter="url(#glowBlue)">
                <animateMotion
                  path={batteryPath}
                  dur="1.2s"
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                />
              </circle>
              <circle r="3" fill="#ffffff">
                <animateMotion
                  path={batteryPath}
                  dur="1.2s"
                  begin="0.6s"
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                />
              </circle>
            </>
          )}

          {/* NODE 1: Main Grid (Left) */}
          <g transform="translate(45, 20)">
            <rect
              width="90"
              height="75"
              rx="14"
              className={`transition-all duration-300 ${
                isMainGrid
                  ? 'fill-emerald-950/80 stroke-emerald-400 stroke-2 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'fill-slate-900/80 stroke-slate-700/80 stroke-1'
              }`}
            />
            {/* Transmission Tower Icon */}
            <path
              d="M 33 22 L 57 22 M 28 35 L 62 35 M 45 15 L 35 60 M 45 15 L 55 60 M 36 35 L 54 48 M 54 35 L 36 48"
              stroke={isMainGrid ? '#34d399' : '#64748b'}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <text
              x="45"
              y="68"
              textAnchor="middle"
              className={`text-[10px] font-bold tracking-wider uppercase ${
                isMainGrid ? 'fill-emerald-300' : 'fill-slate-400'
              }`}
            >
              Main Grid
            </text>
            {isMainGrid && (
              <circle cx="80" cy="12" r="4" className="fill-emerald-400 animate-ping" />
            )}
          </g>

          {/* NODE 2: Battery Storage / Renewable (Right) */}
          <g transform="translate(365, 20)">
            <rect
              width="90"
              height="75"
              rx="14"
              className={`transition-all duration-300 ${
                isRenewable
                  ? 'fill-cyan-950/80 stroke-cyan-400 stroke-2 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'fill-slate-900/80 stroke-slate-700/80 stroke-1'
              }`}
            />
            {/* Battery / Solar Icon */}
            <rect
              x="33"
              y="22"
              width="24"
              height="36"
              rx="3"
              fill="none"
              stroke={isRenewable ? '#38bdf8' : '#64748b'}
              strokeWidth="2"
            />
            <path
              d="M 40 19 L 50 19"
              stroke={isRenewable ? '#38bdf8' : '#64748b'}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 46 29 L 41 38 L 49 38 L 44 47"
              stroke={isRenewable ? '#67e8f9' : '#64748b'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <text
              x="45"
              y="68"
              textAnchor="middle"
              className={`text-[10px] font-bold tracking-wider uppercase ${
                isRenewable ? 'fill-cyan-300' : 'fill-slate-400'
              }`}
            >
              BESS Battery
            </text>
            {isRenewable && (
              <circle cx="80" cy="12" r="4" className="fill-cyan-400 animate-ping" />
            )}
          </g>

          {/* NODE 3: Community / Home Load (Center Bottom) */}
          <g transform="translate(200, 155)">
            <rect
              width="100"
              height="78"
              rx="16"
              className="fill-slate-900/90 stroke-white/20 stroke-1.5 filter drop-shadow-xl"
            />
            {/* House / Load Icon */}
            <path
              d="M 35 34 L 50 20 L 65 34 L 65 52 L 35 52 Z M 45 52 L 45 42 L 55 42 L 55 52"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="50"
              y="64"
              textAnchor="middle"
              className="text-[10px] font-bold tracking-wider uppercase fill-slate-300"
            >
              Smart Load
            </text>
            <text
              x="50"
              y="74"
              textAnchor="middle"
              className="text-[9px] font-mono font-bold fill-cyan-400"
            >
              {demand != null ? `${Number(demand).toFixed(1)} kW` : '--'}
            </text>
          </g>
        </svg>
      </div>

      {/* Mode Status Pill & Explanation */}
      <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRenewable
                ? 'bg-cyan-400 animate-pulse ring-4 ring-cyan-500/30'
                : isMainGrid
                ? 'bg-emerald-400 animate-pulse ring-4 ring-emerald-500/30'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-xs font-bold text-white tracking-wide">
            {isRenewable
              ? 'RENEWABLE_STORAGE_MODE'
              : isMainGrid
              ? 'MAIN_GRID_MODE'
              : 'STANDBY / IDLE'}
          </span>
        </div>

        <span
          className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
            isRenewable
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : isMainGrid
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isRenewable
            ? 'Clean BESS Dispatch'
            : isMainGrid
            ? 'Grid Base-load'
            : 'Awaiting Simulation'}
        </span>
      </div>

      {/* SOC & Demand Micro-Bar */}
      {batterySoc && (
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between z-10 font-mono">
          <span>Active Battery SOC: {batterySoc}%</span>
          <span>Load Factor: {demand ? (demand / 2).toFixed(0) : '--'}%</span>
        </div>
      )}
    </div>
  );
}
