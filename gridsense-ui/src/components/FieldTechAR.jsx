import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Scan,
  AlertTriangle,
  Layers,
  Thermometer,
} from 'lucide-react';

export default function FieldTechAR({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(false);
  const [filterMode, setFilterMode] = useState('FLIR'); // 'FLIR', 'OPTICAL', 'NVG'

  useEffect(() => {
    if (!isOpen) {
      setScanResults(false);
      setIsScanning(false);
      return;
    }

    let stream = null;
    const startCamera = async () => {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          setHasCamera(false);
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch {
        // Silently switch to FLIR Digital Simulation mode without throwing red console errors
        setHasCamera(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResults(true);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-950 border-2 border-cyan-500/70 rounded-3xl shadow-2xl shadow-cyan-950/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top AR Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-white font-mono uppercase">
                  Field Tech AR &bull; Smart Substation Lens
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  HUD v3.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Spatial optical inspection with thermal FLIR overlay &amp; AI defect detection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Mode Selector */}
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
              {['FLIR', 'OPTICAL', 'NVG'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === mode
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area: Live Camera Feed or Simulated FLIR Thermal Environment */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
          {hasCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                filterMode === 'FLIR'
                  ? 'sepia hue-rotate-180 contrast-150 saturate-200'
                  : filterMode === 'NVG'
                  ? 'brightness-125 contrast-150 hue-rotate-90 saturate-200'
                  : ''
              }`}
            />
          ) : (
            /* High-Tech FLIR Thermal Simulation Canvas when Camera is unavailable */
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950/60 to-rose-950/40 flex items-center justify-center overflow-hidden">
              {/* Simulated Substation Wireframe Background */}
              <div className="w-72 h-72 rounded-full border-2 border-dashed border-cyan-500/20 flex items-center justify-center animate-spin-slow">
                <div className="w-48 h-48 rounded-full border border-rose-500/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-rose-600/10 border border-rose-500/50 animate-ping" />
                </div>
              </div>

              {/* Exact Status Notification as Specified */}
              <div className="absolute top-6 left-6 z-20 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-xl backdrop-blur-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Camera unavailable, engaging FLIR Digital Simulation mode.</span>
              </div>

              <div className="absolute bottom-6 left-6 text-xs font-mono text-cyan-400/60">
                [FLIR IR SIMULATION ACTIVE &bull; SUBSTATION ALPHA-1 T-2 TRANSFORMER]
              </div>
            </div>
          )}

          {/* Futuristic SVG HUD Graphic Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 select-none font-mono text-xs">
            {/* Top HUD Telemetry */}
            <div className="flex items-start justify-between">
              {/* Top Left Reticle Info */}
              <div className="space-y-1 bg-slate-950/70 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Scan className="w-4 h-4 text-cyan-400" />
                  <span>TARGET: 66kV SUBSTATION TRANSFORMER T-2</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  LAT: 37.7749&deg; N &bull; LON: -122.4194&deg; W &bull; ELEV: 18m
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  AI VISION: OBJECT IDENTIFIED &bull; CONFIDENCE 99.4%
                </div>
              </div>

              {/* Top Right Reticle Frame */}
              <div className="text-right space-y-1 bg-slate-950/70 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md">
                <div className="text-cyan-300 font-bold">OPTICAL HUD &bull; FPS: 60</div>
                <div className="text-[10px] text-slate-400">FILTER: {filterMode} SPECTRUM</div>
                <div className="text-[10px] text-amber-300">THERMAL RANGE: -10&deg;C to 120&deg;C</div>
              </div>
            </div>

            {/* Central Targeting Reticle & Crosshairs */}
            <div className="relative flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-cyan-400/40 rounded-full flex items-center justify-center relative">
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-cyan-400/60" />
                <div className="absolute h-full w-[1px] bg-cyan-400/60" />
                <div className="w-12 h-12 border border-rose-400 rounded-lg animate-pulse" />
                {/* 4 Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
              </div>

              {/* Laser Scanning Line Animation */}
              {isScanning && (
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 animate-scan pointer-events-none" />
              )}
            </div>

            {/* Bottom HUD Telemetry */}
            <div className="flex items-end justify-between">
              <div className="text-[10px] text-slate-400 font-mono">
                PRESS [SIMULATE AR SCAN] TO ACQUIRE THERMAL PINS
              </div>
              <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>FIELD OPERATOR: SAMM (GRID ADMIN)</span>
              </div>
            </div>
          </div>

          {/* Floating AR Inspection Pins / Overlays (Triggered after scan) */}
          {scanResults && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center animate-fadeIn">
              {/* Pin 1: Transformer Overheat */}
              <div className="absolute top-1/4 right-1/4 bg-rose-950/90 border-2 border-rose-500 text-white p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs animate-bounce-once">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs font-mono">
                  <Thermometer className="w-4 h-4" />
                  <span>CORE TEMP: 82.4&deg;C [CRITICAL]</span>
                </div>
                <p className="text-[10px] text-rose-200 mt-1">
                  Exceeds Class-A threshold (65&deg;C). High risk of thermal runaway.
                </p>
              </div>

              {/* Pin 2: Dielectric Oil Pressure */}
              <div className="absolute bottom-1/4 left-1/5 bg-amber-950/90 border-2 border-amber-500 text-white p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs animate-bounce-once">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>OIL PRESSURE: 1.18 BAR [LOW]</span>
                </div>
                <p className="text-[10px] text-amber-200 mt-1">
                  Dielectric cooling flow constrained. Inspect pump seal.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom AR Diagnostics & Control Tray */}
        <div className="px-5 py-4 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300">TELEMETRY LINK: 5G SECURE</span>
            </div>
            <div className="text-slate-400 hidden sm:block">
              LATENCY: <span className="text-cyan-400 font-bold">14ms</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-xl shadow-cyan-950/60 transition-all select-none cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>{isScanning ? 'Analyzing Telemetry...' : 'Simulate AR Defect Scan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
