import { useState } from 'react';
import { Plane, ShieldAlert } from 'lucide-react';
import DroneFleet from '../components/DroneFleet';

export default function DroneFleetPage() {
  const [testDemand, setTestDemand] = useState(140);
  const [testMode, setTestMode] = useState('MAIN_GRID_MODE');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-2xl shadow-xl shadow-cyan-500/20 text-white">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight font-mono uppercase">
                Drone Fleet Operations
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                UAV MESH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous aerial LiDAR clearance and FLIR radiometric thermography patrolling the microgrid.
            </p>
          </div>
        </div>

        {/* Tactical Simulator Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTestDemand((prev) => (prev > 200 ? 140 : 230));
              setTestMode((m) => (m === 'ISLANDED_MODE' ? 'MAIN_GRID_MODE' : 'ISLANDED_MODE'));
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              testDemand > 200
                ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{testDemand > 200 ? 'Simulate Normal State' : 'Simulate Runaway Overload'}</span>
          </button>
        </div>
      </div>

      {/* Reactive Drone Fleet Component */}
      <DroneFleet currentDemand={testDemand} gridMode={testMode} transformerHealth={testDemand > 200 ? 45 : 88} />
    </div>
  );
}
