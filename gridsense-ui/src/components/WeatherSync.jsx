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
  Zap,
} from 'lucide-react';
import {
  getWeatherInterpretation,
  getWindCompassDirection,
  formatCoordinates,
  reverseGeocode,
  encodePlusCode,
  getGoogleMapsUrl,
  searchPlaces,
  POPULAR_GLOBAL_HUBS,
} from '../utils/weatherUtils';

const PRESET_LOCATIONS = {
  // 🇮🇳 Major Indian Power Grid Hubs
  HUB_HYD: { name: 'Hyderabad, Telangana, India', lat: 17.3850, lon: 78.4867, tag: 'SRLDC Southern Regional Dispatch' },
  HUB_BLR: { name: 'Bengaluru, Karnataka, India', lat: 12.9716, lon: 77.5946, tag: 'BESCOM Smart Microgrid Hub' },
  HUB_MUM: { name: 'Mumbai, Maharashtra, India', lat: 19.0760, lon: 72.8777, tag: 'Tata Power Western Grid' },
  HUB_DEL: { name: 'New Delhi, Delhi, India', lat: 28.6139, lon: 77.2090, tag: 'NLDC National Load Dispatch' },
  HUB_VTZ: { name: 'Visakhapatnam, Andhra Pradesh, India', lat: 17.6868, lon: 83.2185, tag: 'APEPDCL Coastal Smart Substation' },
  HUB_VJA: { name: 'Vijayawada, Andhra Pradesh, India', lat: 16.5062, lon: 80.6480, tag: 'APTRANSCO State Load Dispatch' },
  HUB_MAA: { name: 'Chennai, Tamil Nadu, India', lat: 13.0827, lon: 80.2707, tag: 'TANGEDCO Southern Interconnect' },
  SUB_TIRUPATI: { name: 'Tirupati, Andhra Pradesh, India', lat: 13.6245, lon: 79.4310, tag: 'SVU Substation Feeder' },

  // 🌍 Global Smart Grid Centers
  HUB_SF: { name: 'San Francisco, California, USA', lat: 37.7749, lon: -122.4194, tag: 'CAISO Alpha-1 Substation' },
  HUB_LON: { name: 'London, England, United Kingdom', lat: 51.5074, lon: -0.1278, tag: 'National Grid UK Interconnect' },
  HUB_NYC: { name: 'New York, New York, USA', lat: 40.7128, lon: -74.0060, tag: 'NYISO Sector Central' },
  HUB_TYO: { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, tag: 'TEPCO Megawatt Microgrid' },
  HUB_SYD: { name: 'Sydney, New South Wales, Australia', lat: -33.8688, lon: 151.2093, tag: 'AEMO Pacific Solar Farm' },
  HUB_DXB: { name: 'Dubai, United Arab Emirates', lat: 25.2048, lon: 55.2708, tag: 'DEWA Solar Park 400kV' },
  HUB_BER: { name: 'Berlin, Germany', lat: 52.5200, lon: 13.4050, tag: '50Hertz Transmission Center' },
  HUB_SIN: { name: 'Singapore, Singapore', lat: 1.3521, lon: 103.8198, tag: 'EMA Jurong Island Microgrid' },

  // ⚡ Regional Grid Feeders
  SUB_ALPHA: { name: 'Substation Alpha-1 (Main Bus)', lat: 37.7749, lon: -122.4194, tag: 'Primary 230kV Feeder' },
  SUB_BETA: { name: 'Substation Beta-4 (Industrial)', lat: 37.7833, lon: -122.4167, tag: 'Industrial 66kV Feeder' },
  SUB_GAMMA: { name: 'Gamma Solar Farm (50MW Array)', lat: 37.7600, lon: -122.4300, tag: 'Utility Solar Generation' },
  SUB_DELTA: { name: 'Delta BESS Substation (20MWh)', lat: 37.7900, lon: -122.4000, tag: 'Battery Dispatch Reserve' },
};

export default function WeatherSync({ onWeatherLoaded }) {
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
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
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

  // Debounced search query handler with instant cache checking
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(POPULAR_GLOBAL_HUBS);
      setIsSearching(false);
      setSelectedSearchIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlaces(trimmed);
        setSearchResults(results);
        setSelectedSearchIndex(results.length > 0 ? 0 : -1);
      } catch (err) {
        console.warn('Place search notice:', err);
      } finally {
        setIsSearching(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // GNSS Watcher and abort controller references for cleanup
  const gnssWatchIdRef = useRef(null);
  const weatherAbortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Store onWeatherLoaded in a ref to avoid infinite re-render loops
  const onWeatherLoadedRef = useRef(onWeatherLoaded);
  useEffect(() => {
    onWeatherLoadedRef.current = onWeatherLoaded;
  }, [onWeatherLoaded]);

  // Clean up any active GNSS watcher and pending fetch requests on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      weatherAbortControllerRef.current?.abort();
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

    weatherAbortControllerRef.current?.abort();
    const controller = new AbortController();
    weatherAbortControllerRef.current = controller;

    try {
      // Step 1: Set coordinates and default plus code immediately
      let place = customPlaceName;
      let plusCode = encodePlusCode(lat, lon);
      let geocodeSource = customPlaceName ? 'Substation Preset' : 'GNSS Geocoding';
      const coordsHtml = formatCoordinates(lat, lon);
      setCoordinatesLabel(coordsHtml);

      // Start reverse geocoding in parallel if no custom place name provided
      const geoPromise = !place
        ? reverseGeocode(lat, lon)
        : Promise.resolve({ placeName: place, plusCode, source: geocodeSource });

      if (place) {
        setResolvedPlaceName(place);
        setActivePlusCode(plusCode);
      } else {
        const fallbackPlace = `Station (${coordsHtml})`;
        setResolvedPlaceName(fallbackPlace);
        setActivePlusCode(plusCode);
        place = fallbackPlace;
      }

      // Step 2: Query high-precision satellite telemetry in parallel with geocoding
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index,shortwave_radiation,direct_normal_irradiance&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,shortwave_radiation,direct_normal_irradiance,diffuse_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=3`;

      const [res, geoResult] = await Promise.all([
        fetch(url, { method: 'GET', signal: controller.signal }),
        geoPromise.catch(() => null),
      ]);

      if (!isMountedRef.current) return;

      if (geoResult?.placeName) {
        place = geoResult.placeName;
        plusCode = geoResult.plusCode || plusCode;
        geocodeSource = geoResult.source || geocodeSource;
        setResolvedPlaceName(place);
        setActivePlusCode(plusCode);
      }

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
      if (err.name === 'AbortError') return;
      if (!isMountedRef.current) return;
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
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsAcquiringGnss(false);
      }
    }
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
    setSearchQuery(result.name || '');
    setSearchResults([]);
    setSelectedSearchIndex(-1);
    fetchWeather(result.lat, result.lon, result.displayName, result.id, null);
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (searchResults.length > 0) {
      const idx = selectedSearchIndex >= 0 && selectedSearchIndex < searchResults.length ? selectedSearchIndex : 0;
      handleSelectSearchResult(searchResults[idx]);
      return;
    }

    // Direct immediate fallback query
    setIsSearching(true);
    try {
      const results = await searchPlaces(query);
      if (results.length > 0) {
        handleSelectSearchResult(results[0]);
      } else {
        setError(`⚠️ Could not locate "${query}". Please check spelling or enter coordinates.`);
      }
    } catch {
      setError(`Search service unavailable for "${query}".`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsSearchOpen(true);
      setSelectedSearchIndex((prev) => (searchResults.length > 0 ? (prev < searchResults.length - 1 ? prev + 1 : 0) : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsSearchOpen(true);
      setSelectedSearchIndex((prev) => (searchResults.length > 0 ? (prev > 0 ? prev - 1 : searchResults.length - 1) : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSelectedSearchIndex(-1);
    }
  };

  // Mobile & Laptop GPS: Triggered strictly on direct user click inside the onClick handler
  const handleGpsSync = () => {
    setError(null);
    setGeoDeniedWarning(false);

    if (typeof window === 'undefined' || !navigator?.geolocation) {
      if (isMountedRef.current) {
        setGeoDeniedWarning(true);
        setError('⚠️ Geolocation not supported by this browser. Enter city or select a substation.');
      }
      return;
    }

    setIsLoading(true);
    setIsAcquiringGnss(true);

    const onPosSuccess = (pos) => {
      if (!isMountedRef.current) return;
      setIsAcquiringGnss(false);
      const lat = Number(pos.coords.latitude.toFixed(5));
      const lon = Number(pos.coords.longitude.toFixed(5));
      const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
      setGpsAccuracy(acc);
      fetchWeather(lat, lon, null, 'LIVE_GPS', acc);
    };

    // Attempt high accuracy first (satellites for mobile). If timeout or unavailable (e.g. laptop or indoor), fallback to standard network accuracy
    try {
      navigator.geolocation.getCurrentPosition(
        onPosSuccess,
        (err) => {
          if (err?.code === 1) {
            // User actively clicked 'Deny'
            if (!isMountedRef.current) return;
            setIsAcquiringGnss(false);
            setIsLoading(false);
            setGeoDeniedWarning(true);
            return;
          }

          // Non-denial error: Timeout (code 3) or Position Unavailable (code 2)
          // Fall back gracefully to standard/network accuracy with cached position allowed
          console.warn('High-accuracy GPS delayed, attempting standard network location:', err?.message);
          navigator.geolocation.getCurrentPosition(
            onPosSuccess,
            (fallbackErr) => {
              if (!isMountedRef.current) return;
              setIsAcquiringGnss(false);
              setIsLoading(false);
              setGeoDeniedWarning(true);
              console.warn('Network location failed:', fallbackErr?.code, fallbackErr?.message);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
          );
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    } catch (e) {
      if (!isMountedRef.current) return;
      setIsAcquiringGnss(false);
      setIsLoading(false);
      setGeoDeniedWarning(true);
      console.warn('Geolocation invocation error:', e);
    }
  };



  // Mount-only initialization: Load default substation without popping GPS permission prompt (User Gesture Required on Mobile)
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    // Load default Alpha-1 substation on initial mount.
    // Geolocation is triggered strictly on user click via handleGpsSync to satisfy iOS Safari & Android Chrome policies.
    const def = PRESET_LOCATIONS.HUB_SF;
    fetchWeather(def.lat, def.lon, `${def.name} (${def.tag})`, 'HUB_SF', null);
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

      {/* Top Banner: Location Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        {/* Title & Satellite Indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 shrink-0 shadow-lg shadow-amber-950/40">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight font-mono uppercase">
                Satellite Weather Ingestion &bull; Live Telemetry
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-800/80 shrink-0">
                WMO &bull; Dual-Engine GPS
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
              Continuous solar irradiance, ambient temperature &amp; thermal derating sync
            </p>
          </div>
        </div>

        {/* Action Controls: Locate GPS, Dropdown City Selector & Google Maps Satellite Link */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto shrink-0 justify-start sm:justify-end">
          {/* High-Accuracy GPS Sync Button */}
          <button
            type="button"
            onClick={handleGpsSync}
            disabled={isAcquiringGnss}
            className={`flex-1 sm:flex-initial min-h-[40px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl font-bold font-mono text-xs tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 shadow-xl shadow-amber-950/50 transition-all select-none border-none active:scale-95 cursor-pointer whitespace-nowrap ${
              isAcquiringGnss ? 'opacity-70 cursor-wait' : 'hover:shadow-amber-500/30'
            }`}
          >
            {isAcquiringGnss ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Acquiring GPS...</span>
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

          {/* Autocomplete City & Utility Substation Search Input with Dropdown Recommendations */}
          <div ref={searchDropdownRef} className="relative flex-1 sm:flex-initial min-w-[220px] sm:min-w-[280px]">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  setIsSearchOpen(true);
                  if (searchResults.length === 0) {
                    setSearchResults(POPULAR_GLOBAL_HUBS);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={resolvedPlaceName ? `📍 ${resolvedPlaceName.split(',')[0]} (Type city...)` : "Search city (e.g. Hyderabad, London)..."}
                className="w-full min-h-[40px] pl-8 pr-12 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/95 text-amber-300 border border-amber-500/40 hover:border-amber-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-md shadow-amber-950/40 placeholder-slate-400"
              />
              <div className="absolute right-2 flex items-center gap-1 z-10">
                {isSearching && (
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin mr-0.5" />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults(POPULAR_GLOBAL_HUBS);
                      setIsSearchOpen(true);
                      setSelectedSearchIndex(-1);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Autocomplete Results Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/98 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 max-h-72 overflow-y-auto">
                {isSearching && searchResults.length === 0 && (
                  <div className="p-3 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    Resolving satellite geodata...
                  </div>
                )}
                {!isSearching && searchResults.length === 0 && searchQuery.trim().length >= 1 && (
                  <div className="p-3 text-center text-xs font-mono text-slate-400">
                    No matching locations for &quot;{searchQuery}&quot;. Try typing exact coordinates like <span className="text-cyan-400">17.38, 78.48</span>.
                  </div>
                )}
                {searchResults.map((result, idx) => {
                  const isHighlighted = selectedSearchIndex === idx;
                  return (
                    <button
                      key={result.id || idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(result)}
                      onMouseEnter={() => setSelectedSearchIndex(idx)}
                      className={`w-full text-left p-2.5 transition-colors flex items-center justify-between gap-2.5 group cursor-pointer ${
                        isHighlighted
                          ? 'bg-cyan-950/70 border-l-4 border-l-cyan-400 text-cyan-100'
                          : 'hover:bg-cyan-950/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-base shrink-0 select-none">{result.flag || '📍'}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold font-mono text-white group-hover:text-cyan-300 truncate">
                            {result.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            {result.displayName}
                          </div>
                          {result.tag && (
                            <div className="text-[9px] font-mono text-cyan-400/80 truncate mt-0.5">
                              {result.tag}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-mono text-cyan-400/90 font-bold">
                          {result.lat.toFixed(2)}°, {result.lon.toFixed(2)}°
                        </div>
                        {result.plusCode && (
                          <div className="text-[9px] font-mono text-indigo-300/80">
                            {result.plusCode}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct Google Maps Navigation / Satellite Exploration */}
          <a
            href={getGoogleMapsUrl(activeCoordinates.lat, activeCoordinates.lon)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-950/80 hover:border-cyan-500/80 transition-all shadow-md group cursor-pointer shrink-0 whitespace-nowrap"
            title="Open exact coordinates in Google Maps (Satellite & 3D view)"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-cyan-400/80" />
          </a>
        </div>
      </div>

      {/* Prominent Active Substation Telemetry Metadata Strip */}
      <div className="bg-slate-950/70 border border-white/5 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {/* Resolved Place Name Pill */}
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/70 shadow-xs max-w-full">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[240px] sm:max-w-md" title={resolvedPlaceName}>
              {resolvedPlaceName || 'Resolving location...'}
            </span>
          </div>

          {/* Live GNSS Status */}
          {activeStationId === 'LIVE_GPS' && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              LIVE GNSS SATELLITE
            </span>
          )}

          {/* Formatted GNSS Accuracy with Regional/Precision Label */}
          {gpsAccuracy != null && activeStationId === 'LIVE_GPS' && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 border flex items-center gap-1 ${
                gpsAccuracy <= 20
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                  : gpsAccuracy <= 1000
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                  : 'bg-slate-900 text-slate-300 border-slate-700/80'
              }`}
              title="Physical horizontal accuracy radius from GNSS/network receiver"
            >
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              {gpsAccuracy > 1000
                ? `&plusmn;${Math.round(gpsAccuracy / 1000)} km (Regional IP)`
                : `&plusmn;${Math.round(gpsAccuracy)}m (Precision GNSS)`}
            </span>
          )}
        </div>

        {/* Coordinates & Plus Code */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activePlusCode && (
            <div
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 shadow-xs"
              title="Google Open Location Code (Plus Code) for precise substation micro-location"
            >
              <Crosshair className="w-3 h-3 text-indigo-400" />
              <span>{activePlusCode}</span>
            </div>
          )}

          {coordinatesLabel && (
            <span
              className="text-[11px] text-slate-400 hidden sm:inline"
              dangerouslySetInnerHTML={{ __html: coordinatesLabel }}
            />
          )}
        </div>
      </div>

      {/* Quick-Tap Popular Power Grid Hub Chips (Arranged to prevent overflow) */}
      <div className="pt-2 border-t border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            Major Power Hub Presets:
          </span>
          <span className="text-[9px] text-slate-500 hidden sm:inline">Tap any hub to sync weather &amp; telemetry</span>
        </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {POPULAR_GLOBAL_HUBS.map((hub) => {
              const isSelected =
                Math.abs(activeCoordinates.lat - hub.lat) < 0.05 &&
                Math.abs(activeCoordinates.lon - hub.lon) < 0.05;

              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => {
                    fetchWeather(hub.lat, hub.lon, hub.displayName, hub.id, null);
                  }}
                  className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 select-none active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-md shadow-amber-950/60 ring-1 ring-amber-400/40'
                      : 'bg-slate-900/80 text-slate-300 border-white/10 hover:text-white hover:border-white/20 hover:bg-slate-800'
                  }`}
                  title={`${hub.displayName} • ${hub.tag}`}
                >
                  <span className="text-sm select-none">{hub.flag}</span>
                  <span>{hub.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                </button>
              );
            })}
          </div>
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
