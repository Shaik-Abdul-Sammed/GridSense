// Hackathon Winning Demo Scenario Dataset
// Guaranteed peak demand spike crossing 220 kW at 19:00 to trigger CRITICAL_OVERLOAD & storage transition.

export const HACKATHON_DEMO_DATA = [
  { timestamp: '2026-10-24 00:00:00', ambient_temp_c: 21.2, humidity_pct: 78.4, solar_irradiance_wm2: 0.0, target_demand_kw: 82.5 },
  { timestamp: '2026-10-24 01:00:00', ambient_temp_c: 20.4, humidity_pct: 80.1, solar_irradiance_wm2: 0.0, target_demand_kw: 76.0 },
  { timestamp: '2026-10-24 02:00:00', ambient_temp_c: 19.8, humidity_pct: 82.0, solar_irradiance_wm2: 0.0, target_demand_kw: 72.4 },
  { timestamp: '2026-10-24 03:00:00', ambient_temp_c: 19.3, humidity_pct: 83.5, solar_irradiance_wm2: 0.0, target_demand_kw: 69.8 },
  { timestamp: '2026-10-24 04:00:00', ambient_temp_c: 18.9, humidity_pct: 85.0, solar_irradiance_wm2: 0.0, target_demand_kw: 74.2 },
  { timestamp: '2026-10-24 05:00:00', ambient_temp_c: 19.6, humidity_pct: 82.3, solar_irradiance_wm2: 0.0, target_demand_kw: 88.0 },
  { timestamp: '2026-10-24 06:00:00', ambient_temp_c: 22.0, humidity_pct: 75.2, solar_irradiance_wm2: 85.0, target_demand_kw: 112.5 },
  { timestamp: '2026-10-24 07:00:00', ambient_temp_c: 24.5, humidity_pct: 69.0, solar_irradiance_wm2: 240.0, target_demand_kw: 135.0 },
  { timestamp: '2026-10-24 08:00:00', ambient_temp_c: 27.2, humidity_pct: 62.4, solar_irradiance_wm2: 460.0, target_demand_kw: 152.0 },
  { timestamp: '2026-10-24 09:00:00', ambient_temp_c: 29.8, humidity_pct: 56.1, solar_irradiance_wm2: 680.0, target_demand_kw: 165.4 },
  { timestamp: '2026-10-24 10:00:00', ambient_temp_c: 32.1, humidity_pct: 50.8, solar_irradiance_wm2: 830.0, target_demand_kw: 172.0 },
  { timestamp: '2026-10-24 11:00:00', ambient_temp_c: 34.0, humidity_pct: 46.2, solar_irradiance_wm2: 920.0, target_demand_kw: 178.5 },
  { timestamp: '2026-10-24 12:00:00', ambient_temp_c: 35.5, humidity_pct: 43.0, solar_irradiance_wm2: 960.0, target_demand_kw: 182.0 },
  { timestamp: '2026-10-24 13:00:00', ambient_temp_c: 36.2, humidity_pct: 41.5, solar_irradiance_wm2: 940.0, target_demand_kw: 179.0 },
  { timestamp: '2026-10-24 14:00:00', ambient_temp_c: 36.0, humidity_pct: 42.0, solar_irradiance_wm2: 860.0, target_demand_kw: 175.5 },
  { timestamp: '2026-10-24 15:00:00', ambient_temp_c: 35.1, humidity_pct: 45.4, solar_irradiance_wm2: 710.0, target_demand_kw: 168.0 },
  { timestamp: '2026-10-24 16:00:00', ambient_temp_c: 33.6, humidity_pct: 50.2, solar_irradiance_wm2: 490.0, target_demand_kw: 159.2 },
  { timestamp: '2026-10-24 17:00:00', ambient_temp_c: 31.8, humidity_pct: 55.0, solar_irradiance_wm2: 250.0, target_demand_kw: 164.5 },
  { timestamp: '2026-10-24 18:00:00', ambient_temp_c: 29.5, humidity_pct: 61.2, solar_irradiance_wm2: 45.0, target_demand_kw: 188.0 },
  // DRAMATIC HEAT & DEMAND SPIKE AT 19:00 (> 220 kW)
  { timestamp: '2026-10-24 19:00:00', ambient_temp_c: 38.4, humidity_pct: 68.5, solar_irradiance_wm2: 5.0, target_demand_kw: 228.6 },
  { timestamp: '2026-10-24 20:00:00', ambient_temp_c: 34.2, humidity_pct: 71.0, solar_irradiance_wm2: 0.0, target_demand_kw: 214.2 },
  { timestamp: '2026-10-24 21:00:00', ambient_temp_c: 30.1, humidity_pct: 74.0, solar_irradiance_wm2: 0.0, target_demand_kw: 202.5 },
  { timestamp: '2026-10-24 22:00:00', ambient_temp_c: 27.0, humidity_pct: 77.2, solar_irradiance_wm2: 0.0, target_demand_kw: 174.0 },
  { timestamp: '2026-10-24 23:00:00', ambient_temp_c: 24.5, humidity_pct: 80.0, solar_irradiance_wm2: 0.0, target_demand_kw: 108.5 },
];
