import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Camera,
  X,
  Scan,
  AlertTriangle,
  Layers,
  Thermometer,
  RotateCcw,
} from 'lucide-react';

export default function FieldTechAR({ isOpen = true, onClose, embedded = false }) {
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

  const handleResetScan = () => {
    setScanResults(false);
    setIsScanning(false);
  };

  if (!isOpen) return null;

  const content = (
    <div className={`relative w-full ${embedded ? '' : 'max-w-4xl'} bg-slate-950 border-2 border-cyan-500/70 rounded-3xl shadow-2xl shadow-cyan-950/90 overflow-hidden flex flex-col ${embedded ? 'min-h-[520px]' : 'max-h-[90vh]'}`}>
      {/* Top AR Header Bar */}
      <div className="px-5 py-3.5 bg-slate-900/95 border-b border-white/10 flex items-center justify-between z-20">
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
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
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

          {onClose && !embedded && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Viewport Area: Live Camera Feed or Simulated FLIR Thermal Environment */}
      <div
        className={`relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[460px] transition-colors duration-500 ${
          filterMode === 'FLIR'
            ? 'bg-[#0d0724]'
            : filterMode === 'NVG'
            ? 'bg-[#052210]'
            : 'bg-slate-950'
        }`}
      >
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
          <div
            className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-all duration-500 ${
              filterMode === 'FLIR'
                ? 'bg-gradient-to-tr from-[#0a0418] via-[#1a0b38] to-[#2c0b38]'
                : filterMode === 'NVG'
                ? 'bg-gradient-to-tr from-[#021808] via-[#04280f] to-[#063b15]'
                : 'bg-gradient-to-tr from-slate-950 via-slate-900 to-black'
            }`}
          >
            {/* Simulated Substation Wireframe Background with Thermal Heat Rings */}
            <div className="w-80 h-80 rounded-full border-2 border-dashed border-cyan-500/20 flex items-center justify-center animate-spin-slow">
              <div
                className={`w-56 h-56 rounded-full border flex items-center justify-center ${
                  filterMode === 'FLIR'
                    ? 'border-rose-500/40'
                    : filterMode === 'NVG'
                    ? 'border-emerald-500/40'
                    : 'border-cyan-500/30'
                }`}
              >
                <div
                  className={`w-32 h-32 rounded-full animate-ping ${
                    filterMode === 'FLIR'
                      ? 'bg-rose-600/15 border border-rose-500/60'
                      : filterMode === 'NVG'
                      ? 'bg-emerald-600/15 border border-emerald-500/60'
                      : 'bg-cyan-600/15 border border-cyan-500/60'
                  }`}
                />
              </div>
            </div>

            {/* Glowing Transformer Core Silhouette in FLIR Spectrum */}
            {filterMode === 'FLIR' && (
              <div className="absolute w-36 h-36 rounded-2xl bg-gradient-to-tr from-rose-500/30 via-amber-500/40 to-yellow-300/30 blur-xl animate-pulse pointer-events-none" />
            )}
          </div>
        )}

        {/* Futuristic SVG HUD Graphic Overlay - Fully Structured Without Overlaps */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 select-none font-mono text-xs">
          {/* Top HUD Telemetry */}
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2.5">
            {/* Top Left Reticle Info with Simulation Indicator */}
            <div className="space-y-1 bg-slate-950/85 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md shadow-lg max-w-sm">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Scan className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">TARGET: 66kV TRANSFORMER T-2</span>
              </div>
              <div className="text-[10px] text-slate-400">
                LAT: 37.7749&deg; N &bull; LON: -122.4194&deg; W &bull; ELEV: 18m
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[10px] text-emerald-400 font-bold">
                  AI VISION: 99.4% CONFIDENCE
                </span>
                {!hasCamera && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-600/80 font-bold">
                    FLIR SIMULATION
                  </span>
                )}
              </div>
            </div>

            {/* Top Right Reticle Frame */}
            <div className="text-left sm:text-right space-y-1 bg-slate-950/85 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md shadow-lg self-end sm:self-auto">
              <div className="text-cyan-300 font-bold">OPTICAL HUD &bull; 60 FPS</div>
              <div className="text-[10px] text-slate-400">FILTER: {filterMode} SPECTRUM</div>
              <div className="text-[10px] text-amber-300">THERMAL: -10&deg;C to 120&deg;C</div>
            </div>
          </div>

          {/* Central Targeting Reticle & Crosshairs */}
          <div className="relative flex items-center justify-center my-auto">
            <div
              className={`w-52 h-52 sm:w-64 sm:h-64 border-2 rounded-full flex items-center justify-center relative transition-colors ${
                filterMode === 'FLIR'
                  ? 'border-rose-400/50'
                  : filterMode === 'NVG'
                  ? 'border-emerald-400/50'
                  : 'border-cyan-400/50'
              }`}
            >
              {/* Crosshairs */}
              <div
                className={`absolute w-full h-[1px] ${
                  filterMode === 'FLIR' ? 'bg-rose-400/60' : filterMode === 'NVG' ? 'bg-emerald-400/60' : 'bg-cyan-400/60'
                }`}
              />
              <div
                className={`absolute h-full w-[1px] ${
                  filterMode === 'FLIR' ? 'bg-rose-400/60' : filterMode === 'NVG' ? 'bg-emerald-400/60' : 'bg-cyan-400/60'
                }`}
              />
              <div
                className={`w-14 h-14 border rounded-lg animate-pulse flex items-center justify-center ${
                  filterMode === 'FLIR' ? 'border-rose-400 bg-rose-500/10' : filterMode === 'NVG' ? 'border-emerald-400 bg-emerald-500/10' : 'border-cyan-400 bg-cyan-500/10'
                }`}
              >
                <span className="text-[9px] font-mono font-bold text-white/90">
                  {filterMode === 'FLIR' ? '82.4°C' : 'T-2'}
                </span>
              </div>

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

          {/* Bottom HUD Telemetry Status Bar - Zero Overlap Guaranteed */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
            <div className="bg-slate-950/85 px-3.5 py-2 rounded-xl border border-cyan-500/40 text-[11px] text-cyan-300 font-mono flex flex-wrap items-center gap-2 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="font-bold text-white">[ALPHA-1 T-2 TRANSFORMER]</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-300">
                {scanResults
                  ? 'Active Defect Diagnostics Loaded'
                  : 'Press "Simulate AR Defect Scan" below'}
              </span>
            </div>

            <div className="bg-slate-950/85 px-3.5 py-2 rounded-xl border border-cyan-500/40 text-[11px] text-cyan-400 font-bold font-mono flex items-center gap-1.5 backdrop-blur-md shadow-lg self-start sm:self-auto">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>FIELD TECH: SAMM</span>
            </div>
          </div>
        </div>

        {/* Floating AR Inspection Pins / Overlays (Triggered after scan) */}
        {scanResults && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center animate-fadeIn">
            {/* Pin 1: Transformer Overheat */}
            <div className="absolute top-1/4 right-6 sm:right-16 bg-rose-950/95 border-2 border-rose-500 text-white p-3.5 rounded-xl shadow-2xl backdrop-blur-md max-w-xs animate-bounce-once">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs font-mono">
                <Thermometer className="w-4 h-4 shrink-0" />
                <span>CORE TEMP: 82.4&deg;C [CRITICAL]</span>
              </div>
              <p className="text-[10px] text-rose-200 mt-1 leading-relaxed">
                Exceeds IEC 60076-7 Class-A thermal threshold (65&deg;C). High risk of accelerated insulation aging.
              </p>
            </div>

            {/* Pin 2: Dielectric Oil Pressure */}
            <div className="absolute bottom-1/4 left-6 sm:left-16 bg-amber-950/95 border-2 border-amber-500 text-white p-3.5 rounded-xl shadow-2xl backdrop-blur-md max-w-xs animate-bounce-once">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>OIL PRESSURE: 1.18 BAR [LOW]</span>
              </div>
              <p className="text-[10px] text-amber-200 mt-1 leading-relaxed">
                Dielectric cooling circulation restricted. Inspect radiator radiator fan and pump seal.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom AR Diagnostics & Control Tray */}
      <div className="px-5 py-4 bg-slate-900/95 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-bold">5G TELEMETRY LINK: SECURE</span>
          </div>
          <div className="text-slate-400 hidden sm:block">
            LATENCY: <span className="text-cyan-400 font-bold">14ms</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {scanResults && (
            <button
              type="button"
              onClick={handleResetScan}
              className="px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-xl shadow-cyan-950/60 transition-all select-none cursor-pointer border-none"
          >
            <Scan className="w-4 h-4" />
            <span>{isScanning ? 'Analyzing Telemetry...' : 'Simulate AR Defect Scan'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      {content}
    </div>
  );
}

FieldTechAR.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  embedded: PropTypes.bool,
};
