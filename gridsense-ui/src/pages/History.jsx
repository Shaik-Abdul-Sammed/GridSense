import { useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  Clock,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Zap,
} from 'lucide-react';

const INITIAL_HISTORY = [
  {
    id: 1,
    timestamp: '2026-10-24 22:00:00',
    demand: 172.5,
    mode: 'RENEWABLE_STORAGE_MODE',
    alert: 'NONE',
    action: 'BESS Battery Discharge (48 kW offset)',
  },
  {
    id: 2,
    timestamp: '2026-10-24 21:00:00',
    demand: 206.8,
    mode: 'RENEWABLE_STORAGE_MODE',
    alert: 'CRITICAL_OVERLOAD',
    action: 'Automated Peak Shaving + Curtailment Alert Issued',
  },
  {
    id: 3,
    timestamp: '2026-10-24 20:00:00',
    demand: 215.4,
    mode: 'RENEWABLE_STORAGE_MODE',
    alert: 'CRITICAL_OVERLOAD',
    action: 'Critical Load Shedding Engaged & Battery Dispatched',
  },
  {
    id: 4,
    timestamp: '2026-10-24 19:00:00',
    demand: 198.2,
    mode: 'RENEWABLE_STORAGE_MODE',
    alert: 'NONE',
    action: 'Peak Window Switch to Storage Active',
  },
  {
    id: 5,
    timestamp: '2026-10-24 18:00:00',
    demand: 185.0,
    mode: 'RENEWABLE_STORAGE_MODE',
    alert: 'NONE',
    action: 'Peak Window Commenced (Storage Mode Engaged)',
  },
  {
    id: 6,
    timestamp: '2026-10-24 17:00:00',
    demand: 154.2,
    mode: 'MAIN_GRID_MODE',
    alert: 'NONE',
    action: 'Base-load utility dispatch',
  },
  {
    id: 7,
    timestamp: '2026-10-24 16:00:00',
    demand: 148.9,
    mode: 'MAIN_GRID_MODE',
    alert: 'NONE',
    action: 'Normal transmission operation',
  },
  {
    id: 8,
    timestamp: '2026-10-24 15:00:00',
    demand: 162.1,
    mode: 'RENEWABLE_STORAGE_MODE',
    alert: 'NONE',
    action: 'Solar PV Excess Absorption to BESS',
  },
  {
    id: 9,
    timestamp: '2026-10-24 14:00:00',
    demand: 165.7,
    mode: 'RENEWABLE_STORAGE_MODE',
    alert: 'NONE',
    action: 'Solar peak generation offset active',
  },
  {
    id: 10,
    timestamp: '2026-10-24 13:00:00',
    demand: 158.3,
    mode: 'RENEWABLE_STORAGE_MODE',
    alert: 'NONE',
    action: 'Clean energy dispatch active',
  },
  {
    id: 11,
    timestamp: '2026-10-24 12:00:00',
    demand: 142.0,
    mode: 'MAIN_GRID_MODE',
    alert: 'NONE',
    action: 'Main grid balance restored',
  },
  {
    id: 12,
    timestamp: '2026-10-24 11:00:00',
    demand: 135.5,
    mode: 'MAIN_GRID_MODE',
    alert: 'NONE',
    action: 'Normal baseline distribution',
  },
];

export default function History() {
  const [filterMode, setFilterMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return INITIAL_HISTORY.filter((log) => {
      // Filter by mode/alert
      if (filterMode === 'OVERLOAD' && log.alert !== 'CRITICAL_OVERLOAD') return false;
      if (filterMode === 'RENEWABLE' && log.mode !== 'RENEWABLE_STORAGE_MODE') return false;
      if (filterMode === 'MAINGRID' && log.mode !== 'MAIN_GRID_MODE') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.timestamp.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.mode.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [filterMode, searchQuery]);

  const handleExportHistory = () => {
    const csv = Papa.unparse(filteredLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gridsense_event_history.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Decision Logs & Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete chronological record of autonomous grid switches, overload warnings, and automated actions.
          </p>
        </div>

        <button
          onClick={handleExportHistory}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer select-none"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by timestamp or action taken..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-hidden transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'OVERLOAD', label: '🚨 Overloads Only' },
            { id: 'RENEWABLE', label: 'Renewable Storage' },
            { id: 'MAINGRID', label: 'Main Grid' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                filterMode === btn.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data-Dense Event Logs Table (Requirement 5) */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Predicted Demand</th>
                <th className="py-3.5 px-4 text-center">Grid Mode</th>
                <th className="py-3.5 px-4 text-center">Alert Status</th>
                <th className="py-3.5 px-4">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredLogs.map((log) => {
                const isOverload = log.alert === 'CRITICAL_OVERLOAD';

                return (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      isOverload
                        ? 'bg-red-950/30 hover:bg-red-950/40 border-l-4 border-red-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono font-semibold text-white whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* Predicted Demand */}
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                        isOverload ? 'text-red-400 text-sm' : 'text-cyan-300'
                      }`}
                    >
                      {log.demand.toFixed(1)} kW
                    </td>

                    {/* Grid Mode */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          log.mode === 'RENEWABLE_STORAGE_MODE'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        {log.mode === 'RENEWABLE_STORAGE_MODE' ? 'RENEWABLE STORAGE' : 'MAIN GRID'}
                      </span>
                    </td>

                    {/* Alert Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isOverload ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600/30 text-red-300 border border-red-500 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          CRITICAL_OVERLOAD
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">NONE</span>
                      )}
                    </td>

                    {/* Action Taken */}
                    <td className="py-3 px-4 text-slate-300">
                      <span className={isOverload ? 'font-bold text-red-200' : ''}>
                        {log.action}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No events match the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}
