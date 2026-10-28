/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Rotate3d, Zap, ShieldAlert, BatteryCharging } from 'lucide-react';

// Animated Glowing Energy Particle traveling along 3D Vector path
function EnergyStream({ start, end, color, speed = 1.8, count = 5 }) {
  const points = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      offset: i / count,
    }));
  }, [count]);

  const p1 = useMemo(() => new THREE.Vector3(...start), [start]);
  const p2 = useMemo(() => new THREE.Vector3(...end), [end]);

  return (
    <group>
      {/* Laser line between nodes */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([...start, ...end]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.4} linewidth={2} />
      </line>

      {/* Flowing energy orbs */}
      {points.map((pt, idx) => (
        <FlowingOrb
          key={idx}
          p1={p1}
          p2={p2}
          offset={pt.offset}
          speed={speed}
          color={color}
        />
      ))}
    </group>
  );
}

function FlowingOrb({ p1, p2, offset, speed, color }) {
  const meshRef = useRef();
  const progressRef = useRef(offset);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    progressRef.current = (progressRef.current + delta * speed * 0.4) % 1;
    // Arch upward slightly in the middle for high-voltage transmission aesthetic
    const t = progressRef.current;
    const currentPos = new THREE.Vector3().lerpVectors(p1, p2, t);
    currentPos.y += Math.sin(t * Math.PI) * 0.8;
    meshRef.current.position.copy(currentPos);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        roughness={0.1}
      />
    </mesh>
  );
}

// 1. Main Grid High-Voltage Transmission Substation Tower
function GridTower({ isIslanded, isActiveMode }) {
  const towerRef = useRef();

  useFrame(() => {
    if (isIslanded && towerRef.current) {
      // Jitter / spark effect under cyberattack disconnection
      towerRef.current.position.x = -4 + (Math.random() - 0.5) * 0.05;
    }
  });

  const towerColor = isIslanded
    ? '#ef4444' // Red under cyberattack
    : isActiveMode
    ? '#eab308' // Amber active
    : '#64748b'; // Idle slate

  return (
    <group ref={towerRef} position={[-4, 0, 0]}>
      {/* Base Concrete Foundation */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.4, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Lattice Tower Structure */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.3, 0.8, 3, 4]} />
        <meshStandardMaterial
          color={towerColor}
          wireframe={true}
          emissive={towerColor}
          emissiveIntensity={isIslanded ? 2.5 : isActiveMode ? 1.2 : 0.2}
        />
      </mesh>

      {/* Crossbar 1 */}
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[2.8, 0.15, 0.3]} />
        <meshStandardMaterial color={towerColor} metalness={0.8} />
      </mesh>

      {/* Crossbar 2 */}
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[1.8, 0.12, 0.25]} />
        <meshStandardMaterial color={towerColor} metalness={0.8} />
      </mesh>

      {/* High-Voltage Transformers / Insulators */}
      {[-1.2, 0, 1.2].map((xOffset, i) => (
        <mesh key={i} position={[xOffset, 2.5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshStandardMaterial
            color={isIslanded ? '#f87171' : '#38bdf8'}
            emissive={isIslanded ? '#ef4444' : '#0284c7'}
            emissiveIntensity={isIslanded ? 2 : 1}
          />
        </mesh>
      ))}

      {/* Top Lightning Arrester */}
      <mesh position={[0, 3.8, 0]}>
        <coneGeometry args={[0.1, 0.6, 6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Floating 3D Label */}
      <Html position={[0, 4.3, 0]} center distanceFactor={14} className="pointer-events-none select-none">
        <div className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-extrabold whitespace-nowrap shadow-xl border backdrop-blur-md ${
          isIslanded
            ? 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse'
            : 'bg-slate-950/80 text-white border-white/10'
        }`}>
          {isIslanded ? '⚠️ GRID OFFLINE [BREACH]' : '⚡ MAIN GRID TOWER'}
        </div>
      </Html>
    </group>
  );
}

// 2. Battery Energy Storage System (BESS Industrial Container)
function BatteryContainer({ isDischarging, isIslanded, soc }) {
  const containerRef = useRef();

  useFrame((state) => {
    if (!containerRef.current) return;
    const t = state.clock.getElapsedTime();
    if (isIslanded) {
      // Rapid pulsing glow under emergency islanded mode
      containerRef.current.scale.setScalar(1 + Math.sin(t * 8) * 0.02);
    } else if (isDischarging) {
      // Smooth breathing glow
      containerRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.015);
    }
  });

  const bessColor = isIslanded
    ? '#ec4899' // Emergency Magenta
    : isDischarging
    ? '#06b6d4' // Cyan Storage Mode
    : '#10b981'; // Green Standby/Charge

  return (
    <group ref={containerRef} position={[0, 0, -3.2]}>
      {/* Industrial BESS Enclosure Container */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[2.6, 1.7, 1.4]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Glowing Energy Core Window */}
      <mesh position={[0, 0.9, 0.71]}>
        <planeGeometry args={[2.2, 0.8]} />
        <meshStandardMaterial
          color={bessColor}
          emissive={bessColor}
          emissiveIntensity={isIslanded ? 3.5 : isDischarging ? 2.5 : 1.0}
        />
      </mesh>

      {/* Status LED Indicators */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1.45, 0.72]}>
          <boxGeometry args={[0.2, 0.1, 0.05]} />
          <meshStandardMaterial
            color={bessColor}
            emissive={bessColor}
            emissiveIntensity={3}
          />
        </mesh>
      ))}

      {/* Cooling Fans on Top */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 1.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#475569" wireframe={true} />
        </mesh>
      ))}

      {/* Floating 3D Label */}
      <Html position={[0, 2.3, 0]} center distanceFactor={14} className="pointer-events-none select-none">
        <div
          className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-extrabold whitespace-nowrap shadow-xl border backdrop-blur-md bg-slate-950/80"
          style={{ color: bessColor, borderColor: `${bessColor}60` }}
        >
          {`🔋 BESS BATTERY (${soc}%)`}
        </div>
      </Html>
    </group>
  );
}

// 3. Smart House (Residential Microgrid Load with Rooftop Solar)
function SmartHouse({ demandKw }) {
  return (
    <group position={[3.6, 0, 0.8]}>
      {/* Foundation */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.2, 0.3, 2.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Main Living Volume (Cube) */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[1.8, 1.4, 1.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* Smart Panoramic Glass Windows */}
      <mesh position={[0, 0.9, 0.91]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Pyramid Roof (Pyramid on a cube) */}
      <mesh position={[0, 2.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.5, 1.0, 4]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Rooftop Solar PV Panels on roof slope */}
      <mesh position={[0.4, 2.1, 0.4]} rotation={[0.5, 0.5, -0.3]}>
        <boxGeometry args={[0.9, 0.05, 0.6]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={1.2}
          wireframe={true}
        />
      </mesh>

      {/* Floating 3D Demand Label */}
      <Html position={[0, 2.9, 0]} center distanceFactor={14} className="pointer-events-none select-none">
        <div className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-extrabold whitespace-nowrap shadow-xl border border-cyan-500/50 bg-slate-950/80 text-cyan-300 backdrop-blur-md">
          {`🏡 SMART LOAD: ${Number(demandKw || 120).toFixed(0)} kW`}
        </div>
      </Html>
    </group>
  );
}

// 3D Scene Root
function MicrogridScene({ gridMode, batterySoc, demandKw, autoRotate = true }) {
  const isIslanded = gridMode === 'ISLANDED_MODE';
  const isRenewable = gridMode === 'RENEWABLE_STORAGE_MODE';
  const isMainGrid = gridMode === 'MAIN_GRID_MODE' && !isIslanded;

  const sceneGroupRef = useRef();

  // Dynamic 5x speedup rotation on scene group
  useFrame((_, delta) => {
    if (sceneGroupRef.current && autoRotate) {
      sceneGroupRef.current.rotation.y += delta * 0.45;
    }
  });

  // Scene Coordinates
  const gridTowerPos = [-4, 2.2, 0];
  const batteryPos = [0, 1.2, -3.2];
  const housePos = [3.6, 1.4, 0.8];

  return (
    <group ref={sceneGroupRef}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#38bdf8" />

      {/* Cybernetic Floor Grid */}
      <gridHelper args={[24, 24, '#06b6d4', '#1e293b']} position={[0, -0.01, 0]} />

      {/* Floating Objects */}
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
        <GridTower isIslanded={isIslanded} isActiveMode={isMainGrid} />
      </Float>

      <Float speed={1.2} rotationIntensity={0.03} floatIntensity={0.15}>
        <BatteryContainer
          isDischarging={isRenewable || isIslanded}
          isIslanded={isIslanded}
          soc={batterySoc}
        />
      </Float>

      <Float speed={1.0} rotationIntensity={0.02} floatIntensity={0.1}>
        <SmartHouse demandKw={demandKw} />
      </Float>

      {/* 3D Animated Energy Flow Streams */}
      {/* 1. Main Grid -> House */}
      {isMainGrid && (
        <EnergyStream
          start={gridTowerPos}
          end={housePos}
          color="#f59e0b"
          speed={2.2}
          count={6}
        />
      )}

      {/* 2. Battery -> House */}
      {(isRenewable || isIslanded) && (
        <EnergyStream
          start={batteryPos}
          end={housePos}
          color={isIslanded ? '#f43f5e' : '#06b6d4'}
          speed={isIslanded ? 3.0 : 2.0}
          count={7}
        />
      )}
    </group>
  );
}

export default function Substation3D({
  gridMode = 'MAIN_GRID_MODE',
  batterySoc = '85.0',
  demandKw = 145.0,
}) {
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col relative overflow-hidden group">
      {/* Top Header / Mode Display */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>3D Digital Twin &bull; Microgrid Telemetry</span>
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                gridMode === 'ISLANDED_MODE'
                  ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                  : gridMode === 'RENEWABLE_STORAGE_MODE'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}
            >
              {gridMode}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            WebGL Spatial Digital Twin of High-Voltage Grid Tower, BESS Battery & Residential Microgrid.
          </p>
        </div>

        {/* 3D Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            title="Toggle 3D Camera Orbit Auto-Rotation"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              autoRotate
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Rotate3d className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
            <span>{autoRotate ? 'Orbit: ON' : 'Orbit: OFF'}</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="w-full h-80 sm:h-96 rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-black relative overflow-hidden border border-white/5">
        <Canvas
          camera={{ position: [7, 6, 8], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          className="cursor-grab active:cursor-grabbing"
        >
          <MicrogridScene
            gridMode={gridMode}
            batterySoc={batterySoc}
            demandKw={demandKw}
            autoRotate={autoRotate}
          />
          <OrbitControls
            enableDamping={true}
            dampingFactor={0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={4.5} // 5x faster smooth camera orbit
            maxPolarAngle={Math.PI / 2.1} // Prevent going below ground plane
            minDistance={4}
            maxDistance={18}
          />
        </Canvas>

        {/* Sci-Fi HUD Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-[10px] space-y-1 font-mono pointer-events-none">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
            <span>Main Transmission Grid &bull; 66 kV</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm" />
            <span>BESS Container &bull; 500 kWh Li-ion</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm" />
            <span>Smart Microgrid Load &amp; Solar PV</span>
          </div>
        </div>

        {/* Status Callout Badge */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono pointer-events-none flex items-center gap-2">
          {gridMode === 'ISLANDED_MODE' ? (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="text-rose-300 font-bold">GRID DISCONNECTED: ISLANDED</span>
            </>
          ) : gridMode === 'RENEWABLE_STORAGE_MODE' ? (
            <>
              <BatteryCharging className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 font-bold">STORAGE DISPATCH ACTIVE</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 font-bold">UTILITY FEED ACTIVE</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
