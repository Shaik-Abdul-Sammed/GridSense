import { useState } from 'react';
import {
  Compass,
  MapPin,
  RefreshCw,
  Sun,
  Droplets,
  Thermometer,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function WeatherSync({ onWeatherLoaded, isStreaming }) {
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState(null);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [error, setError] = useState(null);

  // Fetch from Open-Meteo API
  const fetchOpenMeteo = async (lat, lon, label) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,shortwave_radiation&forecast_days=1`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.hourly || !data.hourly.time) {
        throw new Error('Malformed hourly payload from Open-Meteo.');
      }

      const times = data.hourly.time;
      const temps = data.hourly.temperature_2m;
      const humidities = data.hourly.relative_humidity_2m;
      const solars = data.hourly.shortwave_radiation;

      const formatted24h = times.slice(0, 24).map((rawTime, idx) => {
        // rawTime is formatted as "YYYY-MM-DDTHH:00"
        const formattedTimestamp = rawTime.replace('T', ' ') + ':00';
        return {
          timestamp: formattedTimestamp,
          ambient_temp_c: Number((temps[idx] ?? 25.0).toFixed(1)),
          humidity_pct: Number((humidities[idx] ?? 60.0).toFixed(1)),
          solar_irradiance_wm2: Number(Math.max(0, solars[idx] ?? 0.0).toFixed(1)),
        };
      });

      setLocationName(label);
      const avgTemp = (temps.slice(0, 24).reduce((a, b) => a + b, 0) / 24).toFixed(1);
      const avgHumidity = (humidities.slice(0, 24).reduce((a, b) => a + b, 0) / 24).toFixed(0);
      const peakSolar = Math.max(...solars.slice(0, 24)).toFixed(0);

      setWeatherSummary({
        count: formatted24h.length,
        avgTemp,
        avgHumidity,
        peakSolar,
      });

      if (onWeatherLoaded) {
        onWeatherLoaded(formatted24h, `Live Open-Meteo (${label})`);
      }
    } catch (err) {
      console.warn('Open-Meteo fetch failed:', err);
      setError(`Failed to retrieve live weather: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync using navigator.geolocation
  const handleGpsSync = () => {
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using Regional Fallback.');
      fetchOpenMeteo(37.77, -122.42, 'San Francisco, CA');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coordsLabel = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;
        fetchOpenMeteo(latitude, longitude, coordsLabel);
      },
      (err) => {
        console.warn('Geolocation permission error:', err);
        // Fallback default coordinates (San Francisco tech hub)
        setError('Location permission denied or unavailable. Fallback to Substation SF.');
        fetchOpenMeteo(37.77, -122.42, 'Substation SF (37.77°N, -122.42°W)');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Title & Info */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Live Location Weather Ingestion</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
              Open-Meteo API
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-0.5">
            Synchronizes real-time ambient temperature, humidity, and solar DNI into the forecast pipeline.
          </p>

          {locationName && weatherSummary && (
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {locationName}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-400" />
                Avg: {weatherSummary.avgTemp}°C
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" />
                Humidity: {weatherSummary.avgHumidity}%
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                Peak Solar: {weatherSummary.peakSolar} W/m²
              </span>
              <span className="text-cyan-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                24h Synced
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        <button
          type="button"
          onClick={handleGpsSync}
          disabled={isLoading || isStreaming}
          className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 shadow-xl shadow-amber-950/60 transition-all select-none cursor-pointer border border-amber-400/30 active:scale-95 ${
            isLoading || isStreaming ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Contacting Satellites...</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>Sync Local Weather via GPS</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="w-full text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 p-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
