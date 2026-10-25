import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Download,
  Terminal,
  ShieldAlert,
  Moon,
  Coins,
  Flame,
  FileText,
  ThermometerSnowflake,
  Activity,
} from 'lucide-react';
import {
  TEST_NORMAL_DAY_CSV,
  TEST_CYBERATTACK_JSON,
  TEST_PEAK_SURGE_CSV,
  TEST_P2P_MARKET_JSON,
  TEST_ZERO_SOLAR_CSV,
  TEST_STRESS_FAILURE_CSV,
  TEST_CLIMATE_HEATWAVE_JSON,
  downloadFile,
} from '../utils/testSuiteGenerator';

export default function Settings() {
  const { settings, updateSettings, resetSettings, DEFAULT_SETTINGS } = useSettings();

  const [formData, setFormData] = useState({
    maxDemandThreshold: settings.maxDemandThreshold,
    criticalThreshold: settings.criticalThreshold,
    peakWindowStart: settings.peakWindowStart,
    peakWindowEnd: settings.peakWindowEnd,
    streamingInterval: settings.streamingInterval,
    enableGridDefender: Boolean(settings.enableGridDefender),
  });

  const [savedToast, setSavedToast] = useState(false);
  const [injectedToast, setInjectedToast] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleReset = () => {
    resetSettings();
    setFormData(DEFAULT_SETTINGS);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const applyPreset = (preset) => {
    setFormData((prev) => ({ ...prev, ...preset }));
  };

  const showInjectMessage = (msg) => {
    setInjectedToast(msg);
    setTimeout(() => setInjectedToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Grid Configuration &amp; Developer Tools
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure autonomous transition rules, launch fault injectors, and generate the 5 automated test scenarios.
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Rules Saved to Storage!</span>
          </div>
        )}

        {injectedToast && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold animate-fadeIn">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>{injectedToast}</span>
          </div>
        )}
      </div>

      {/* Feature 6: Developer Tools & Automated Test-Suite Scenarios */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Developer Tools &bull; Automated Test Suite Suite (5 Scenarios)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              ONE-CLICK BENCHMARK
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Stored in <code className="text-cyan-300">public/test-data/</code> for automated evaluator ingest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. test_normal_day.csv */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  test_normal_day.csv
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 leading-none rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  BASELINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                Standard 24h diurnal curve. All hours within nominal limits (100–160 kW). Zero alerts.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadFile(TEST_NORMAL_DAY_CSV, 'test_normal_day.csv', 'text/csv');
                  showInjectMessage('Downloaded test_normal_day.csv');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* 2. test_cyberattack.json */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  test_cyberattack.json
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 leading-none rounded bg-rose-950 text-rose-300 border border-rose-800">
                  FAULT SCADA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                Forces main grid power to 0.0 kW, disengages transmission bus, and triggers emergency islanding.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadFile(TEST_CYBERATTACK_JSON, 'test_cyberattack.json', 'application/json');
                  showInjectMessage('Downloaded test_cyberattack.json');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950 hover:bg-rose-900 border border-rose-800/60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* 3. test_peak_surge.csv */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  test_peak_surge.csv
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 leading-none rounded bg-amber-950 text-amber-300 border border-amber-800">
                  OVERLOAD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                Thermal stress surge jumping instantly to 250 kW at 19:00, forcing the Grid Defender mini-game!
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadFile(TEST_PEAK_SURGE_CSV, 'test_peak_surge.csv', 'text/csv');
                  showInjectMessage('Downloaded test_peak_surge.csv');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-950 hover:bg-amber-900 border border-amber-800/60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* 4. test_p2p_market.json */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-purple-400" />
                  test_p2p_market.json
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 leading-none rounded bg-purple-950 text-purple-300 border border-purple-800">
                  LEDGER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                Simulates 42 prosumers with 680 kW surplus rooftop solar, triggering high-frequency smart contracts.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadFile(TEST_P2P_MARKET_JSON, 'test_p2p_market.json', 'application/json');
                  showInjectMessage('Downloaded test_p2p_market.json');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-300 bg-purple-950 hover:bg-purple-900 border border-purple-800/60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* 5. test_zero_solar.csv */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-slate-400" />
                  test_zero_solar.csv
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 leading-none rounded bg-slate-800 text-slate-300 border border-slate-700">
                  NIGHTTIME
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                Continuous dark/cloudy scenario with zero solar irradiance (0 W/m²). Tests pure BESS resilience.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadFile(TEST_ZERO_SOLAR_CSV, 'test_zero_solar.csv', 'text/csv');
                  showInjectMessage('Downloaded test_zero_solar.csv');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* 6. test_stress_failure.csv (Feature 1 & 6) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  test_stress_failure.csv
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 leading-none rounded bg-rose-950 text-rose-300 border border-rose-800">
                  RUL DECAY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                24h sequence reaching 45&deg;C ambient temperature with sustained 190 kW loads to trigger RUL failure forecaster.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadFile(TEST_STRESS_FAILURE_CSV, 'test_stress_failure.csv', 'text/csv');
                  showInjectMessage('Downloaded test_stress_failure.csv');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950 hover:bg-rose-900 border border-rose-800/60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* 7. test_climate_heatwave.json (Feature 2 & 6) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-amber-400" />
                  test_climate_heatwave.json
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 leading-none rounded bg-amber-950 text-amber-300 border border-amber-800">
                  CLIMATE +4.5&deg;C
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                Simulates extreme +4.5&deg;C climate delta forcing regional HVAC chilling saturation and predictive transformer trip.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadFile(TEST_CLIMATE_HEATWAVE_JSON, 'test_climate_heatwave.json', 'application/json');
                  showInjectMessage('Downloaded test_climate_heatwave.json');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-950 hover:bg-amber-900 border border-amber-800/60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Quick Operational Presets
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                maxDemandThreshold: 160,
                criticalThreshold: 200,
                peakWindowStart: '18:00',
                peakWindowEnd: '22:00',
              })
            }
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                Standard Production
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">
                Default
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Max: 160 kW &bull; Overload: 200 kW &bull; Peak: 18-22
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                maxDemandThreshold: 140,
                criticalThreshold: 180,
                peakWindowStart: '17:00',
                peakWindowEnd: '23:00',
              })
            }
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                Aggressive Peak Shaving
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 font-mono">
                High Battery
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Max: 140 kW &bull; Overload: 180 kW &bull; Peak: 17-23
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                maxDemandThreshold: 220,
                criticalThreshold: 260,
                peakWindowStart: '19:00',
                peakWindowEnd: '21:00',
              })
            }
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                High-Capacity Grid
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 font-mono">
                Substation
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Max: 220 kW &bull; Overload: 260 kW &bull; Peak: 19-21
            </p>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Demand &amp; Overload Limits
              </h3>
            </div>

            <div>
              <label
                htmlFor="maxDemandThreshold"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Max Grid Demand Threshold (kW)
              </label>
              <div className="relative">
                <input
                  id="maxDemandThreshold"
                  type="number"
                  name="maxDemandThreshold"
                  min="50"
                  max="500"
                  step="5"
                  value={formData.maxDemandThreshold}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 outline-hidden transition-colors"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-500 font-mono">
                  kW
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Loads exceeding this threshold trigger autonomous switch to{' '}
                <span className="text-cyan-300 font-mono">RENEWABLE_STORAGE_MODE</span>.
              </p>
            </div>

            <div>
              <label
                htmlFor="criticalThreshold"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Critical Overload Threshold (kW)
              </label>
              <div className="relative">
                <input
                  id="criticalThreshold"
                  type="number"
                  name="criticalThreshold"
                  min="80"
                  max="600"
                  step="5"
                  value={formData.criticalThreshold}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/80 border border-white/10 focus:border-red-500 rounded-xl px-4 py-2.5 text-sm font-mono text-rose-300 outline-hidden transition-colors"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-500 font-mono">
                  kW
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Demand exceeding this value triggers the flashing{' '}
                <span className="text-rose-400 font-mono">CRITICAL_OVERLOAD</span> alert banner
                and emergency reference line.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Peak Window &amp; Cadence Constraints
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="peakWindowStart"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Peak Window Start
                </label>
                <input
                  id="peakWindowStart"
                  type="text"
                  name="peakWindowStart"
                  pattern="[0-2][0-9]:00"
                  placeholder="18:00"
                  value={formData.peakWindowStart}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-hidden transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Format: HH:00</p>
              </div>

              <div>
                <label
                  htmlFor="peakWindowEnd"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Peak Window End
                </label>
                <input
                  id="peakWindowEnd"
                  type="text"
                  name="peakWindowEnd"
                  pattern="[0-2][0-9]:00"
                  placeholder="22:00"
                  value={formData.peakWindowEnd}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-hidden transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Format: HH:00</p>
              </div>
            </div>

            <div>
              <label
                htmlFor="streamingInterval"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Real-Time Simulation Cadence (ms)
              </label>
              <div className="relative">
                <input
                  id="streamingInterval"
                  type="number"
                  name="streamingInterval"
                  min="200"
                  max="5000"
                  step="100"
                  value={formData.streamingInterval}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 outline-hidden transition-colors"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-500 font-mono">
                  ms
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Delay between consecutive hourly dispatches during simulation (Default: 1500 ms).
              </p>
            </div>

            {/* Feature: Enable Grid Defender Mini-Game Toggle */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor="enableGridDefender"
                    className="text-xs font-semibold text-slate-200 block"
                  >
                    Enable Grid Defender Game
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    When enabled, severe overload (&gt;200kW) interrupts the view with the interactive blackout defender drill. When disabled (default), only the red Alert Banner is shown so simulations proceed uninterrupted.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    id="enableGridDefender"
                    type="checkbox"
                    name="enableGridDefender"
                    checked={Boolean(formData.enableGridDefender)}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900/90 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Live Controller Logic Impact</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Peak highlight: <span className="font-mono text-cyan-300">{formData.peakWindowStart} - {formData.peakWindowEnd}</span> &bull;
                Overload ceiling: <span className="font-mono text-rose-300">&gt; {formData.criticalThreshold} kW</span> &bull;
                Storage trigger: <span className="font-mono text-blue-300">&gt; {formData.maxDemandThreshold} kW</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <button
              type="submit"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Rules</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
