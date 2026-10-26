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
 * Format: 849VQHFJ+X6 (Base-20 alphanumeric grid addressing).
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

/**
 * Multi-Tier High-Precision Reverse Geocoding:
 * Tier 1: Google Maps Geocoding API (if VITE_GOOGLE_MAPS_API_KEY is configured).
 * Tier 2: BigDataCloud Reverse Geocode Client (CORS supported, returns locality & plusCode).
 * Tier 3: OpenStreetMap Nominatim reverse geocoding fallback.
 * Tier 4: Formatted coordinate representation.
 */
export async function reverseGeocode(lat, lon) {
  const plusCodeDefault = encodePlusCode(lat, lon);
  const googleKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;

  // Tier 1: Google Maps Geocoding API (if configured)
  if (googleKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
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
          return {
            placeName: address,
            plusCode: gPlusCode,
            source: 'Google Maps Geocoding',
            toString() {
              return address;
            },
          };
        }
      }
    } catch (err) {
      console.warn('Google Maps Geocoding skipped, falling to Tier 2:', err.message);
    }
  }

  // Tier 2: BigDataCloud Reverse Geocoding with Google Plus Code
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api-bdc.io/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality;
      const state = data.principalSubdivision;
      const country = data.countryName;
      const parts = [city, state, country].filter(Boolean);
      const resolvedCode = data.plusCode || plusCodeDefault;
      if (parts.length > 0) {
        const placeName = parts.join(', ');
        return {
          placeName,
          plusCode: resolvedCode,
          city,
          state,
          country,
          source: 'GNSS Satellite & Plus Code',
          toString() {
            return placeName;
          },
        };
      }
    }
  } catch (err) {
    console.warn('api-bdc geocode fallback engaged:', err.message);
  }

  // Tier 3: Secondary fallback: OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data?.address) {
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.suburb ||
          data.address.county;
        const state = data.address.state;
        const country = data.address.country;
        const parts = [city, state, country].filter(Boolean);
        if (parts.length > 0) {
          const placeName = parts.join(', ');
          return {
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
        }
      }
    }
  } catch (nomErr) {
    console.warn('Nominatim reverse geocode skipped:', nomErr.message);
  }

  // Tier 4: Coordinate fallback
  const latStr = lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`;
  const lonStr = lon >= 0 ? `${lon.toFixed(2)}°E` : `${Math.abs(lon).toFixed(2)}°W`;
  const fallbackPlace = `Station (${latStr}, ${lonStr})`;
  return {
    placeName: fallbackPlace,
    plusCode: plusCodeDefault,
    source: 'GPS Grid Coordinates',
    toString() {
      return fallbackPlace;
    },
  };
}

/**
 * Searches places, substations, cities, or landmarks worldwide.
 * Uses high-speed Geocoding API with Google Plus Code calculation.
 */
export async function searchPlaces(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return [];
  }
  const cleanQuery = query.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results.map((r) => {
          const displayName = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
          return {
            id: `PLACE_${r.id}`,
            name: r.name,
            displayName,
            lat: Number(r.latitude.toFixed(4)),
            lon: Number(r.longitude.toFixed(4)),
            country: r.country || '',
            admin1: r.admin1 || '',
            plusCode: encodePlusCode(r.latitude, r.longitude),
            tag: `Search Result &bull; ${r.country || 'Global'}`,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Place search service unavailable:', err.message);
  }
  return [];
}
