import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Navigation,
  Radio,
  Plane,
  AlertTriangle,
  Crosshair,
  Compass,
  Layers,
  Flame,
  Camera,
  Maximize2,
  Minimize2,
} from 'lucide-react';

const INITIAL_DRONES = [
  {
    id: 'DRONE-ALPHA',
    callsign: 'Alpha Patrol',
    sector: 'SECTOR: ALPHA-1 TRANSMISSION CORRIDOR',
    ceiling: '120m',
    heading: '042° NE',
    coords: '37.7749°N, 122.4194°W',
    mission: 'Sector 1 66kV Transmission Line Inspection',
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
    sector: 'SECTOR: BETA-2 SUBSTATION TRANSFORMER AIRSPACE',
    ceiling: '80m',
    heading: '185° S',
    coords: '37.7735°N, 122.4210°W',
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
    sector: 'SECTOR: GAMMA-3 BESS & MICROGRID PERIMETER',
    ceiling: '100m',
    heading: '315° NW',
    coords: '37.7762°N, 122.4175°W',
    mission: 'BESS 500kWh Container Cooling & Feeder Inspection',
    altitude: '35m',
    battery: '92%',
    speed: '22 km/h',
    status: 'ALL_CLEAR',
    telemetry: 'Inverter Banks 1-4 Balanced & Nominal',
    color: '#10b981', // Emerald
  },
];

export default function DroneFleet({
  currentDemand = 0,
  gridMode = 'MAIN_GRID_MODE',
  transformerHealth = 85,
}) {
  const [drones, setDrones] = useState(INITIAL_DRONES);
  const [selectedDroneId, setSelectedDroneId] = useState('DRONE-GAMMA');
  const [sensorMode, setSensorMode] = useState('LIDAR'); // 'LIDAR', 'FLIR', 'OPTICAL'
  const [viewPerspective, setViewPerspective] = useState('SECTOR_ZOOM'); // 'SECTOR_ZOOM', 'FULL_GRID'

  // Reactive state triggers
  const isOverloadedOrIslanded = currentDemand > 200 || gridMode === 'ISLANDED_MODE';
  const isAnomalyActive = transformerHealth < 60 || isOverloadedOrIslanded;

  const getDynamicViewBox = () => {
    if (viewPerspective === 'FULL_GRID') {
      return '0 0 600 320';
    }
    if (selectedDroneId === 'DRONE-ALPHA') {
      return '40 20 360 210';
    }
    if (selectedDroneId === 'DRONE-BETA') {
      return '0 70 320 200';
    }
    return '200 40 380 230';
  };

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
              status: isOverloadedOrIslanded
                ? 'CRITICAL_RUNAWAY'
                : isAnomalyActive
                ? 'CRITICAL_THERMAL_SURGE'
                : 'ROUTINE_THERMOGRAPHY',
              telemetry: isOverloadedOrIslanded
                ? '⚠️ CRITICAL: Substation Transformer Thermal Runaway Imminent.'
                : isAnomalyActive
                ? `FLIR Core Temp: 88.5°C [CRITICAL HOTSPOT DETECTED]`
                : `FLIR Core Temp: 48.2°C (Transformer Health: ${transformerHealth}%)`,
            };
          }
          return { ...drone, battery: nextBatt };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAnomalyActive, isOverloadedOrIslanded, transformerHealth]);

  const activeDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  return (
    <div
      className={`backdrop-blur-xl border shadow-2xl rounded-2xl p-5 space-y-4 transition-all duration-300 ${
        isOverloadedOrIslanded
          ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/30'
          : 'bg-slate-900/50 border-white/10'
      }`}
    >
      {/* Dynamic Keyframes for reactive drone path speed & radar sweep */}
      <style>{`
        @keyframes droneFlightAlpha {
          0% { transform: translate(100px, 160px); }
          50% { transform: translate(300px, 80px); }
          100% { transform: translate(100px, 160px); }
        }
        @keyframes droneFlightGamma {
          0% { transform: translate(300px, 80px); }
          50% { transform: translate(480px, 200px); }
          100% { transform: translate(300px, 80px); }
        }
        @keyframes radarSweepSpin {
          from { transform: rotate(0deg); transform-origin: 300px 160px; }
          to { transform: rotate(360deg); transform-origin: 300px 160px; }
        }
        @keyframes reticlePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border transition-colors ${
              isOverloadedOrIslanded
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-bounce'
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}
          >
            <Plane className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight font-mono uppercase">
                Autonomous Drone Fleet &bull; Aerial Telemetry
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border transition-colors ${
                  isOverloadedOrIslanded
                    ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                }`}
              >
                {isOverloadedOrIslanded ? 'EMERGENCY SCRAMBLE' : '3 UAVs ACTIVE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time aerial LiDAR &amp; thermal inspection coordinates across microgrid sectors.
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl border transition-colors ${
            isOverloadedOrIslanded
              ? 'text-rose-400 bg-rose-950/80 border-rose-700 animate-pulse'
              : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
          }`}
        >
          {isOverloadedOrIslanded ? (
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
          ) : (
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          )}
          <span>{isOverloadedOrIslanded ? '⚠️ OVERLOAD SCRAMBLE' : `${activeDrone.callsign.toUpperCase()} • ${activeDrone.heading}`}</span>
        </div>
      </div>

      {/* Aerial View & Sensor Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-bold px-2">Aerial Sensor:</span>
          <button
            type="button"
            onClick={() => setSensorMode('LIDAR')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              sensorMode === 'LIDAR'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>LiDAR Cloud</span>
          </button>
          <button
            type="button"
            onClick={() => setSensorMode('FLIR')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              sensorMode === 'FLIR'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>FLIR Thermal</span>
          </button>
          <button
            type="button"
            onClick={() => setSensorMode('OPTICAL')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              sensorMode === 'OPTICAL'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3 h-3 text-emerald-400" />
            <span>4K Optical</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewPerspective((prev) => (prev === 'SECTOR_ZOOM' ? 'FULL_GRID' : 'SECTOR_ZOOM'))}
            className="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-cyan-300 hover:text-white"
          >
            {viewPerspective === 'SECTOR_ZOOM' ? (
              <>
                <Minimize2 className="w-3 h-3 text-cyan-400" />
                <span>Sector Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 text-emerald-400" />
                <span>Full Grid Wide</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: 2D SVG Spatial Map + Right Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: 2D SVG Interactive Spatial Aerial Map */}
        <div
          className={`lg:col-span-2 relative h-72 sm:h-84 rounded-2xl border overflow-hidden flex items-center justify-center transition-colors ${
            isOverloadedOrIslanded
              ? 'bg-slate-950/95 border-rose-500/50 shadow-inner'
              : 'bg-slate-950/90 border-white/10'
          }`}
        >
          {/* Cybernetic Radial Map Grid with dynamic ViewBox */}
          <svg
            className="w-full h-full absolute inset-0 select-none transition-all duration-700 ease-in-out"
            viewBox={getDynamicViewBox()}
          >
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                <stop
                  offset="0%"
                  stopColor={isOverloadedOrIslanded ? '#ef4444' : activeDrone.color}
                  stopOpacity={isOverloadedOrIslanded ? '0.35' : '0.18'}
                />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.88" />
              </radialGradient>
              <linearGradient id="flightPathCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={isOverloadedOrIslanded ? '#ef4444' : '#06b6d4'}
                  stopOpacity="0.7"
                />
                <stop
                  offset="100%"
                  stopColor={isOverloadedOrIslanded ? '#b91c1c' : '#3b82f6'}
                  stopOpacity="0.25"
                />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            <rect width="600" height="320" fill="url(#mapGlow)" />
            {[40, 80, 120, 160, 200, 240, 280].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="600"
                y2={y}
                stroke={isOverloadedOrIslanded ? '#450a0a' : '#1e293b'}
                strokeWidth="0.5"
              />
            ))}
            {[60, 120, 180, 240, 300, 360, 420, 480, 540].map((x) => (
              <line
                key={x}
                x1={x}
                y1="0"
                x2={x}
                y2="320"
                stroke={isOverloadedOrIslanded ? '#450a0a' : '#1e293b'}
                strokeWidth="0.5"
              />
            ))}

            {/* Radar Sweep Circles */}
            <circle
              cx="300"
              cy="160"
              r="70"
              fill="none"
              stroke={isOverloadedOrIslanded ? '#ef4444' : activeDrone.color}
              strokeWidth={isOverloadedOrIslanded ? '1.5' : '0.85'}
              strokeDasharray="3 3"
              opacity={isOverloadedOrIslanded ? '0.75' : '0.45'}
            />
            <circle
              cx="300"
              cy="160"
              r="130"
              fill="none"
              stroke={isOverloadedOrIslanded ? '#ef4444' : activeDrone.color}
              strokeWidth={isOverloadedOrIslanded ? '1.5' : '0.85'}
              opacity={isOverloadedOrIslanded ? '0.6' : '0.25'}
            />

            {/* Rotating Radar Sweep Beam Line */}
            <line
              x1="300"
              y1="160"
              x2="430"
              y2="160"
              stroke={isOverloadedOrIslanded ? '#ef4444' : activeDrone.color}
              strokeWidth={isOverloadedOrIslanded ? '2' : '1.2'}
              opacity={isOverloadedOrIslanded ? '0.85' : '0.6'}
              style={{
                animation: `radarSweepSpin ${isOverloadedOrIslanded ? '1.8s' : '4.5s'} linear infinite`,
              }}
            />

            {/* Dynamic Active Sector Highlight Corridors based on Selected Drone */}
            {selectedDroneId === 'DRONE-ALPHA' && (
              <g className="transition-all duration-500">
                <line
                  x1="100"
                  y1="160"
                  x2="300"
                  y2="80"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  className="animate-flow-dash"
                  style={{ filter: 'drop-shadow(0 0 8px #06b6d4)' }}
                />
                <circle cx="200" cy="120" r="28" fill="#06b6d4" opacity="0.08" className="animate-pulse" />
              </g>
            )}

            {selectedDroneId === 'DRONE-BETA' && (
              <g className="transition-all duration-500">
                <circle
                  cx="100"
                  cy="160"
                  r="46"
                  fill="#f43f5e"
                  opacity="0.12"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
                <line
                  x1="100"
                  y1="160"
                  x2="110"
                  y2="140"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              </g>
            )}

            {selectedDroneId === 'DRONE-GAMMA' && (
              <g className="transition-all duration-500">
                <line
                  x1="300"
                  y1="80"
                  x2="480"
                  y2="200"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  className="animate-flow-dash"
                  style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}
                />
                <circle cx="390" cy="140" r="28" fill="#10b981" opacity="0.08" className="animate-pulse" />
              </g>
            )}

            {/* Power Line Interconnect Vectors (Baseline Topology) */}
            <path
              d="M 100 160 L 300 80 L 480 200 Z"
              fill="none"
              stroke="url(#flightPathCyan)"
              strokeWidth={isOverloadedOrIslanded ? '2' : '1.5'}
              strokeDasharray="5 5"
              opacity="0.6"
            />
            <path d="M 300 80 L 300 240" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

            {/* Static Ground Nodes (Clickable to switch aerial focus) */}
            {/* Node 1: Main Substation Grid Tower */}
            <g
              transform="translate(100, 160)"
              className="cursor-pointer group"
              onClick={() => setSelectedDroneId('DRONE-BETA')}
            >
              {isOverloadedOrIslanded && (
                <circle r="30" fill="#ef4444" opacity="0.45" className="animate-ping" />
              )}
              <circle
                r="18"
                fill={isOverloadedOrIslanded ? '#7f1d1d' : '#1e293b'}
                stroke={isOverloadedOrIslanded ? '#ef4444' : '#eab308'}
                strokeWidth={isOverloadedOrIslanded ? '3' : '2'}
                style={{
                  filter: isOverloadedOrIslanded ? 'drop-shadow(0 0 16px #ef4444)' : 'none',
                }}
              />
              <circle r="6" fill={isOverloadedOrIslanded ? '#ef4444' : '#eab308'} />
              <text
                x="0"
                y="32"
                fill={isOverloadedOrIslanded ? '#fca5a5' : '#e2e8f0'}
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="bold"
              >
                {isOverloadedOrIslanded ? '⚠️ GRID SUBSTATION' : 'GRID SUBSTATION'}
              </text>
            </g>

            {/* Node 2: Central BESS Battery Storage */}
            <g
              transform="translate(300, 80)"
              className="cursor-pointer"
              onClick={() => setSelectedDroneId('DRONE-ALPHA')}
            >
              <circle r="18" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
              <circle r="6" fill="#06b6d4" />
              <text
                x="0"
                y="-24"
                fill="#e2e8f0"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="bold"
              >
                BESS STORAGE
              </text>
            </g>

            {/* Node 3: Microgrid Smart Houses */}
            <g
              transform="translate(480, 200)"
              className="cursor-pointer"
              onClick={() => setSelectedDroneId('DRONE-GAMMA')}
            >
              <circle r="18" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <circle r="6" fill="#3b82f6" />
              <text
                x="0"
                y="32"
                fill="#e2e8f0"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="bold"
              >
                SMART LOADS
              </text>
            </g>

            {/* Animated Drone Waypoint Flights */}
            {/* Drone Alpha (UAV-α) */}
            <g
              style={{
                animation: `droneFlightAlpha ${isOverloadedOrIslanded ? '2.5s' : '9s'} ease-in-out infinite`,
              }}
              className="cursor-pointer"
              onClick={() => setSelectedDroneId('DRONE-ALPHA')}
            >
              {selectedDroneId === 'DRONE-ALPHA' && (
                <>
                  <circle r="22" fill="#06b6d4" opacity="0.18" className="animate-ping" />
                  <circle r="18" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="14" y="-8" fill="#06b6d4" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    [TRACKING]
                  </text>
                </>
              )}
              <circle r="10" fill={isOverloadedOrIslanded ? '#ef4444' : '#0891b2'} opacity="0.3" className="animate-ping" />
              <circle r="6" fill={isOverloadedOrIslanded ? '#ef4444' : '#06b6d4'} />
              <polygon points="-5,-4 6,0 -5,4" fill="#ffffff" />
              <text x="12" y="4" fill={isOverloadedOrIslanded ? '#ef4444' : '#06b6d4'} fontSize="9" fontFamily="monospace" fontWeight="bold">
                UAV-α
              </text>
            </g>

            {/* Drone Beta (UAV-β) */}
            <g
              transform={isAnomalyActive ? 'translate(110, 140)' : 'translate(210, 120)'}
              className="cursor-pointer transition-all duration-700"
              onClick={() => setSelectedDroneId('DRONE-BETA')}
            >
              {selectedDroneId === 'DRONE-BETA' && (
                <>
                  <circle r="22" fill="#f43f5e" opacity="0.2" className="animate-ping" />
                  <circle r="18" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="14" y="-8" fill="#f43f5e" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    [TRACKING]
                  </text>
                </>
              )}
              <circle r="12" fill={isAnomalyActive ? '#ef4444' : '#f43f5e'} opacity="0.45" className="animate-ping" />
              <circle r="7" fill={isAnomalyActive ? '#ef4444' : '#f43f5e'} />
              <polygon points="-5,-4 6,0 -5,4" fill="#ffffff" />
              <text
                x="14"
                y="4"
                fill={isAnomalyActive ? '#ef4444' : '#f43f5e'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                UAV-β {isAnomalyActive ? '[HOTSPOT]' : ''}
              </text>
            </g>

            {/* Drone Gamma (UAV-γ) */}
            <g
              style={{
                animation: `droneFlightGamma ${isOverloadedOrIslanded ? '2.2s' : '8s'} ease-in-out infinite`,
              }}
              className="cursor-pointer"
              onClick={() => setSelectedDroneId('DRONE-GAMMA')}
            >
              {selectedDroneId === 'DRONE-GAMMA' && (
                <>
                  <circle r="22" fill="#10b981" opacity="0.18" className="animate-ping" />
                  <circle r="18" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="14" y="-8" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    [TRACKING]
                  </text>
                </>
              )}
              <circle r="10" fill={isOverloadedOrIslanded ? '#ef4444' : '#10b981'} opacity="0.3" className="animate-ping" />
              <circle r="6" fill={isOverloadedOrIslanded ? '#ef4444' : '#10b981'} />
              <polygon points="-5,-4 6,0 -5,4" fill="#ffffff" />
              <text x="12" y="4" fill={isOverloadedOrIslanded ? '#ef4444' : '#10b981'} fontSize="9" fontFamily="monospace" fontWeight="bold">
                UAV-γ
              </text>
            </g>
          </svg>

          {/* Map Overlay HUD Callout with DYNAMIC SECTOR NAME & LIVE GPS TELEMETRY */}
          <div
            className={`absolute top-3 left-3 px-3.5 py-2.5 rounded-xl border text-[10px] font-mono transition-all backdrop-blur-md shadow-lg ${
              isOverloadedOrIslanded
                ? 'bg-rose-950/95 border-rose-500 text-rose-300 font-bold shadow-rose-950/50'
                : 'bg-slate-950/90 border-white/15 text-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping shrink-0"
                style={{ backgroundColor: activeDrone.color }}
              />
              <span className="font-extrabold text-white tracking-wide text-xs">
                {activeDrone.sector}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                &bull; CEILING: {activeDrone.ceiling}
              </span>
              {isOverloadedOrIslanded && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-600 font-bold uppercase animate-pulse">
                  OVERLOAD SCRAMBLE
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-white font-bold flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-cyan-400" />
                LOCKED: {activeDrone.callsign.toUpperCase()}
              </span>
              <span>&bull;</span>
              <span className="text-cyan-300">{activeDrone.coords}</span>
              <span>&bull;</span>
              <span className="text-amber-300 flex items-center gap-1">
                <Compass className="w-3 h-3" />
                HDG: {activeDrone.heading}
              </span>
              <span>&bull;</span>
              <span className="font-bold text-emerald-400">
                VIEW: {sensorMode}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Drone Selected Telemetry Feed */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Select Aerial Unit:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {drones.map((d) => {
                const isSelected = selectedDroneId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDroneId(d.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 shadow-md ring-2'
                        : 'bg-slate-950/70 border-white/5 hover:border-white/20 text-slate-400'
                    }`}
                    style={{
                      borderColor: isSelected ? d.color : undefined,
                      boxShadow: isSelected ? `0 0 12px ${d.color}40` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-white font-mono">
                      <span>{d.callsign.split(' ')[0]}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {d.battery} Batt
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Telemetry Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" style={{ color: activeDrone.color }} />
                <span>{activeDrone.callsign}</span>
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                  isOverloadedOrIslanded ||
                  activeDrone.status.includes('HOTSPOT') ||
                  activeDrone.status.includes('CRITICAL')
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isOverloadedOrIslanded ? 'CRITICAL_RUNAWAY' : activeDrone.status}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 shrink-0">Assigned Sector:</span>
                <span className="text-right font-bold break-words flex-1 leading-snug" style={{ color: activeDrone.color }}>
                  {activeDrone.sector.replace('SECTOR: ', '')}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 shrink-0">Mission:</span>
                <span className="text-right text-slate-200 flex-1 break-words leading-snug">{activeDrone.mission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flight Altitude:</span>
                <span className="text-cyan-300 font-bold">{activeDrone.altitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ground Speed:</span>
                <span>{isOverloadedOrIslanded ? '54 km/h (Emergency)' : activeDrone.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Battery Level:</span>
                <span className="text-emerald-400 font-bold">{activeDrone.battery}</span>
              </div>
            </div>

            {/* Reactive Telemetry Box */}
            <div
              className={`p-2.5 rounded-lg border text-[10px] leading-snug transition-all ${
                isOverloadedOrIslanded
                  ? 'bg-rose-950/90 border-rose-500 text-rose-200 font-bold shadow-lg shadow-rose-950/50 animate-pulse'
                  : 'bg-black/60 border-white/5 text-cyan-300'
              }`}
            >
              &gt;{' '}
              {isOverloadedOrIslanded
                ? '⚠️ CRITICAL: Substation Transformer Thermal Runaway Imminent.'
                : activeDrone.telemetry}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DroneFleet.propTypes = {
  currentDemand: PropTypes.number,
  gridMode: PropTypes.string,
  transformerHealth: PropTypes.number,
};
