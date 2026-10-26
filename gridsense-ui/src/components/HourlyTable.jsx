import { useState, useMemo } from 'react';
import { AlertTriangle, Filter, Search, Zap, Sun, Battery } from 'lucide-react';

export default function HourlyTable({ forecastData = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Critical fix: Deduplicate data by timestamp / hour to prevent doubled points
  const uniqueData = useMemo(() => {
    if (!Array.isArray(forecastData)) return [];
    return Array.from(
      new Map(
        forecastData
          .filter(Boolean)
          .map((item) => [item.timestamp || item.hour || JSON.stringify(item), item])
      ).values()
    );
  }, [forecastData]);

  const filteredData = useMemo(() => {
    try {
      if (!Array.isArray(uniqueData)) return [];

      return uniqueData.filter((row) => {
        if (!row) return false;

        const hourStr = String(row.hour || '');
        const hourNum = parseInt(hourStr.split(':')[0], 10);
        const safeDemand = Number(row.predicted_demand_kw ?? row.demand ?? 0);
        const safeSolar = Number(row.solar_irradiance_wm2 ?? row.solar ?? 0);

        // Filter mode checks
        if (filterMode === 'OVERLOAD' && row.alert !== 'CRITICAL_OVERLOAD' && safeDemand <= 160) {
          return false;
        }
        if (filterMode === 'PEAK' && !(hourNum >= 18 && hourNum <= 22)) {
          return false;
        }
        if (filterMode === 'SOLAR' && safeSolar < 100) {
          return false;
        }
        if (
          filterMode === 'STORAGE' &&
          row.grid_mode !== 'RENEWABLE_STORAGE_MODE' &&
          row.mode !== 'RENEWABLE_STORAGE_MODE'
        ) {
          return false;
        }

        // Search query check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesHour = hourStr.toLowerCase().includes(q);
          const matchesTimestamp = String(row.timestamp || '').toLowerCase().includes(q);
          const matchesMode = String(row.grid_mode || row.mode || '').toLowerCase().includes(q);
          if (!matchesHour && !matchesTimestamp && !matchesMode) {
            return false;
          }
        }

        return true;
      });
    } catch (err) {
      console.error('Error filtering hourly table data:', err);
      return uniqueData;
    }
  }, [uniqueData, filterMode, searchQuery]);

  if (!uniqueData || uniqueData.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white">24-Hour Forecast Schedule Breakdown</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
            {filteredData.length} of {uniqueData.length} Points
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span>{isOpen ? 'Collapse Table' : 'Expand & Filter Table'}</span>
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
        <div className="mt-4 space-y-3">
          {/* Filter and Search Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search hour (e.g. 19:00)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 focus:border-cyan-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-hidden transition-colors font-mono"
              />
            </div>

            {/* Quick Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase tracking-wider mr-1">
                <Filter className="w-3 h-3 text-cyan-400" /> Filter:
              </span>
              {[
                { id: 'ALL', label: 'All Hours', icon: null },
                { id: 'OVERLOAD', label: 'Overload / High', icon: AlertTriangle },
                { id: 'PEAK', label: 'Peak (18-22h)', icon: Zap },
                { id: 'SOLAR', label: 'Solar Active', icon: Sun },
                { id: 'STORAGE', label: 'BESS Dispatch', icon: Battery },
              ].map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setFilterMode(btn.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all whitespace-nowrap ${
                      filterMode === btn.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-700">
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
                {filteredData.map((row, idx) => {
                  const hourInt = parseInt(String(row.hour || '').split(':')[0], 10);
                  const isOverload =
                    row.alert === 'CRITICAL_OVERLOAD' ||
                    Number(row.predicted_demand_kw || row.demand || 0) > 160;
                  const isPeak = !isNaN(hourInt) && hourInt >= 18 && hourInt <= 22;
                  const isAnomaly = !!row.isAnomaly;
                  const mode = row.grid_mode || row.mode || 'MAIN_GRID_MODE';

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isOverload ? 'bg-red-950/30 text-red-200' : ''
                      } ${isPeak ? 'bg-amber-950/20' : ''}`}
                    >
                      <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                        {row.hour}
                        {isPeak && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 leading-none">
                            PEAK
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {row.timestamp || '--'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {row.ambient_temp_c != null ? Number(row.ambient_temp_c).toFixed(1) : '--'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {row.humidity_pct != null ? `${Number(row.humidity_pct).toFixed(0)}%` : '--'}
                      </td>
                      <td className="py-2 px-3 text-right text-amber-300">
                        {row.solar_irradiance_wm2 != null
                          ? `${Number(row.solar_irradiance_wm2).toFixed(0)}`
                          : '--'}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-bold ${
                          isOverload ? 'text-red-400' : 'text-cyan-300'
                        }`}
                      >
                        {row.predicted_demand_kw != null
                          ? `${Number(row.predicted_demand_kw).toFixed(1)} kW`
                          : row.demand != null
                            ? `${Number(row.demand).toFixed(1)} kW`
                            : '--'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                            mode === 'RENEWABLE_STORAGE_MODE'
                              ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                              : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                          }`}
                        >
                          {mode === 'RENEWABLE_STORAGE_MODE' ? 'BESS Storage' : 'Main Grid'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {isOverload ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-red-900/60 text-red-300 border border-red-700/50">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            Overload
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Normal</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {isAnomaly ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-900/60 text-amber-300 border border-amber-700/50">
                            Spike (+{row.anomalySurgePct || 40}%)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div className="p-6 text-center text-slate-500 font-sans text-xs">
                No hourly forecast records match the filter criteria.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
