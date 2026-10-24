import { Leaf, Zap, BarChart2, BatteryCharging, Factory } from 'lucide-react';

export default function MetricsOverview({ forecastData = [] }) {
  if (!forecastData || forecastData.length === 0) {
    return null;
  }

  // Calculate statistics
  const demands = forecastData.map((d) => Number(d.predicted_demand_kw) || 0);
  const peakDemand = Math.max(...demands);
  const peakItem = forecastData.find((d) => Number(d.predicted_demand_kw) === peakDemand);
  const peakHour = peakItem?.hour || '--';

  const minDemand = Math.min(...demands);
  const avgDemand = demands.reduce((acc, v) => acc + v, 0) / (demands.length || 1);

  const renewableHours = forecastData.filter(
    (d) => d.grid_mode === 'RENEWABLE_STORAGE_MODE'
  ).length;
  const mainGridHours = forecastData.length - renewableHours;

  // Feature 5: Carbon Footprint Calculator (ESG Metric: 0.45 kg CO2 saved per kWh in renewable mode)
  const co2SavedKg = forecastData.reduce((total, d) => {
    if (d.grid_mode === 'RENEWABLE_STORAGE_MODE') {
      return total + (Number(d.predicted_demand_kw) || 0) * 0.45;
    }
    return total;
  }, 0);

  const cards = [
    {
      title: 'Peak Demand',
      value: `${peakDemand.toFixed(1)} kW`,
      subtext: `Occurs at ${peakHour} hrs`,
      badge: peakDemand > 200 ? 'Overload Risk' : 'Within Limits',
      badgeClass:
        peakDemand > 200
          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: Zap,
      iconColor: peakDemand > 200 ? 'text-rose-400' : 'text-cyan-400',
    },
    {
      title: 'Average 24h Load',
      value: `${avgDemand.toFixed(1)} kW`,
      subtext: `Min: ${minDemand.toFixed(1)} kW`,
      badge: 'Aggregated',
      badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
      icon: BarChart2,
      iconColor: 'text-blue-400',
    },
    {
      title: 'Renewable Storage',
      value: `${renewableHours} hrs`,
      subtext: `${((renewableHours / 24) * 100).toFixed(0)}% of daily cycle`,
      badge: 'Clean Energy',
      badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      icon: BatteryCharging,
      iconColor: 'text-cyan-400',
    },
    {
      title: 'Main Grid Feed',
      value: `${mainGridHours} hrs`,
      subtext: 'Base-load utility dispatch',
      badge: 'Utility Feed',
      badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
      icon: Factory,
      iconColor: 'text-slate-400',
    },
    {
      title: 'Carbon Saved (ESG)',
      value: `${co2SavedKg.toFixed(1)} kg`,
      subtext: '0.45 kg CO₂ displaced / kWh',
      badge: 'Eco Metric',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse',
      icon: Leaf,
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-white/20"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
                {card.title}
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${card.badgeClass}`}
              >
                {card.badge}
              </span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-white font-mono">
                {card.value}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
