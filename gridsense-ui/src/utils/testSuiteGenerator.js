// Generator utility for Hackathon Test Suite scenarios
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

// Feature 6: Failure Scenarios
export const TEST_STRESS_FAILURE_CSV = `timestamp,ambient_temp_c,humidity_pct,solar_irradiance_wm2
2026-10-24 00:00:00,28.0,60.0,0.0
2026-10-24 01:00:00,28.5,58.0,0.0
2026-10-24 02:00:00,29.0,55.0,0.0
2026-10-24 03:00:00,29.5,54.0,0.0
2026-10-24 04:00:00,30.0,52.0,0.0
2026-10-24 05:00:00,31.0,50.0,0.0
2026-10-24 06:00:00,33.0,46.0,120.0
2026-10-24 07:00:00,35.5,42.0,290.0
2026-10-24 08:00:00,37.0,38.0,490.0
2026-10-24 09:00:00,39.2,35.0,690.0
2026-10-24 10:00:00,41.0,32.0,840.0
2026-10-24 11:00:00,42.5,30.0,910.0
2026-10-24 12:00:00,43.8,28.0,930.0
2026-10-24 13:00:00,44.5,27.0,900.0
2026-10-24 14:00:00,45.0,26.0,820.0
2026-10-24 15:00:00,44.8,27.0,680.0
2026-10-24 16:00:00,44.0,29.0,460.0
2026-10-24 17:00:00,43.0,32.0,240.0
2026-10-24 18:00:00,41.5,36.0,60.0
2026-10-24 19:00:00,42.0,40.0,0.0
2026-10-24 20:00:00,40.5,44.0,0.0
2026-10-24 21:00:00,39.0,48.0,0.0
2026-10-24 22:00:00,37.5,52.0,0.0
2026-10-24 23:00:00,36.0,55.0,0.0`;

export const TEST_CLIMATE_HEATWAVE_JSON = JSON.stringify(
  {
    scenario: "GLOBAL_WARMING_HEATWAVE_SURGE",
    description: "Simulates an extreme +4.5°C climate anomaly forcing regional HVAC chilling saturation and predictive transformer degradation.",
    globalTempDeltaC: 4.5,
    hvacCoolingLoadFactor: 1.48,
    incidentMetadata: {
      substation: "ALPHA-1",
      riskLevel: "CRITICAL_THERMAL_OVERLOAD",
      expectedRulHours: 3.2
    }
  },
  null,
  2
);

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
