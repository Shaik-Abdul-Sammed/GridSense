import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Menu,
  Zap,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PAGE_TITLES = {
  '/': 'Real-Time Grid Telemetry & 3D Digital Twin',
  '/impact': 'Impact & Innovation Pitch Deck & ESG Metrics',
  '/analytics': 'Predictive Model Insights & Feature Importance',
  '/history': 'Dispatch Decision Log & Audit Trail',
  '/marketplace': 'Peer-to-Peer (P2P) Energy Marketplace Ledger',
  '/settings': 'Grid Transition Controller Rules & Thresholds',
  '/defender': 'Grid Defender Tactical Blackout Defense Arena',
  '/game': 'Grid Defender Tactical Blackout Defense Arena',
  '/twin': '3D Digital Twin Microgrid Spatial Explorer',
  '/drones': 'Autonomous Drone Fleet & Aerial Telemetry',
  '/ar': 'AR Field Tech FLIR Thermal Diagnostic Scanner',
  '/weather': 'Satellite GPS Weather Ingestion & Forecast',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('gridsense_sidebar_visible');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const toggleSidebarVisible = () => {
    setIsSidebarVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gridsense_sidebar_visible', String(next));
      } catch {
        // Safe fallback
      }
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarVisible();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentTitle = PAGE_TITLES[location.pathname] || 'GridSense Command Center';

  return (
    <div className="min-h-[100dvh] h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white font-sans selection:bg-cyan-500 selection:text-white flex flex-col lg:flex-row relative transition-colors duration-200">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/2 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Persistent Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isVisible={isSidebarVisible}
        onToggleCollapse={toggleSidebarVisible}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-h-[100dvh] h-[100dvh] overflow-hidden relative z-10 transition-all duration-300 ${
          isSidebarVisible ? 'lg:pl-72' : 'lg:pl-0'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/70 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            {/* Desktop Sidebar Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={toggleSidebarVisible}
              title={isSidebarVisible ? 'Collapse Sidebar (Ctrl+B)' : 'Expand Sidebar (Ctrl+B)'}
              className="hidden lg:flex p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer items-center justify-center select-none"
              aria-label={isSidebarVisible ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {isSidebarVisible ? (
                <PanelLeftClose className="w-5 h-5 text-cyan-400" />
              ) : (
                <PanelLeftOpen className="w-5 h-5 text-cyan-400" />
              )}
            </button>

            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
                  {currentTitle}
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Zoho Catalyst Appsail + Slate Hybrid Topology
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button in Global Top Bar */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer select-none"
              aria-label="Toggle theme mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-300 font-mono text-[11px]">System Live</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="max-w-7xl mx-auto space-y-6 pb-12 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
