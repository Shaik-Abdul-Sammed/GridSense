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

export async function reverseGeocode(lat, lon) {
  // Fast, free client-side reverse geocoding with complete CORS support
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
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch (err) {
    console.warn('api-bdc geocode fallback engaged:', err.message);
  }

  // Secondary fallback: OpenStreetMap Nominatim
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
          return parts.join(', ');
        }
      }
    }
  } catch (nomErr) {
    console.warn('Nominatim reverse geocode skipped:', nomErr.message);
  }

  const latStr = lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`;
  const lonStr = lon >= 0 ? `${lon.toFixed(2)}°E` : `${Math.abs(lon).toFixed(2)}°W`;
  return `Station (${latStr}, ${lonStr})`;
}

