
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

  const cards = [
    {
      title: 'Peak Demand',
      value: `${peakDemand.toFixed(1)} kW`,
      subtext: `Occurs at ${peakHour} hrs`,
      badge: peakDemand > 200 ? 'Overload Risk' : 'Within Limits',
      badgeClass:
        peakDemand > 200
          ? 'bg-red-500/20 text-red-400 border-red-500/30'
          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      iconColor: peakDemand > 200 ? 'text-red-400' : 'text-cyan-400',
    },
    {
      title: 'Average 24h Load',
      value: `${avgDemand.toFixed(1)} kW`,
      subtext: `Min: ${minDemand.toFixed(1)} kW`,
      badge: 'Aggregated',
      badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Renewable Storage Mode',
      value: `${renewableHours} hrs`,
      subtext: `${((renewableHours / 24) * 100).toFixed(0)}% of daily cycle`,
      badge: 'Clean Energy',
      badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Main Grid Mode',
      value: `${mainGridHours} hrs`,
      subtext: 'Base-load utility dispatch',
      badge: 'Utility Feed',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {card.title}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${card.badgeClass}`}
            >
              {card.badge}
            </span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white font-mono">
              {card.value}
            </span>
            <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
