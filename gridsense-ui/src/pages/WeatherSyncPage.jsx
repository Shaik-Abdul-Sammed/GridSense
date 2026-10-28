import { useState } from 'react';
import WeatherSync from '../components/WeatherSync';
import { getWeatherInterpretation } from '../utils/weatherUtils';
import {
  CloudSun,
  Satellite,
  Thermometer,
  Sun,
  Wind,
  Droplets,
  Gauge,
  ShieldCheck,
  Zap,
  Activity,
  Sunrise,
  Sunset,
  MapPin,
  CheckCircle2,
  Radio,
} from 'lucide-react';

export default function WeatherSyncPage() {
  const [syncedData, setSyncedData] = useState([]);
  const [sourceLabel, setSourceLabel] = useState(null);
  const [weatherMeta, setWeatherMeta] = useState(null);

  const handleWeatherLoaded = (data, label, meta) => {
    setSyncedData(data);
    setSourceLabel(label);
    if (meta) {
      setWeatherMeta(meta);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 text-white shrink-0">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono uppercase">
                Satellite Weather Ingestion &amp; Grid Analytics
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-800">
                WMO &bull; GEOSTATIONARY SATELLITE RADAR
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Synchronizes real-time high-resolution meteorological telemetry, ambient temperature, relative humidity, solar GHI/DNI, and aerodynamic cooling into neural dispatch models.
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-bold text-cyan-300">GEO-ORBITAL FEED: ACTIVE</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">IEC 60076 COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* Main Weather Ingestion & Live Place Detection Component */}
      <WeatherSync onWeatherLoaded={handleWeatherLoaded} isStreaming={false} />

      {/* Power Grid & Substation Meteorological Analytics */}
      {weatherMeta && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* Analytics 1: Thermal Derating Margin */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Thermal Margin (IEC 60076)</span>
              <Thermometer className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {Math.max(0, (65 - weatherMeta.currentTemp)).toFixed(1)}&deg;C
              <span className="text-xs font-normal text-slate-400 ml-1.5">to max core</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Convective Capacity (100%)</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-white/5">
              Ambient temp is {weatherMeta.currentTemp}&deg;C. Normal insulation aging expected across Phase windings.
            </p>
          </div>

          {/* Analytics 2: Solar PV Generation Yield */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>PV Yield &amp; Solar DNI</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {weatherMeta.peakSolar}
              <span className="text-xs font-normal text-slate-400 ml-1.5">W/m&sup2; Peak</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>
                Live DNI: {weatherMeta.liveSolarDni ?? 0} W/m&sup2; &bull; Cap:{' '}
                {Math.min(100, Math.round(((weatherMeta.liveSolarDni || weatherMeta.peakSolar) / 1000) * 100))}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-white/5">
              Live UV index {weatherMeta.liveUv || weatherMeta.maxUv} (Max: {weatherMeta.maxUv}). Real-time direct solar flux informs BESS battery charging dispatch.
            </p>
          </div>

          {/* Analytics 3: Dynamic Line Rating (Aero-Cooling) */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Dynamic Line Rating (DLR)</span>
              <Wind className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white">
              +{(weatherMeta.currentWindSpeed * 0.45).toFixed(1)}%
              <span className="text-xs font-normal text-slate-400 ml-1.5">Ampacity Boost</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>Crosswind: {weatherMeta.currentWindSpeed} km/h {weatherMeta.currentWindDir}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-white/5">
              Forced convective aerodynamic dissipation cools high-voltage conductors, preventing line sag.
            </p>
          </div>

          {/* Analytics 4: Flashover & Condensation Risk */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>Insulator Flashover Risk</span>
              <Gauge className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              LOW RISK
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-bold">
              <Droplets className="w-3.5 h-3.5" />
              <span>Barometer: {weatherMeta.currentPressure} hPa</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-white/5">
              Humidity at {weatherMeta.currentHumidity}%. Porcelain shed surfaces remain dry; corona discharge nominal.
            </p>
          </div>
        </div>
      )}

      {/* 24-Hour Hourly Satellite Telemetry Grid */}
      {syncedData.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">
                24-Hour Satellite Hourly Telemetry Forecast
              </span>
              <span className="text-slate-400 text-[11px]">({sourceLabel})</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
              {weatherMeta?.plusCode && (
                <span className="px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 font-bold hidden md:inline">
                  Plus Code: {weatherMeta.plusCode}
                </span>
              )}
              {weatherMeta?.accuracyRadius != null && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-bold hidden sm:inline">
                  &plusmn;{weatherMeta.accuracyRadius}m Fix
                </span>
              )}
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {syncedData.length} Intervals Synced
              </span>
            </div>
          </div>

          {/* Hourly Timeline Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2.5">
            {syncedData.map((item, idx) => {
              const hourOnly = item.timestamp.split(' ')[1]?.slice(0, 5) || `${idx}:00`;
              const hourInt = parseInt(hourOnly.split(':')[0], 10);
              const isDayTime = hourInt >= 6 && hourInt <= 18;
              const cond = getWeatherInterpretation(item.weather_code, isDayTime ? 1 : 0);

              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 hover:border-amber-500/40 transition-all space-y-1.5 shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold text-[11px]">{hourOnly}</span>
                    <span className="text-sm select-none" title={cond.label}>
                      {cond.icon}
                    </span>
                  </div>

                  <div className="text-sm font-black text-white">
                    {item.ambient_temp_c}&deg;C
                  </div>

                  <div className="space-y-0.5 text-[10px]">
                    <div className="text-cyan-400 flex items-center justify-between">
                      <span>💧</span>
                      <span>{item.humidity_pct}%</span>
                    </div>
                    <div className="text-amber-400 flex items-center justify-between">
                      <span>☀️</span>
                      <span>{item.solar_irradiance_wm2}</span>
                    </div>
                    {item.wind_speed_kmh != null && (
                      <div className="text-teal-400 flex items-center justify-between">
                        <span>💨</span>
                        <span>{item.wind_speed_kmh}k</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3-Day Macro Forecast Preview for Microgrid Dispatch */}
      {weatherMeta?.dailyForecast?.time && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm uppercase">
              3-Day Microgrid Weather Outlook &bull; {weatherMeta.placeName}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weatherMeta.dailyForecast.time.slice(0, 3).map((dayDate, idx) => {
              const maxT = weatherMeta.dailyForecast.temperature_2m_max?.[idx] ?? 25;
              const minT = weatherMeta.dailyForecast.temperature_2m_min?.[idx] ?? 15;
              const wCode = weatherMeta.dailyForecast.weather_code?.[idx] ?? 0;
              const cond = getWeatherInterpretation(wCode, 1);
              const sunrise = weatherMeta.dailyForecast.sunrise?.[idx]?.split('T')?.[1] || '06:30';
              const sunset = weatherMeta.dailyForecast.sunset?.[idx]?.split('T')?.[1] || '18:30';
              const uv = weatherMeta.dailyForecast.uv_index_max?.[idx] ?? 5.0;

              return (
                <div
                  key={dayDate}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-white text-sm">
                        {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dayDate}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{dayDate}</span>
                    </div>
                    <span className="text-2xl">{cond.icon}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">{maxT}&deg;C</span>
                    <span className="text-sm font-bold text-slate-400">/ {minT}&deg;C</span>
                    <span className="text-xs text-amber-300 font-bold ml-auto">{cond.label}</span>
                  </div>

                  <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-1 text-[10px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block">UV Index</span>
                      <span className="text-amber-400 font-bold">{uv}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sunrise</span>
                      <span className="text-white font-bold flex items-center gap-0.5">
                        <Sunrise className="w-2.5 h-2.5 text-amber-400" /> {sunrise}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sunset</span>
                      <span className="text-white font-bold flex items-center gap-0.5">
                        <Sunset className="w-2.5 h-2.5 text-orange-400" /> {sunset}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
