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
  Zap,
  Fan,
  FileText,
  CheckCircle2,
  ChevronRight,
  Activity,
  ShieldCheck,
  Cpu,
  Check,
} from 'lucide-react';

const INSPECTION_FIELDS = {
  TRANSFORMER_T2: {
    id: 'TRANSFORMER_T2',
    name: 'Transformer T-2',
    code: 'ALPHA-1 T-2',
    type: '66kV Step-Down Transformer',
    location: 'LAT: 37.7749° N • LON: -122.4194° W • ELEV: 18m',
    confidence: '99.4%',
    baseSeverity: 'CRITICAL',
    flirTemp: '82.4°C',
    defects: [
      {
        id: 'DEF-T2-CORE',
        name: 'Core Winding Hotspot',
        severity: 'CRITICAL',
        currentReading: '82.4°C',
        normalReading: '≤ 65.0°C',
        metricName: 'Core Temp',
        iconType: 'Thermometer',
        pinPosition: 'top-1/4 right-4 sm:right-12',
        summary: 'Exceeds IEC 60076-7 Class-A thermal threshold (65°C). Accelerated paper insulation degradation.',
        rootCause: 'Phase-B harmonic eddy current concentration under continuous 112% overload.',
        impact: 'High risk of dielectric breakdown and thermal runaway if sustained > 28 min.',
        remediations: [
          {
            id: 'REM-BESS-SHAVE',
            actionTitle: 'Dispatch BESS Peak-Shaving (-40 kW)',
            description: 'Offload Phase-B onto BESS Pack A-3 to immediately alleviate winding stress.',
            iconType: 'Zap',
            resultSeverity: 'STABILIZED',
            resultReading: '56.2°C',
            toastMessage: '⚡ BESS Peak-Shaving (-40 kW) active. Core temperature stabilized at 56.2°C.',
          },
          {
            id: 'REM-DRONE-DISPATCH',
            actionTitle: 'Dispatch Autonomous FLIR Drone',
            description: 'Transmit GPS vector to Autonomous Drone #DRN-02 for close-range thermal surveillance.',
            iconType: 'FileText',
            resultSeverity: 'INSPECTING',
            resultReading: '82.4°C (Monitoring)',
            toastMessage: '📋 Work Order #WO-9942 filed. Sector A Drone #DRN-02 en route.',
          },
        ],
      },
      {
        id: 'DEF-T2-OIL',
        name: 'Dielectric Oil Pressure Drop',
        severity: 'WARNING',
        currentReading: '1.18 BAR',
        normalReading: '1.80 - 2.20 BAR',
        metricName: 'Oil Pressure',
        iconType: 'AlertTriangle',
        pinPosition: 'bottom-1/4 left-4 sm:left-12',
        summary: 'Dielectric oil pressure below circulation safety limit. Risk of vapor pockets.',
        rootCause: 'Auxiliary cooling radiator pump cavitation or micro-airlock in valve V-04.',
        impact: 'Reduced forced-oil circulation across external cooling radiator fins.',
        remediations: [
          {
            id: 'REM-PUMP-BOOST',
            actionTitle: 'Trigger Emergency Radiator Pump Boost',
            description: 'Cycle auxiliary coolant pump to 100% duty cycle and purge manifold line.',
            iconType: 'Fan',
            resultSeverity: 'NOMINAL',
            resultReading: '1.88 BAR',
            toastMessage: '❄️ Radiator pump cycled to 100%. Oil pressure restored to 1.88 BAR (Nominal).',
          },
        ],
      },
    ],
  },
  BESS_INVERTER: {
    id: 'BESS_INVERTER',
    name: 'BESS Inverter Racks',
    code: 'BESS-INV-01',
    type: '500kWh Containerized Inverter Rack',
    location: 'LAT: 37.7751° N • LON: -122.4190° W • ELEV: 17m',
    confidence: '98.8%',
    baseSeverity: 'WARNING',
    flirTemp: '74.5°C',
    defects: [
      {
        id: 'DEF-BESS-IGBT',
        name: 'IGBT Junction Thermal Drift',
        severity: 'WARNING',
        currentReading: '74.5°C',
        normalReading: '≤ 60.0°C',
        metricName: 'IGBT Temp',
        iconType: 'Cpu',
        pinPosition: 'top-1/3 left-6 sm:left-16',
        summary: 'Inverter Bridge 2 IGBT module temperature elevated above optimal operating margin.',
        rootCause: 'Filter intake partial blockage with dust particles reducing forced convective airflow.',
        impact: 'Inverter output de-rating by 15% to prevent thermal shutdown.',
        remediations: [
          {
            id: 'REM-BESS-THROTTLE',
            actionTitle: 'Throttle Switching Frequency (12kHz → 8kHz)',
            description: 'Reduces semiconductor switching losses by 22% while maintaining clean grid sine wave.',
            iconType: 'Activity',
            resultSeverity: 'STABILIZED',
            resultReading: '54.1°C',
            toastMessage: '⚡ Frequency throttled to 8kHz. IGBT temperature cooled to 54.1°C.',
          },
        ],
      },
    ],
  },
  HV_BUSHING: {
    id: 'HV_BUSHING',
    name: 'HV Bushing Array',
    code: 'HV-BSH-66KV',
    type: 'Capacitance Graded Porcelain Bushing',
    location: 'LAT: 37.7748° N • LON: -122.4196° W • ELEV: 22m',
    confidence: '97.9%',
    baseSeverity: 'ELEVATED',
    flirTemp: '51.8°C',
    defects: [
      {
        id: 'DEF-BSH-PD',
        name: 'Corona Partial Discharge',
        severity: 'ELEVATED',
        currentReading: '120 pC',
        normalReading: '≤ 15 pC',
        metricName: 'Partial Discharge',
        iconType: 'Zap',
        pinPosition: 'top-1/4 right-6 sm:right-16',
        summary: 'Acoustic and RF sensors detect 120 pC partial discharge pulses along shed skirt.',
        rootCause: 'Surface salt contamination and ambient humidity creating micro-tracking paths.',
        impact: 'Progressive porcelain glaze degradation and flashover hazard.',
        remediations: [
          {
            id: 'REM-BSH-PURGE',
            actionTitle: 'Engage De-Ionizing Nitrogen Curtain Pulse',
            description: 'Trigger dry nitrogen purge nozzle array along insulator shed skirt.',
            iconType: 'ShieldCheck',
            resultSeverity: 'NOMINAL',
            resultReading: '12 pC',
            toastMessage: '🛡️ De-ionizing curtain pulsed. Corona discharge suppressed to 12 pC (Nominal).',
          },
        ],
      },
    ],
  },
  BREAKER_CB104: {
    id: 'BREAKER_CB104',
    name: 'Feeder Breaker CB-104',
    code: 'FEEDER-CB104',
    type: 'SF6 Gas-Insulated Circuit Breaker',
    location: 'LAT: 37.7746° N • LON: -122.4192° W • ELEV: 16m',
    confidence: '99.8%',
    baseSeverity: 'NOMINAL',
    flirTemp: '34.0°C',
    defects: [
      {
        id: 'DEF-CB-HEALTH',
        name: 'Contact Integrity Check',
        severity: 'NOMINAL',
        currentReading: '34.0°C',
        normalReading: '≤ 45.0°C',
        metricName: 'Contact Temp',
        iconType: 'CheckCircle2',
        pinPosition: 'bottom-1/3 right-8 sm:right-16',
        summary: 'All vacuum interrupter contacts operating within nominal limits. SF6 pressure 5.8 bar.',
        rootCause: 'None. Baseline scheduled diagnostic scan validates full contact conductivity.',
        impact: 'Circuit breaker is 100% operational with zero trip alarms.',
        remediations: [
          {
            id: 'REM-CB-AUDIT',
            actionTitle: 'Log Routine Inspection to SCADA Audit Trail',
            description: 'Record timestamped baseline calibration telemetry to the central SCADA historian.',
            iconType: 'FileText',
            resultSeverity: 'NOMINAL',
            resultReading: '34.0°C (Verified)',
            toastMessage: '📋 Audit entry #AUD-8821 logged successfully. Next scheduled scan in 7 days.',
          },
        ],
      },
    ],
  },
};

const SEVERITY_CONFIG = {
  CRITICAL: {
    badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-600',
    border: 'border-rose-500',
    glow: 'shadow-rose-500/50',
    indicator: 'bg-rose-500',
    text: 'text-rose-400',
    pinBg: 'bg-rose-950/95',
  },
  WARNING: {
    badgeBg: 'bg-amber-950/90 text-amber-300 border-amber-600',
    border: 'border-amber-500',
    glow: 'shadow-amber-500/50',
    indicator: 'bg-amber-500',
    text: 'text-amber-400',
    pinBg: 'bg-amber-950/95',
  },
  ELEVATED: {
    badgeBg: 'bg-yellow-950/90 text-yellow-300 border-yellow-600',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-500/50',
    indicator: 'bg-yellow-500',
    text: 'text-yellow-400',
    pinBg: 'bg-yellow-950/95',
  },
  STABILIZED: {
    badgeBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500',
    border: 'border-emerald-500',
    glow: 'shadow-emerald-500/50',
    indicator: 'bg-emerald-400',
    text: 'text-emerald-400',
    pinBg: 'bg-emerald-950/95',
  },
  NOMINAL: {
    badgeBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-600',
    border: 'border-emerald-500',
    glow: 'shadow-emerald-500/50',
    indicator: 'bg-emerald-400',
    text: 'text-emerald-400',
    pinBg: 'bg-emerald-950/95',
  },
  INSPECTING: {
    badgeBg: 'bg-cyan-950/90 text-cyan-300 border-cyan-600',
    border: 'border-cyan-500',
    glow: 'shadow-cyan-500/50',
    indicator: 'bg-cyan-400',
    text: 'text-cyan-400',
    pinBg: 'bg-cyan-950/95',
  },
};

function renderDefectIcon(iconType, className = 'w-4 h-4 shrink-0') {
  switch (iconType) {
    case 'Thermometer':
      return <Thermometer className={className} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Fan':
      return <Fan className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    default:
      return <FileText className={className} />;
  }
}

export default function FieldTechAR({ isOpen = true, onClose, embedded = false }) {
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(true);
  const [filterMode, setFilterMode] = useState('FLIR'); // 'FLIR', 'OPTICAL', 'NVG'
  const [selectedFieldId, setSelectedFieldId] = useState('TRANSFORMER_T2');
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [remediatedDefects, setRemediatedDefects] = useState({});
  const [actionInProgress, setActionInProgress] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  useEffect(() => {
    if (!isOpen) {
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

  const showToast = (message) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResults(true);
      showToast(`AI Vision: Diagnostic telemetry synchronized for ${INSPECTION_FIELDS[selectedFieldId].name}.`);
    }, 1000);
  };

  const handleResetScan = () => {
    setRemediatedDefects({});
    setSelectedDefect(null);
    showToast('Diagnostic telemetry reset to live substation state.');
  };

  const handleApplyRemediation = (defect, remediation) => {
    setActionInProgress(remediation.id);
    setTimeout(() => {
      setRemediatedDefects((prev) => ({
        ...prev,
        [defect.id]: {
          severity: remediation.resultSeverity,
          reading: remediation.resultReading,
          actionTitle: remediation.actionTitle,
        },
      }));
      setActionInProgress(null);
      showToast(remediation.toastMessage);
    }, 800);
  };

  const currentField = INSPECTION_FIELDS[selectedFieldId] || INSPECTION_FIELDS.TRANSFORMER_T2;

  // Compute effective severity of a defect (taking remediation into account)
  const getDefectEffectiveState = (defect) => {
    const rem = remediatedDefects[defect.id];
    if (rem) {
      return {
        severity: rem.severity,
        reading: rem.reading,
        isRemediated: true,
        actionTitle: rem.actionTitle,
      };
    }
    return {
      severity: defect.severity,
      reading: defect.currentReading,
      isRemediated: false,
      actionTitle: null,
    };
  };

  // Compute aggregate field severity
  const getFieldAggregateSeverity = (fieldKey) => {
    const field = INSPECTION_FIELDS[fieldKey];
    const severities = field.defects.map((d) => getDefectEffectiveState(d).severity);
    if (severities.includes('CRITICAL')) return 'CRITICAL';
    if (severities.includes('WARNING')) return 'WARNING';
    if (severities.includes('ELEVATED')) return 'ELEVATED';
    if (severities.includes('STABILIZED')) return 'STABILIZED';
    return 'NOMINAL';
  };

  // Live center reticle telemetry reading
  const getCenterReticleReading = () => {
    if (selectedFieldId === 'TRANSFORMER_T2') {
      const coreState = getDefectEffectiveState(currentField.defects[0]);
      return filterMode === 'FLIR' ? coreState.reading : 'T-2';
    }
    if (selectedFieldId === 'BESS_INVERTER') {
      const igbtState = getDefectEffectiveState(currentField.defects[0]);
      return filterMode === 'FLIR' ? igbtState.reading : 'BESS';
    }
    if (selectedFieldId === 'HV_BUSHING') {
      const pdState = getDefectEffectiveState(currentField.defects[0]);
      return pdState.reading;
    }
    return 'CB-104';
  };

  if (!isOpen) return null;

  const content = (
    <div
      className={`relative w-full ${
        embedded ? '' : 'max-w-5xl'
      } bg-slate-950 border-2 border-cyan-500/70 rounded-3xl shadow-2xl shadow-cyan-950/90 overflow-hidden flex flex-col ${
        embedded ? 'min-h-[580px]' : 'max-h-[92vh]'
      }`}
    >
      {/* Top Notification Toast */}
      {toastNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border-2 border-cyan-400 text-cyan-200 px-4 py-2 rounded-2xl shadow-2xl shadow-cyan-500/40 text-xs font-mono font-bold flex items-center gap-2 animate-bounce-once backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Top AR Header Bar */}
      <div className="px-5 py-3.5 bg-slate-900/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white font-mono uppercase">
                Field Tech AR &bull; Substation Lens
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                HUD v3.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Select field asset below to diagnose &amp; remediate critical grid conditions.
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

      {/* Inspection Field Target Selector Bar - Operator Asset Switcher */}
      <div className="px-4 py-2.5 bg-slate-950/95 border-b border-cyan-500/30 flex items-center gap-2 overflow-x-auto z-20 scrollbar-none">
        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Fields:
        </span>
        {Object.keys(INSPECTION_FIELDS).map((fieldKey) => {
          const field = INSPECTION_FIELDS[fieldKey];
          const isSelected = selectedFieldId === fieldKey;
          const aggregateSeverity = getFieldAggregateSeverity(fieldKey);
          const style = SEVERITY_CONFIG[aggregateSeverity] || SEVERITY_CONFIG.NOMINAL;

          return (
            <button
              key={fieldKey}
              type="button"
              onClick={() => {
                setSelectedFieldId(fieldKey);
                setScanResults(true);
                // If this field has defects, select the first critical or active one for quick viewing
                if (field.defects.length > 0) {
                  setSelectedDefect(field.defects[0]);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-800 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span className="font-bold">{field.name}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${style.badgeBg} flex items-center gap-1`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.indicator} ${aggregateSeverity === 'CRITICAL' ? 'animate-ping' : ''}`} />
                {aggregateSeverity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Viewport Area: Live Camera Feed or Simulated FLIR Thermal Environment */}
      <div
        className={`relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[420px] sm:min-h-[480px] transition-colors duration-500 ${
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
          /* High-Tech FLIR Thermal Simulation Canvas */
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
              <div
                className={`absolute w-44 h-44 rounded-2xl blur-xl animate-pulse pointer-events-none transition-colors duration-700 ${
                  getFieldAggregateSeverity(selectedFieldId) === 'CRITICAL'
                    ? 'bg-gradient-to-tr from-rose-600/40 via-amber-500/40 to-yellow-300/30'
                    : getFieldAggregateSeverity(selectedFieldId) === 'WARNING'
                    ? 'bg-gradient-to-tr from-amber-600/30 via-yellow-500/30 to-emerald-400/20'
                    : 'bg-gradient-to-tr from-emerald-600/30 via-cyan-500/30 to-blue-400/20'
                }`}
              />
            )}
          </div>
        )}

        {/* Futuristic SVG HUD Graphic Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 select-none font-mono text-xs">
          {/* Top HUD Telemetry */}
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2.5">
            {/* Top Left Reticle Info */}
            <div className="space-y-1 bg-slate-950/90 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md shadow-lg max-w-sm pointer-events-auto">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Scan className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">TARGET: {currentField.name.toUpperCase()}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {currentField.location}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[10px] text-emerald-400 font-bold">
                  AI CONFIDENCE: {currentField.confidence}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                    SEVERITY_CONFIG[getFieldAggregateSeverity(selectedFieldId)]?.badgeBg
                  }`}
                >
                  FIELD STATUS: [{getFieldAggregateSeverity(selectedFieldId)}]
                </span>
              </div>
            </div>

            {/* Top Right Reticle Frame */}
            <div className="text-left sm:text-right space-y-1 bg-slate-950/90 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md shadow-lg self-end sm:self-auto pointer-events-auto">
              <div className="text-cyan-300 font-bold">OPTICAL HUD &bull; 60 FPS</div>
              <div className="text-[10px] text-slate-400">FILTER: {filterMode} SPECTRUM</div>
              <div className="text-[10px] text-amber-300">CALIBRATION: IEC 60076-7</div>
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
                  filterMode === 'FLIR'
                    ? 'bg-rose-400/60'
                    : filterMode === 'NVG'
                    ? 'bg-emerald-400/60'
                    : 'bg-cyan-400/60'
                }`}
              />
              <div
                className={`absolute h-full w-[1px] ${
                  filterMode === 'FLIR'
                    ? 'bg-rose-400/60'
                    : filterMode === 'NVG'
                    ? 'bg-emerald-400/60'
                    : 'bg-cyan-400/60'
                }`}
              />
              <div
                className={`w-20 h-20 border rounded-xl animate-pulse flex flex-col items-center justify-center p-1 text-center ${
                  filterMode === 'FLIR'
                    ? 'border-rose-400 bg-rose-500/15'
                    : filterMode === 'NVG'
                    ? 'border-emerald-400 bg-emerald-500/15'
                    : 'border-cyan-400 bg-cyan-500/15'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-white tracking-wider">
                  {getCenterReticleReading()}
                </span>
                <span className="text-[8px] font-mono text-cyan-300 uppercase">
                  {currentField.code}
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

          {/* Bottom HUD Telemetry Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
            <div className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-cyan-500/40 text-[11px] text-cyan-300 font-mono flex flex-wrap items-center gap-2 backdrop-blur-md shadow-lg pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="font-bold text-white">[{currentField.code}]</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-300">
                {scanResults
                  ? `Telemetry active &bull; Click defect pin or [CRITICAL] field to remediate`
                  : 'Press "Simulate AR Defect Scan" below'}
              </span>
            </div>

            <div className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-cyan-500/40 text-[11px] text-cyan-400 font-bold font-mono flex items-center gap-1.5 backdrop-blur-md shadow-lg self-start sm:self-auto pointer-events-auto">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>FIELD TECH: SAMM</span>
            </div>
          </div>
        </div>

        {/* Floating AR Inspection Defect Pins (Fully Clickable & Interactive) */}
        {scanResults && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center animate-fadeIn">
            {currentField.defects.map((defect) => {
              const state = getDefectEffectiveState(defect);
              const config = SEVERITY_CONFIG[state.severity] || SEVERITY_CONFIG.NOMINAL;
              const isRemediated = state.isRemediated;

              return (
                <div
                  key={defect.id}
                  onClick={() => setSelectedDefect(defect)}
                  className={`absolute ${defect.pinPosition} pointer-events-auto cursor-pointer p-3 rounded-2xl border-2 ${
                    config.border
                  } ${config.pinBg} text-white shadow-2xl ${
                    config.glow
                  } backdrop-blur-md max-w-[280px] sm:max-w-xs transition-all duration-300 hover:scale-105 active:scale-95 group animate-bounce-once select-none`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                      {renderDefectIcon(defect.iconType, `w-4 h-4 ${config.text} shrink-0`)}
                      <span className="truncate">{defect.metricName}: {state.reading}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-black border uppercase tracking-wider ${config.badgeBg}`}
                    >
                      {state.severity}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {defect.summary}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      {isRemediated ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Remediated</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                          <span>Click to Remediate</span>
                        </>
                      )}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Interactive Defect Remediation & Diagnostic Action Drawer */}
        {selectedDefect && (
          <div className="absolute inset-y-0 right-0 w-full sm:w-[380px] bg-slate-950/95 border-l-2 border-cyan-500/80 shadow-2xl shadow-cyan-950/90 z-30 p-5 flex flex-col justify-between backdrop-blur-xl animate-fadeIn overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    {renderDefectIcon(selectedDefect.iconType, 'w-4 h-4')}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white font-mono uppercase tracking-wide">
                      {selectedDefect.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Asset: {currentField.code}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDefect(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badge & Live Reading Card */}
              {(() => {
                const state = getDefectEffectiveState(selectedDefect);
                const config = SEVERITY_CONFIG[state.severity] || SEVERITY_CONFIG.NOMINAL;
                return (
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Severity Level:</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${config.badgeBg}`}
                      >
                        [{state.severity}]
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{selectedDefect.metricName}:</span>
                      <span className="font-bold text-white text-sm">{state.reading}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Nominal Threshold:</span>
                      <span className="text-emerald-400 font-bold">{selectedDefect.normalReading}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Root Cause & Diagnostic Summary */}
              <div className="space-y-2 text-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Diagnostic Findings</span>
                </div>
                <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                  {selectedDefect.summary}
                </p>
                <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-amber-400 font-bold">Root Cause: </span>
                    {selectedDefect.rootCause}
                  </div>
                  <div className="pt-1">
                    <span className="text-rose-400 font-bold">Impact: </span>
                    {selectedDefect.impact}
                  </div>
                </div>
              </div>

              {/* Remediation Action Controls */}
              <div className="space-y-2.5 pt-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Interactive Field Remediation</span>
                </div>

                <div className="space-y-2">
                  {selectedDefect.remediations.map((remediation) => {
                    const isExecuting = actionInProgress === remediation.id;
                    const isAlreadyRemediated =
                      remediatedDefects[selectedDefect.id]?.actionTitle === remediation.actionTitle;

                    return (
                      <div
                        key={remediation.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isAlreadyRemediated
                            ? 'bg-emerald-950/40 border-emerald-500/60'
                            : 'bg-slate-900 hover:bg-slate-850 border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5 shrink-0">
                            {renderDefectIcon(remediation.iconType, 'w-3.5 h-3.5')}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-xs font-bold text-white font-mono">
                              {remediation.actionTitle}
                            </h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              {remediation.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-cyan-300">
                            Target: [{remediation.resultSeverity}]
                          </span>
                          <button
                            type="button"
                            disabled={isExecuting || isAlreadyRemediated}
                            onClick={() => handleApplyRemediation(selectedDefect, remediation)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                              isAlreadyRemediated
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-md shadow-cyan-950/50'
                            }`}
                          >
                            {isExecuting ? (
                              <>
                                <RotateCcw className="w-3 h-3 animate-spin" />
                                <span>Executing...</span>
                              </>
                            ) : isAlreadyRemediated ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Applied</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3 h-3" />
                                <span>Execute</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedDefect(null)}
                className="w-full py-2 rounded-xl text-xs font-mono font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-white/10 transition-colors cursor-pointer"
              >
                Dismiss Diagnostics
              </button>
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
          {Object.keys(remediatedDefects).length > 0 && (
            <button
              type="button"
              onClick={handleResetScan}
              className="px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-xl shadow-cyan-950/60 transition-all select-none cursor-pointer border-none"
          >
            <Scan className="w-4 h-4" />
            <span>{isScanning ? 'Analyzing Field Telemetry...' : 'Simulate AR Defect Scan'}</span>
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
