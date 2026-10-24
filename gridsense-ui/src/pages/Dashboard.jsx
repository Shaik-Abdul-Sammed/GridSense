import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Mic,
  MicOff,
  BellRing,
  X,
  Radio,
  ShieldAlert,
  Gamepad2,
  Box,
  Layers,
} from 'lucide-react';
import Header from '../components/Header';
import AlertBanner from '../components/AlertBanner';
import PowerFlowDiagram from '../components/PowerFlowDiagram';
import Substation3D from '../components/Substation3D';
import GridDefenderModal from '../components/GridDefenderModal';
import BatteryGauge from '../components/BatteryGauge';
import LoadCurveChart from '../components/LoadCurveChart';
import ControlPanel from '../components/ControlPanel';
import MetricsOverview from '../components/MetricsOverview';
import HourlyTable from '../components/HourlyTable';
import MeterScanner from '../components/MeterScanner';
import WeatherSync from '../components/WeatherSync';
import { useSettings } from '../context/SettingsContext';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { HACKATHON_DEMO_DATA } from '../utils/demoData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/forecast';

// Timezone-safe hour parser
function parseTimezoneSafeHour(timestampStr, fallbackHour = 0) {
  if (!timestampStr || typeof timestampStr !== 'string') {
    const pad = String(fallbackHour).padStart(2, '0');
    return { hourNum: fallbackHour, hourLabel: `${pad}:00` };
  }

  const parts = timestampStr.trim().split(/[\sT]+/);
  if (parts.length > 1) {
    const timeTokens = parts[1].split(':');
    const parsedH = parseInt(timeTokens[0], 10);
    if (!isNaN(parsedH) && parsedH >= 0 && parsedH <= 23) {
      return {
        hourNum: parsedH,
        hourLabel: `${String(parsedH).padStart(2, '0')}:00`,
      };
    }
  }

  const pad = String(fallbackHour).padStart(2, '0');
  return { hourNum: fallbackHour, hourLabel: `${pad}:00` };
}

// Diurnal weather generator
function generateHourlyWeather(dateStr, hour) {
  const hourStr = String(hour).padStart(2, '0');
  const timestamp = `${dateStr} ${hourStr}:00:00`;

  const tempBase = 22 + 9 * Math.sin(((hour - 7) / 12) * Math.PI);
  const ambient_temp_c = Number(
    Math.max(16, Math.min(38, tempBase + (Math.random() * 2.4 - 1.2))).toFixed(1)
  );

  const humBase = 72 - 25 * Math.sin(((hour - 7) / 12) * Math.PI);
  const humidity_pct = Number(
    Math.max(30, Math.min(95, humBase + (Math.random() * 4 - 2))).toFixed(1)
  );

  let solar_irradiance_wm2 = 0;
  if (hour >= 6 && hour <= 18) {
    const solarBase = 880 * Math.sin(((hour - 6) / 12) * Math.PI);
    solar_irradiance_wm2 = Number(
      Math.max(0, solarBase + (Math.random() * 50 - 25)).toFixed(1)
    );
  }

  return {
    timestamp,
    ambient_temp_c,
    humidity_pct,
    solar_irradiance_wm2,
  };
}

// Fallback response generator
function generateSimulatedResponse(weatherPayload, hour, settings) {
  const peakStartHour = parseInt(settings.peakWindowStart.split(':')[0], 10) || 18;
  const peakEndHour = parseInt(settings.peakWindowEnd.split(':')[0], 10) || 22;

  let baseDemand = 100 + 40 * Math.sin(((hour - 6) / 12) * Math.PI);
  if (hour >= peakStartHour && hour <= peakEndHour) {
    baseDemand += 65 + (hour === 19 || hour === 20 ? 35 : 15);
  } else if (hour >= 0 && hour <= 5) {
    baseDemand = 75 + Math.random() * 20;
  }

  const noise = Math.random() * 12 - 6;
  const predicted_demand_kw = Number(Math.max(40, baseDemand + noise).toFixed(1));

  const isOverload = predicted_demand_kw >= settings.criticalThreshold;
  const alert = isOverload ? 'CRITICAL_OVERLOAD' : 'NONE';

  const isPeak = hour >= peakStartHour && hour <= peakEndHour;
  const isHighDemand = predicted_demand_kw > settings.maxDemandThreshold;
  const grid_mode =
    isOverload || isHighDemand || isPeak || weatherPayload.solar_irradiance_wm2 > 250
      ? 'RENEWABLE_STORAGE_MODE'
      : 'MAIN_GRID_MODE';

  const battery_soc = Math.max(0, 100 - (predicted_demand_kw / 3)).toFixed(1);

  return {
    timestamp: weatherPayload.timestamp,
    predicted_demand_kw,
    grid_mode,
    alert,
    battery_soc,
  };
}

// Network retry logic
async function fetchWithRetry(url, options, retries = 2, delay = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (options?.signal?.aborted || err.name === 'AbortError') {
        throw err;
      }
      if (attempt === retries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export default function Dashboard() {
  const { settings } = useSettings();

  const [forecastData, setForecastData] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(24);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Feature 2: Cyberattack / Fault Injection Simulator
  const [isCyberattack, setIsCyberattack] = useState(false);

  // Feature 5: Gamified "Grid Defender" Mini-Game Modal
  const [isDefenderOpen, setIsDefenderOpen] = useState(false);
  const [defenderDemand, setDefenderDemand] = useState(225);
  const hasTriggeredDefenderRef = useRef(false);

  // Digital Twin Display Mode Toggle ('3D' vs '2D')
  const [digitalTwinMode, setDigitalTwinMode] = useState('3D');

  // SMS/Email Alert state
  const [smsAlert, setSmsAlert] = useState(null);

  // CSV Ingestion State
  const [csvData, setCsvData] = useState(null);
  const [loadedCsvName, setLoadedCsvName] = useState(null);

  // AbortController and cancellation controls
  const abortControllerRef = useRef(null);
  const stopRequestedRef = useRef(false);
  const fastForwardRef = useRef(false);

  // Today's ISO date string
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Real-Time Streaming Simulation function
  const runStreamingSimulation = useCallback(
    async (sourceItems, datasetName = null, isDemoScenario = false) => {
      if (!sourceItems || sourceItems.length === 0) return;

      setIsStreaming(true);
      setError(null);
      stopRequestedRef.current = false;
      fastForwardRef.current = false;
      hasTriggeredDefenderRef.current = false;
      setForecastData([]);
      setSelectedHour(null);

      const itemsToProcess = sourceItems.slice(0, 24);
      setTotalSteps(itemsToProcess.length);

      let prevDemandKw = null;

      for (let i = 0; i < itemsToProcess.length; i++) {
        if (stopRequestedRef.current) break;

        setCurrentStep(i + 1);
        const item = itemsToProcess[i];
        const { hourNum, hourLabel } = parseTimezoneSafeHour(item.timestamp, i);

        let prediction = null;
        abortControllerRef.current = new AbortController();

        if (isDemoScenario && item.target_demand_kw !== undefined) {
          const targetDemand = Number(item.target_demand_kw);
          const isOverload = targetDemand >= settings.criticalThreshold;
          const peakStart = parseInt(settings.peakWindowStart.split(':')[0], 10) || 18;
          const peakEnd = parseInt(settings.peakWindowEnd.split(':')[0], 10) || 22;
          const isPeak = hourNum >= peakStart && hourNum <= peakEnd;

          prediction = {
            timestamp: item.timestamp,
            predicted_demand_kw: targetDemand,
            alert: isOverload ? 'CRITICAL_OVERLOAD' : 'NONE',
            grid_mode:
              isOverload || isPeak || targetDemand > settings.maxDemandThreshold
                ? 'RENEWABLE_STORAGE_MODE'
                : 'MAIN_GRID_MODE',
            battery_soc: Math.max(0, 100 - targetDemand / 3).toFixed(1),
          };
          setIsOnline(true);
        } else {
          try {
            prediction = await fetchWithRetry(
              API_URL,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal,
                body: JSON.stringify({
                  timestamp: item.timestamp,
                  ambient_temp_c: item.ambient_temp_c,
                  humidity_pct: item.humidity_pct,
                  solar_irradiance_wm2: item.solar_irradiance_wm2,
                }),
              },
              2,
              1000
            );
            setIsOnline(true);
          } catch (fetchErr) {
            if (fetchErr.name === 'AbortError' || stopRequestedRef.current) break;

            setIsOnline(false);
            prediction = generateSimulatedResponse(item, hourNum, settings);
            if (i === 0) {
              setError(
                `Backend at ${API_URL} unreachable after retries (${fetchErr.message}). Fallback resilience model engaged.`
              );
            }
          }
        }

        if (stopRequestedRef.current) break;

        const predicted_demand_kw = Number(prediction.predicted_demand_kw);

        // Feature 5: Gamified Grid Defender Trigger on overload during simulation
        if (
          predicted_demand_kw >= settings.criticalThreshold &&
          !hasTriggeredDefenderRef.current &&
          !isCyberattack
        ) {
          hasTriggeredDefenderRef.current = true;
          setDefenderDemand(predicted_demand_kw);
          setIsDefenderOpen(true);
          // Pause briefly to let the defender modal engage the operator
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        const isDynamicOverload = predicted_demand_kw >= settings.criticalThreshold;
        const alert =
          prediction.alert === 'CRITICAL_OVERLOAD' || isDynamicOverload
            ? 'CRITICAL_OVERLOAD'
            : 'NONE';

        if (alert === 'CRITICAL_OVERLOAD' && !isCyberattack) {
          setSmsAlert({
            hour: hourLabel,
            demand: predicted_demand_kw,
            message: `🚨 SMS Sent to Grid Operator: Demand exceeded ${settings.criticalThreshold}kW (${predicted_demand_kw.toFixed(1)} kW at ${hourLabel})! Autonomous battery storage dispatch activated.`,
          });
        }

        let isAnomaly = false;
        let anomalySurgePct = 0;
        let anomalyReason = '';
        if (prevDemandKw !== null && prevDemandKw > 0) {
          const surge = (predicted_demand_kw - prevDemandKw) / prevDemandKw;
          if (surge > 0.4) {
            isAnomaly = true;
            anomalySurgePct = Math.round(surge * 100);
            anomalyReason = `⚠️ Sudden Load Spike Anomaly (+${anomalySurgePct}% jump from ${prevDemandKw.toFixed(1)} kW)`;
          }
        }
        prevDemandKw = predicted_demand_kw;

        const peakStartHour = parseInt(settings.peakWindowStart.split(':')[0], 10) || 18;
        const peakEndHour = parseInt(settings.peakWindowEnd.split(':')[0], 10) || 22;
        const isPeak = hourNum >= peakStartHour && hourNum <= peakEndHour;
        const isHighDemand = predicted_demand_kw > settings.maxDemandThreshold;

        // Force ISLANDED_MODE if under active cyberattack
        const grid_mode = isCyberattack
          ? 'ISLANDED_MODE'
          : prediction.grid_mode ||
            (isDynamicOverload || isHighDemand || isPeak || item.solar_irradiance_wm2 > 250
              ? 'RENEWABLE_STORAGE_MODE'
              : 'MAIN_GRID_MODE');

        const battery_soc =
          prediction.battery_soc !== undefined && prediction.battery_soc !== null
            ? Number(prediction.battery_soc).toFixed(1)
            : Math.max(0, 100 - (predicted_demand_kw / 3)).toFixed(1);

        const newPoint = {
          ...item,
          ...prediction,
          grid_mode,
          alert: isCyberattack ? 'CRITICAL_OVERLOAD' : alert,
          hour: hourLabel,
          predicted_demand_kw,
          battery_soc,
          isAnomaly,
          anomalySurgePct,
          anomalyReason,
        };

        setForecastData((prev) => [...prev, newPoint]);
        setLastUpdated(new Date().toLocaleTimeString());

        if (i < itemsToProcess.length - 1 && !fastForwardRef.current) {
          await new Promise((resolve) => setTimeout(resolve, settings.streamingInterval || 1500));
        }
      }

      setIsStreaming(false);
      if (datasetName) setLoadedCsvName(datasetName);
    },
    [settings, isCyberattack]
  );

  const handleStartSimulation = useCallback(() => {
    if (csvData && csvData.length > 0) {
      runStreamingSimulation(csvData, loadedCsvName, false);
      return;
    }
    const standardItems = Array.from({ length: 24 }, (_, hour) =>
      generateHourlyWeather(todayStr, hour)
    );
    runStreamingSimulation(standardItems, null, false);
  }, [csvData, loadedCsvName, runStreamingSimulation, todayStr]);

  const handlePlayDemoScenario = useCallback(() => {
    runStreamingSimulation(HACKATHON_DEMO_DATA, 'Hackathon Demo Scenario', true);
  }, [runStreamingSimulation]);

  const handleStopSimulation = useCallback(() => {
    stopRequestedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Voice Commands Integration
  const { isListening, feedback, isSupported, toggleListening } = useVoiceCommands({
    onStartSimulation: handleStartSimulation,
    onStopSimulation: handleStopSimulation,
  });

  const handleFastForward = () => {
    fastForwardRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleInstantMock = useCallback(() => {
    handleStopSimulation();
    let prevMockDemand = null;

    const mockResults = Array.from({ length: 24 }, (_, hour) => {
      const payload = generateHourlyWeather(todayStr, hour);
      const response = generateSimulatedResponse(payload, hour, settings);
      const hourLabel = `${String(hour).padStart(2, '0')}:00`;
      const predicted_demand_kw = Number(response.predicted_demand_kw);

      let isAnomaly = false;
      let anomalySurgePct = 0;
      let anomalyReason = '';
      if (prevMockDemand !== null && prevMockDemand > 0) {
        const surge = (predicted_demand_kw - prevMockDemand) / prevMockDemand;
        if (surge > 0.4) {
          isAnomaly = true;
          anomalySurgePct = Math.round(surge * 100);
          anomalyReason = `⚠️ Sudden Load Spike Anomaly (+${anomalySurgePct}% jump from ${prevMockDemand.toFixed(1)} kW)`;
        }
      }
      prevMockDemand = predicted_demand_kw;

      const battery_soc =
        response.battery_soc !== undefined && response.battery_soc !== null
          ? Number(response.battery_soc).toFixed(1)
          : Math.max(0, 100 - (predicted_demand_kw / 3)).toFixed(1);

      return {
        ...payload,
        ...response,
        grid_mode: response.grid_mode || 'MAIN_GRID_MODE',
        hour: hourLabel,
        predicted_demand_kw,
        battery_soc,
        isAnomaly,
        anomalySurgePct,
        anomalyReason,
      };
    });

    setForecastData(mockResults);
    setIsOnline(true);
    setLastUpdated(`${new Date().toLocaleTimeString()} (Instant Mock)`);
    setSelectedHour(null);
  }, [handleStopSimulation, todayStr, settings]);

  // Feature 2: Trigger / Neutralize Cyberattack Simulator
  const handleToggleCyberattack = () => {
    setIsCyberattack((prev) => {
      const nextState = !prev;
      setForecastData((curr) =>
        curr.map((point) => ({
          ...point,
          grid_mode: nextState ? 'ISLANDED_MODE' : 'MAIN_GRID_MODE',
          alert: nextState ? 'CRITICAL_OVERLOAD' : 'NONE',
        }))
      );
      if (nextState) {
        setSmsAlert({
          hour: 'NOW',
          demand: 220,
          message:
            '🚨 SCADA BREACH: Adversary packet injection detected on Port 502 (Modbus). Main Grid disconnected. EMERGENCY ISLANDED PROTOCOL ENGAGED.',
        });
      }
      return nextState;
    });
  };

  const handleCsvLoaded = (rows, fileName) => {
    setCsvData(rows);
    setLoadedCsvName(fileName);
    runStreamingSimulation(rows, fileName, false);
  };

  const handleWeatherLoaded = (rows, label) => {
    setCsvData(rows);
    setLoadedCsvName(label);
    runStreamingSimulation(rows, label, false);
  };

  const handleOverrideLoad = (newDemandKw) => {
    if (!newDemandKw || isNaN(newDemandKw)) return;

    setForecastData((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const targetIndex = selectedHour
        ? updated.findIndex((d) => d.hour === selectedHour)
        : updated.length - 1;

      if (targetIndex === -1) return prev;
      const targetItem = updated[targetIndex];
      const val = Number(newDemandKw);

      const isOverload = val >= settings.criticalThreshold;
      const peakStart = parseInt(settings.peakWindowStart.split(':')[0], 10) || 18;
      const peakEnd = parseInt(settings.peakWindowEnd.split(':')[0], 10) || 22;
      const hourNum = parseInt(targetItem.hour.split(':')[0], 10);
      const isPeak = hourNum >= peakStart && hourNum <= peakEnd;

      const grid_mode = isCyberattack
        ? 'ISLANDED_MODE'
        : isOverload || isPeak || val > settings.maxDemandThreshold
        ? 'RENEWABLE_STORAGE_MODE'
        : 'MAIN_GRID_MODE';

      const battery_soc = Math.max(0, 100 - val / 3).toFixed(1);

      updated[targetIndex] = {
        ...targetItem,
        predicted_demand_kw: val,
        alert: isOverload ? 'CRITICAL_OVERLOAD' : 'NONE',
        grid_mode,
        battery_soc,
      };

      return updated;
    });

    setLastUpdated(`${new Date().toLocaleTimeString()} (OCR Override: ${newDemandKw} kW)`);
  };

  // Export PDF Report
  const handleExportPDF = async () => {
    const element = document.getElementById('dashboard-report-content');
    if (!element) return;

    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(9, 13, 22);
      pdf.rect(0, 0, pdfWidth, 26, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(34, 211, 238);
      pdf.text('GridSense Autonomous System - Shift Handover Report', 14, 11);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `Generated: ${new Date().toLocaleString()} | Facility: Substation ALPHA-1 | Operator: Samm (Grid Admin)`,
        14,
        19
      );

      const contentWidth = pdfWidth - 28;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      const maxContentHeight = pdfHeight - 65;
      const finalHeight = Math.min(contentHeight, maxContentHeight);

      pdf.addImage(imgData, 'PNG', 14, 29, contentWidth, finalHeight);

      const footerY = pdfHeight - 20;
      pdf.setDrawColor(51, 65, 85);
      pdf.setLineWidth(0.5);
      pdf.line(14, footerY - 5, pdfWidth - 14, footerY - 5);

      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        'CONTROLLER CERTIFICATION: Autonomous Transition Controller Telemetry Formally Verified',
        14,
        footerY
      );

      pdf.setDrawColor(34, 211, 238);
      pdf.line(pdfWidth - 85, footerY, pdfWidth - 14, footerY);
      pdf.setTextColor(226, 232, 240);
      pdf.text('Operator Signature: Samm (Shift 1 Admin)', pdfWidth - 85, footerY + 5);

      pdf.save('GridSense_Report.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export JSON Telemetry
  const handleExportJSON = () => {
    if (!forecastData || forecastData.length === 0) return;

    const payload = {
      exportMetadata: {
        system: 'GridSense Autonomous Smart Grid Command Center',
        facility: 'Substation ALPHA-1',
        operator: 'Samm (Grid Admin)',
        timestamp: new Date().toISOString(),
        totalHours: forecastData.length,
        isCyberattackActive: isCyberattack,
        settings: {
          maxDemandThresholdKw: settings.maxDemandThreshold,
          criticalThresholdKw: settings.criticalThreshold,
          peakWindow: `${settings.peakWindowStart} - ${settings.peakWindowEnd}`,
        },
      },
      esgMetrics: {
        carbonDisplacedKg: forecastData
          .reduce(
            (acc, d) =>
              d.grid_mode === 'RENEWABLE_STORAGE_MODE'
                ? acc + (Number(d.predicted_demand_kw) || 0) * 0.45
                : acc,
            0
          )
          .toFixed(2),
        renewableHours: forecastData.filter(
          (d) => d.grid_mode === 'RENEWABLE_STORAGE_MODE'
        ).length,
      },
      telemetry: forecastData,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gridsense_telemetry.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const criticalHours = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return [];
    return forecastData
      .filter(
        (item) =>
          item.alert === 'CRITICAL_OVERLOAD' ||
          item.predicted_demand_kw >= settings.criticalThreshold ||
          isCyberattack
      )
      .map((item) => item.hour);
  }, [forecastData, settings.criticalThreshold, isCyberattack]);

  const maxDemand = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return 0;
    return Math.max(...forecastData.map((d) => Number(d.predicted_demand_kw) || 0));
  }, [forecastData]);

  const latestPrediction = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return null;

    if (selectedHour) {
      const found = forecastData.find((d) => d.hour === selectedHour);
      if (found) return found;
    }

    return forecastData[forecastData.length - 1];
  }, [forecastData, selectedHour]);

  const latestSoc = useMemo(() => {
    if (!latestPrediction) return '100.0';
    if (latestPrediction.battery_soc !== undefined && latestPrediction.battery_soc !== null) {
      return Number(latestPrediction.battery_soc).toFixed(1);
    }
    if (latestPrediction.predicted_demand_kw != null) {
      return Math.max(0, 100 - (Number(latestPrediction.predicted_demand_kw) / 3)).toFixed(1);
    }
    return '100.0';
  }, [latestPrediction]);

  const effectiveGridMode = isCyberattack
    ? 'ISLANDED_MODE'
    : latestPrediction?.grid_mode || 'MAIN_GRID_MODE';

  useEffect(() => {
    handleInstantMock();
  }, [handleInstantMock]);

  return (
    <div className="space-y-6 relative">
      {/* Feature 5: Gamified Grid Defender Modal */}
      <GridDefenderModal
        isOpen={isDefenderOpen}
        onClose={() => setIsDefenderOpen(false)}
        onResumeSimulation={() => {
          setIsDefenderOpen(false);
          setIsStreaming(true);
        }}
        overloadDemand={defenderDemand}
      />

      {/* Feature 7: Mock SMS/Email Alert Toast Notification */}
      {smsAlert && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-rose-950/95 border-2 border-rose-500 text-white p-4 rounded-2xl shadow-2xl shadow-rose-950/80 backdrop-blur-xl animate-bounce-once flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 border border-rose-500/40">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                Automated SCADA Dispatch
              </span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-900/60 px-1.5 py-0.5 rounded">
                Twilio Mock
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-1 leading-snug">{smsAlert.message}</p>
          </div>
          <button
            onClick={() => setSmsAlert(null)}
            className="text-rose-400 hover:text-white p-1 rounded-lg cursor-pointer"
            aria-label="Dismiss SMS Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Feature 2: Massive Red Siren Alert for Cyberattack */}
      {isCyberattack && (
        <div className="bg-rose-950/90 border-2 border-rose-500 p-5 rounded-2xl shadow-2xl shadow-rose-950/90 animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/60 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase">
                DEFCON 1 &bull; SCADA BUS BREACH DETECTED
              </span>
              <h3 className="text-base sm:text-lg font-black text-white font-mono">
                ⚠️ ACTIVE CYBERATTACK: MAIN GRID BREACHED - ISLANDED PROTOCOL ENGAGED
              </h3>
              <p className="text-xs text-rose-200 mt-0.5">
                Regional utility feeder severed. Main grid import: 0.0 kW. BESS battery discharging at 100% capacity to power microgrid.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleCyberattack}
            className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-xl border border-emerald-400/40 cursor-pointer shrink-0"
          >
            🛡️ Neutralize &amp; Restore Grid
          </button>
        </div>
      )}

      {/* Header Section with Grid Frequency, Theme Toggle & Cyberattack button */}
      <Header
        lastUpdated={lastUpdated}
        isOnline={isOnline}
        latestDemand={Number(latestPrediction?.predicted_demand_kw) || 0}
        criticalThreshold={settings.criticalThreshold}
        gridMode={effectiveGridMode}
        batterySoc={latestSoc}
        isCyberattack={isCyberattack}
        onTriggerCyberattack={handleToggleCyberattack}
      />

      {/* Feature 1: Live Location Weather Ingestion */}
      <WeatherSync onWeatherLoaded={handleWeatherLoaded} isStreaming={isStreaming} />

      {/* Control Section: Drag & Drop CSV + Demo Scenario + PDF & JSON Exports */}
      <ControlPanel
        onStartSimulation={handleStartSimulation}
        onStopSimulation={handleStopSimulation}
        onFastForward={handleFastForward}
        isStreaming={isStreaming}
        currentStep={currentStep}
        totalSteps={totalSteps}
        apiUrl={API_URL}
        error={error}
        onClearError={() => setError(null)}
        onGenerateMock={handleInstantMock}
        onCsvLoaded={handleCsvLoaded}
        loadedCsvName={loadedCsvName}
        forecastData={forecastData}
        onPlayDemoScenario={handlePlayDemoScenario}
        onExportPDF={handleExportPDF}
        isExportingPdf={isExportingPdf}
        onExportJSON={handleExportJSON}
      />

      {/* Optical Meter Ingestion (OCR) Component */}
      <MeterScanner
        onOverrideLoad={handleOverrideLoad}
        currentLoad={latestPrediction?.predicted_demand_kw}
      />

      {/* Printable Report Canvas Container */}
      <div id="dashboard-report-content" className="space-y-6 rounded-2xl bg-slate-950/60 p-2 sm:p-4">
        {/* Unmissable Alert Banner */}
        {criticalHours.length > 0 && (
          <AlertBanner criticalHours={criticalHours} maxDemand={maxDemand} />
        )}

        {forecastData.length > 0 && <MetricsOverview forecastData={forecastData} />}

        {/* Feature 1: Digital Twin Microgrid Visualization (3D WebGL vs 2D Schematic) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Microgrid Telemetry Twin
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60">
                Spatial WebGL
              </span>
            </div>

            {/* View Switcher Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDefenderOpen(true)}
                title="Launch the Gamified Grid Defender emergency tactical mini-game"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 cursor-pointer shadow-md"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Play Grid Defender Drill</span>
              </button>

              <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setDigitalTwinMode('3D')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    digitalTwinMode === '3D'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Digital Twin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDigitalTwinMode('2D')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    digitalTwinMode === '2D'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2D Schematic</span>
                </button>
              </div>
            </div>
          </div>

          {digitalTwinMode === '3D' ? (
            <Substation3D
              gridMode={effectiveGridMode}
              batterySoc={latestSoc}
              demandKw={latestPrediction?.predicted_demand_kw || 140}
            />
          ) : (
            <PowerFlowDiagram
              mode={effectiveGridMode}
              timestamp={latestPrediction?.timestamp}
              demand={latestPrediction?.predicted_demand_kw}
              batterySoc={latestSoc}
            />
          )}
        </div>

        {/* Main Grid: Recharts Load Curve + Battery Gauge & Hourly Scrubber */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Load Curve Chart */}
          <div className="lg:col-span-2">
            <LoadCurveChart
              data={forecastData}
              isLoading={isStreaming && forecastData.length === 0}
              peakWindowStart={settings.peakWindowStart}
              peakWindowEnd={settings.peakWindowEnd}
              criticalThreshold={settings.criticalThreshold}
            />
          </div>

          {/* Right Column: Battery Gauge + Scrubber */}
          <div className="flex flex-col gap-6 justify-between">
            <BatteryGauge
              latestDemand={latestPrediction?.predicted_demand_kw}
              soc={latestSoc}
            />

            {forecastData.length > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-medium">Inspect Streamed Hour:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {latestPrediction?.hour || '--:--'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {forecastData.map((d) => {
                    const isSelected = latestPrediction?.hour === d.hour;
                    const isOverload =
                      d.alert === 'CRITICAL_OVERLOAD' ||
                      d.predicted_demand_kw >= settings.criticalThreshold ||
                      isCyberattack;
                    const isSpike = !!d.isAnomaly;

                    return (
                      <button
                        key={d.hour}
                        onClick={() => setSelectedHour(d.hour)}
                        className={`px-2 py-1 rounded text-[10px] font-mono shrink-0 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-white font-bold ring-2 ring-cyan-300'
                            : isOverload
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : isSpike
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {d.hour.slice(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <HourlyTable forecastData={forecastData} />
      </div>

      {/* Floating Voice Command Button & Feedback Bar */}
      {isSupported && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
          {feedback && (
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs text-cyan-300 shadow-2xl backdrop-blur-xl animate-fadeIn flex items-center gap-2 max-w-xs font-medium">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleListening}
            title={
              isListening
                ? 'Voice listening active. Click to mute.'
                : 'Activate voice commands (e.g. "Start forecast", "Show analytics")'
            }
            className={`p-3.5 rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white ring-4 ring-rose-500/50 animate-pulse shadow-rose-950/80'
                : 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-cyan-950/80 border border-cyan-400/40'
            }`}
          >
            {isListening ? (
              <Mic className="w-6 h-6 animate-bounce" />
            ) : (
              <MicOff className="w-6 h-6 text-cyan-200" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
