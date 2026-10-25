import { useState, Suspense, lazy } from 'react';
import { Box, RotateCw, Cpu } from 'lucide-react';

const Substation3D = lazy(() => import('../components/Substation3D'));

export default function DigitalTwinPage() {
  const [gridMode, setGridMode] = useState('MAIN_GRID_MODE');
  const demandKw = 145;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-2xl shadow-xl shadow-cyan-500/20 text-white">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight font-mono uppercase">
                3D Digital Twin Explorer
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                WebGL Three.js
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive spatial digital twin of the high-voltage substation, BESS container, and microgrid loads.
            </p>
          </div>
        </div>

        {/* Tactical Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {['MAIN_GRID_MODE', 'RENEWABLE_STORAGE_MODE', 'ISLANDED_MODE'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setGridMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                gridMode === mode
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {mode.replace('_MODE', '')}
            </button>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="h-[550px] w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950/90 shadow-2xl relative">
        <Suspense fallback={
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
            <RotateCw className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Initializing Three.js WebGL Engine...</span>
          </div>
        }>
          <Substation3D gridMode={gridMode} demandKw={demandKw} />
        </Suspense>

        {/* Floating Telemetry HUD */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md text-xs font-mono space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Spatial Telemetry</div>
          <div className="text-cyan-300 font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mode: {gridMode}</span>
          </div>
          <div className="text-slate-300">Target Load: {demandKw} kW</div>
        </div>
      </div>
    </div>
  );
}
