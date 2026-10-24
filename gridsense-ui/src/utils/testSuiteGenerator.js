// Generator utility for all 5 Hackathon Test Suite scenarios
// Can be downloaded as files or injected directly into GridSense runtime state

export const TEST_NORMAL_DAY_CSV = `timestamp,ambient_temp_c,humidity_pct,solar_irradiance_wm2
2026-10-24 00:00:00,21.0,72.0,0.0
2026-10-24 01:00:00,20.5,73.0,0.0
2026-10-24 02:00:00,20.0,75.0,0.0
2026-10-24 03:00:00,19.5,76.0,0.0
2026-10-24 04:00:00,19.2,77.0,0.0
2026-10-24 05:00:00,19.8,75.0,0.0
2026-10-24 06:00:00,21.5,70.0,85.0
2026-10-24 07:00:00,23.5,65.0,260.0
2026-10-24 08:00:00,25.8,60.0,480.0
2026-10-24 09:00:00,27.5,56.0,670.0
2026-10-24 10:00:00,29.0,52.0,810.0
2026-10-24 11:00:00,30.2,49.0,890.0
2026-10-24 12:00:00,31.0,47.0,915.0
2026-10-24 13:00:00,31.2,46.0,885.0
2026-10-24 14:00:00,30.5,48.0,795.0
2026-10-24 15:00:00,29.6,51.0,645.0
2026-10-24 16:00:00,28.2,54.0,430.0
2026-10-24 17:00:00,26.8,58.0,220.0
2026-10-24 18:00:00,25.2,63.0,45.0
2026-10-24 19:00:00,24.0,66.0,0.0
2026-10-24 20:00:00,23.4,68.0,0.0
2026-10-24 21:00:00,22.7,69.0,0.0
2026-10-24 22:00:00,22.1,70.0,0.0
2026-10-24 23:00:00,21.5,71.0,0.0`;

export const TEST_CYBERATTACK_JSON = JSON.stringify(
  {
    scenario: "CRITICAL_CYBERATTACK_SCADA_BREACH",
    description: "Simulates an advanced adversarial SCADA breach forcing zero grid power and emergency islanding.",
    forcedMode: "ISLANDED_MODE",
    gridStatus: "OFFLINE_COMPROMISED",
    mainGridPowerKw: 0,
    emergencyBatteryDischarge: true,
    telemetryOverride: Array.from({ length: 24 }, (_, h) => {
      const hourStr = String(h).padStart(2, '0');
      return {
        timestamp: `2026-10-24 ${hourStr}:00:00`,
        hour: `${hourStr}:00`,
        ambient_temp_c: 29.0,
        humidity_pct: 65.0,
        solar_irradiance_wm2: h >= 6 && h <= 18 ? 450 : 0,
        predicted_demand_kw: 185.0,
        grid_mode: "ISLANDED_MODE",
        alert: "CRITICAL_OVERLOAD",
        battery_soc: Math.max(10, (95 - h * 3.5)).toFixed(1),
        isCyberattack: true,
      };
    }),
  },
  null,
  2
);

export const TEST_PEAK_SURGE_CSV = `timestamp,ambient_temp_c,humidity_pct,solar_irradiance_wm2
2026-10-24 00:00:00,22.0,65.0,0.0
2026-10-24 01:00:00,21.5,66.0,0.0
2026-10-24 02:00:00,21.0,67.0,0.0
2026-10-24 03:00:00,20.5,69.0,0.0
2026-10-24 04:00:00,20.0,70.0,0.0
2026-10-24 05:00:00,20.5,68.0,0.0
2026-10-24 06:00:00,22.0,64.0,50.0
2026-10-24 07:00:00,25.0,60.0,180.0
2026-10-24 08:00:00,29.0,55.0,320.0
2026-10-24 09:00:00,34.0,50.0,510.0
2026-10-24 10:00:00,38.0,46.0,680.0
2026-10-24 11:00:00,41.0,42.0,780.0
2026-10-24 12:00:00,43.5,39.0,850.0
2026-10-24 13:00:00,44.2,38.0,820.0
2026-10-24 14:00:00,44.0,39.0,740.0
2026-10-24 15:00:00,43.0,41.0,590.0
2026-10-24 16:00:00,41.5,44.0,380.0
2026-10-24 17:00:00,39.8,48.0,160.0
2026-10-24 18:00:00,38.0,53.0,20.0
2026-10-24 19:00:00,41.0,65.0,0.0
2026-10-24 20:00:00,39.5,68.0,0.0
2026-10-24 21:00:00,37.0,72.0,0.0
2026-10-24 22:00:00,34.0,76.0,0.0
2026-10-24 23:00:00,31.0,80.0,0.0`;

export const TEST_P2P_MARKET_JSON = JSON.stringify(
  {
    marketEvent: "HIGH_SOLAR_PROSUMER_SURPLUS",
    description: "Rooftop solar generation exceeds regional load, generating massive P2P microgrid transactions.",
    activeProsumers: 42,
    totalSurplusKw: 680.5,
    averageClearingPrice: 0.095,
    sampleTransactions: [
      { id: "TX-01", seller: "House #04 (Solar 8kW)", buyer: "Bakery Alpha", amountKw: 5.2, pricePerKwh: 0.09, timestamp: "12:00:00" },
      { id: "TX-02", seller: "House #12 (Solar 10kW)", buyer: "EV Charging Hub #1", amountKw: 7.8, pricePerKwh: 0.095, timestamp: "12:01:15" },
      { id: "TX-03", seller: "House #19 (Solar 6kW)", buyer: "House #02", amountKw: 3.4, pricePerKwh: 0.10, timestamp: "12:02:40" },
      { id: "TX-04", seller: "Community Solar Array #1", buyer: "Data Center Beta", amountKw: 24.5, pricePerKwh: 0.088, timestamp: "12:03:10" },
    ],
  },
  null,
  2
);

export const TEST_ZERO_SOLAR_CSV = `timestamp,ambient_temp_c,humidity_pct,solar_irradiance_wm2
2026-10-24 00:00:00,16.0,88.0,0.0
2026-10-24 01:00:00,15.5,89.0,0.0
2026-10-24 02:00:00,15.0,91.0,0.0
2026-10-24 03:00:00,14.8,92.0,0.0
2026-10-24 04:00:00,14.5,93.0,0.0
2026-10-24 05:00:00,14.8,92.0,0.0
2026-10-24 06:00:00,15.5,90.0,0.0
2026-10-24 07:00:00,16.2,88.0,0.0
2026-10-24 08:00:00,17.0,85.0,0.0
2026-10-24 09:00:00,17.8,82.0,0.0
2026-10-24 10:00:00,18.5,80.0,0.0
2026-10-24 11:00:00,19.0,78.0,0.0
2026-10-24 12:00:00,19.5,76.0,0.0
2026-10-24 13:00:00,19.8,75.0,0.0
2026-10-24 14:00:00,19.2,76.0,0.0
2026-10-24 15:00:00,18.5,79.0,0.0
2026-10-24 16:00:00,17.8,82.0,0.0
2026-10-24 17:00:00,17.0,85.0,0.0
2026-10-24 18:00:00,16.5,87.0,0.0
2026-10-24 19:00:00,16.0,89.0,0.0
2026-10-24 20:00:00,15.6,90.0,0.0
2026-10-24 21:00:00,15.2,92.0,0.0
2026-10-24 22:00:00,14.9,93.0,0.0
2026-10-24 23:00:00,14.5,94.0,0.0`;

export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
