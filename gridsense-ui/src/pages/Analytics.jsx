import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
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
} from 'lucide-react';

const FEATURE_IMPORTANCE = [
  { feature: 'Ambient Temp (°C)', importance: 45, color: '#f59e0b' },
  { feature: 'Lag 1h Demand (kW)', importance: 30, color: '#06b6d4' },
  { feature: 'Solar Irradiance (W/m²)', importance: 15, color: '#10b981' },
  { feature: 'Relative Humidity (%)', importance: 10, color: '#6366f1' },
];

const ACCURACY_DATA = [
  { hour: '00:00', actual: 95.2, predicted: 97.0, error: 1.8 },
  { hour: '02:00', actual: 88.4, predicted: 86.5, error: -1.9 },
  { hour: '04:00', actual: 82.1, predicted: 84.0, error: 1.9 },
  { hour: '06:00', actual: 110.5, predicted: 108.2, error: -2.3 },
  { hour: '08:00', actual: 145.0, predicted: 142.6, error: -2.4 },
  { hour: '10:00', actual: 168.2, predicted: 165.4, error: -2.8 },
  { hour: '12:00', actual: 178.6, predicted: 180.1, error: 1.5 },
  { hour: '14:00', actual: 172.4, predicted: 170.8, error: -1.6 },
  { hour: '16:00', actual: 160.0, predicted: 162.3, error: 2.3 },
  { hour: '18:00', actual: 198.5, predicted: 201.2, error: 2.7 },
  { hour: '20:00', actual: 210.4, predicted: 208.0, error: -2.4 },
  { hour: '22:00', actual: 165.2, predicted: 168.1, error: 2.9 },
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

      {/* Model Health KPI Cards (Requirement 4) */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart (Requirement 4) */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Feature Importance Weights</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Gain Contribution
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Relative impact of environmental and historical telemetry features on predicted demand.
            </p>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FEATURE_IMPORTANCE}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.5} />
                <XAxis type="number" unit="%" stroke="#94a3b8" fontSize={11} domain={[0, 50]} />
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
                  {FEATURE_IMPORTANCE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Accuracy Chart (Actual vs. Predicted) (Requirement 4) */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Prediction Accuracy (24h)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                  Ground Truth Comparison
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
              <LineChart data={ACCURACY_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
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
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Parameters Metadata Panel */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 text-xs text-slate-300">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 font-bold text-white uppercase tracking-wider text-[11px]">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Hyperparameter Specifications</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 block">Estimators:</span>
            <span className="text-white font-bold">120 Trees</span>
          </div>
          <div>
            <span className="text-slate-500 block">Max Depth:</span>
            <span className="text-white font-bold">6 Layers</span>
          </div>
          <div>
            <span className="text-slate-500 block">Learning Rate:</span>
            <span className="text-cyan-400 font-bold">0.05</span>
          </div>
          <div>
            <span className="text-slate-500 block">Loss Function:</span>
            <span className="text-white font-bold">Squared Error</span>
          </div>
        </div>
      </div>
    </div>
  );
}
