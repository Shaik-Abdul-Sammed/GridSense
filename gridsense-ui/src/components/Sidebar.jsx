import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Activity,
  BarChart3,
  Clock,
  Settings as SettingsIcon,
  Zap,
  ChevronRight,
  Server,
  Coins,
  Gamepad2,
  Box,
  Plane,
  Camera,
  CloudSun,
  Award,
  PanelLeftClose,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Live Dashboard',
    subtitle: 'Real-time telemetry',
    icon: Activity,
  },
  {
    to: '/impact',
    label: 'Impact & Innovation',
    subtitle: 'Pitch deck & ESG metrics',
    icon: Award,
    badge: 'PITCH',
  },
  {
    to: '/defender',
    label: 'Gamer Demo',
    subtitle: 'Blackout defense drill',
    icon: Gamepad2,
    badge: 'PLAY',
  },
  {
    to: '/twin',
    label: '3D Digital Twin',
    subtitle: 'Spatial WebGL scene',
    icon: Box,
  },
  {
    to: '/drones',
    label: 'Drone Fleet',
    subtitle: 'Aerial inspection mesh',
    icon: Plane,
  },
  {
    to: '/ar',
    label: 'AR Diagnostics',
    subtitle: 'FLIR thermal camera',
    icon: Camera,
  },
  {
    to: '/weather',
    label: 'Satellite Weather',
    subtitle: 'GPS Open-Meteo sync',
    icon: CloudSun,
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
    to: '/marketplace',
    label: 'P2P Energy Market',
    subtitle: 'Decentralized trading',
    icon: Coins,
  },
  {
    to: '/settings',
    label: 'Grid Configuration',
    subtitle: 'Thresholds & rules',
    icon: SettingsIcon,
  },
];

export default function Sidebar({ isOpen, onClose, isVisible = true, onToggleCollapse }) {
  const navRef = useRef(null);

  // Ensure sidebar navigation always defaults to the top so Live Dashboard is never scrolled out of view
  useEffect(() => {
    if (navRef.current) {
      navRef.current.scrollTop = 0;
    }
  }, []);

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
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ${
          isVisible ? 'lg:translate-x-0' : 'lg:-translate-x-full'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">
                  GridSense
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold leading-none">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide mt-0.5">
                Smart Grid Command Center
              </p>
            </div>
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse Sidebar (Ctrl+B)"
              className="hidden lg:flex p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer select-none"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Routes */}
        <nav
          ref={navRef}
          className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900/40 scrollbar-track-transparent"
        >
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                  `group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-white border-l-4 border-cyan-400 shadow-md shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-bold'
                            : 'bg-slate-900/80 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`font-semibold flex items-center gap-1.5 truncate ${
                            isActive ? 'text-white font-bold' : 'text-slate-200'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-black bg-amber-500 text-slate-950 animate-pulse leading-none shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400/80 truncate leading-tight">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform shrink-0 ${
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

        {/* Feature 8: System Health & Uptime Monitor - Sleek Compact Pill Bar */}
        <div className="px-3 py-2 mx-3 mb-2 rounded-xl bg-slate-900/80 border border-white/10 text-[10px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Server className="w-3 h-3 text-cyan-400" />
              Backend
            </span>
            <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 font-mono text-[9px] text-slate-400">
            <span>QuickML v2.4</span>
            <span className="text-cyan-300 font-semibold">99.98% Uptime</span>
          </div>
        </div>

        {/* Operator Profile Section - Compact */}
        <div className="p-2.5 mx-3 mb-3 rounded-xl bg-gradient-to-r from-slate-900/90 to-slate-900/60 border border-white/10 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-cyan-600/30 shrink-0">
                SA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">
                  Samm
                </p>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-mono border border-cyan-800/40 leading-none">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Grid Admin &bull; Shift 1
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isVisible: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

