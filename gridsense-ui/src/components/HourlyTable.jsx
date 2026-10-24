import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function HourlyTable({ forecastData = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!forecastData || forecastData.length === 0) return null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white">24-Hour Forecast Schedule Breakdown</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
            {forecastData.length} Data Points
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600/60 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>{isOpen ? 'Collapse Table' : 'Expand Table'}</span>
          <svg
            className={`w-3.5 h-3.5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Hour</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Temp (°C)</th>
                <th className="py-2.5 px-3 text-right">Humidity (%)</th>
                <th className="py-2.5 px-3 text-right">Solar (W/m²)</th>
                <th className="py-2.5 px-3 text-right">Demand (kW)</th>
                <th className="py-2.5 px-3 text-center">Grid Mode</th>
                <th className="py-2.5 px-3 text-center">Alert State</th>
                <th className="py-2.5 px-3 text-center">Anomaly Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 font-mono">
              {forecastData.map((row, idx) => {
                const isOverload = row.alert === 'CRITICAL_OVERLOAD';
                const isPeak =
                  parseInt(row.hour.split(':')[0], 10) >= 18 &&
                  parseInt(row.hour.split(':')[0], 10) <= 22;
                const isAnomaly = !!row.isAnomaly;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-700/40 transition-colors ${
                      isOverload
                        ? 'bg-rose-950/30'
                        : isAnomaly
                        ? 'bg-amber-950/25'
                        : isPeak
                        ? 'bg-cyan-950/15'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                      {row.hour}
                      {isPeak && (
                        <span className="text-[10px] font-normal text-cyan-400 bg-cyan-950/80 px-1 rounded border border-cyan-800/40">
                          Peak
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{row.timestamp}</td>
                    <td className="py-2 px-3 text-right">{row.ambient_temp_c ?? '--'}</td>
                    <td className="py-2 px-3 text-right">{row.humidity_pct ?? '--'}</td>
                    <td className="py-2 px-3 text-right text-amber-300">
                      {row.solar_irradiance_wm2 ?? '--'}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-bold ${
                        row.predicted_demand_kw > 200 ? 'text-rose-400' : 'text-cyan-300'
                      }`}
                    >
                      {Number(row.predicted_demand_kw).toFixed(1)} kW
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.grid_mode === 'RENEWABLE_STORAGE_MODE'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        }`}
                      >
                        {row.grid_mode === 'RENEWABLE_STORAGE_MODE' ? 'RENEWABLE' : 'MAIN GRID'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isOverload ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600/30 text-rose-300 border border-rose-500/60 animate-pulse">
                          CRITICAL_OVERLOAD
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">NONE</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isAnomaly ? (
                        <span
                          title={row.anomalyReason || 'Sudden hourly load surge > 40%'}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Spike (+{row.anomalySurgePct}%)</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
