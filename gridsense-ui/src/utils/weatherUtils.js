export function getWeatherInterpretation(code, isDay = 1) {
  switch (code) {
    case 0:
      return { label: isDay ? 'Clear Sky' : 'Clear Night', icon: isDay ? '☀️' : '🌙' };
    case 1:
      return { label: 'Mainly Clear', icon: isDay ? '🌤️' : '🌤️' };
    case 2:
      return { label: 'Partly Cloudy', icon: '⛅' };
    case 3:
      return { label: 'Overcast', icon: '☁️' };
    case 45:
    case 48:
      return { label: 'Foggy / Hazy', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { label: 'Light Drizzle', icon: '🌦️' };
    case 56:
    case 57:
      return { label: 'Freezing Drizzle', icon: '🌧️' };
    case 61:
    case 63:
    case 65:
      return { label: 'Rain', icon: '🌧️' };
    case 66:
    case 67:
      return { label: 'Freezing Rain', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { label: 'Snowfall', icon: '❄️' };
    case 77:
      return { label: 'Snow Grains', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', icon: '🌦️' };
    case 85:
    case 86:
      return { label: 'Snow Showers', icon: '🌨️' };
    case 95:
      return { label: 'Thunderstorm', icon: '⛈️' };
    case 96:
    case 99:
      return { label: 'Thunderstorm with Hail', icon: '⛈️' };
    default:
      return { label: isDay ? 'Fair Sky' : 'Clear Sky', icon: isDay ? '☀️' : '🌙' };
  }
}

export function getWindCompassDirection(degrees) {
  if (degrees == null || isNaN(degrees)) return 'N';
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

export function formatCoordinates(lat, lon) {
  if (lat == null || lon == null) return '';
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;
  return `${latStr} &bull; ${lonStr}`;
}

/**
 * Encodes a latitude/longitude pair into a Google Open Location Code (Plus Code).
 * Format: 849VQHFJ+X6 (Base-20 alphanumeric grid addressing, ~13.7m precision).
 */
const PLUS_CODE_ALPHABET = '23456789CFGHJMPQRVWX';
export function encodePlusCode(latitude, longitude) {
  if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
    return '849VQHFJ+X6';
  }
  let lat = Math.min(Math.max(Number(latitude), -90), 90);
  let lng = Number(longitude);
  while (lng < -180) lng += 360;
  while (lng >= 180) lng -= 360;
  lat += 90;
  lng += 180;
  let code = '';
  let latVal = lat;
  let lngVal = lng;
  let latRes = 20;
  let lngRes = 20;
  for (let i = 0; i < 5; i++) {
    const latDigit = Math.floor(latVal / latRes);
    const lngDigit = Math.floor(lngVal / lngRes);
    code += PLUS_CODE_ALPHABET[latDigit] + PLUS_CODE_ALPHABET[lngDigit];
    latVal -= latDigit * latRes;
    lngVal -= lngDigit * lngRes;
    latRes /= 20;
    lngRes /= 20;
  }
  return code.slice(0, 8) + '+' + code.slice(8, 10);
}

/**
 * Universal Google Maps Search Link for coordinates.
 * Generates official Google Maps search query with pinpoint marker.
 */
export function getGoogleMapsUrl(lat, lon) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`;
}

// In-memory cache for reverse geocoding to prevent repetitive network lookups
const reverseGeocodeCache = new Map();

/**
 * Multi-Tier High-Precision Reverse Geocoding:
 * Tier 1: In-memory coordinate cache (instant, 0ms).
 * Tier 2: BigDataCloud Reverse Geocode Client (fast 2s timeout).
 * Tier 3: OpenStreetMap Nominatim reverse geocoding fallback (fast 2s timeout).
 * Tier 4: Formatted GNSS coordinate representation & Plus Code (guaranteed, instant).
 */
export async function reverseGeocode(lat, lon) {
  const plusCodeDefault = encodePlusCode(lat, lon);
  const cacheKey = `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;

  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey);
  }

  const googleKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;

  // Tier 1: Google Maps Geocoding API (if key is configured)
  if (googleKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleKey}&solution_id=gmp_git_agentskills_v1`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results?.[0]) {
          const first = data.results[0];
          const address = first.formatted_address;
          const gPlusCode = data.plus_code?.global_code || plusCodeDefault;
          const result = {
            placeName: address,
            plusCode: gPlusCode,
            source: 'Google Maps Geocoding',
            toString() {
              return address;
            },
          };
          reverseGeocodeCache.set(cacheKey, result);
          return result;
        }
      }
    } catch {
      // Quiet fallback
    }
  }

  // Tier 2: BigDataCloud Reverse Geocoding with Neighborhood & Google Plus Code
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `https://api-bdc.io/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const locality = data.locality;
      const city = data.city;
      const state = data.principalSubdivision;
      const country = data.countryName;
      const parts = [];
      if (locality && locality !== city) parts.push(locality);
      if (city) parts.push(city);
      if (state) parts.push(state);
      if (country) parts.push(country);

      const resolvedCode = data.plusCode || plusCodeDefault;
      if (parts.length > 0) {
        const placeName = parts.join(', ');
        const result = {
          placeName,
          plusCode: resolvedCode,
          locality,
          city,
          state,
          country,
          source: 'GNSS Satellite & Plus Code',
          toString() {
            return placeName;
          },
        };
        reverseGeocodeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Graceful fallback to next tier without console pollution
  }

  // Tier 3: Secondary fallback: OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data?.address) {
        const neighborhood = data.address.neighbourhood || data.address.suburb;
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county;
        const state = data.address.state;
        const country = data.address.country;
        const parts = [neighborhood, city, state, country].filter(Boolean);
        if (parts.length > 0) {
          const placeName = parts.join(', ');
          const result = {
            placeName,
            plusCode: plusCodeDefault,
            city,
            state,
            country,
            source: 'Geographic Registry',
            toString() {
              return placeName;
            },
          };
          reverseGeocodeCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch {
    // Graceful fallback to coordinate representation
  }

  // Tier 4: Coordinate fallback (Instant & 100% reliable)
  const latStr = lat >= 0 ? `${lat.toFixed(4)}°N` : `${Math.abs(lat).toFixed(4)}°S`;
  const lonStr = lon >= 0 ? `${lon.toFixed(4)}°E` : `${Math.abs(lon).toFixed(4)}°W`;
  const fallbackPlace = `Station (${latStr}, ${lonStr})`;
  const fallbackResult = {
    placeName: fallbackPlace,
    plusCode: plusCodeDefault,
    source: 'GPS Grid Coordinates',
    toString() {
      return fallbackPlace;
    },
  };
  reverseGeocodeCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

// In-memory cache for place searches
const searchPlacesCache = new Map();

export function getCountryFlag(country = '') {
  if (!country) return '📍';
  const c = country.toLowerCase();
  if (c.includes('india')) return '🇮🇳';
  if (c.includes('united states') || c === 'usa' || c === 'us') return '🇺🇸';
  if (c.includes('united kingdom') || c === 'uk' || c.includes('britain') || c.includes('england')) return '🇬🇧';
  if (c.includes('japan')) return '🇯🇵';
  if (c.includes('australia')) return '🇦🇺';
  if (c.includes('emirates') || c.includes('dubai') || c === 'uae') return '🇦🇪';
  if (c.includes('germany')) return '🇩🇪';
  if (c.includes('singapore')) return '🇸🇬';
  if (c.includes('canada')) return '🇨🇦';
  if (c.includes('france')) return '🇫🇷';
  if (c.includes('china')) return '🇨🇳';
  if (c.includes('brazil')) return '🇧🇷';
  if (c.includes('south africa')) return '🇿🇦';
  if (c.includes('netherlands')) return '🇳🇱';
  if (c.includes('spain')) return '🇪🇸';
  if (c.includes('italy')) return '🇮🇹';
  return '🌐';
}

export const POPULAR_GLOBAL_HUBS = [
  {
    id: 'HUB_HYD',
    name: 'Hyderabad',
    displayName: 'Hyderabad, Telangana, India',
    lat: 17.3850,
    lon: 78.4867,
    country: 'India',
    flag: '🇮🇳',
    admin1: 'Telangana',
    plusCode: '7J9W9FPP+2M',
    tag: 'SRLDC Southern Regional Dispatch (400kV)',
  },
  {
    id: 'HUB_BLR',
    name: 'Bengaluru',
    displayName: 'Bengaluru, Karnataka, India',
    lat: 12.9716,
    lon: 77.5946,
    country: 'India',
    flag: '🇮🇳',
    admin1: 'Karnataka',
    plusCode: '7J4VXR4F+XX',
    tag: 'BESCOM Smart Microgrid Hub (220kV)',
  },
  {
    id: 'HUB_MUM',
    name: 'Mumbai',
    displayName: 'Mumbai, Maharashtra, India',
    lat: 19.0760,
    lon: 72.8777,
    country: 'India',
    flag: '🇮🇳',
    admin1: 'Maharashtra',
    plusCode: '7JFJ3VGM+3V',
    tag: 'Tata Power Western Grid Interconnect',
  },
  {
    id: 'HUB_DEL',
    name: 'New Delhi',
    displayName: 'New Delhi, Delhi, India',
    lat: 28.6139,
    lon: 77.2090,
    country: 'India',
    flag: '🇮🇳',
    admin1: 'Delhi',
    plusCode: '7JWVJ675+HJ',
    tag: 'NLDC National Load Dispatch Centre',
  },
  {
    id: 'HUB_VTZ',
    name: 'Visakhapatnam',
    displayName: 'Visakhapatnam, Andhra Pradesh, India',
    lat: 17.6868,
    lon: 83.2185,
    country: 'India',
    flag: '🇮🇳',
    admin1: 'Andhra Pradesh',
    plusCode: '7MC4MGPC+CC',
    tag: 'APEPDCL Coastal Smart Substation (220kV)',
  },
  {
    id: 'HUB_VJA',
    name: 'Vijayawada',
    displayName: 'Vijayawada, Andhra Pradesh, India',
    lat: 16.5062,
    lon: 80.6480,
    country: 'India',
    flag: '🇮🇳',
    admin1: 'Andhra Pradesh',
    plusCode: '7M93GJPX+F5',
    tag: 'APTRANSCO State Load Dispatch Centre',
  },
  {
    id: 'HUB_MAA',
    name: 'Chennai',
    displayName: 'Chennai, Tamil Nadu, India',
    lat: 13.0827,
    lon: 80.2707,
    country: 'India',
    flag: '🇮🇳',
    admin1: 'Tamil Nadu',
    plusCode: '7M5237MR+77',
    tag: 'TANGEDCO Southern Interconnect (400kV)',
  },
  {
    id: 'HUB_SF',
    name: 'San Francisco',
    displayName: 'San Francisco, California, United States',
    lat: 37.7749,
    lon: -122.4194,
    country: 'United States',
    flag: '🇺🇸',
    admin1: 'California',
    plusCode: '849VQHFJ+X6',
    tag: 'Substation Alpha-1 (66kV / 11kV)',
  },
  {
    id: 'HUB_NYC',
    name: 'New York',
    displayName: 'New York, New York, United States',
    lat: 40.7128,
    lon: -74.0060,
    country: 'United States',
    flag: '🇺🇸',
    admin1: 'New York',
    plusCode: '87G8P27F+4R',
    tag: 'NYISO Sector Central (138kV)',
  },
  {
    id: 'HUB_LON',
    name: 'London',
    displayName: 'London, England, United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    country: 'United Kingdom',
    flag: '🇬🇧',
    admin1: 'England',
    plusCode: '9C3XGV4C+XV',
    tag: 'National Grid UK Interconnect',
  },
  {
    id: 'HUB_TYO',
    name: 'Tokyo',
    displayName: 'Tokyo, Japan',
    lat: 35.6762,
    lon: 139.6503,
    country: 'Japan',
    flag: '🇯🇵',
    admin1: 'Kanto',
    plusCode: '8Q7XMMG2+F4',
    tag: 'TEPCO Microgrid Hub (50Hz / 60Hz)',
  },
  {
    id: 'HUB_SYD',
    name: 'Sydney',
    displayName: 'Sydney, New South Wales, Australia',
    lat: -33.8688,
    lon: 151.2093,
    country: 'Australia',
    flag: '🇦🇺',
    admin1: 'New South Wales',
    plusCode: '4RRH46J5+FF',
    tag: 'AEMO Pacific Solar Farm Interconnect',
  },
  {
    id: 'HUB_DXB',
    name: 'Dubai',
    displayName: 'Dubai, United Arab Emirates',
    lat: 25.2048,
    lon: 55.2708,
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    admin1: 'Dubai',
    plusCode: '7HQQ673C+W8',
    tag: 'DEWA Solar Park Substation (400kV)',
  },
  {
    id: 'HUB_BER',
    name: 'Berlin',
    displayName: 'Berlin, Germany',
    lat: 52.5200,
    lon: 13.4050,
    country: 'Germany',
    flag: '🇩🇪',
    admin1: 'Berlin',
    plusCode: '9F4MGCH4+2X',
    tag: '50Hertz Transmission Center',
  },
  {
    id: 'HUB_SIN',
    name: 'Singapore',
    displayName: 'Singapore, Singapore',
    lat: 1.3521,
    lon: 103.8198,
    country: 'Singapore',
    flag: '🇸🇬',
    admin1: 'Central Region',
    plusCode: '6PH59R29+RV',
    tag: 'EMA Jurong Island Microgrid Hub',
  },
];

/**
 * Searches places, substations, cities, coordinates, or landmarks worldwide.
 * Supports direct GPS coordinate parsing (e.g. "37.7749, -122.4194"),
 * high-precision Photon OpenStreetMap search, and Open-Meteo fallback.
 */
export async function searchPlaces(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return POPULAR_GLOBAL_HUBS;
  }
  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();

  if (searchPlacesCache.has(lowerQuery)) {
    return searchPlacesCache.get(lowerQuery);
  }

  // Mode 1: Direct Latitude & Longitude coordinate matching
  const coordMatch = cleanQuery.match(
    /^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/
  );
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const pCode = encodePlusCode(lat, lon);
      const latFormatted = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
      const lonFormatted = `${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
      const res = [
        {
          id: `COORD_${lat.toFixed(4)}_${lon.toFixed(4)}`,
          name: `Pin (${latFormatted}, ${lonFormatted})`,
          displayName: `Exact GNSS Coordinates (${latFormatted}, ${lonFormatted})`,
          lat: Number(lat.toFixed(5)),
          lon: Number(lon.toFixed(5)),
          country: 'Pinpoint Location',
          flag: '📍',
          admin1: '',
          plusCode: pCode,
          tag: 'Exact Geographic Coordinates',
        },
      ];
      searchPlacesCache.set(lowerQuery, res);
      return res;
    }
  }

  // Mode 2: Immediate local match against popular utility grid hubs (includes aliases)
  const localHubMatches = POPULAR_GLOBAL_HUBS.filter((h) => {
    const n = h.name.toLowerCase();
    const d = h.displayName.toLowerCase();
    const c = h.country.toLowerCase();
    const t = h.tag.toLowerCase();
    const isMatch =
      n.includes(lowerQuery) ||
      d.includes(lowerQuery) ||
      c.includes(lowerQuery) ||
      t.includes(lowerQuery) ||
      (lowerQuery.includes('bangalore') && n.includes('bengaluru')) ||
      (lowerQuery.includes('bombay') && n.includes('mumbai')) ||
      (lowerQuery.includes('vizag') && n.includes('visakhapatnam')) ||
      (lowerQuery.includes('delhi') && n.includes('delhi')) ||
      (lowerQuery.includes('madras') && n.includes('chennai'));
    return isMatch;
  });

  // If query is only 1 letter, return instantaneous local matches without external network lag
  if (cleanQuery.length === 1) {
    const oneLetterResults = localHubMatches.length > 0 ? localHubMatches : POPULAR_GLOBAL_HUBS;
    searchPlacesCache.set(lowerQuery, oneLetterResults);
    return oneLetterResults;
  }

  // Mode 3: High-Precision Dual-Engine Query (Photon OSM + Open-Meteo)
  let externalMatches = [];

  // Sub-engine A: Photon OpenStreetMap (World-class multilingual & alias resolution)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=6`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.features)) {
        data.features.forEach((f) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates;
          if (Array.isArray(coords) && coords.length >= 2) {
            const lon = Number(coords[0].toFixed(5));
            const lat = Number(coords[1].toFixed(5));
            const name = props.name || cleanQuery;
            const state = props.state || props.county || '';
            const country = props.country || '';
            const displayName = [name, state, country].filter(Boolean).join(', ');
            externalMatches.push({
              id: `OSM_${props.osm_id || Math.random()}`,
              name,
              displayName,
              lat,
              lon,
              country,
              flag: getCountryFlag(country),
              admin1: state,
              plusCode: encodePlusCode(lat, lon),
              tag: `Geographic Location &bull; ${country || 'Global'}`,
            });
          }
        });
      }
    }
  } catch {
    // Quiet fallback to Open-Meteo
  }

  // Sub-engine B: Open-Meteo Geocoding
  if (externalMatches.length < 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=6&language=en&format=json`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) {
          data.results.forEach((r) => {
            const displayName = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
            externalMatches.push({
              id: `PLACE_${r.id}`,
              name: r.name,
              displayName,
              lat: Number(r.latitude.toFixed(5)),
              lon: Number(r.longitude.toFixed(5)),
              country: r.country || '',
              flag: getCountryFlag(r.country),
              admin1: r.admin1 || '',
              plusCode: encodePlusCode(r.latitude, r.longitude),
              tag: `Meteorological Station &bull; ${r.country || 'Global'}`,
            });
          });
        }
      }
    } catch {
      // Quiet fallback
    }
  }

  // Combine local high-priority matches with external results, deduplicating within 10km (~0.09 deg)
  const combined = [...localHubMatches];
  externalMatches.forEach((extItem) => {
    const isDuplicate = combined.some(
      (c) =>
        Math.abs(c.lat - extItem.lat) < 0.09 && Math.abs(c.lon - extItem.lon) < 0.09
    );
    if (!isDuplicate) {
      combined.push(extItem);
    }
  });

  searchPlacesCache.set(lowerQuery, combined);
  return combined;
}
