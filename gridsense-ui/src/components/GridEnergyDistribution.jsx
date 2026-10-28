import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  PieChart as PieIcon,
  Sun,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

const SOURCE_COLORS = {
  Solar: '#f59e0b', // Amber-500
  Battery: '#06b6d4', // Cyan-500
  MainGrid: '#10b981', // Emerald-500
  Reserve: '#6366f1', // Indigo-500
};

const MODE_COLORS = {
  'Main Grid Mode': '#10b981',
  'Renewable Storage': '#06b6d4',
  'Peak Shaving / Overload': '#f43f5e',
  'Islanded Mode': '#a855f7',
};

const TIER_COLORS = {
  'Off-Peak (<110 kW)': '#3b82f6',
  'Nominal (110-160 kW)': '#10b981',
  'High Peak (160-200 kW)': '#f59e0b',
  'Critical (>200 kW)': '#ef4444',
};

// Custom Tooltip for Recharts Pie Slices
function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const item = data.payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono min-w-[180px]">
        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800 mb-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: data.color || item.fill }}
          />
          <span className="font-bold text-white tracking-tight">{data.name}</span>
        </div>
        <div className="space-y-1 text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Contribution:</span>
            <span className="font-bold text-cyan-300">
              {Number(data.value).toFixed(1)} {item.unit || 'kW'}
            </span>
          </div>
          {item.sharePct !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Share of Total:</span>
              <span className="font-bold text-emerald-400">{item.sharePct}%</span>
            </div>
          )}
          {item.hours !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Duration:</span>
              <span className="font-bold text-amber-300">{item.hours} hrs</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

CustomPieTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export default function GridEnergyDistribution({
  forecastData = [],
  currentDemand = 143.0,
  currentGridMode = 'MAIN_GRID_MODE',
  criticalThreshold = 200,
}) {
  const [activeTab, setActiveTab] = useState('SOURCE_MIX'); // 'SOURCE_MIX' | 'MODE_SHARE' | 'TIER_BREAKDOWN'
  const [activeIndex, setActiveIndex] = useState(null);

  // 1. Calculate Real-Time Energy Generation & Source Mix
  const sourceMixData = useMemo(() => {
    const demand = Math.max(20, Number(currentDemand) || 140);

    // If latest forecast point has solar irradiance
    const latestPoint = forecastData[forecastData.length - 1] || {};
    const solarIrradiance = Number(latestPoint.solar_irradiance_wm2) || 0;

    let solarShare = 0;
    let batteryShare = 0;
    let gridShare = 0;

    if (solarIrradiance > 50) {
      // Estimated PV yield ~ 30-45% of load during daylight
      solarShare = Math.min(demand * 0.55, (solarIrradiance / 1000) * 85);
    }

    if (
      currentGridMode === 'RENEWABLE_STORAGE_MODE' ||
      currentDemand >= 160 ||
      currentGridMode === 'ISLANDED_MODE'
    ) {
      // Battery storage actively discharging
      batteryShare = Math.min(demand - solarShare, demand * 0.42);
    } else {
      // Baseload trickle battery reserve
      batteryShare = Math.min(15, demand * 0.08);
    }

    gridShare = Math.max(10, demand - solarShare - batteryShare);

    const totalCalculated = solarShare + batteryShare + gridShare;

    return [
      {
        name: 'Solar PV Direct',
        value: Number(solarShare.toFixed(1)),
        fill: SOURCE_COLORS.Solar,
        unit: 'kW',
        sharePct: ((solarShare / totalCalculated) * 100).toFixed(1),
        icon: '☀️',
        description: 'Clean on-site photovoltaic generation',
      },
      {
        name: 'Battery Storage',
        value: Number(batteryShare.toFixed(1)),
        fill: SOURCE_COLORS.Battery,
        unit: 'kW',
        sharePct: ((batteryShare / totalCalculated) * 100).toFixed(1),
        icon: '🔋',
        description: 'Substation BESS peak-shaving dispatch',
      },
      {
        name: 'Main Utility Grid',
        value: Number(gridShare.toFixed(1)),
        fill: SOURCE_COLORS.MainGrid,
        unit: 'kW',
        sharePct: ((gridShare / totalCalculated) * 100).toFixed(1),
        icon: '⚡',
        description: 'High-voltage transmission interconnect',
      },
    ].filter((item) => item.value > 0);
  }, [currentDemand, currentGridMode, forecastData]);

  // 2. Calculate 24-Hour Operating Mode Distribution
  const modeShareData = useMemo(() => {
    if (!forecastData || forecastData.length === 0) {
      return [
        { name: 'Main Grid Mode', value: 16, hours: 16, sharePct: '66.7', fill: MODE_COLORS['Main Grid Mode'] },
        { name: 'Renewable Storage', value: 8, hours: 8, sharePct: '33.3', fill: MODE_COLORS['Renewable Storage'] },
      ];
    }

    let mainGridHours = 0;
    let renewableStorageHours = 0;
    let overloadHours = 0;
    let islandedHours = 0;

    forecastData.forEach((item) => {
      const kw = Number(item.predicted_demand_kw) || 0;
      if (item.grid_mode === 'ISLANDED_MODE') {
        islandedHours++;
      } else if (item.alert === 'CRITICAL_OVERLOAD' || kw >= criticalThreshold) {
        overloadHours++;
      } else if (item.grid_mode === 'RENEWABLE_STORAGE_MODE' || kw > 160) {
        renewableStorageHours++;
      } else {
        mainGridHours++;
      }
    });

    const total = forecastData.length;
    const slices = [];

    if (mainGridHours > 0) {
      slices.push({
        name: 'Main Grid Mode',
        value: mainGridHours,
        hours: mainGridHours,
        sharePct: ((mainGridHours / total) * 100).toFixed(1),
        fill: MODE_COLORS['Main Grid Mode'],
        unit: 'hrs',
      });
    }
    if (renewableStorageHours > 0) {
      slices.push({
        name: 'Renewable Storage',
        value: renewableStorageHours,
        hours: renewableStorageHours,
        sharePct: ((renewableStorageHours / total) * 100).toFixed(1),
        fill: MODE_COLORS['Renewable Storage'],
        unit: 'hrs',
      });
    }
    if (overloadHours > 0) {
      slices.push({
        name: 'Peak Shaving / Overload',
        value: overloadHours,
        hours: overloadHours,
        sharePct: ((overloadHours / total) * 100).toFixed(1),
        fill: MODE_COLORS['Peak Shaving / Overload'],
        unit: 'hrs',
      });
    }
    if (islandedHours > 0) {
      slices.push({
        name: 'Islanded Mode',
        value: islandedHours,
        hours: islandedHours,
        sharePct: ((islandedHours / total) * 100).toFixed(1),
        fill: MODE_COLORS['Islanded Mode'],
        unit: 'hrs',
      });
    }

    return slices;
  }, [forecastData, criticalThreshold]);

  // 3. Calculate 24-Hour Demand Tier Breakdown
  const tierBreakdownData = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return [];

    let offPeak = 0;
    let nominal = 0;
    let highPeak = 0;
    let critical = 0;

    forecastData.forEach((d) => {
      const kw = Number(d.predicted_demand_kw) || 0;
      if (kw < 110) offPeak++;
      else if (kw < 160) nominal++;
      else if (kw < criticalThreshold) highPeak++;
      else critical++;
    });

    const total = forecastData.length || 1;
    return [
      { name: 'Off-Peak (<110 kW)', value: offPeak, hours: offPeak, sharePct: ((offPeak / total) * 100).toFixed(1), fill: TIER_COLORS['Off-Peak (<110 kW)'], unit: 'hrs' },
      { name: 'Nominal (110-160 kW)', value: nominal, hours: nominal, sharePct: ((nominal / total) * 100).toFixed(1), fill: TIER_COLORS['Nominal (110-160 kW)'], unit: 'hrs' },
      { name: 'High Peak (160-200 kW)', value: highPeak, hours: highPeak, sharePct: ((highPeak / total) * 100).toFixed(1), fill: TIER_COLORS['High Peak (160-200 kW)'], unit: 'hrs' },
      { name: 'Critical (>200 kW)', value: critical, hours: critical, sharePct: ((critical / total) * 100).toFixed(1), fill: TIER_COLORS['Critical (>200 kW)'], unit: 'hrs' },
    ].filter((t) => t.value > 0);
  }, [forecastData, criticalThreshold]);

  // Clean Energy Self-Sufficiency Index
  const cleanEnergyPct = useMemo(() => {
    const totalDemand = Number(currentDemand) || 140;
    const solarVal = sourceMixData.find((s) => s.name.includes('Solar'))?.value || 0;
    const battVal = sourceMixData.find((s) => s.name.includes('Battery'))?.value || 0;
    return Math.min(100, Math.round(((solarVal + battVal) / totalDemand) * 100));
  }, [currentDemand, sourceMixData]);

  // Active chart dataset depending on sub-tab
  const currentChartData =
    activeTab === 'SOURCE_MIX'
      ? sourceMixData
      : activeTab === 'MODE_SHARE'
      ? modeShareData
      : tierBreakdownData;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-4 sm:p-6 flex flex-col gap-5">
      {/* Header & Sub-Option Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner">
            <PieIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                Telemetry Analytics &amp; Energy Distribution
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                Live Recharts Pie
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Multi-dimensional power allocation, operating mode shares &amp; demand tier breakdown
            </p>
          </div>
        </div>

        {/* Chart View Switcher Sub-Options */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('SOURCE_MIX')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SOURCE_MIX'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-950/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Source Mix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MODE_SHARE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MODE_SHARE'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>24h Modes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TIER_BREAKDOWN')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TIER_BREAKDOWN'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Load Tiers</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Area: Donut Pie Chart + Legend & Real-Time Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Interactive Recharts Donut Pie Chart */}
        <div className="lg:col-span-7 relative h-64 sm:h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={currentChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                cornerRadius={6}
                stroke="#0f172a"
                strokeWidth={2}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {currentChartData.map((entry, index) => (
                  <Cell
                    key={`slice-${index}`}
                    fill={entry.fill}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      filter: activeIndex === index ? 'drop-shadow(0px 0px 8px rgba(255,255,255,0.4))' : 'none',
                      transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                      transformOrigin: 'center center',
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Donut Floating Stat Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            {activeTab === 'SOURCE_MIX' ? (
              <>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Active Load
                </span>
                <span className="text-2xl font-black font-mono text-cyan-300 drop-shadow-md">
                  {Number(currentDemand).toFixed(1)}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">kW Total</span>
              </>
            ) : activeTab === 'MODE_SHARE' ? (
              <>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Clean Index
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400 drop-shadow-md">
                  {cleanEnergyPct}%
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">Renewable</span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Forecast
                </span>
                <span className="text-2xl font-black font-mono text-amber-300 drop-shadow-md">
                  24h
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">Time Horizon</span>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Breakdown Cards & Slices List */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between pb-1">
            <span>Allocation Breakdown</span>
            <span className="text-cyan-400 text-[10px]">Hover Slice to Inspect</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {currentChartData.map((item, idx) => (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeIndex === idx
                    ? 'bg-slate-800/90 border-white/30 shadow-lg scale-[1.01]'
                    : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white tracking-tight truncate">
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-400 truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="text-xs font-black font-mono text-white">
                    {item.value} {item.unit || 'kW'}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-cyan-400">
                    {item.sharePct}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clean Energy Metric Highlight Card */}
          <div className="mt-1 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900/40 border border-emerald-500/30 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin-slow" />
              <div>
                <span className="text-[11px] font-bold text-white">
                  Renewable Self-Sufficiency
                </span>
                <p className="text-[10px] text-slate-400">
                  Displacing fossil peaker reliance with solar + BESS
                </p>
              </div>
            </div>
            <span className="text-base font-black font-mono text-emerald-300">
              {cleanEnergyPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

GridEnergyDistribution.propTypes = {
  forecastData: PropTypes.array,
  currentDemand: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  currentGridMode: PropTypes.string,
  criticalThreshold: PropTypes.number,
};
