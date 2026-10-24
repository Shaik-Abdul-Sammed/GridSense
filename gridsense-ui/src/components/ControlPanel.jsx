import { useState, useRef } from 'react';
import Papa from 'papaparse';

export default function ControlPanel({
  onStartSimulation,
  onStopSimulation,
  onFastForward,
  isStreaming,
  currentStep,
  totalSteps,
  apiUrl,
  error,
  onClearError,
  onGenerateMock,
  onCsvLoaded,
  loadedCsvName,
  forecastData = [],
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const [csvWarning, setCsvWarning] = useState(null);
  const fileInputRef = useRef(null);

  // Bulletproof CSV Validation & Clamping with PapaParse
  const processCsvFile = (file) => {
    if (!file) return;
    setCsvError(null);
    setCsvWarning(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setCsvError('Uploaded CSV is empty or unreadable.');
          return;
        }

        // Validate required headers
        const sampleRow = results.data[0];
        const lowerKeys = Object.keys(sampleRow).map((k) => k.trim().toLowerCase());
        const required = ['timestamp', 'ambient_temp_c', 'humidity_pct', 'solar_irradiance_wm2'];
        const missing = required.filter((col) => !lowerKeys.includes(col));

        if (missing.length > 0) {
          setCsvError(
            `CSV validation failed: Missing required column(s): ${missing.join(
              ', '
            )}. Expected headers: timestamp, ambient_temp_c, humidity_pct, solar_irradiance_wm2.`
          );
          return;
        }

        // Helper to find key case-insensitively
        const findKey = (row, keyName) => {
          const match = Object.keys(row).find((k) => k.trim().toLowerCase() === keyName);
          return match ? row[match] : undefined;
        };

        let clampedCount = 0;
        const normalized = [];

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];
          const rawTimestamp = findKey(row, 'timestamp');
          if (!rawTimestamp) continue;

          let temp = Number(findKey(row, 'ambient_temp_c') ?? 25.0);
          let humidity = Number(findKey(row, 'humidity_pct') ?? 60.0);
          let solar = Number(findKey(row, 'solar_irradiance_wm2') ?? 0.0);

          // Clamping checks: solar irradiance >= 0, temperature <= 60°C
          if (solar < 0) {
            solar = 0.0;
            clampedCount++;
          }
          if (temp > 60) {
            temp = 60.0;
            clampedCount++;
          } else if (temp < -40) {
            temp = -40.0;
            clampedCount++;
          }
          if (humidity < 0) {
            humidity = 0.0;
            clampedCount++;
          } else if (humidity > 100) {
            humidity = 100.0;
            clampedCount++;
          }

          normalized.push({
            timestamp: String(rawTimestamp).trim(),
            ambient_temp_c: Number(temp.toFixed(1)),
            humidity_pct: Number(humidity.toFixed(1)),
            solar_irradiance_wm2: Number(solar.toFixed(1)),
          });
        }

        if (normalized.length === 0) {
          setCsvError('No valid rows containing timestamps were parsed from the CSV.');
          return;
        }

        if (clampedCount > 0) {
          setCsvWarning(
            `Data sanitized: ${clampedCount} value(s) clamped to realistic ranges (solar irradiance ≥ 0 W/m², ambient temperature ≤ 60°C).`
          );
        }

        onCsvLoaded(normalized, file.name);
      },
      error: (err) => {
        setCsvError(`Failed to parse CSV file: ${err.message}`);
      },
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processCsvFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processCsvFile(files[0]);
    }
  };

  // Quick 1-click loader for bundled sample_test_input.csv
  const loadDefaultSampleCsv = async () => {
    try {
      setCsvError(null);
      setCsvWarning(null);
      const res = await fetch('/sample_test_input.csv');
      if (!res.ok) throw new Error('Could not fetch sample_test_input.csv');
      const text = await res.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const normalized = results.data
            .filter((row) => row.timestamp)
            .map((row) => ({
              timestamp: String(row.timestamp).trim(),
              ambient_temp_c: Number(row.ambient_temp_c ?? 25.0),
              humidity_pct: Number(row.humidity_pct ?? 60.0),
              solar_irradiance_wm2: Math.max(0, Number(row.solar_irradiance_wm2 ?? 0.0)),
            }));
          onCsvLoaded(normalized, 'sample_test_input.csv');
        },
      });
    } catch (err) {
      setCsvError(err.message);
    }
  };

  // Export Results to CSV via Papa.unparse()
  const handleExportResults = () => {
    if (!forecastData || forecastData.length === 0) return;

    const exportRows = forecastData.map((d) => ({
      timestamp: d.timestamp,
      hour: d.hour,
      predicted_demand_kw: d.predicted_demand_kw,
      grid_mode: d.grid_mode || 'MAIN_GRID_MODE',
      alert: d.alert || 'NONE',
      battery_soc: d.battery_soc ?? '100.0',
      ambient_temp_c: d.ambient_temp_c ?? '',
      humidity_pct: d.humidity_pct ?? '',
      solar_irradiance_wm2: d.solar_irradiance_wm2 ?? '',
    }));

    const csvContent = Papa.unparse(exportRows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', 'gridsense_forecast_results.csv');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 md:p-6 flex flex-col gap-5 transition-all">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Smart Dispatch Controller</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              1.5s Stream Interval
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry simulation, robust CSV validation & automated retry resilience.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Main Simulation / Stop Button */}
          <button
            onClick={isStreaming ? onStopSimulation : onStartSimulation}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-xl cursor-pointer select-none ${
              isStreaming
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-rose-900/40'
                : 'bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 shadow-cyan-500/25 active:scale-[0.98]'
            }`}
          >
            {isStreaming ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Simulating Hour {currentStep} of {totalSteps}... (Stop)</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 text-cyan-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{loadedCsvName ? `Stream ${loadedCsvName}` : 'Generate 24-Hour Forecast'}</span>
              </>
            )}
          </button>

          {/* Fast-forward button during active stream */}
          {isStreaming && (
            <button
              onClick={onFastForward}
              title="Abort current delay and fast-forward through remaining hours"
              className="px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer select-none flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span>Fast-Forward</span>
            </button>
          )}

          {/* Export Results to CSV Button (Requirement 5) */}
          {forecastData && forecastData.length > 0 && !isStreaming && (
            <button
              onClick={handleExportResults}
              title="Export complete forecast telemetry to gridsense_forecast_results.csv"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-600/60 transition-colors cursor-pointer select-none shadow-lg shadow-emerald-950/50"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Export CSV</span>
            </button>
          )}

          {/* Demo Mock Data Button */}
          {!isStreaming && (
            <button
              onClick={onGenerateMock}
              title="Populate instantly with mock hackathon evaluation dataset"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-colors cursor-pointer select-none"
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Instant Mock</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag-and-Drop CSV Ingestion Area with Strict Validation */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 scale-[1.01]'
            : loadedCsvName
            ? 'border-emerald-500/50 bg-emerald-950/20'
            : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                loadedCsvName
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {loadedCsvName ? (
                  <span className="text-emerald-300">
                    Active Dataset: <strong className="underline">{loadedCsvName}</strong>
                  </span>
                ) : (
                  'Drag & Drop CSV here or click to browse'
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Strictly validated schema: <code className="text-cyan-300">timestamp</code>,{' '}
                <code className="text-cyan-300">ambient_temp_c</code>,{' '}
                <code className="text-cyan-300">humidity_pct</code>,{' '}
                <code className="text-cyan-300">solar_irradiance_wm2</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadDefaultSampleCsv();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900 transition-colors cursor-pointer"
            >
              Load sample_test_input.csv
            </button>
          </div>
        </div>
      </div>

      {/* CSV Validation Error Alert */}
      {csvError && (
        <div className="bg-rose-950/80 border border-rose-500 text-rose-200 px-4 py-3 rounded-xl text-xs flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2">
            <span className="text-base select-none">❌</span>
            <div>
              <p className="font-bold text-white">CSV Upload Rejected</p>
              <p className="mt-0.5 text-rose-200">{csvError}</p>
            </div>
          </div>
          <button
            onClick={() => setCsvError(null)}
            className="text-rose-400 hover:text-white font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* CSV Sanitization Warning Alert */}
      {csvWarning && (
        <div className="bg-amber-950/70 border border-amber-500/80 text-amber-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⚠️</span>
            <span>{csvWarning}</span>
          </div>
          <button
            onClick={() => setCsvWarning(null)}
            className="text-amber-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Target endpoint info bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>API Target:</span>
          <code className="text-cyan-300 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            {apiUrl}
          </code>
        </div>
        <div className="text-slate-400 flex items-center gap-3">
          <span>Retry Policy: <strong className="text-cyan-300">2 Retries (1s backoff)</strong></span>
          <span>Stream Interval: <strong className="text-white">1.5s</strong></span>
        </div>
      </div>

      {/* Backend connection error notice */}
      {error && (
        <div className="bg-rose-950/70 border border-rose-500/80 text-rose-200 p-4 rounded-xl text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <svg
              className="w-5 h-5 text-rose-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-bold text-white text-sm">Backend Service Notice</p>
              <p className="mt-1 text-rose-300">{error}</p>
            </div>
          </div>
          <button
            onClick={onClearError}
            className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
            title="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
