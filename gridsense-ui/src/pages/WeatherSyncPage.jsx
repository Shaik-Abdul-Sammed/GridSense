import { useState } from 'react';
import WeatherSync from '../components/WeatherSync';
import { CloudSun, Satellite } from 'lucide-react';

export default function WeatherSyncPage() {
  const [syncedData, setSyncedData] = useState([]);
  const [sourceLabel, setSourceLabel] = useState(null);

  const handleWeatherLoaded = (data, label) => {
    setSyncedData(data);
    setSourceLabel(label);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl shadow-xl shadow-amber-500/20 text-white">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight font-mono uppercase">
                Satellite Weather Ingestion
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                Open-Meteo GPS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synchronizes real-time latitude/longitude weather metrics, ambient temperature, humidity, and solar DNI into the forecast engine.
            </p>
          </div>
        </div>
      </div>

      <WeatherSync onWeatherLoaded={handleWeatherLoaded} isStreaming={false} />

      {syncedData.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-bold text-white flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span>Synced 24h Hourly Telemetry ({sourceLabel})</span>
            </span>
            <span className="text-emerald-400 font-bold">{syncedData.length} Intervals</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {syncedData.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
                <div className="text-slate-400 font-bold">{item.timestamp.split(' ')[1]?.slice(0, 5)}</div>
                <div className="text-amber-300 font-bold">{item.ambient_temp_c}°C</div>
                <div className="text-cyan-400 text-[10px]">💧 {item.humidity_pct}%</div>
                <div className="text-yellow-400 text-[10px]">☀️ {item.solar_irradiance_wm2} W/m²</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
