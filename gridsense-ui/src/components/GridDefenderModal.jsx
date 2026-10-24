import { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Zap,
  BatteryCharging,
  PowerOff,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function GridDefenderModal({
  isOpen,
  onClose,
  onResumeSimulation,
  overloadDemand = 225,
}) {
  const [timeLeft, setTimeLeft] = useState(5.0);
  const [gameState, setGameState] = useState('PLAYING'); // 'PLAYING', 'VICTORY', 'BLACKOUT'
  const [selectedAction, setSelectedAction] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setGameState('PLAYING');
      setTimeLeft(5.0);
      setSelectedAction(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setGameState('PLAYING');
    setTimeLeft(5.0);
    setSelectedAction(null);

    const intervalMs = 100;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          setGameState('BLACKOUT');
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const handleAction = (actionKey) => {
    if (gameState !== 'PLAYING') return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAction(actionKey);

    if (actionKey === 'DISCHARGE_BATTERY') {
      setGameState('VICTORY');
    } else if (actionKey === 'BUY_GRID') {
      setGameState('BLACKOUT');
    } else if (actionKey === 'LOAD_SHED') {
      setGameState('VICTORY_MARGINAL');
    }
  };

  const handleReboot = () => {
    setGameState('PLAYING');
    setTimeLeft(5.0);
    setSelectedAction(null);
    onClose();
    if (onResumeSimulation) onResumeSimulation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Blackout Full Screen Overlay Mode */}
      {gameState === 'BLACKOUT' && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-pulse">
          <div className="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-500 mb-6 animate-bounce">
            <PowerOff className="w-10 h-10" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-rose-500 tracking-tight font-mono mb-2">
            CASCADE GRID BLACKOUT
          </h2>
          <p className="text-rose-200 text-sm max-w-lg mb-4">
            Substation transformers exceeded critical thermal thresholds. Generator frequency dropped below 47.5 Hz causing complete island trip and regional outage.
          </p>
          <div className="bg-rose-950/80 border border-rose-600 px-4 py-2 rounded-xl text-xs font-mono text-rose-300 mb-8">
            ACTION FAILED: {selectedAction === 'BUY_GRID' ? 'Overloaded Transmission Lines' : 'Tactical Response Time Expired (0.0s)'}
          </div>
          <button
            type="button"
            onClick={handleReboot}
            className="px-8 py-3.5 rounded-xl font-black text-sm tracking-wide text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-2xl shadow-cyan-500/40 border border-cyan-400/40 transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Black Start Auxiliary Reboot</span>
          </button>
        </div>
      )}

      {/* Main Tactical Defender Modal */}
      <div className="relative w-full max-w-xl bg-slate-950 border-2 border-rose-500/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-rose-950/90 text-white overflow-hidden">
        {/* Glowing Ambient Danger Orb */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-rose-500/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/50 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
                Tactical Decision Protocol
              </span>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                🚨 GRID IMMINENT FAILURE
              </h3>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Surge Load:</span>
            <span className="text-sm font-bold text-rose-400">{overloadDemand} kW</span>
          </div>
        </div>

        {/* Dynamic Body content depending on Game State */}
        {gameState === 'PLAYING' && (
          <div className="py-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 animate-bounce" />
                  CRITICAL FREQUENCY COLLAPSE IN:
                </span>
                <span className="text-lg text-rose-300 font-black">{timeLeft.toFixed(1)}s</span>
              </div>
              {/* Countdown Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-500/40">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-100 ease-linear"
                  style={{ width: `${(timeLeft / 5.0) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Demand has surged dangerously past safety limits. Generator frequency is decaying rapidly. Select the correct mitigation procedure within <strong>5 seconds</strong> to stabilize the grid:
            </p>

            {/* Tactical Choice Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAction('DISCHARGE_BATTERY')}
                className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/80 to-slate-900 border border-cyan-500/60 hover:border-cyan-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-xs">
                  <BatteryCharging className="w-4 h-4" />
                  <span>Discharge BESS</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Inject clean 150 kW battery power instantly to absorb peak load.
                </p>
                <span className="mt-3 block text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                  [RECOMMENDED]
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('BUY_GRID')}
                className="p-4 rounded-xl bg-gradient-to-b from-rose-950/60 to-slate-900 border border-rose-500/40 hover:border-rose-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Buy Main Grid</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Import extra power through overloaded regional substation lines.
                </p>
                <span className="mt-3 block text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                  [RISKY]
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('LOAD_SHED')}
                className="p-4 rounded-xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
                  <PowerOff className="w-4 h-4" />
                  <span>Load Shedding</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Cut secondary circuits. Prevents fire but causes partial brownout.
                </p>
                <span className="mt-3 block text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                  [FALLBACK]
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Victory State Screen */}
        {(gameState === 'VICTORY' || gameState === 'VICTORY_MARGINAL') && (
          <div className="py-6 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-emerald-300 font-mono">
                {gameState === 'VICTORY' ? 'GRID DEFENDED & STABILIZED!' : 'PARTIAL LOAD SHED SUCCESS'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                {gameState === 'VICTORY'
                  ? 'BESS fast-discharge matched instantaneous peak demand. Grid frequency stabilized back to 50.00 Hz nominal with zero loss of power!'
                  : 'Secondary loads detached successfully. Essential services remain operational.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs font-mono py-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                +500 Operator XP
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-white/10 font-bold">
                Freq: 50.00 Hz
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReboot}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-950/60 cursor-pointer"
              >
                Resume Grid Stream
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
