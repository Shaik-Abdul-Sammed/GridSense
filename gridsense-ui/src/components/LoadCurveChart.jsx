import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isOverload = data.alert === 'CRITICAL_OVERLOAD' || data.predicted_demand_kw > 200;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-sans min-w-[200px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
          <span className="font-bold text-slate-200">Hour {label}</span>
          {isOverload ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
              OVERLOAD
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              NORMAL
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Predicted Demand:</span>
            <span className="font-mono font-bold text-cyan-300">
              {Number(data.predicted_demand_kw).toFixed(1)} kW
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Mode:</span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                data.grid_mode === 'RENEWABLE_STORAGE_MODE' ? 'text-blue-400' : 'text-emerald-400'
              }`}
            >
              {data.grid_mode === 'RENEWABLE_STORAGE_MODE' ? 'RENEWABLE' : 'MAIN GRID'}
            </span>
          </div>

          {data.ambient_temp_c !== undefined && (
            <div className="pt-1 mt-1 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
              <span>Ambient Temp:</span>
              <span className="font-mono text-slate-200">{data.ambient_temp_c}°C</span>
            </div>
          )}

          {data.solar_irradiance_wm2 !== undefined && (
            <div className="flex items-center justify-between text-slate-400">
              <span>Solar Irradiance:</span>
              <span className="font-mono text-amber-300">{data.solar_irradiance_wm2} W/m²</span>
            </div>
          )}

          {data.humidity_pct !== undefined && (
            <div className="flex items-center justify-between text-slate-400">
              <span>Humidity:</span>
              <span className="font-mono text-slate-200">{data.humidity_pct}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function LoadCurveChart({
  data = [],
  isLoading = false,
  peakWindowStart = '18:00',
  peakWindowEnd = '22:00',
  criticalThreshold = 200,
}) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
      {/* Chart Title and Legend Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              24-Hour Load Curve & Demand Forecast
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              kW / Hour
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic load telemetry with active peak highlight window ({peakWindowStart} - {peakWindowEnd})
          </p>
        </div>

        {/* Legend Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
            <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span className="text-slate-300">Predicted Load (kW)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/40">
            <span className="w-3 h-3 bg-red-500/30 border border-red-500 rounded-xs" />
            <span className="text-red-300 font-medium">Peak Window ({peakWindowStart} - {peakWindowEnd})</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
            <span className="w-3 h-0.5 border-b border-dashed border-red-500" />
            <span className="text-slate-400">{criticalThreshold} kW Limit</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[360px] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 rounded-xl">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-sm font-medium text-cyan-300">
              Fetching 24-hour forecast from backend...
            </span>
          </div>
        )}

        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="loadLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="70%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
                opacity={0.6}
              />

              <XAxis
                dataKey="hour"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                interval="preserveStartEnd"
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                unit=" kW"
                domain={[0, 'auto']}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Dynamic Peak Window ReferenceArea */}
              <ReferenceArea
                x1={peakWindowStart}
                x2={peakWindowEnd}
                fill="red"
                fillOpacity={0.2}
              />

              {/* Dynamic Overload ReferenceLine */}
              <ReferenceLine
                y={criticalThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `${criticalThreshold} kW Overload Threshold`,
                  fill: '#f87171',
                  position: 'insideTopRight',
                  fontSize: 11,
                  offset: 10,
                }}
              />

              <Line
                type="monotone"
                dataKey="predicted_demand_kw"
                name="Demand (kW)"
                stroke="url(#loadLineGrad)"
                strokeWidth={3}
                dot={{ r: 3, fill: '#06b6d4', strokeWidth: 1.5, stroke: '#0891b2' }}
                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700/60 rounded-xl">
            <svg
              className="w-12 h-12 mb-3 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <p className="text-sm font-medium text-slate-400">No Forecast Data Loaded</p>
            <p className="text-xs text-slate-600 mt-1">
              Click &quot;Generate 24-Hour Forecast&quot; to request predictions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
