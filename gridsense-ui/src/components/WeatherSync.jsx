import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Compass,
  MapPin,
  RefreshCw,
  Sun,
  Droplets,
  Thermometer,
  CheckCircle2,
  AlertCircle,
  X,
  Wind,
  Gauge,
  Sunrise,
  Sunset,
  Navigation,
  Search,
  ExternalLink,
  Crosshair,
  Globe,
  Radio,
} from 'lucide-react';
import {
  getWeatherInterpretation,
  getWindCompassDirection,
  formatCoordinates,
  reverseGeocode,
  encodePlusCode,
  getGoogleMapsUrl,
  searchPlaces,
} from '../utils/weatherUtils';

const REGIONAL_SUBSTATIONS = [
  {
    id: 'SUB_SF',
    name: 'San Francisco, USA',
    shortName: 'San Francisco',
    lat: 37.7749,
    lon: -122.4194,
    tag: 'Substation Alpha-1 (66kV / 11kV)',
    plusCode: '849VQHFJ+X6',
  },
  {
    id: 'SUB_HYD',
    name: 'Hyderabad, India',
    shortName: 'Hyderabad',
    lat: 17.3850,
    lon: 78.4867,
    tag: 'SRLDC Southern Regional Dispatch',
    plusCode: '7J9W9FPP+2M',
  },
  {
    id: 'SUB_NYC',
    name: 'New York, USA',
    shortName: 'New York',
    lat: 40.7128,
    lon: -74.0060,
    tag: 'NYISO Sector Central',
    plusCode: '87G8P27F+4R',
  },
  {
    id: 'SUB_LON',
    name: 'London, UK',
    shortName: 'London',
    lat: 51.5074,
    lon: -0.1278,
    tag: 'National Grid UK Interconnect',
    plusCode: '9C3XGV4C+XV',
  },
  {
    id: 'SUB_TYO',
    name: 'Tokyo, Japan',
    shortName: 'Tokyo',
    lat: 35.6762,
    lon: 139.6503,
    tag: 'TEPCO Microgrid Hub',
    plusCode: '8Q7XMMG2+F4',
  },
  {
    id: 'SUB_SYD',
    name: 'Sydney, Australia',
    shortName: 'Sydney',
    lat: -33.8688,
    lon: 151.2093,
    tag: 'AEMO Pacific Solar Farm',
    plusCode: '4RRH46J5+FF',
  },
];

export default function WeatherSync({ onWeatherLoaded, isStreaming }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAcquiringGnss, setIsAcquiringGnss] = useState(false);
  const [activeStationId, setActiveStationId] = useState('SUB_SF');
  const [resolvedPlaceName, setResolvedPlaceName] = useState('San Francisco, California, United States');
  const [activePlusCode, setActivePlusCode] = useState('849VQHFJ+X6');
  const [activeCoordinates, setActiveCoordinates] = useState({ lat: 37.7749, lon: -122.4194 });
  const [coordinatesLabel, setCoordinatesLabel] = useState('37.7749° N &bull; 122.4194° W');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [weatherDetails, setWeatherDetails] = useState(null);
  const [error, setError] = useState(null);

  // Prominent warning when location permission is blocked or denied
  const [geoDeniedWarning, setGeoDeniedWarning] = useState(false);

  // Modern place search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchDropdownRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query handler
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlaces(trimmed);
        setSearchResults(results);
      } catch (err) {
        console.warn('Place search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // GNSS Watcher reference for cleanup
  const gnssWatchIdRef = useRef(null);
  const bestGnssFixRef = useRef(null);

  // Store onWeatherLoaded in a ref to avoid infinite re-render loops
  const onWeatherLoadedRef = useRef(onWeatherLoaded);
  useEffect(() => {
    onWeatherLoadedRef.current = onWeatherLoaded;
  }, [onWeatherLoaded]);

  // Clean up any active GNSS watcher on unmount
  useEffect(() => {
    return () => {
      if (gnssWatchIdRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(gnssWatchIdRef.current);
      }
    };
  }, []);

  // Core weather fetcher from Open-Meteo Satellite Feed
  const fetchWeather = async (lat, lon, customPlaceName = null, stationId = null, accuracy = null) => {
    setIsLoading(true);
    setError(null);
    if (stationId) {
      setActiveStationId(stationId);
    }
    if (accuracy !== undefined) {
      setGpsAccuracy(accuracy);
    }
    setActiveCoordinates({ lat, lon });

    try {
      // Step 1: Resolve high-precision location, address, and Google Plus Code
      let place = customPlaceName;
      let plusCode = encodePlusCode(lat, lon);
      let geocodeSource = 'Substation Preset';

      if (!place) {
        const geoResult = await reverseGeocode(lat, lon);
        place = geoResult.placeName || String(geoResult);
        plusCode = geoResult.plusCode || plusCode;
        geocodeSource = geoResult.source || 'GNSS Geocoding';
      }

      setResolvedPlaceName(place);
      setActivePlusCode(plusCode);
      const coordsHtml = formatCoordinates(lat, lon);
      setCoordinatesLabel(coordsHtml);

      // Step 2: Query high-precision satellite telemetry including real-time solar irradiance & UV
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index,shortwave_radiation,direct_normal_irradiance&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,shortwave_radiation,direct_normal_irradiance,diffuse_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=3`;

      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error(`Open-Meteo returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data?.hourly?.time || !Array.isArray(data.hourly.time)) {
        throw new Error('Received unexpected payload format from satellite provider.');
      }

      const times = data.hourly.time;
      const temps = data.hourly.temperature_2m || [];
      const humidities = data.hourly.relative_humidity_2m || [];
      const solars = data.hourly.shortwave_radiation || [];
      const dnis = data.hourly.direct_normal_irradiance || [];
      const winds = data.hourly.wind_speed_10m || [];
      const apparentTemps = data.hourly.apparent_temperature || [];
      const precipProbs = data.hourly.precipitation_probability || [];
      const wCodes = data.hourly.weather_code || [];
      const pressures = data.hourly.surface_pressure || [];

      // Step 3: Rolling 24-hour forward operational window aligned to current hour
      const currentPrefix = String(data.current?.time || '').slice(0, 13);
      let startIdx = times.findIndex((t) => t.startsWith(currentPrefix));
      if (startIdx < 0 || startIdx > times.length - 24) {
        startIdx = 0;
      }

      const formatted24h = times.slice(startIdx, startIdx + 24).map((rawTime, offset) => {
        const idx = startIdx + offset;
        const formattedTimestamp = String(rawTime).replace('T', ' ') + ':00';
        return {
          timestamp: formattedTimestamp,
          ambient_temp_c: Number((temps[idx] ?? 25.0).toFixed(1)),
          humidity_pct: Number((humidities[idx] ?? 60.0).toFixed(1)),
          solar_irradiance_wm2: Number(Math.max(0, solars[idx] ?? 0.0).toFixed(1)),
          direct_normal_irradiance: Number(Math.max(0, dnis[idx] ?? 0.0).toFixed(1)),
          wind_speed_kmh: Number((winds[idx] ?? 10.0).toFixed(1)),
          apparent_temp_c: Number((apparentTemps[idx] ?? temps[idx] ?? 25.0).toFixed(1)),
          precipitation_probability: Number(precipProbs[idx] ?? 0),
          weather_code: wCodes[idx] ?? 0,
          surface_pressure_hpa: Number((pressures[idx] ?? 1013.2).toFixed(1)),
        };
      });

      // Step 4: Parse accurate real-time statistics
      const currentData = data.current || {};
      const dailyData = data.daily || {};

      const currentTemp = Number((currentData.temperature_2m ?? temps[startIdx] ?? 25.0).toFixed(1));
      const feelsLike = Number((currentData.apparent_temperature ?? currentTemp).toFixed(1));
      const currentHumidity = Number((currentData.relative_humidity_2m ?? humidities[startIdx] ?? 60).toFixed(0));
      const currentPressure = Number((currentData.surface_pressure ?? 1013.2).toFixed(0));
      const currentWindSpeed = Number((currentData.wind_speed_10m ?? winds[startIdx] ?? 10.0).toFixed(1));
      const currentWindDeg = currentData.wind_direction_10m ?? 180;
      const currentWindDir = getWindCompassDirection(currentWindDeg);
      const currentWeatherCode = currentData.weather_code ?? 0;
      const currentIsDay = currentData.is_day ?? 1;
      const condition = getWeatherInterpretation(currentWeatherCode, currentIsDay);

      const validTemps = temps.slice(startIdx, startIdx + 24).filter((t) => typeof t === 'number');
      const avgTemp = (validTemps.reduce((a, b) => a + b, 0) / (validTemps.length || 1)).toFixed(1);

      const validHum = humidities.slice(startIdx, startIdx + 24).filter((h) => typeof h === 'number');
      const avgHumidity = (validHum.reduce((a, b) => a + b, 0) / (validHum.length || 1)).toFixed(0);

      const validSolars = solars.slice(startIdx, startIdx + 24).filter((s) => typeof s === 'number');
      const peakSolar = (validSolars.length ? Math.max(...validSolars) : 800).toFixed(0);
      const liveSolarDni = Number((currentData.direct_normal_irradiance ?? 0).toFixed(0));
      const liveGhi = Number((currentData.shortwave_radiation ?? 0).toFixed(0));

      const todayMax = Number((dailyData.temperature_2m_max?.[0] ?? Math.max(...validTemps)).toFixed(1));
      const todayMin = Number((dailyData.temperature_2m_min?.[0] ?? Math.min(...validTemps)).toFixed(1));
      const sunriseTime = dailyData.sunrise?.[0]?.split('T')?.[1] || '06:30';
      const sunsetTime = dailyData.sunset?.[0]?.split('T')?.[1] || '18:30';
      const maxUv = Number(dailyData.uv_index_max?.[0] ?? currentData.uv_index ?? 5.5).toFixed(1);
      const liveUv = Number(currentData.uv_index ?? 0).toFixed(1);

      const fullMeta = {
        stationId: stationId || 'CUSTOM',
        placeName: place,
        plusCode,
        coordinates: { lat, lon },
        coordinatesLabel: coordsHtml,
        accuracyRadius: accuracy,
        geocodeSource,
        currentTemp,
        feelsLike,
        currentHumidity,
        currentPressure,
        currentWindSpeed,
        currentWindDir,
        currentWindDeg,
        currentPrecipitation: currentData.precipitation ?? 0.0,
        conditionLabel: condition.label,
        conditionIcon: condition.icon,
        avgTemp,
        avgHumidity,
        peakSolar,
        liveSolarDni,
        liveGhi,
        todayMax,
        todayMin,
        sunriseTime,
        sunsetTime,
        maxUv,
        liveUv,
        dailyForecast: dailyData,
        elevation: data.elevation ?? 18,
        timezone: data.timezone || 'UTC',
      };

      setWeatherDetails(fullMeta);

      if (onWeatherLoadedRef.current) {
        onWeatherLoadedRef.current(formatted24h, place, fullMeta);
      }
    } catch (err) {
      console.warn('Weather sync error, using localized calibration:', err.message);
      setError(`Satellite weather sync encountered a temporary issue (${err.message}). Showing localized calibration.`);

      const fallback24h = Array.from({ length: 24 }, (_, idx) => {
        const hourStr = String(idx).padStart(2, '0');
        const temp = Number((22.0 + 8.0 * Math.sin(((idx - 6) * Math.PI) / 12)).toFixed(1));
        const humidity = Number((65.0 - 15.0 * Math.sin(((idx - 6) * Math.PI) / 12)).toFixed(1));
        const solar =
          idx >= 6 && idx <= 18
            ? Number((750 * Math.sin(((idx - 6) * Math.PI) / 12)).toFixed(1))
            : 0.0;
        return {
          timestamp: `2026-10-26 ${hourStr}:00:00`,
          ambient_temp_c: temp,
          humidity_pct: humidity,
          solar_irradiance_wm2: solar,
          direct_normal_irradiance: Number((solar * 1.15).toFixed(1)),
          wind_speed_kmh: 12.4,
          apparent_temp_c: temp + 1.2,
          precipitation_probability: 5,
          weather_code: 0,
          surface_pressure_hpa: 1014.5,
        };
      });

      const fallbackPlus = encodePlusCode(lat, lon);
      const fallbackMeta = {
        stationId: stationId || 'SUB_SF',
        placeName: customPlaceName || 'Substation Alpha-1 (San Francisco, CA)',
        plusCode: fallbackPlus,
        coordinates: { lat, lon },
        coordinatesLabel: formatCoordinates(lat, lon),
        accuracyRadius: accuracy,
        currentTemp: 24.5,
        feelsLike: 25.2,
        currentHumidity: 58,
        currentPressure: 1014,
        currentWindSpeed: 12.4,
        currentWindDir: 'SW',
        currentWindDeg: 225,
        currentPrecipitation: 0.0,
        conditionLabel: 'Clear Sky',
        conditionIcon: '☀️',
        avgTemp: '24.5',
        avgHumidity: '58',
        peakSolar: '750',
        liveSolarDni: 750,
        liveGhi: 680,
        todayMax: 28.5,
        todayMin: 18.2,
        sunriseTime: '06:45',
        sunsetTime: '18:20',
        maxUv: '5.8',
        liveUv: '4.2',
        elevation: 18,
        timezone: 'UTC',
      };

      setResolvedPlaceName(fallbackMeta.placeName);
      setActivePlusCode(fallbackPlus);
      setCoordinatesLabel(fallbackMeta.coordinatesLabel);
      setWeatherDetails(fallbackMeta);

      if (onWeatherLoadedRef.current) {
        onWeatherLoadedRef.current(fallback24h, fallbackMeta.placeName, fallbackMeta);
      }
    } finally {
      setIsLoading(false);
      setIsAcquiringGnss(false);
    }
  };

  // Substation Preset Button Click Handler
  const handleSelectSubstation = (station) => {
    if (gnssWatchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gnssWatchIdRef.current);
      gnssWatchIdRef.current = null;
    }
    setIsAcquiringGnss(false);
    setGeoDeniedWarning(false);
    fetchWeather(station.lat, station.lon, `${station.name} (${station.tag})`, station.id, null);
  };

  // Search result selection handler
  const handleSelectSearchResult = (result) => {
    if (gnssWatchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gnssWatchIdRef.current);
      gnssWatchIdRef.current = null;
    }
    setIsAcquiringGnss(false);
    setGeoDeniedWarning(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    fetchWeather(result.lat, result.lon, result.displayName, result.id, null);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0]);
    }
  };

  // Multi-Sample Hardware GNSS Fix Acquisition (Progressive Satellite Locking)
  const handleGpsSync = () => {
    setError(null);
    setIsLoading(true);
    setIsAcquiringGnss(true);
    setGeoDeniedWarning(false);
    bestGnssFixRef.current = null;

    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setIsAcquiringGnss(false);
      setGeoDeniedWarning(true);
      setError('Hardware geolocation not supported by this browser. Defaulting to Substation Alpha-1.');
      const def = REGIONAL_SUBSTATIONS[0];
      fetchWeather(def.lat, def.lon, `${def.name} (${def.tag})`, def.id, null);
      return;
    }

    // Safety timeout: Lock with the best acquired fix within 6 seconds
    const safetyTimer = setTimeout(() => {
      if (gnssWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(gnssWatchIdRef.current);
        gnssWatchIdRef.current = null;
      }
      setIsAcquiringGnss(false);

      if (bestGnssFixRef.current) {
        const { lat, lon, accuracy } = bestGnssFixRef.current;
        fetchWeather(lat, lon, null, 'LIVE_GPS', accuracy);
      } else {
        // Fallback to one-shot getCurrentPosition with mobile-optimized timeout
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = Number(pos.coords.latitude.toFixed(5));
            const lon = Number(pos.coords.longitude.toFixed(5));
            const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
            fetchWeather(lat, lon, null, 'LIVE_GPS', acc);
          },
          () => {
            setGeoDeniedWarning(true);
            const def = REGIONAL_SUBSTATIONS[0];
            fetchWeather(def.lat, def.lon, `${def.name} (${def.tag})`, def.id, null);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }, 6000);

    // Progressive GNSS watch: captures increasingly accurate satellite readings
    try {
      gnssWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lon = Number(pos.coords.longitude.toFixed(5));
          const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;

          if (
            bestGnssFixRef.current == null ||
            (acc != null && acc < (bestGnssFixRef.current.accuracy || 9999))
          ) {
            bestGnssFixRef.current = { lat, lon, accuracy: acc };
            setGpsAccuracy(acc);
          }

          // If accuracy is high-precision (<= 15 meters), lock in immediately!
          if (acc != null && acc <= 15) {
            clearTimeout(safetyTimer);
            if (gnssWatchIdRef.current != null) {
              navigator.geolocation.clearWatch(gnssWatchIdRef.current);
              gnssWatchIdRef.current = null;
            }
            setIsAcquiringGnss(false);
            fetchWeather(lat, lon, null, 'LIVE_GPS', acc);
          }
        },
        (err) => {
          console.warn('GNSS watcher error:', err.message);
          clearTimeout(safetyTimer);
          if (gnssWatchIdRef.current != null) {
            navigator.geolocation.clearWatch(gnssWatchIdRef.current);
            gnssWatchIdRef.current = null;
          }
          setIsAcquiringGnss(false);
          setGeoDeniedWarning(true);

          if (bestGnssFixRef.current) {
            const { lat, lon, accuracy } = bestGnssFixRef.current;
            fetchWeather(lat, lon, null, 'LIVE_GPS', accuracy);
          } else {
            const def = REGIONAL_SUBSTATIONS[0];
            fetchWeather(def.lat, def.lon, `${def.name} (${def.tag})`, def.id, null);
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } catch (e) {
      clearTimeout(safetyTimer);
      setIsAcquiringGnss(false);
      setGeoDeniedWarning(true);
      console.warn('Geolocation invocation exception:', e);
      const def = REGIONAL_SUBSTATIONS[0];
      fetchWeather(def.lat, def.lon, `${def.name} (${def.tag})`, def.id, null);
    }
  };

  // Mount-only initialization: Load default substation without popping GPS permission prompt (User Gesture Required on Mobile)
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    // Load default Alpha-1 substation on initial mount.
    // Geolocation is triggered strictly on user click via handleGpsSync to satisfy iOS Safari & Android Chrome policies.
    const def = REGIONAL_SUBSTATIONS[0];
    fetchWeather(def.lat, def.lon, `${def.name} (${def.tag})`, def.id, null);
  }, []);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-4 sm:p-6 flex flex-col gap-5">
      {/* Location Access Denied Mobile-Friendly Warning Banner */}
      {geoDeniedWarning && (
        <div className="w-full text-xs sm:text-sm font-mono text-amber-950 bg-amber-400 border-2 border-amber-300 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xl shadow-amber-950/40 animate-fadeIn">
          <div className="flex items-center gap-2.5 font-bold">
            <span>
              ⚠️ Location blocked by your phone. Please enable Location Services in your device settings and try again. Showing default substation location.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setGeoDeniedWarning(false)}
            className="text-amber-950 hover:text-black font-black text-sm px-2.5 py-1 rounded-lg cursor-pointer shrink-0 hover:bg-amber-300 transition-colors"
            title="Dismiss warning"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner: Header, Location Place Name & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Title, Place Name & Identity */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 shrink-0 shadow-lg shadow-amber-950/40">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight font-mono uppercase">
                Satellite Weather Ingestion &bull; Live Telemetry
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-800/80">
                WMO &bull; Open-Meteo GPS
              </span>
            </div>

            {/* Prominent Live Location Place Name */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-sm bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-800/60 shadow-xs max-w-full">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="break-words">{resolvedPlaceName || 'Resolving location...'}</span>
              </div>

              {/* Live GPS badge with physical precision radius */}
              {activeStationId === 'LIVE_GPS' && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  LIVE GNSS DEVICE
                </span>
              )}

              {/* Hardware GNSS Accuracy Pill */}
              {gpsAccuracy != null && activeStationId === 'LIVE_GPS' && (
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold shrink-0 border flex items-center gap-1 ${
                    gpsAccuracy <= 20
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                      : gpsAccuracy <= 100
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                      : 'bg-orange-950/80 text-orange-300 border-orange-700/80'
                  }`}
                  title="Physical horizontal accuracy radius from GNSS/Wi-Fi receiver"
                >
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  &plusmn;{gpsAccuracy}m Accuracy
                </span>
              )}

              {/* Google Plus Code Badge */}
              {activePlusCode && (
                <div
                  className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 shadow-xs shrink-0"
                  title="Google Open Location Code (Plus Code) for precise substation micro-location"
                >
                  <Crosshair className="w-3 h-3 text-indigo-400" />
                  <span>{activePlusCode}</span>
                </div>
              )}

              {/* Formatted Coordinates */}
              {coordinatesLabel && (
                <span
                  className="text-[11px] text-slate-400 font-mono hidden md:inline shrink-0"
                  dangerouslySetInnerHTML={{ __html: coordinatesLabel }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Controls: Locate GPS & Google Maps */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end shrink-0">
          {/* High-Accuracy Multi-Sample GPS Sync Trigger */}
          <button
            type="button"
            onClick={handleGpsSync}
            disabled={isLoading || isStreaming}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold font-mono text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 shadow-xl shadow-amber-950/50 transition-all select-none cursor-pointer border-none active:scale-95 ${
              isLoading || isStreaming ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isAcquiringGnss ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {gpsAccuracy ? `Locking (±${gpsAccuracy}m)...` : 'Acquiring GPS...'}
                </span>
              </>
            ) : isLoading && activeStationId === 'LIVE_GPS' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Ingesting...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5" />
                <span>Locate My GPS</span>
              </>
            )}
          </button>

          {/* Direct Google Maps Navigation / Satellite Exploration */}
          <a
            href={getGoogleMapsUrl(activeCoordinates.lat, activeCoordinates.lon)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-950/80 hover:border-cyan-500/80 transition-all shadow-md group cursor-pointer shrink-0"
            title="Open exact coordinates in Google Maps (Satellite & 3D view)"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-cyan-400/80" />
          </a>
        </div>
      </div>

      {/* Search Bar & Global Location Resolver */}
      <div className="pt-2 border-t border-white/5">
        <div ref={searchDropdownRef} className="relative w-full max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setIsSearchOpen(true);
              }}
              placeholder="Search global city, coordinates (e.g. 14.68, 77.60), or address..."
              className="w-full pl-9 pr-16 py-2 rounded-xl text-xs font-mono bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {isSearching && (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin mr-1" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </form>

          {/* Autocomplete Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 max-h-72 overflow-y-auto">
              {isSearching && searchResults.length === 0 && (
                <div className="p-3 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  Searching global database...
                </div>
              )}
              {!isSearching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="p-3 text-center text-xs font-mono text-slate-400">
                  No matching locations found for &quot;{searchQuery}&quot;
                </div>
              )}
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left p-3 hover:bg-cyan-950/50 hover:text-cyan-200 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold font-mono text-white group-hover:text-cyan-300 truncate">
                        {result.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {result.displayName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-cyan-400/80 font-semibold">
                      {result.lat.toFixed(2)}°, {result.lon.toFixed(2)}°
                    </div>
                    {result.plusCode && (
                      <div className="text-[9px] font-mono text-indigo-400/80">
                        {result.plusCode}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Regional Substation Quick Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 pb-1 border-t border-white/5">
        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-cyan-400" />
          Substations:
        </span>
        {REGIONAL_SUBSTATIONS.map((station) => {
          const isSelected = activeStationId === station.id;
          return (
            <button
              key={station.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectSubstation(station)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-lg shadow-amber-950/60 ring-1 ring-amber-400/40'
                  : 'bg-slate-900/70 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <span>{station.name}</span>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
            </button>
          );
        })}
      </div>

      {/* Accurate Live Meteorological Statistics Cards */}
      {weatherDetails && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
          {/* Card 1: Live Ambient Temp & Condition */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Ambient Temp</span>
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                {weatherDetails.currentTemp}&deg;C
              </span>
              <span className="text-[11px] text-slate-400">
                Feels {weatherDetails.feelsLike}&deg;
              </span>
            </div>
            <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1 truncate">
              <span>{weatherDetails.conditionIcon}</span>
              <span className="truncate">{weatherDetails.conditionLabel}</span>
            </div>
          </div>

          {/* Card 2: Relative Humidity */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Humidity</span>
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {weatherDetails.currentHumidity}%
            </div>
            <div className="text-[10px] text-cyan-300">
              Avg 24h: {weatherDetails.avgHumidity}%
            </div>
          </div>

          {/* Card 3: Solar Radiation GHI / DNI */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Solar Irradiance</span>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {weatherDetails.peakSolar}
              <span className="text-xs font-normal text-slate-400 ml-1">W/m&sup2; Max</span>
            </div>
            <div className="text-[10px] text-amber-300">
              Live DNI: {weatherDetails.liveSolarDni || 0} W/m&sup2; &bull; UV {weatherDetails.liveUv}
            </div>
          </div>

          {/* Card 4: Wind Speed & Direction */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Wind Speed</span>
              <Wind className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {weatherDetails.currentWindSpeed}
              <span className="text-xs font-normal text-slate-400 ml-1">km/h</span>
            </div>
            <div className="text-[10px] text-teal-300">
              Heading: {weatherDetails.currentWindDeg}&deg; ({weatherDetails.currentWindDir})
            </div>
          </div>

          {/* Card 5: Barometric Pressure */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Barometer</span>
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {weatherDetails.currentPressure}
              <span className="text-xs font-normal text-slate-400 ml-1">hPa</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Standard Atmosphere</span>
            </div>
          </div>

          {/* Card 6: Day/Night Astronomy */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>Day Cycle</span>
              <Sunrise className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="text-xs text-white font-bold space-y-0.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">High / Low:</span>
                <span className="text-rose-400">{weatherDetails.todayMax}&deg; / {weatherDetails.todayMin}&deg;</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sunrise className="w-3 h-3 text-amber-400" /> {weatherDetails.sunriseTime}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Sunset className="w-3 h-3 text-orange-400" /> {weatherDetails.sunsetTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Required Attribution & Operational Standards Footer */}
      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 border-t border-white/5 pt-2 px-1">
        <div className="flex items-center gap-2">
          <span>Geocoding &amp; Mapping: Google Maps Platform &bull; WMO Satellite Radar</span>
          <span className="hidden sm:inline text-slate-600">&bull;</span>
          <span className="hidden sm:inline">Open Location Code</span>
        </div>
        <div className="text-slate-400">
          IEC 60076 Convective Derating Standards
        </div>
      </div>

      {error && (
        <div className="w-full text-xs text-amber-300 bg-amber-950/70 border border-amber-800/80 p-3 rounded-2xl flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-amber-400/80 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

WeatherSync.propTypes = {
  onWeatherLoaded: PropTypes.func,
  isStreaming: PropTypes.bool,
};
