import { NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Clock,
  Settings as SettingsIcon,
  Zap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Live Dashboard',
    subtitle: 'Real-time telemetry',
    icon: Activity,
  },
  {
    to: '/analytics',
    label: 'Model Insights',
    subtitle: 'ML metrics & features',
    icon: BarChart3,
  },
  {
    to: '/history',
    label: 'Event Logs',
    subtitle: 'Dispatch audit trail',
    icon: Clock,
  },
  {
    to: '/settings',
    label: 'Grid Configuration',
    subtitle: 'Thresholds & rules',
    icon: SettingsIcon,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950/90 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  GridSense
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide">
                Smart Grid Command Center
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Routes */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-white border-l-4 border-cyan-400 shadow-lg shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-bold'
                            : 'bg-slate-900/80 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className={`font-semibold ${
                            isActive ? 'text-white font-bold' : 'text-slate-300'
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive
                          ? 'text-cyan-400 translate-x-0.5'
                          : 'text-slate-600 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System Health Snapshot */}
        <div className="px-5 py-3 mx-4 mb-3 rounded-xl bg-slate-900/70 border border-white/5 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Controller State</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">ARMED</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>Inference Latency</span>
            <span className="font-mono text-cyan-300">42 ms</span>
          </div>
        </div>

        {/* Operator Profile Section (Requirement 1) */}
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/60 border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-cyan-600/30">
                SA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">
                  Samm
                </p>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-mono border border-cyan-800/40">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Grid Admin &bull; Shift 1
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
