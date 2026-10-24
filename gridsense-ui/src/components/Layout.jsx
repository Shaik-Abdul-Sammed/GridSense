import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Zap } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Real-Time Grid Telemetry & Forecasting',
  '/analytics': 'Predictive Model Insights & Feature Importance',
  '/history': 'Dispatch Decision Log & Audit Trail',
  '/settings': 'Grid Transition Controller Rules & Thresholds',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'GridSense Command Center';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white font-sans selection:bg-cyan-500 selection:text-white flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/2 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Persistent Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen relative z-10">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/70 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-3">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
