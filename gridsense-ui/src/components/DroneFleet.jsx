import { useState, useEffect } from 'react';
import {
  Navigation,
  Radio,
  Plane,
} from 'lucide-react';

const INITIAL_DRONES = [
  {
    id: 'DRONE-ALPHA',
    callsign: 'Alpha Patrol',
    mission: 'Sector 4 66kV Transmission Line Inspection',
    altitude: '42m',
    battery: '88%',
    speed: '28 km/h',
    status: 'SURVEYING_LIDAR',
    telemetry: 'LiDAR Vegetation Clearance: 98.2% Nominal',
    color: '#06b6d4', // Cyan
  },
  {
    id: 'DRONE-BETA',
    callsign: 'Beta Thermal',
    mission: 'Substation Transformer T-2 IR Thermography',
    altitude: '25m',
    battery: '74%',
    speed: '12 km/h',
    status: 'INSPECTING_HOTSPOT',
    telemetry: 'FLIR Core Temp: 82.4°C [Thermal Anomaly]',
    color: '#f43f5e', // Rose
  },
  {
    id: 'DRONE-GAMMA',
    callsign: 'Gamma Perimeter',
    mission: 'BESS 500kWh Container Cooling Inspection',
    altitude: '35m',
    battery: '92%',
    speed: '22 km/h',
    status: 'ALL_CLEAR',
    telemetry: 'Inverter Banks 1-4 Balanced & Nominal',
    color: '#10b981', // Emerald
  },
];

export default function DroneFleet({ transformerHealth = 85 }) {
  const [drones, setDrones] = useState(INITIAL_DRONES);
  const [selectedDroneId, setSelectedDroneId] = useState('DRONE-BETA');

  // Link to failure predictor: if transformer health drops below 50%, Drone Beta triggers active hotspot alarm
  const isAnomalyActive = transformerHealth < 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setDrones((prev) =>
        prev.map((drone) => {
          const battNum = parseInt(drone.battery, 10);
          const nextBatt = battNum > 15 ? `${battNum - 1}%` : '95%';
          if (drone.id === 'DRONE-BETA') {
            return {
              ...drone,
              battery: nextBatt,
              status: isAnomalyActive ? 'CRITICAL_THERMAL_SURGE' : 'ROUTINE_THERMOGRAPHY',
              telemetry: isAnomalyActive
                ? `FLIR Core Temp: 86.8°C [CRITICAL HOTSPOT DETECTED]`
                : `FLIR Core Temp: 48.2°C (Transformer Health: ${transformerHealth}%)`,
            };
          }
          return { ...drone, battery: nextBatt };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAnomalyActive, transformerHealth]);

  const activeDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Plane className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight font-mono uppercase">
                Autonomous Drone Fleet &bull; Aerial Telemetry
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                3 UAVs ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time aerial LiDAR &amp; thermal inspection coordinates across microgrid sectors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>MESH COMMS: LINKED</span>
        </div>
      </div>

      {/* Grid: 2D SVG Spatial Map + Right Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: 2D SVG Interactive Spatial Aerial Map */}
        <div className="lg:col-span-2 relative h-72 sm:h-80 bg-slate-950/90 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
          {/* Cybernetic Radial Map Grid */}
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 600 320">
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
              </radialGradient>
              <linearGradient id="flightPathCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            <rect width="600" height="320" fill="url(#mapGlow)" />
            {[40, 80, 120, 160, 200, 240, 280].map((y) => (
              <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#1e293b" strokeWidth="0.5" />
            ))}
            {[60, 120, 180, 240, 300, 360, 420, 480, 540].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="320" stroke="#1e293b" strokeWidth="0.5" />
            ))}

            {/* Radar Sweep Circles */}
            <circle cx="300" cy="160" r="70" fill="none" stroke="#06b6d4" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="300" cy="160" r="130" fill="none" stroke="#06b6d4" strokeWidth="0.75" opacity="0.2" />

            {/* Power Line Interconnect Vectors */}
            <path d="M 100 160 L 300 80 L 480 200 Z" fill="none" stroke="url(#flightPathCyan)" strokeWidth="1.5" strokeDasharray="5 5" />
            <path d="M 300 80 L 300 240" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

            {/* Static Ground Nodes */}
            {/* Node 1: Main Substation Grid Tower */}
            <g transform="translate(100, 160)">
              <circle r="18" fill="#1e293b" stroke="#eab308" strokeWidth="2" />
              <circle r="6" fill="#eab308" />
              <text x="0" y="32" fill="#e2e8f0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                GRID SUBSTATION
              </text>
            </g>

            {/* Node 2: Central BESS Battery Storage */}
            <g transform="translate(300, 80)">
              <circle r="18" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
              <circle r="6" fill="#06b6d4" />
              <text x="0" y="-24" fill="#e2e8f0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                BESS STORAGE
              </text>
            </g>

            {/* Node 3: Microgrid Smart Houses */}
            <g transform="translate(480, 200)">
              <circle r="18" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <circle r="6" fill="#3b82f6" />
              <text x="0" y="32" fill="#e2e8f0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                SMART LOADS
              </text>
            </g>

            {/* Animated Drone Waypoint Flights (CSS Motion) */}
            {/* Drone Alpha (Cyan) patrolling Grid -> BESS */}
            <g className="animate-drone-path-alpha cursor-pointer" onClick={() => setSelectedDroneId('DRONE-ALPHA')}>
              <circle r="10" fill="#0891b2" opacity="0.3" className="animate-ping" />
              <circle r="6" fill="#06b6d4" />
              <polygon points="-5,-4 6,0 -5,4" fill="#ffffff" />
              <text x="12" y="4" fill="#06b6d4" fontSize="9" fontFamily="monospace" fontWeight="bold">
                UAV-α
              </text>
            </g>

            {/* Drone Beta (Thermal hotspot inspection hovering over Substation) */}
            <g
              transform={isAnomalyActive ? "translate(110, 140)" : "translate(210, 120)"}
              className="cursor-pointer transition-all duration-1000"
              onClick={() => setSelectedDroneId('DRONE-BETA')}
            >
              <circle r="12" fill={isAnomalyActive ? "#ef4444" : "#f43f5e"} opacity="0.4" className="animate-ping" />
              <circle r="7" fill={isAnomalyActive ? "#ef4444" : "#f43f5e"} />
              <polygon points="-5,-4 6,0 -5,4" fill="#ffffff" />
              <text x="14" y="4" fill={isAnomalyActive ? "#ef4444" : "#f43f5e"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                UAV-β {isAnomalyActive ? '[HOTSPOT]' : ''}
              </text>
            </g>

            {/* Drone Gamma (Perimeter inspection towards houses) */}
            <g className="animate-drone-path-gamma cursor-pointer" onClick={() => setSelectedDroneId('DRONE-GAMMA')}>
              <circle r="10" fill="#10b981" opacity="0.3" className="animate-ping" />
              <circle r="6" fill="#10b981" />
              <polygon points="-5,-4 6,0 -5,4" fill="#ffffff" />
              <text x="12" y="4" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">
                UAV-γ
              </text>
            </g>
          </svg>

          {/* Map Overlay HUD Callout */}
          <div className="absolute top-3 left-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-slate-300">
            SECTOR: ALPHA-1 AIRSPACE &bull; CEILING: 120m
          </div>
        </div>

        {/* Right: Drone Selected Telemetry Feed */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Select Aerial Unit:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {drones.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDroneId(d.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedDroneId === d.id
                      ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-400'
                      : 'bg-slate-950/70 border-white/5 hover:border-white/20 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-white font-mono">
                    <span>{d.callsign.split(' ')[0]}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {d.battery} Batt
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Telemetry Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                {activeDrone.callsign}
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                  activeDrone.status.includes('HOTSPOT') || activeDrone.status.includes('CRITICAL')
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {activeDrone.status}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Mission:</span>
                <span className="truncate max-w-[170px] text-right">{activeDrone.mission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flight Altitude:</span>
                <span className="text-cyan-300 font-bold">{activeDrone.altitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ground Speed:</span>
                <span>{activeDrone.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Battery Level:</span>
                <span className="text-emerald-400 font-bold">{activeDrone.battery}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 text-[10px] text-cyan-300 leading-snug">
              &gt; {activeDrone.telemetry}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
