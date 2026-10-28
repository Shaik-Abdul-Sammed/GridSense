import { useState, useEffect, useRef, useCallback } from 'react';
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
  Radio,
  Sliders,
  VideoOff,
  Eye,
  RefreshCw,
  Sparkles,
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
        pinPosition: 'top-24 right-3 sm:top-24 sm:right-6',
        summary: 'Exceeds IEC 60076-7 Class-A thermal threshold (65°C). Accelerated paper insulation degradation.',
        rootCause: 'Phase-B harmonic eddy current concentration under continuous 112% overload.',
        impact: 'High risk of dielectric breakdown and thermal runaway if sustained > 28 min.',
        remediations: [
          {
            id: 'REM-BESS-SHAVE',
            actionTitle: 'Dispatch BESS Peak-Shaving (-40 kW)',
            description: 'Injects localized battery energy to drop transformer winding load below 85% capacity.',
            iconType: 'Zap',
            resultSeverity: 'STABILIZED',
            resultReading: '63.2°C',
            toastMessage: '⚡ BESS 40kW peak shaving active. Winding hotspot stabilized to 63.2°C.',
          },
          {
            id: 'REM-FORCE-COOL',
            actionTitle: 'Engage Stage-2 Forced Oil Pumps (OFAF)',
            description: 'Forces high-velocity synthetic ester oil circulation through heat exchanger banks.',
            iconType: 'Fan',
            resultSeverity: 'NOMINAL',
            resultReading: '58.7°C',
            toastMessage: '🌀 OFAF Stage-2 cooling online. Transformer core cooled to 58.7°C (Nominal).',
          },
        ],
      },
      {
        id: 'DEF-T2-OIL',
        name: 'Top Oil Dielectric Stress',
        severity: 'WARNING',
        currentReading: '71.5°C',
        normalReading: '≤ 60.0°C',
        metricName: 'Top Oil Temp',
        iconType: 'Activity',
        pinPosition: 'bottom-16 left-3 sm:bottom-18 sm:left-6',
        summary: 'Top oil temperature climbing at 0.4°C/min; dissolved gas sensor (DGA) reports trace hydrogen.',
        rootCause: 'Ambient ambient heat wave combined with peak industrial feeder demand.',
        impact: 'Oil oxidation rate accelerated 2.4x standard aging profile.',
        remediations: [
          {
            id: 'REM-TAP-AUTO',
            actionTitle: 'Auto-Step OLTC Tap Changer (Position 7 → 5)',
            description: 'Lowers secondary bus voltage by 2.5% to decrease magnetizing core current.',
            iconType: 'Sliders',
            resultSeverity: 'NOMINAL',
            resultReading: '57.1°C',
            toastMessage: '⚙️ On-Load Tap Changer stepped down to Pos 5. Top oil cooling to 57.1°C.',
          },
        ],
      },
    ],
  },
  BESS_INVERTER: {
    id: 'BESS_INVERTER',
    name: 'BESS Inverter Rack B',
    code: 'BESS-INV-02',
    type: 'Bidirectional SiC Power Converter',
    location: 'LAT: 37.7751° N • LON: -122.4190° W • ELEV: 19m',
    confidence: '98.7%',
    baseSeverity: 'WARNING',
    flirTemp: '68.9°C',
    defects: [
      {
        id: 'DEF-INV-IGBT',
        name: 'IGBT Junction Thermal Delta',
        severity: 'WARNING',
        currentReading: '68.9°C',
        normalReading: '≤ 55.0°C',
        metricName: 'IGBT Temp',
        iconType: 'Cpu',
        pinPosition: 'top-24 left-3 sm:top-24 sm:left-6',
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
        pinPosition: 'top-24 right-3 sm:top-24 sm:right-6',
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
        pinPosition: 'bottom-16 right-3 sm:bottom-20 sm:right-6',
        summary: 'Dynamic resistance and SF6 gas density within standard IEC 62271 nominal envelope.',
        rootCause: 'All three poles operating in optimal synchronized vacuum transition.',
        impact: 'Feeder circuit breaker ready for high-speed fault isolation.',
        remediations: [],
      },
    ],
  },
};

const SEVERITY_CONFIG = {
  CRITICAL: {
    badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-500',
    border: 'border-rose-500',
    glow: 'shadow-rose-500/50',
    indicator: 'bg-rose-500 animate-pulse',
    text: 'text-rose-400',
    pinBg: 'bg-slate-950/95',
  },
  WARNING: {
    badgeBg: 'bg-amber-950/90 text-amber-300 border-amber-500',
    border: 'border-amber-500',
    glow: 'shadow-amber-500/50',
    indicator: 'bg-amber-400 animate-pulse',
    text: 'text-amber-400',
    pinBg: 'bg-slate-950/95',
  },
  ELEVATED: {
    badgeBg: 'bg-orange-950/90 text-orange-300 border-orange-500',
    border: 'border-orange-500',
    glow: 'shadow-orange-500/50',
    indicator: 'bg-orange-400',
    text: 'text-orange-400',
    pinBg: 'bg-slate-950/95',
  },
  STABILIZED: {
    badgeBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500',
    border: 'border-emerald-500',
    glow: 'shadow-emerald-500/50',
    indicator: 'bg-emerald-400',
    text: 'text-emerald-400',
    pinBg: 'bg-slate-950/95',
  },
  NOMINAL: {
    badgeBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-600',
    border: 'border-emerald-500',
    glow: 'shadow-emerald-500/50',
    indicator: 'bg-emerald-400',
    text: 'text-emerald-400',
    pinBg: 'bg-slate-950/95',
  },
  INSPECTING: {
    badgeBg: 'bg-cyan-950/90 text-cyan-300 border-cyan-600',
    border: 'border-cyan-500',
    glow: 'shadow-cyan-500/50',
    indicator: 'bg-cyan-400',
    text: 'text-cyan-400',
    pinBg: 'bg-slate-950/95',
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
  const streamRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState(false);
  const [isSimModeForced, setIsSimModeForced] = useState(false);
  const [simulationPreset, setSimulationPreset] = useState(null); // 'NORMAL' | 'CRITICAL' | null

  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(true);
  const [filterMode, setFilterMode] = useState('FLIR'); // 'FLIR', 'OPTICAL', 'NVG'
  const [selectedFieldId, setSelectedFieldId] = useState('TRANSFORMER_T2');
  const [activeDefectId, setActiveDefectId] = useState('DEF-T2-CORE');
  const [remediatedDefects, setRemediatedDefects] = useState({});
  const [dismissedDefectPins, setDismissedDefectPins] = useState({});
  const [isHotspotDismissed, setIsHotspotDismissed] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  // Mobile Suboptions Switcher: 'ALL', 'VIEWPORT', 'CONSOLE'
  const [mobileSubTab, setMobileSubTab] = useState('ALL');

  const showToast = useCallback((message) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification((curr) => (curr === message ? null : curr));
    }, 5000);
  }, []);

  // Stop Camera Feed Handler: Releases camera hardware tracks, remains on AR page, and switches to simulated FLIR thermal mode
  const handleStopCameraFeed = () => {
    try {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        if (typeof stream.getTracks === 'function') {
          stream.getTracks().forEach((track) => track.stop());
        }
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    } catch (err) {
      console.warn('Error releasing camera tracks:', err);
    }
    setHasCamera(false);
    setIsSimModeForced(true);
    setFilterMode('FLIR');
    showToast('📷 Camera turned off. Switched to FLIR Thermal Simulation mode.');
  };

  // Preset 1: Simulate Normal Asset (Cool colors, 45°C)
  const handleSimulateNormalPreset = () => {
    try {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        if (typeof stream.getTracks === 'function') {
          stream.getTracks().forEach((track) => track.stop());
        }
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    } catch (err) {
      console.warn('Error releasing camera for preset:', err);
    }
    setHasCamera(false);
    setIsSimModeForced(true);
    setSimulationPreset('NORMAL');
    setFilterMode('FLIR');
    setSelectedFieldId('TRANSFORMER_T2');
    showToast('📷 Mock Thermal: Healthy Transformer T-2 (45.0°C Nominal)');
  };

  // Preset 2: Simulate Critical Overload (Hotspot, 92°C)
  const handleSimulateCriticalPreset = () => {
    try {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        if (typeof stream.getTracks === 'function') {
          stream.getTracks().forEach((track) => track.stop());
        }
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    } catch (err) {
      console.warn('Error releasing camera for preset:', err);
    }
    setHasCamera(false);
    setIsSimModeForced(true);
    setSimulationPreset('CRITICAL');
    setIsHotspotDismissed(false);
    setFilterMode('FLIR');
    setSelectedFieldId('TRANSFORMER_T2');
    setActiveDefectId('DEF-T2-CORE');
    showToast('🔥 Mock Thermal: CRITICAL HOTSPOT DETECTED (92.0°C Overload)');
  };

  // Comprehensive Camera Initializer with robust mobile/desktop fallbacks
  const startCamera = useCallback(async () => {
    setCameraPermissionRequested(true);
    let stream = null;

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setHasCamera(false);
        setCameraUnavailable(true);
        setFilterMode('FLIR');
        return;
      }

      // First attempt: environment-facing camera with optimal HD resolution
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (constraintErr) {
        console.warn('Ideal back-camera constraint failed, attempting standard camera:', constraintErr);
        // Fallback for laptops and devices without back-facing cameras
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      streamRef.current = stream;

      // Assign to permanent video element
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((playErr) => {
            console.warn('Autoplay prevented on video tag:', playErr);
          });
        };
        try {
          await videoRef.current.play();
        } catch (pErr) {
          console.warn('Direct play error:', pErr);
        }
      }

      setHasCamera(true);
      setCameraUnavailable(false);
      setIsSimModeForced(false);
      showToast('📷 Live Optical Camera feed connected successfully.');
    } catch (err) {
      console.warn('Camera feed denied, blocked, or unavailable:', err?.message || err);
      setHasCamera(false);
      setCameraUnavailable(true);
      setIsSimModeForced(true);
      setFilterMode('FLIR');
      showToast('Thermal Simulation fallback active (Physical camera unavailable).');
    }
  }, [showToast]);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      return;
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, startCamera]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResults(true);
      setDismissedDefectPins({});
      setIsHotspotDismissed(false);
      showToast(`AI Vision: Diagnostic telemetry synchronized for ${INSPECTION_FIELDS[selectedFieldId].name}.`);
    }, 900);
  };

  const handleResetScan = () => {
    setRemediatedDefects({});
    setDismissedDefectPins({});
    setIsHotspotDismissed(false);
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

  // Selected defect object (or null if user closed the card)
  const activeDefect = activeDefectId
    ? currentField.defects.find((d) => d.id === activeDefectId) || currentField.defects[0]
    : null;

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
    if (simulationPreset === 'NORMAL' && (!hasCamera || isSimModeForced)) {
      return '45.0°C';
    }
    if (simulationPreset === 'CRITICAL' && (!hasCamera || isSimModeForced)) {
      return '92.0°C';
    }
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
    <div className="w-full flex flex-col space-y-4">
      {/* Top Notification Toast with Dismiss Cross (✕) */}
      {toastNotification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border-2 border-cyan-400 text-cyan-200 px-4 py-2.5 rounded-2xl shadow-2xl shadow-cyan-500/50 text-xs font-mono font-bold flex items-center justify-between gap-3 animate-bounce-once backdrop-blur-md max-w-md w-[92vw] sm:w-auto"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="break-words text-left leading-tight">{toastNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotification(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Dismiss notification"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Suboptions Switcher Bar (Appears on small/medium screens to prevent clumsy stacked scrolling) */}
      <div className="flex xl:hidden items-center justify-between p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase px-2 shrink-0">
          View Mode:
        </span>
        <div className="flex items-center gap-1 flex-1 justify-end font-mono text-xs">
          <button
            type="button"
            onClick={() => setMobileSubTab('VIEWPORT')}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mobileSubTab === 'VIEWPORT'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/60'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AR Lens</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileSubTab('CONSOLE')}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mobileSubTab === 'CONSOLE'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/60'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Diagnostics</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileSubTab('ALL')}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              mobileSubTab === 'ALL'
                ? 'bg-slate-800 text-white border border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout: Viewport on Left/Top, Diagnostics & Remediation on Right/Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ================= COLUMN 1: AR Viewport & Camera Lens ================= */}
        <div
          className={`xl:col-span-7 2xl:col-span-8 bg-slate-950 border-2 border-cyan-500/70 rounded-3xl shadow-2xl shadow-cyan-950/90 overflow-hidden flex flex-col ${
            mobileSubTab === 'CONSOLE' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          {/* Top AR Header Bar */}
          <div className="px-4 py-3 bg-slate-900/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight text-white font-mono uppercase truncate">
                    Field Tech AR &bull; Substation Lens
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                    HUD v3.5
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Thermal optical targeting with spatial defect markers &amp; IEC diagnostics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Camera Feed Toggle (Stays on AR page, stops hardware stream and switches to thermal FLIR simulation) */}
              {hasCamera && !isSimModeForced ? (
                <button
                  type="button"
                  onClick={handleStopCameraFeed}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/70 border border-rose-400/50 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Turn off live camera hardware feed and switch to simulated FLIR thermal mode"
                >
                  <VideoOff className="w-4 h-4" />
                  <span>✕ Turn Off Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSimModeForced(false);
                    startCamera();
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950/70 border border-cyan-400/50 cursor-pointer transition-all active:scale-95 shrink-0"
                  title={cameraUnavailable ? 'Camera denied or unavailable. Click to retry access.' : 'Engage physical webcam / camera feed'}
                >
                  <RefreshCw className="w-4 h-4 text-cyan-200" />
                  <span>{cameraUnavailable ? 'Retry Camera' : cameraPermissionRequested && !hasCamera ? 'Restore Camera' : 'Turn On Camera'}</span>
                </button>
              )}

              {/* Filter Mode Selector */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
                {['FLIR', 'OPTICAL', 'NVG'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterMode(mode)}
                    className={`min-h-[36px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                      filterMode === mode
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Modal Close Button (Only present when FieldTechAR is loaded inside a modal popup on Dashboard) */}
              {!embedded && onClose && (
                <button
                  type="button"
                  onClick={() => {
                    handleStopCameraFeed();
                    onClose();
                  }}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 border border-white/20 cursor-pointer transition-all shrink-0"
                  title="Close AR Modal"
                >
                  <X className="w-4 h-4" />
                  <span>Exit Modal</span>
                </button>
              )}
            </div>
          </div>

          {/* Inspection Field Target Selector Bar - Operator Asset Suboptions */}
          <div className="px-4 py-2 bg-slate-950/95 border-b border-cyan-500/30 flex items-center gap-2 overflow-x-auto z-20 scrollbar-thin scrollbar-thumb-slate-700 flex-nowrap">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Suboptions:
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
                    setDismissedDefectPins({});
                    if (field.defects.length > 0) {
                      setActiveDefectId(field.defects[0].id);
                    }
                  }}
                  className={`min-h-[42px] flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${style.indicator}`} />
                  <span className="font-bold whitespace-nowrap">{field.name}</span>
                  <span
                    className={`text-[8px] px-1 py-0.2 rounded border font-black uppercase ${style.badgeBg}`}
                  >
                    {aggregateSeverity}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preset Sample Thermal Controls for Hackathon Judges */}
          <div className="px-4 py-2.5 bg-slate-900/95 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-2.5 z-20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                AR Sample Presets:
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* 📷 Preset: Simulate Normal Asset */}
              <button
                type="button"
                onClick={handleSimulateNormalPreset}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  simulationPreset === 'NORMAL' && (!hasCamera || isSimModeForced)
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-950/60 font-black'
                    : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-600/40'
                }`}
                title="Bypass webcam: Static mock thermal canvas showing healthy transformer (cool colors, 45°C)"
              >
                <span>📷</span>
                <span>Simulate Normal Asset (45°C)</span>
              </button>

              {/* 🔥 Preset: Simulate Critical Overload */}
              <button
                type="button"
                onClick={handleSimulateCriticalPreset}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  simulationPreset === 'CRITICAL' && (!hasCamera || isSimModeForced)
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-950/60 animate-pulse font-black'
                    : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border-rose-600/40'
                }`}
                title="Bypass webcam: Static mock thermal canvas showing critical hotspot (bright red/white, 92°C)"
              >
                <span>🔥</span>
                <span>Simulate Critical Overload (92°C)</span>
              </button>
            </div>
          </div>

          {/* AR Viewport Container */}
          <div
            className={`relative w-full h-[380px] sm:h-[460px] md:h-[500px] overflow-hidden select-none transition-colors duration-500 ${
              filterMode === 'FLIR'
                ? 'bg-[#0d0724]'
                : filterMode === 'NVG'
                ? 'bg-[#052210]'
                : 'bg-slate-950'
            }`}
          >
            {/* Live Camera Video Element - Always Mounted to Guarantee Stream Display */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                hasCamera && !isSimModeForced
                  ? 'opacity-100 z-10'
                  : 'opacity-0 -z-10 pointer-events-none'
              } ${
                filterMode === 'FLIR'
                  ? 'sepia hue-rotate-180 contrast-150 saturate-200'
                  : filterMode === 'NVG'
                  ? 'brightness-125 contrast-150 hue-rotate-90 saturate-200'
                  : ''
              }`}
            />

            {/* High-Tech FLIR Thermal Simulation Canvas - Guaranteed Visuals When Camera is Inactive */}
            {(!hasCamera || isSimModeForced) && (
              <div
                className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-all duration-500 ${
                  simulationPreset === 'CRITICAL'
                    ? 'bg-gradient-to-tr from-[#1f0208] via-[#38040d] to-[#590a18]'
                    : simulationPreset === 'NORMAL'
                    ? 'bg-gradient-to-tr from-[#02130e] via-[#05221a] to-[#0a382a]'
                    : filterMode === 'FLIR'
                    ? 'bg-gradient-to-tr from-[#0a0418] via-[#1a0b38] to-[#2c0b38]'
                    : filterMode === 'NVG'
                    ? 'bg-gradient-to-tr from-[#021808] via-[#04280f] to-[#063b15]'
                    : 'bg-gradient-to-tr from-slate-950 via-slate-900 to-black'
                }`}
              >
                {/* Critical Hotspot Detected Overlay Warning Banner with Dismiss ✕ */}
                {simulationPreset === 'CRITICAL' && !isHotspotDismissed && (
                  <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-rose-600/95 border-2 border-white text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-2xl shadow-rose-950 ring-4 ring-rose-500/60 animate-bounce z-30 flex items-center gap-2 max-w-[90%] sm:max-w-none">
                    <span className="text-base sm:text-lg select-none shrink-0">🔥</span>
                    <span className="truncate">CRITICAL HOTSPOT DETECTED (92°C)</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsHotspotDismissed(true);
                        showToast('Dismissed critical hotspot alert banner.');
                      }}
                      className="p-1 -mr-1 rounded-lg hover:bg-white/20 text-white transition-all cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center shrink-0 ml-1 border border-white/30"
                      title="Close alert banner"
                      aria-label="Close critical hotspot alert"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                )}

                {/* Thermal Radiometric Temperature Gradient Legend on Right Margin */}
                <div className="absolute right-3 top-16 bottom-16 w-5 sm:w-6 rounded-md bg-gradient-to-b from-white via-yellow-400 via-rose-500 via-purple-700 to-blue-950 border border-white/20 flex flex-col justify-between py-1 px-0.5 text-[8px] font-mono text-white text-center shadow-lg pointer-events-none z-20">
                  <span className="font-black text-black">95°</span>
                  <span className="font-bold text-amber-950">75°</span>
                  <span className="font-bold">60°</span>
                  <span className="font-bold">45°</span>
                  <span className="font-bold">30°</span>
                  <span className="font-bold text-cyan-300">15°</span>
                </div>

                {/* Simulated Substation Wireframe Background with Thermal Heat Rings */}
                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-cyan-500/20 flex items-center justify-center animate-spin-slow">
                  <div
                    className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border flex items-center justify-center ${
                      simulationPreset === 'CRITICAL'
                        ? 'border-rose-400/70'
                        : simulationPreset === 'NORMAL'
                        ? 'border-emerald-400/70'
                        : filterMode === 'FLIR'
                        ? 'border-rose-500/40'
                        : filterMode === 'NVG'
                        ? 'border-emerald-500/40'
                        : 'border-cyan-500/30'
                    }`}
                  >
                    <div
                      className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full animate-ping ${
                        simulationPreset === 'CRITICAL'
                          ? 'bg-rose-600/30 border border-rose-400'
                          : simulationPreset === 'NORMAL'
                          ? 'bg-emerald-600/25 border border-emerald-400'
                          : filterMode === 'FLIR'
                          ? 'bg-rose-600/15 border border-rose-500/60'
                          : filterMode === 'NVG'
                          ? 'bg-emerald-600/15 border border-emerald-500/60'
                          : 'bg-cyan-600/15 border border-cyan-500/60'
                      }`}
                    />
                  </div>
                </div>

                {/* Glowing Transformer Core Silhouette in FLIR Spectrum */}
                {simulationPreset === 'CRITICAL' ? (
                  <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full blur-3xl bg-gradient-to-tr from-rose-600 via-red-500 to-white/90 animate-pulse pointer-events-none" />
                ) : simulationPreset === 'NORMAL' ? (
                  <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full blur-3xl bg-gradient-to-tr from-emerald-600/40 via-cyan-500/40 to-blue-600/30 animate-pulse pointer-events-none" />
                ) : (
                  filterMode === 'FLIR' && (
                    <div
                      className={`absolute w-44 h-44 sm:w-56 sm:h-56 rounded-3xl blur-2xl animate-pulse pointer-events-none transition-colors duration-700 ${
                        getFieldAggregateSeverity(selectedFieldId) === 'CRITICAL'
                          ? 'bg-gradient-to-tr from-rose-600/50 via-amber-500/50 to-yellow-300/40'
                          : getFieldAggregateSeverity(selectedFieldId) === 'WARNING'
                          ? 'bg-gradient-to-tr from-amber-600/40 via-yellow-500/40 to-emerald-400/30'
                          : 'bg-gradient-to-tr from-emerald-600/40 via-cyan-500/40 to-blue-400/30'
                      }`}
                    />
                  )
                )}

                {/* Simulated FLIR Radiometry Calibration Watermark */}
                {simulationPreset === 'CRITICAL' ? (
                  <div className="absolute bottom-12 left-4 text-[9px] font-mono font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/60 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    <span>CRITICAL OVERLOAD MOCK: 92.0°C &bull; CORE HOTSPOT BREACH</span>
                  </div>
                ) : simulationPreset === 'NORMAL' ? (
                  <div className="absolute bottom-12 left-4 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/60 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>NORMAL ASSET MOCK: 45.0°C &bull; HEALTHY NOMINAL ENVELOPE</span>
                  </div>
                ) : (
                  <div className="absolute bottom-12 left-4 text-[9px] font-mono font-bold text-amber-300/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>FLIR RADIOMETRY: EMISSIVITY 0.95 &bull; IR OPTIC 24°</span>
                  </div>
                )}
              </div>
            )}

            {/* Tactical HUD Overlay Elements (Grid, Coordinates, Reticles) */}
            <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between z-20">
              {/* Top HUD Status Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="bg-slate-950/90 px-2.5 py-1 rounded-lg border border-cyan-500/40 text-[10px] text-cyan-300 font-mono flex items-center gap-2 backdrop-blur-md shadow-md pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span>TARGET: {currentField.code}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-white font-bold">{currentField.confidence} MATCH</span>
                </div>

                <div className="flex items-center gap-1.5 pointer-events-auto">
                  {Object.values(dismissedDefectPins).some(Boolean) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDismissedDefectPins({});
                        showToast('Restored all AR telemetry pin messages.');
                      }}
                      className="bg-cyan-950/90 hover:bg-cyan-900 px-2 py-1 rounded-lg border border-cyan-400 text-[10px] text-cyan-300 font-mono flex items-center gap-1 backdrop-blur-md shadow-md cursor-pointer transition-all active:scale-95"
                      title="Restore closed pin messages"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>Restore Pins ({Object.values(dismissedDefectPins).filter(Boolean).length})</span>
                    </button>
                  )}
                  <div className="bg-slate-950/90 px-2 py-1 rounded-lg border border-cyan-500/40 text-[10px] text-amber-300 font-mono backdrop-blur-md">
                    <span>MODE: {filterMode}</span>
                  </div>
                  <div className="bg-slate-950/90 px-2 py-1 rounded-lg border border-cyan-500/40 text-[10px] text-emerald-400 font-mono backdrop-blur-md">
                    <span>FLIR: {currentField.flirTemp}</span>
                  </div>
                </div>
              </div>

              {/* Central Optical Targeting Reticle */}
              <div className="relative w-full flex-1 flex items-center justify-center">
                <div
                  className={`relative w-40 h-40 sm:w-52 sm:h-52 border-2 rounded-full flex items-center justify-center transition-all duration-300 ${
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
                    className={`w-16 h-16 sm:w-20 sm:h-20 border rounded-xl animate-pulse flex flex-col items-center justify-center p-1 text-center ${
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
                    <span className="text-[8px] font-mono text-cyan-300 uppercase truncate max-w-[55px]">
                      {currentField.code}
                    </span>
                  </div>

                  {/* 4 Corner brackets */}
                  <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400" />
                </div>

                {/* Laser Scanning Line Animation */}
                {isScanning && (
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 animate-scan pointer-events-none" />
                )}
              </div>

              {/* Compact Bottom HUD Status Strip */}
              <div className="flex items-center justify-between gap-2">
                <div className="bg-slate-950/90 px-3 py-1.5 rounded-xl border border-cyan-500/40 text-[10px] text-cyan-300 font-mono flex items-center gap-2 backdrop-blur-md shadow-md pointer-events-auto truncate">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                  <span className="font-bold text-white">{currentField.name}</span>
                  <span className="text-slate-400 hidden sm:inline">&bull;</span>
                  <span className="text-slate-300 hidden sm:inline">{currentField.location}</span>
                </div>

                <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-xl border border-cyan-500/40 text-[10px] text-cyan-400 font-bold font-mono flex items-center gap-1.5 backdrop-blur-md shadow-md pointer-events-auto shrink-0">
                  <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>TECH: SAMM</span>
                </div>
              </div>
            </div>

            {/* Floating AR Inspection Defect Pins (Interactive & Clickable with Close Button ✕) */}
            {scanResults && (
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center animate-fadeIn">
                {currentField.defects
                  .filter((defect) => !dismissedDefectPins[defect.id])
                  .map((defect) => {
                    const state = getDefectEffectiveState(defect);
                    const config = SEVERITY_CONFIG[state.severity] || SEVERITY_CONFIG.NOMINAL;
                    const isRemediated = state.isRemediated;
                    const isActive = activeDefectId === defect.id;

                    return (
                      <div
                        key={defect.id}
                        onClick={() => {
                          setActiveDefectId(defect.id);
                          if (mobileSubTab === 'VIEWPORT') {
                            showToast(`Selected: ${defect.name} (${state.reading})`);
                          }
                        }}
                        className={`absolute ${defect.pinPosition} pointer-events-auto cursor-pointer p-2.5 sm:p-3 rounded-2xl border-2 ${
                          isActive ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105' : config.border
                        } ${config.pinBg} text-white shadow-2xl ${
                          config.glow
                        } backdrop-blur-md w-[220px] sm:w-[260px] max-w-[calc(100vw-3rem)] transition-all duration-300 hover:scale-105 active:scale-95 group select-none`}
                      >
                        <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-white/10">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold min-w-0">
                            {renderDefectIcon(defect.iconType, `w-3.5 h-3.5 ${config.text} shrink-0`)}
                            <span className="truncate">{defect.metricName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-black border uppercase tracking-wider shrink-0 ${config.badgeBg}`}
                            >
                              {state.severity}
                            </span>
                            {/* Close/Dismiss Pin Message (✕) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedDefectPins((prev) => ({ ...prev, [defect.id]: true }));
                                showToast(`Closed ${defect.metricName} pin message.`);
                              }}
                              className="p-1 -mr-1 -my-1 rounded-md text-slate-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center shrink-0"
                              title="Close this message"
                              aria-label={`Close ${defect.metricName} pin message`}
                            >
                              <X className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Telemetry Reading Metric & Limit */}
                        <div className="flex items-baseline justify-between pt-1 font-mono">
                          <span className="text-sm font-black text-white tracking-wide">{state.reading}</span>
                          <span className="text-[9px] text-slate-400">Limit: {defect.normalReading}</span>
                        </div>

                        <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {defect.summary}
                        </p>

                        <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] font-mono">
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            {isRemediated ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Remediated</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                                <span>Inspect Defect</span>
                              </>
                            )}
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Bottom AR Diagnostics & Control Tray */}
          <div className="px-4 py-3 bg-slate-900/95 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 z-20">
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300 font-bold">5G TELEMETRY: SECURE</span>
              </div>
              <div className="text-slate-400 hidden sm:block">
                LATENCY: <span className="text-cyan-400 font-bold">14ms</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {Object.values(dismissedDefectPins).some(Boolean) && (
                <button
                  type="button"
                  onClick={() => {
                    setDismissedDefectPins({});
                    showToast('Restored all floating AR pin messages.');
                  }}
                  className="min-h-[42px] px-3 py-2 rounded-xl font-bold text-xs tracking-wider uppercase text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Restore closed pin messages"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Restore Pins ({Object.values(dismissedDefectPins).filter(Boolean).length})</span>
                </button>
              )}

              {Object.keys(remediatedDefects).length > 0 && (
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="min-h-[42px] px-3 py-2 rounded-xl font-bold text-xs tracking-wider uppercase text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset State</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-xl shadow-cyan-950/60 transition-all select-none cursor-pointer border-none"
              >
                <Scan className="w-4 h-4" />
                <span>{isScanning ? 'Scanning...' : 'Rescan Telemetry'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: Diagnostics & Remediation Console ================= */}
        <div
          className={`xl:col-span-5 2xl:col-span-4 bg-slate-950 border-2 border-cyan-500/70 rounded-3xl shadow-2xl shadow-cyan-950/90 overflow-hidden flex flex-col ${
            mobileSubTab === 'VIEWPORT' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          {/* Remediation Console Header */}
          <div className="px-5 py-3.5 bg-slate-900/95 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white font-mono uppercase tracking-wide">
                  Diagnostic Action Console
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Target: {currentField.code} &bull; {currentField.name}
                </p>
              </div>
            </div>

            {/* Target Aggregate Severity Badge */}
            {(() => {
              const aggSeverity = getFieldAggregateSeverity(selectedFieldId);
              const conf = SEVERITY_CONFIG[aggSeverity] || SEVERITY_CONFIG.NOMINAL;
              return (
                <span
                  className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-wider ${conf.badgeBg}`}
                >
                  [{aggSeverity}]
                </span>
              );
            })()}
          </div>

          <div className="p-4 sm:p-5 space-y-4 flex-1">
            {/* Defect Tabs inside Selected Field */}
            {currentField.defects.length > 1 && (
              <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-white/10 overflow-x-auto scrollbar-none">
                {currentField.defects.map((def) => {
                  const dState = getDefectEffectiveState(def);
                  const isCur = activeDefectId === def.id;
                  const cfg = SEVERITY_CONFIG[dState.severity] || SEVERITY_CONFIG.NOMINAL;

                  return (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => setActiveDefectId(def.id)}
                      className={`min-h-[38px] flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                        isCur
                          ? 'bg-slate-800 text-white border border-cyan-400 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {renderDefectIcon(def.iconType, 'w-3.5 h-3.5')}
                      <span className="truncate max-w-[120px]">{def.metricName}</span>
                      <span className={`text-[8px] px-1 py-0.2 rounded border ${cfg.badgeBg}`}>
                        {dState.severity}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Defect Metric Card with Dismiss Cross (✕) */}
            {activeDefect ? (
              <div className="space-y-4 animate-fadeIn">
                {(() => {
                  const st = getDefectEffectiveState(activeDefect);
                  const cfg = SEVERITY_CONFIG[st.severity] || SEVERITY_CONFIG.NOMINAL;

                  return (
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2.5 font-mono shadow-inner relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                            {renderDefectIcon(activeDefect.iconType, 'w-4 h-4')}
                          </div>
                          <span className="text-xs font-black text-white truncate">{activeDefect.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${cfg.badgeBg}`}
                          >
                            [{st.severity}]
                          </span>
                          {/* Close/Dismiss Cross (✕) on Defect Diagnosis */}
                          <button
                            type="button"
                            onClick={() => setActiveDefectId(null)}
                            className="min-h-[32px] min-w-[32px] p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                            aria-label="Close defect diagnosis"
                            title="Close defect card"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                        <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
                          <span className="text-[10px] text-slate-400 block">{activeDefect.metricName}</span>
                          <span className="text-base font-bold text-white tracking-wide">{st.reading}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Nominal Limit</span>
                          <span className="text-base font-bold text-emerald-400 tracking-wide">
                            {activeDefect.normalReading}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Diagnostic Findings Card */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>IEC 60076-7 Diagnostic Summary</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {activeDefect.summary}
                  </p>
                  <div className="text-[10px] text-slate-400 space-y-1 pt-1.5 border-t border-white/5">
                    <div>
                      <span className="text-amber-400 font-bold font-mono">Root Cause: </span>
                      <span className="text-slate-300">{activeDefect.rootCause}</span>
                    </div>
                    <div>
                      <span className="text-rose-400 font-bold font-mono">Impact: </span>
                      <span className="text-slate-300">{activeDefect.impact}</span>
                    </div>
                  </div>
                </div>

                {/* Remediation Action Controls */}
                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Remediation Protocols</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {activeDefect.remediations.length} Available Action(s)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeDefect.remediations.map((remediation) => {
                      const isExecuting = actionInProgress === remediation.id;
                      const isAlreadyRemediated =
                        remediatedDefects[activeDefect.id]?.actionTitle === remediation.actionTitle;

                      return (
                        <div
                          key={remediation.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            isAlreadyRemediated
                              ? 'bg-emerald-950/30 border-emerald-500/50'
                              : 'bg-slate-900 hover:bg-slate-850 border-white/10'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5 shrink-0">
                              {renderDefectIcon(remediation.iconType, 'w-4 h-4')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-white font-mono break-words">
                                {remediation.actionTitle}
                              </h5>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed break-words">
                                {remediation.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                            <span className="text-[9px] font-mono text-cyan-300 truncate">
                              Target State: [{remediation.resultSeverity}]
                            </span>
                            <button
                              type="button"
                              disabled={isExecuting || isAlreadyRemediated}
                              onClick={() => handleApplyRemediation(activeDefect, remediation)}
                              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                isAlreadyRemediated
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                  : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-md shadow-cyan-950/50'
                              }`}
                            >
                              {isExecuting ? (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Executing...</span>
                                </>
                              ) : isAlreadyRemediated ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Applied</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5" />
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
            ) : (
              /* Helpful Guide Placeholder when defect card is dismissed */
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 text-center space-y-3 font-mono">
                <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase">No Defect Card Selected</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tap any defect pin on the AR Lens or select a component below to review diagnostics.
                  </p>
                </div>
                {currentField.defects.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2 justify-center">
                    {currentField.defects.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setActiveDefectId(d.id)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Inspect {d.metricName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Remediation Console Footer Bar */}
          <div className="px-5 py-3 bg-slate-900/95 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Closed-Loop SCADA Sync</span>
            </span>
            <span className="text-cyan-400 font-bold">ALPHA-1 SUBSTATION</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-6xl my-auto">{content}</div>
    </div>
  );
}

FieldTechAR.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  embedded: PropTypes.bool,
};
