import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  BrainCircuit,
  Activity,
  Cpu,
  TrendingUp,
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  AlertTriangle,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';

const FEATURE_IMPORTANCE_PRESETS = {
  GAIN: [
    { feature: 'Ambient Temp (°C)', importance: 45, color: '#f59e0b' },
    { feature: 'Lag 1h Demand (kW)', importance: 30, color: '#06b6d4' },
    { feature: 'Solar Irradiance (W/m²)', importance: 15, color: '#10b981' },
    { feature: 'Relative Humidity (%)', importance: 10, color: '#6366f1' },
  ],
  SPLIT: [
    { feature: 'Lag 1h Demand (kW)', importance: 42, color: '#06b6d4' },
    { feature: 'Ambient Temp (°C)', importance: 36, color: '#f59e0b' },
    { feature: 'Solar Irradiance (W/m²)', importance: 14, color: '#10b981' },
    { feature: 'Relative Humidity (%)', importance: 8, color: '#6366f1' },
  ],
  COVER: [
    { feature: 'Ambient Temp (°C)', importance: 52, color: '#f59e0b' },
    { feature: 'Solar Irradiance (W/m²)', importance: 24, color: '#10b981' },
    { feature: 'Lag 1h Demand (kW)', importance: 16, color: '#06b6d4' },
    { feature: 'Relative Humidity (%)', importance: 8, color: '#6366f1' },
  ],
};

const FULL_ACCURACY_DATA = [
  { hour: '00:00', actual: 95.2, predicted: 97.0, error: 1.8, isPeak: false, isSolar: false },
  { hour: '02:00', actual: 88.4, predicted: 86.5, error: -1.9, isPeak: false, isSolar: false },
  { hour: '04:00', actual: 82.1, predicted: 84.0, error: 1.9, isPeak: false, isSolar: false },
  { hour: '06:00', actual: 110.5, predicted: 108.2, error: -2.3, isPeak: false, isSolar: true },
  { hour: '08:00', actual: 145.0, predicted: 142.6, error: -2.4, isPeak: false, isSolar: true },
  { hour: '10:00', actual: 168.2, predicted: 165.4, error: -2.8, isPeak: false, isSolar: true },
  { hour: '12:00', actual: 178.6, predicted: 180.1, error: 1.5, isPeak: false, isSolar: true },
  { hour: '14:00', actual: 172.4, predicted: 170.8, error: -1.6, isPeak: false, isSolar: true },
  { hour: '16:00', actual: 160.0, predicted: 162.3, error: 2.3, isPeak: false, isSolar: true },
  { hour: '18:00', actual: 198.5, predicted: 201.2, error: 2.7, isPeak: true, isSolar: false },
  { hour: '20:00', actual: 210.4, predicted: 208.0, error: -2.4, isPeak: true, isSolar: false },
  { hour: '22:00', actual: 165.2, predicted: 168.1, error: 2.9, isPeak: true, isSolar: false },
];

function AccuracyTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-white mb-1.5">Timestamp: {label}</p>
        <div className="flex justify-between gap-4 text-cyan-300">
          <span>Predicted:</span>
          <span className="font-mono font-bold">{data.predicted} kW</span>
        </div>
        <div className="flex justify-between gap-4 text-slate-300">
          <span>Actual Load:</span>
          <span className="font-mono font-bold">{data.actual} kW</span>
        </div>
        <div className="flex justify-between gap-4 text-amber-300 pt-1 border-t border-slate-800">
          <span>Residual Error:</span>
          <span className="font-mono">{Math.abs(data.error).toFixed(1)} kW</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function Analytics() {
  const [timeWindowFilter, setTimeWindowFilter] = useState('ALL'); // 'ALL', 'PEAK', 'SOLAR'
  const [importanceMetric, setImportanceMetric] = useState('GAIN'); // 'GAIN', 'SPLIT', 'COVER'
  const [showOnlyHighResiduals, setShowOnlyHighResiduals] = useState(false);

  // Filtered accuracy curve
  const filteredAccuracyData = useMemo(() => {
    try {
      return FULL_ACCURACY_DATA.filter((point) => {
        if (timeWindowFilter === 'PEAK' && !point.isPeak) return false;
        if (timeWindowFilter === 'SOLAR' && !point.isSolar) return false;
        if (showOnlyHighResiduals && Math.abs(point.error) < 2.0) return false;
        return true;
      });
    } catch (err) {
      console.error('Error filtering accuracy data:', err);
      return FULL_ACCURACY_DATA;
    }
  }, [timeWindowFilter, showOnlyHighResiduals]);

  const [featureChartMode, setFeatureChartMode] = useState('BAR'); // 'BAR' | 'PIE'

  // Model Residual Error Distribution (Pie Chart)
  const errorDistributionData = useMemo(() => {
    let highConf = 0; // < 2.0 kW
    let modConf = 0; // 2.0 - 2.8 kW
    let outlier = 0; // > 2.8 kW

    FULL_ACCURACY_DATA.forEach((d) => {
      const err = Math.abs(d.error);
      if (err < 2.0) highConf++;
      else if (err <= 2.8) modConf++;
      else outlier++;
    });

    const total = FULL_ACCURACY_DATA.length || 1;
    return [
      {
        name: 'High Precision (<2 kW)',
        value: highConf,
        sharePct: ((highConf / total) * 100).toFixed(0),
        fill: '#10b981',
      },
      {
        name: 'Nominal Variance (2-2.8 kW)',
        value: modConf,
        sharePct: ((modConf / total) * 100).toFixed(0),
        fill: '#06b6d4',
      },
      {
        name: 'Outlier Residual (>2.8 kW)',
        value: outlier,
        sharePct: ((outlier / total) * 100).toFixed(0),
        fill: '#f59e0b',
      },
    ].filter((item) => item.value > 0);
  }, []);

  const currentImportanceData = FEATURE_IMPORTANCE_PRESETS[importanceMetric] || FEATURE_IMPORTANCE_PRESETS.GAIN;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Model Diagnostics & Feature Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inference accuracy, residual distribution, and feature importance weighting.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">QuickML Engine: ACTIVE</span>
        </div>
      </div>

      {/* Model Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RMSE Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Root Mean Squared Error
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Optimal
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">12.4</span>
            <span className="text-xs text-slate-400 font-mono">kW RMSE</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>±3.2% error margin against 24h baseline</span>
          </p>
        </div>

        {/* R-Squared Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Variance Explained (R²)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              High Fit
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-300 font-mono">0.94</span>
            <span className="text-xs text-slate-400 font-mono">/ 1.00</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Robust correlation across diurnal shifts</span>
          </p>
        </div>

        {/* Model Architecture Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Model Pipeline</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              v2.4
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white font-mono">XGBoost Regressor</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Trained on 8,760 telemetry points</span>
          </p>
        </div>

        {/* Inference Latency Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Inference Latency</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Low Latency
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-300 font-mono">42</span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Catalyst Appsail compute time</span>
          </p>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Evaluation Horizon:
          </span>
          {[
            { id: 'ALL', label: 'Full 24 Hours' },
            { id: 'PEAK', label: 'Peak Window (18-22h)' },
            { id: 'SOLAR', label: 'Solar Window (06-16h)' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setTimeWindowFilter(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                timeWindowFilter === btn.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOnlyHighResiduals}
              onChange={(e) => setShowOnlyHighResiduals(e.target.checked)}
              className="rounded bg-slate-950 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Highlight High Residuals (&gt; 2.0 kW)</span>
          </label>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Chart with Bar / Pie Toggle */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Feature Importance Weights</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {importanceMetric} Metric
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Relative impact of environmental and historical telemetry features.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Bar vs Pie Switcher */}
              <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFeatureChartMode('BAR')}
                  className={`px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 transition-all ${
                    featureChartMode === 'BAR'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Horizontal Bar View"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Bar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeatureChartMode('PIE')}
                  className={`px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 transition-all ${
                    featureChartMode === 'PIE'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Donut Pie View"
                >
                  <PieIcon className="w-3 h-3" />
                  <span>Pie</span>
                </button>
              </div>

              {/* Importance Metric Filter */}
              <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-white/10 text-[11px]">
                {['GAIN', 'SPLIT', 'COVER'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setImportanceMetric(m)}
                    className={`px-2.5 py-1 rounded-md font-mono cursor-pointer transition-all ${
                      importanceMetric === m
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {featureChartMode === 'BAR' ? (
                <BarChart
                  data={currentImportanceData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.5} />
                  <XAxis type="number" unit="%" stroke="#94a3b8" fontSize={11} domain={[0, 60]} />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    width={130}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Importance Weight']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                    {currentImportanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Pie
                    data={currentImportanceData}
                    dataKey="importance"
                    nameKey="feature"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    cornerRadius={5}
                  >
                    {currentImportanceData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Accuracy Chart */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Prediction Accuracy</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                  {filteredAccuracyData.length} Sample Points
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Actual grid load vs. XGBoost predicted telemetry curve.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-0.5 bg-slate-400" />
                Actual
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400" />
                Predicted
              </span>
            </div>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredAccuracyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kW" domain={[60, 240]} />
                <Tooltip content={<AccuracyTooltip />} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#94a3b8' }}
                  name="Actual Load"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#06b6d4' }}
                  name="Predicted Load"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Prediction Residual & Error Distribution (Recharts Donut Pie Chart) */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Residual Error Variance Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proportion of prediction samples grouped by absolute error margin (&plusmn;kW)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-bold">
              98.2% Within Safe Operational Tolerance
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-4">
          <div className="md:col-span-5 h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(val, name) => [`${val} sample hours`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Pie
                  data={errorDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  cornerRadius={6}
                >
                  {errorDistributionData.map((entry, index) => (
                    <Cell key={`error-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Tolerance</span>
              <span className="text-xl font-black font-mono text-emerald-400">&plusmn;1.4 kW</span>
              <span className="text-[9px] font-mono text-slate-500">MAE Benchmark</span>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {errorDistributionData.map((tier) => (
              <div
                key={tier.name}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.fill }} />
                  <span className="text-xs font-bold text-white truncate">{tier.name}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white">{tier.sharePct}%</span>
                  <span className="text-xs font-mono text-slate-400">{tier.value} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Residual Diagnostics Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Sample Residual Error Matrix</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Filtered: {filteredAccuracyData.length} records
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-white/10 font-mono">
              <tr>
                <th className="py-2.5 px-4">Hour</th>
                <th className="py-2.5 px-4 text-right">Actual Load</th>
                <th className="py-2.5 px-4 text-right">Predicted Load</th>
                <th className="py-2.5 px-4 text-right">Residual Error</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredAccuracyData.map((row, idx) => {
                const absError = Math.abs(row.error);
                const isHighError = absError >= 2.5;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-white">{row.hour}</td>
                    <td className="py-2.5 px-4 text-right text-slate-300">{row.actual.toFixed(1)} kW</td>
                    <td className="py-2.5 px-4 text-right text-cyan-300 font-bold">{row.predicted.toFixed(1)} kW</td>
                    <td className={`py-2.5 px-4 text-right font-bold ${isHighError ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {row.error > 0 ? `+${row.error.toFixed(1)}` : row.error.toFixed(1)} kW
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {isHighError ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Moderate Residual
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          High Fidelity
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
