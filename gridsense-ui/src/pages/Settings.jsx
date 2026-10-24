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
  FileSpreadsheet,
} from 'lucide-react';
import {
  generateNormalDayCsv,
  generateExtremeStormCsv,
  triggerDownloadCsv,
} from '../utils/generateDemoFiles';

export default function Settings() {
  const { settings, updateSettings, resetSettings, DEFAULT_SETTINGS } = useSettings();

  const [formData, setFormData] = useState({
    maxDemandThreshold: settings.maxDemandThreshold,
    criticalThreshold: settings.criticalThreshold,
    peakWindowStart: settings.peakWindowStart,
    peakWindowEnd: settings.peakWindowEnd,
    streamingInterval: settings.streamingInterval,
  });

  const [savedToast, setSavedToast] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
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

  // Automated Test & Demo File Download handlers (Feature 3)
  const handleDownloadNormal = () => {
    triggerDownloadCsv(generateNormalDayCsv(), 'demo_normal_day.csv');
  };

  const handleDownloadStorm = () => {
    triggerDownloadCsv(generateExtremeStormCsv(), 'demo_extreme_storm.csv');
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
              Transition Controller Rules
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic load thresholds and peak window constraints that drive autonomous grid switching.
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Rules Saved to Storage!</span>
          </div>
        )}
      </div>

      {/* Feature 3: Automated Test & Demo File Generator */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Automated Test & Benchmark Datasets
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Evaluator Ready
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Download standard test datasets to drag-and-drop into the Live Dashboard.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Normal Diurnal Day (Baseline)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                  Standard Weather
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                24 hours of standard 20°C–31°C diurnal cycle and smooth solar curve. Safe demand profile within 100–160 kW.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadNormal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 transition-colors cursor-pointer select-none"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download demo_normal_day.csv</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Extreme Storm & Peak Stress
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono">
                  Overload Stress
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Extreme 42.5°C heat stress causing catastrophic 19:00 load spike (&gt; 220 kW). Triggers emergency storage and CRITICAL_OVERLOAD.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadStorm}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 transition-colors cursor-pointer select-none"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Download demo_extreme_storm.csv</span>
            </button>
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
          {/* Threshold Inputs */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Demand & Overload Limits
              </h3>
            </div>

            {/* Max Grid Demand Threshold */}
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

            {/* Critical Overload Threshold */}
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

          {/* Peak Window & Simulation Cadence */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Peak Window & Cadence Constraints
              </h3>
            </div>

            {/* Peak Window Start & End */}
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

            {/* Streaming Cadence */}
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
          </div>
        </div>

        {/* Live Rule Impact Summary Card */}
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
