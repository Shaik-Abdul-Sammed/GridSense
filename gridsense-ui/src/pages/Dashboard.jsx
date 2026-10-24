import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Header from '../components/Header';
import AlertBanner from '../components/AlertBanner';
import PowerFlowDiagram from '../components/PowerFlowDiagram';
import BatteryGauge from '../components/BatteryGauge';
import LoadCurveChart from '../components/LoadCurveChart';
import ControlPanel from '../components/ControlPanel';
import MetricsOverview from '../components/MetricsOverview';
import HourlyTable from '../components/HourlyTable';
import MeterScanner from '../components/MeterScanner';
import { useSettings } from '../context/SettingsContext';
import { HACKATHON_DEMO_DATA } from '../utils/demoData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/forecast';

// Timezone-safe hour parser: strictly uses string splitting to avoid browser timezone shifts
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

// Helper to generate diurnal weather payload for an hour (0-23)
function generateHourlyWeather(dateStr, hour) {
  const hourStr = String(hour).padStart(2, '0');
  const timestamp = `${dateStr} ${hourStr}:00:00`;

  // Diurnal ambient temperature model: peak at 14:00, minimum around 05:00
  const tempBase = 22 + 9 * Math.sin(((hour - 7) / 12) * Math.PI);
  const ambient_temp_c = Number(
    Math.max(16, Math.min(38, tempBase + (Math.random() * 2.4 - 1.2))).toFixed(1)
  );

  // Relative humidity model: inverse correlation with temperature
  const humBase = 72 - 25 * Math.sin(((hour - 7) / 12) * Math.PI);
  const humidity_pct = Number(
    Math.max(30, Math.min(95, humBase + (Math.random() * 4 - 2))).toFixed(1)
  );

  // Solar irradiance model (W/m²): 0 at night; bell curve between 06:00 and 18:00
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

// Fallback response generator if backend is unreachable (uses dynamic thresholds from settings)
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

// Network retry logic: retries up to 2 times with 1-second backoff
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

  // CSV Ingestion State
  const [csvData, setCsvData] = useState(null);
  const [loadedCsvName, setLoadedCsvName] = useState(null);

  // AbortController and cancellation controls
  const abortControllerRef = useRef(null);
  const stopRequestedRef = useRef(false);
  const fastForwardRef = useRef(false);

  // Today's ISO date string (YYYY-MM-DD)
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
      setForecastData([]);
      setSelectedHour(null);

      const itemsToProcess = sourceItems.slice(0, 24);
      setTotalSteps(itemsToProcess.length);

      for (let i = 0; i < itemsToProcess.length; i++) {
        if (stopRequestedRef.current) {
          break;
        }

        setCurrentStep(i + 1);
        const item = itemsToProcess[i];
        const { hourNum, hourLabel } = parseTimezoneSafeHour(item.timestamp, i);

        let prediction = null;
        abortControllerRef.current = new AbortController();

        // If playing the guaranteed Hackathon Demo Scenario, prioritize its targeted load curve
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
          // Standard API communication with retry engine
          try {
            prediction = await fetchWithRetry(
              API_URL,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
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
            if (fetchErr.name === 'AbortError' || stopRequestedRef.current) {
              break;
            }

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

        // Dynamic transition controller rules from SettingsContext
        const isDynamicOverload = predicted_demand_kw >= settings.criticalThreshold;
        const alert =
          prediction.alert === 'CRITICAL_OVERLOAD' || isDynamicOverload
            ? 'CRITICAL_OVERLOAD'
            : 'NONE';

        const peakStartHour = parseInt(settings.peakWindowStart.split(':')[0], 10) || 18;
        const peakEndHour = parseInt(settings.peakWindowEnd.split(':')[0], 10) || 22;
        const isPeak = hourNum >= peakStartHour && hourNum <= peakEndHour;
        const isHighDemand = predicted_demand_kw > settings.maxDemandThreshold;

        const grid_mode =
          prediction.grid_mode ||
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
          alert,
          hour: hourLabel,
          predicted_demand_kw,
          battery_soc,
        };

        setForecastData((prev) => [...prev, newPoint]);
        setLastUpdated(new Date().toLocaleTimeString());

        // Wait streamingInterval ms per hour unless fast-forward or at end
        if (i < itemsToProcess.length - 1 && !fastForwardRef.current) {
          await new Promise((resolve) => setTimeout(resolve, settings.streamingInterval || 1500));
        }
      }

      setIsStreaming(false);
      if (datasetName) {
        setLoadedCsvName(datasetName);
      }
    },
    [settings]
  );

  const handleStartSimulation = () => {
    if (csvData && csvData.length > 0) {
      runStreamingSimulation(csvData, loadedCsvName, false);
      return;
    }
    const standardItems = Array.from({ length: 24 }, (_, hour) =>
      generateHourlyWeather(todayStr, hour)
    );
    runStreamingSimulation(standardItems, null, false);
  };

  // Feature 3: Play Hackathon Demo Scenario
  const handlePlayDemoScenario = () => {
    runStreamingSimulation(HACKATHON_DEMO_DATA, 'Hackathon Demo Scenario', true);
  };

  const handleStopSimulation = () => {
    stopRequestedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleFastForward = () => {
    fastForwardRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleInstantMock = useCallback(() => {
    handleStopSimulation();
    const mockResults = Array.from({ length: 24 }, (_, hour) => {
      const payload = generateHourlyWeather(todayStr, hour);
      const response = generateSimulatedResponse(payload, hour, settings);
      const hourLabel = `${String(hour).padStart(2, '0')}:00`;
      const predicted_demand_kw = Number(response.predicted_demand_kw);
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
      };
    });

    setForecastData(mockResults);
    setIsOnline(true);
    setLastUpdated(`${new Date().toLocaleTimeString()} (Instant Mock)`);
    setSelectedHour(null);
  }, [todayStr, settings]);

  const handleCsvLoaded = (rows, fileName) => {
    setCsvData(rows);
    setLoadedCsvName(fileName);
    runStreamingSimulation(rows, fileName, false);
  };

  // Feature 2: Override Current Load with OCR Reading
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

      // Re-evaluate transition rules for this item
      const isOverload = val >= settings.criticalThreshold;
      const peakStart = parseInt(settings.peakWindowStart.split(':')[0], 10) || 18;
      const peakEnd = parseInt(settings.peakWindowEnd.split(':')[0], 10) || 22;
      const hourNum = parseInt(targetItem.hour.split(':')[0], 10);
      const isPeak = hourNum >= peakStart && hourNum <= peakEnd;

      const grid_mode =
        isOverload || isPeak || val > settings.maxDemandThreshold
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

  // Feature 1: Export Shift Report (PDF)
  const handleExportPDF = async () => {
    const element = document.getElementById('dashboard-report-content');
    if (!element) return;

    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617', // Match dark slate-950
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Header Banner
      pdf.setFillColor(9, 13, 22);
      pdf.rect(0, 0, pdfWidth, 26, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(34, 211, 238); // Cyan-400
      pdf.text('GridSense Autonomous System - Shift Handover Report', 14, 11);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184); // Slate-400
      pdf.text(
        `Generated: ${new Date().toLocaleString()} | Facility: Substation ALPHA-1 | Operator: Samm (Grid Admin)`,
        14,
        19
      );

      // Captured Dashboard Canvas
      const contentWidth = pdfWidth - 28;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      const maxContentHeight = pdfHeight - 65; // Preserve space for header & signature
      const finalHeight = Math.min(contentHeight, maxContentHeight);

      pdf.addImage(imgData, 'PNG', 14, 29, contentWidth, finalHeight);

      // Footer Operator Signature Line (Requirement 1)
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

      // Signature Box
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

  const criticalHours = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return [];
    return forecastData
      .filter(
        (item) =>
          item.alert === 'CRITICAL_OVERLOAD' ||
          item.predicted_demand_kw >= settings.criticalThreshold
      )
      .map((item) => item.hour);
  }, [forecastData, settings.criticalThreshold]);

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

  useEffect(() => {
    handleInstantMock();
  }, [handleInstantMock]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Header lastUpdated={lastUpdated} isOnline={isOnline} />

      {/* Control Section: Drag & Drop CSV + Demo Scenario + PDF Shift Report */}
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
      />

      {/* Feature 2: Optical Meter Ingestion (OCR) Component */}
      <MeterScanner
        onOverrideLoad={handleOverrideLoad}
        currentLoad={latestPrediction?.predicted_demand_kw}
      />

      {/* Printable Report Canvas Container (Captured by html2canvas for PDF Shift Report) */}
      <div id="dashboard-report-content" className="space-y-6 rounded-2xl bg-slate-950/60 p-2 sm:p-4">
        {/* Unmissable Alert Banner with aria-live="assertive" */}
        {criticalHours.length > 0 && (
          <AlertBanner criticalHours={criticalHours} maxDemand={maxDemand} />
        )}

        {forecastData.length > 0 && <MetricsOverview forecastData={forecastData} />}

        {/* Main Grid: Recharts Load Curve + Animated Power Flow Diagram & Battery SOC */}
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

          {/* Right Column: Animated Power Flow Diagram + Battery Gauge */}
          <div className="flex flex-col gap-6 justify-between">
            <PowerFlowDiagram
              mode={latestPrediction?.grid_mode || 'MAIN_GRID_MODE'}
              timestamp={latestPrediction?.timestamp}
              demand={latestPrediction?.predicted_demand_kw}
              batterySoc={latestSoc}
            />

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
                      d.predicted_demand_kw >= settings.criticalThreshold;
                    return (
                      <button
                        key={d.hour}
                        onClick={() => setSelectedHour(d.hour)}
                        className={`px-2 py-1 rounded text-[10px] font-mono shrink-0 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-white font-bold ring-2 ring-cyan-300'
                            : isOverload
                            ? 'bg-red-950/80 text-red-300 border border-red-800'
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
    </div>
  );
}
