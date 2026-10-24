// Transformer Predictive Failure Forecaster (Remaining Useful Life - RUL)
// Calculates thermodynamic, electrical, and degradation stress scores on high-voltage substation transformers

export function calculateTransformerHealth(telemetryHistory = [], currentItem = null) {
  if (!telemetryHistory || telemetryHistory.length === 0) {
    if (!currentItem) {
      return {
        stressScore: 12,
        healthPct: 88,
        rulHours: null,
        status: 'HEALTHY',
        statusColor: 'emerald',
        factors: { thermalStress: 5, electricalStress: 7, spikeStress: 0 },
      };
    }
  }

  const items = [...telemetryHistory];
  if (currentItem && (!items.length || items[items.length - 1]?.hour !== currentItem?.hour)) {
    items.push(currentItem);
  }

  // Look at recent operating window (up to last 12 hours)
  const windowItems = items.slice(-12);
  const latest = windowItems[windowItems.length - 1] || currentItem;

  const currentDemand = Number(latest?.predicted_demand_kw ?? 130);
  const currentTemp = Number(latest?.ambient_temp_c ?? 25);

  // 1. Electrical Load Stress (Demands > 160 kW compound thermal loss I^2*R)
  let electricalStress = 0;
  if (currentDemand > 220) {
    electricalStress = 45;
  } else if (currentDemand > 180) {
    electricalStress = 32;
  } else if (currentDemand > 160) {
    electricalStress = 20;
  } else if (currentDemand > 130) {
    electricalStress = 10;
  } else {
    electricalStress = 4;
  }

  // Count sustained overload hours in window
  const sustainedOverloads = windowItems.filter(
    (d) => Number(d.predicted_demand_kw) > 160
  ).length;
  electricalStress += sustainedOverloads * 3;

  // 2. Thermal Ambient Stress (Ambient > 35°C severely reduces transformer cooling efficiency)
  let thermalStress = 0;
  if (currentTemp >= 42) {
    thermalStress = 40;
  } else if (currentTemp >= 38) {
    thermalStress = 28;
  } else if (currentTemp >= 35) {
    thermalStress = 18;
  } else if (currentTemp >= 30) {
    thermalStress = 8;
  } else {
    thermalStress = 2;
  }

  // 3. Rate-of-Change / Shock Spike Stress (Sudden load jumps shock transformer windings)
  let spikeStress = 0;
  if (windowItems.length >= 2) {
    const prev = windowItems[windowItems.length - 2];
    const prevDemand = Number(prev.predicted_demand_kw || 100);
    const jump = currentDemand - prevDemand;
    if (jump > 50) {
      spikeStress = 25;
    } else if (jump > 30) {
      spikeStress = 14;
    } else if (jump > 15) {
      spikeStress = 6;
    }
  }

  // Total compound stress score capped at 0-100%
  const rawStress = electricalStress + thermalStress + spikeStress;
  const stressScore = Math.min(100, Math.max(0, rawStress));

  // Health is inverse of stress score
  const healthPct = Math.max(0, 100 - stressScore);

  // Remaining Useful Life (RUL) estimation:
  // If stress score > 80% (health < 20%), transformer enters critical failure trajectory
  let rulHours = null;
  let status = 'HEALTHY';
  let statusColor = 'emerald';

  if (stressScore >= 80 || healthPct <= 20) {
    status = 'IMMINENT_FAILURE';
    statusColor = 'rose';
    // RUL between 1 and 4 hours under severe compounding degradation
    rulHours = Math.max(1, Math.round(1 + ((100 - stressScore) / 20) * 3));
  } else if (stressScore >= 55 || healthPct <= 45) {
    status = 'HIGH_DEGRADATION';
    statusColor = 'amber';
    rulHours = Math.round(5 + ((80 - stressScore) / 25) * 8);
  } else if (stressScore >= 30 || healthPct <= 70) {
    status = 'MODERATE_WEAR';
    statusColor = 'yellow';
  }

  return {
    stressScore,
    healthPct,
    rulHours,
    status,
    statusColor,
    factors: {
      electricalStress,
      thermalStress,
      spikeStress,
    },
    metrics: {
      windingTempEst: (currentTemp + (currentDemand / 180) * 38).toFixed(1),
      oilDeteriorationRate: (stressScore * 0.042).toFixed(2),
    },
  };
}
