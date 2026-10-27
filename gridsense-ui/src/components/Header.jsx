import PropTypes from 'prop-types';
import {
  Zap,
  Activity,
  TrendingUp,
  ShieldAlert,
  DollarSign,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';

export default function Header({
  lastUpdated,
  isOnline,
  latestDemand = 0,
  criticalThreshold = 200,
  isCyberattack = false,
  onTriggerCyberattack,
  isVoiceMuted = false,
  onToggleVoiceMute,
  isAudioUnlocked = false,
  onUnlockAudio,
  ambientTemp = 26.5,
  humidityPct = 55,
  solarIrradiance = 350,
  onStartTour,
}) {
  // Accurate Weather Status with Degrees
  const tempNum = Number(ambientTemp);
  const formattedTemp = Number.isFinite(tempNum) ? tempNum.toFixed(1) : '26.0';
  const solarNum = Number(solarIrradiance) || 0;
  const humNum = Number(humidityPct) || 55;

  let weatherIcon = '☀️';
  let weatherCondition = 'Clear Sky';

  if (humNum > 82) {
    weatherIcon = '🌧️';
    weatherCondition = 'Humid / Rain Risk';
  } else if (solarNum > 600) {
    weatherIcon = '☀️';
    weatherCondition = 'Sunny & Clear';
  } else if (solarNum > 250) {
    weatherIcon = '🌤️';
    weatherCondition = 'Partly Cloudy';
  } else if (solarNum > 10) {
    weatherIcon = '⛅';
    weatherCondition = 'Overcast Day';
  } else {
    weatherIcon = '🌙';
    weatherCondition = 'Clear Night';
  }

  // Feature 4: Dynamic Pricing Engine (Tariff Ticker)
  // Formula: price = 0.10 + (currentDemand / 1000) * 5 ($/kWh)
  const currentTariff = (0.10 + (Number(latestDemand) / 1000) * 5).toFixed(2);
  const isTariffSpike = latestDemand > criticalThreshold || currentTariff >= 1.0;

  // Microgrid Cost Avoidance / Battery Peak Savings:
  // When in RENEWABLE_STORAGE_MODE or high demand, avoiding high tariff:
  const peakSavings = (
    Math.max(0, (latestDemand * 0.7) * (Number(currentTariff) - 0.10))
  ).toFixed(2);

  // Grid Frequency Simulation (Feature 4)
  const isOverloaded = latestDemand >= criticalThreshold || isCyberattack;
  const simulatedFrequency = isCyberattack
    ? '0.00'
    : isOverloaded
    ? (49.5 + Math.max(0, 0.3 * (1 - (latestDemand - criticalThreshold) / 100))).toFixed(2)
    : '50.00';

  return (
    <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3.5 pb-4 border-b border-white/10">
      {/* Brand & Substation Identity */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 rounded-xl shadow-lg shadow-cyan-500/20 text-white flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white font-mono">
              GridSense Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 shadow-xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              v3.0 DIGITAL TWIN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Autonomous Digital Twin &bull; P2P Energy Marketplace &bull; Neural SCADA Controller
          </p>
        </div>
      </div>

      {/* Tickers & Real-time Gauges (Arranged cleanly to prevent overflow on mobile & laptops) */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-stretch xl:self-auto justify-start xl:justify-end">
        {/* Real-time Ambient Weather Status with Degrees */}
        <div
          title={`Substation Microclimate: ${formattedTemp}°C | ${weatherCondition} | Humidity: ${humNum}% | Solar DNI: ${solarNum} W/m²`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all bg-slate-900/80 border-white/10 text-amber-300"
        >
          <span className="text-base select-none leading-none">{weatherIcon}</span>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-amber-400">
              {formattedTemp}°C
            </span>
            <span className="text-[10px] text-slate-300 hidden sm:inline">
              {weatherCondition}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono hidden md:inline border-l border-white/10 pl-1.5">
              💧 {humNum}%
            </span>
          </div>
        </div>

        {/* Feature 4: Live Dynamic Tariff Ticker */}
        <div
          title={
            isTariffSpike
              ? 'PEAK SURGE TARIFF: High regional demand has triggered emergency dynamic tariff!'
              : 'Dynamic market clearing tariff based on real-time feeder demand'
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            isTariffSpike
              ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-lg shadow-rose-950/60 animate-pulse'
              : 'bg-slate-900/80 border-white/10 text-cyan-300'
          }`}
        >
          <TrendingUp className={`w-4 h-4 ${isTariffSpike ? 'text-rose-400' : 'text-emerald-400'}`} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">TARIFF:</span>
              <span className="font-black text-sm">${currentTariff}</span>
              <span className="text-[10px] text-slate-400">/kWh</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-[10px] text-emerald-400 font-bold border-l border-white/10 pl-2">
              <DollarSign className="w-3 h-3" />
              <span>BESS Saved: ${peakSavings}/h</span>
            </div>
          </div>
        </div>

        {/* Feature 4: Grid Frequency Monitor */}
        <div
          title={
            isCyberattack
              ? 'MAIN GRID DISCONNECTED UNDER CYBERATTACK'
              : isOverloaded
              ? 'Generator frequency decaying under severe overload stress!'
              : 'Grid generator frequency is nominal and synchronized'
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            isCyberattack || isOverloaded
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-lg shadow-rose-950/50 animate-pulse'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <Activity
            className={`w-4 h-4 ${
              isCyberattack || isOverloaded ? 'text-rose-400 animate-bounce' : 'text-emerald-400'
            }`}
          />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-wider">
              {simulatedFrequency} Hz
            </span>
            <span className="text-[10px] hidden sm:inline text-slate-300">
              {isCyberattack ? 'ISLANDED' : isOverloaded ? 'FREQ DROP' : 'NOMINAL'}
            </span>
          </div>
        </div>

        {/* Live API Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-slate-300 font-mono text-[11px]">
            {isOnline ? 'API Connected' : 'Local Fallback'}
          </span>
        </div>

        {/* Feature 2: Cyberattack / Fault Injection Quick Trigger */}
        {onTriggerCyberattack && (
          <button
            type="button"
            onClick={onTriggerCyberattack}
            title={
              isCyberattack
                ? 'Neutralize cyberattack and restore main grid telemetry'
                : 'Simulate adversary SCADA penetration forcing emergency islanded mode'
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isCyberattack
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-400 animate-pulse'
                : 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border-rose-700/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isCyberattack ? '🛡️ Restore Grid' : '⚠️ Cyberattack'}</span>
          </button>
        )}

        {/* Mobile / Direct User-Gesture Voice Audio Unlocker Button */}
        {!isAudioUnlocked && onUnlockAudio && (
          <button
            type="button"
            onClick={onUnlockAudio}
            title="Enable AI Voice Alerts (Requires user gesture on mobile browsers)"
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-400/50 flex items-center gap-1.5 cursor-pointer select-none transition-all animate-pulse"
          >
            <Volume2 className="w-3.5 h-3.5 text-slate-950" />
            <span>🔊 Enable Voice</span>
          </button>
        )}

        {/* Feature 4: Automated AI Voice Alert Mute/Unmute Toggle */}
        {onToggleVoiceMute && (
          <button
            type="button"
            onClick={onToggleVoiceMute}
            title={isVoiceMuted ? 'Unmute AI Audio Voice Alerts' : 'Mute AI Audio Voice Alerts'}
            className={`p-2 rounded-xl border transition-all cursor-pointer select-none ${
              isVoiceMuted
                ? 'bg-slate-850 text-slate-500 border-white/5 hover:text-slate-300'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80 shadow-md shadow-cyan-950/50'
            }`}
            aria-label="Toggle voice alerts"
          >
            {isVoiceMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            )}
          </button>
        )}

        {/* Hackathon Guided UI Tour */}
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            title="Start Interactive Hackathon UI Tour"
            className="group px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 hover:text-black shadow-lg shadow-cyan-500/25 border border-cyan-400/40 flex items-center gap-1.5 cursor-pointer select-none transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:rotate-45" />
            <span>Start Guided Tour</span>
          </button>
        )}

        {lastUpdated && (
          <div className="text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/10 hidden md:block">
            Sync: {lastUpdated}
          </div>
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
  lastUpdated: PropTypes.string,
  isOnline: PropTypes.bool,
  latestDemand: PropTypes.number,
  criticalThreshold: PropTypes.number,
  isCyberattack: PropTypes.bool,
  onTriggerCyberattack: PropTypes.func,
  isVoiceMuted: PropTypes.bool,
  onToggleVoiceMute: PropTypes.func,
  isAudioUnlocked: PropTypes.bool,
  onUnlockAudio: PropTypes.func,
  ambientTemp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  humidityPct: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  solarIrradiance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onStartTour: PropTypes.func,
};
