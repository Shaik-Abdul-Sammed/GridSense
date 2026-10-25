import { useState, useEffect, useRef } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import TourTooltip from '../components/TourTooltip';
import {
  Gamepad2,
  ShieldAlert,
  Zap,
  BatteryCharging,
  PowerOff,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  ChevronRight,
} from 'lucide-react';

// Web Audio sound synthesizer helper
function playAudioTone(freq, duration = 0.2, type = 'sine', gainVal = 0.15) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context may be restricted by browser
  }
}

const WAVES = [
  {
    waveNumber: 1,
    title: 'Wave 1: Evening Peak Surge',
    demandKw: 215,
    initialFreq: 49.2,
    transformerTemp: 76.5,
    description: 'Residential induction cooking and lighting loads have crested past 200 kW. Regional frequency is decaying.',
    timeLimit: 10.0,
    correctActions: ['DISCHARGE_BESS', 'LOAD_SHED'],
    points: 500,
  },
  {
    waveNumber: 2,
    title: 'Wave 2: Solar Eclipse Cloud Drop',
    demandKw: 245,
    initialFreq: 48.7,
    transformerTemp: 84.0,
    description: 'Sudden cloud occlusion dropped 450 kW rooftop solar to zero in 3 seconds. Net feeder demand skyrocketed.',
    timeLimit: 8.0,
    correctActions: ['DISCHARGE_BESS', 'VAR_COMPENSATION'],
    points: 750,
  },
  {
    waveNumber: 3,
    title: 'Wave 3: SCADA Cyber Penetration',
    demandKw: 280,
    initialFreq: 47.9,
    transformerTemp: 92.5,
    description: 'Adversary spoofing commands on telemetry bus. External utility tie-line is unstable. Islanding required!',
    timeLimit: 7.0,
    correctActions: ['EMERGENCY_ISLAND', 'DISCHARGE_BESS'],
    points: 1000,
  },
  {
    waveNumber: 4,
    title: 'Wave 4: 43°C Heatwave Inversion',
    demandKw: 310,
    initialFreq: 47.4,
    transformerTemp: 101.8,
    description: 'Extreme regional ambient temperature has pushed commercial HVAC chilling demand to historical max. Transformer cooling fans failing.',
    timeLimit: 6.0,
    correctActions: ['LOAD_SHED', 'DISCHARGE_BESS'],
    points: 1250,
  },
  {
    waveNumber: 5,
    title: 'Wave 5: Superstorm Multi-Feeder Fault',
    demandKw: 350,
    initialFreq: 46.8,
    transformerTemp: 114.2,
    description: 'Catastrophic transmission tower line drop. Generator rotational inertia exhausted. Final emergency defense!',
    timeLimit: 5.0,
    correctActions: ['EMERGENCY_ISLAND', 'LOAD_SHED'],
    points: 1500,
  },
];

const GAME_TOUR_STEPS = [
  {
    target: '#tour-game-objective',
    badge: 'SCADA TELEMETRY',
    content: (
      <div className="space-y-2">
        <h4 className="font-bold text-white text-base flex items-center gap-1.5">
          <span>🎯</span> Mission Objective &amp; Live Feeder Vitals
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Monitor real-time demand surge, grid frequency (nominal <strong className="text-cyan-300">50.0 Hz</strong>), and core temperature. You must dispatch the correct emergency protocol before the countdown expires!
        </p>
        <div className="pt-1 flex items-center gap-2 text-[11px] text-cyan-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Sub-second reaction required to avert cascaded regional blackout
        </div>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '#tour-game-discharge',
    badge: 'BESS FAST INJECT',
    content: (
      <div className="space-y-2">
        <h4 className="font-bold text-cyan-300 text-base flex items-center gap-1.5">
          <span>🔋</span> 1. Discharge Battery (BESS)
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Dispatches <strong className="text-cyan-300">150 kW</strong> of stored electrochemical energy in under 20ms to arrest frequency decay and damp high-frequency transients.
        </p>
        <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Best for:</span> Evening cooking peaks &amp; transient solar dips
        </div>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '#tour-game-grid',
    badge: 'GRID TIE-LINE',
    content: (
      <div className="space-y-2">
        <h4 className="font-bold text-emerald-300 text-base flex items-center gap-1.5">
          <span>🌐</span> 2. Main Grid Tie-Line / Islanding
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Commands physical tie-line breakers. Imports spinning reserves during normal surges or engages <strong className="text-emerald-300">emergency microgrid islanding</strong> to protect against external cyber intrusions.
        </p>
        <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Best for:</span> SCADA cyber penetrations &amp; transmission line drops
        </div>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '#tour-game-loadshed',
    badge: 'LOAD SHEDDING',
    content: (
      <div className="space-y-2">
        <h4 className="font-bold text-amber-300 text-base flex items-center gap-1.5">
          <span>✂️</span> 3. Selective Feeder Load Shedding
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Gracefully sheds non-essential smart loads (EV superchargers, commercial chillers) while keeping hospitals and critical nodes energised.
        </p>
        <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Best for:</span> Extreme heatwaves (&gt;42°C) &amp; thermal runaway
        </div>
      </div>
    ),
    disableBeacon: true,
  },
];

export default function GamerDemo() {
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE', 'PLAYING', 'VICTORY', 'BLACKOUT', 'GAME_OVER'
  const [timeLeft, setTimeLeft] = useState(10.0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('gridsense_gamer_highscore')) || 1500;
    } catch {
      return 1500;
    }
  });
  const [streak, setStreak] = useState(0);
  const [selectedAction, setSelectedAction] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('NORMAL'); // 'EASY' (+3s), 'NORMAL', 'HARD' (-2s)
  const timerRef = useRef(null);

  // Guided UI Tour State
  const [runTour, setRunTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const runTourRef = useRef(false);
  runTourRef.current = runTour;

  const handleStartTour = () => {
    if (gameState !== 'PLAYING') {
      startWave(0);
    }
    // Single-click clean start: reset state then launch
    setRunTour(false);
    setTourStepIndex(0);
    setTimeout(() => {
      setRunTour(true);
    }, 40);
  };

  const handleTourCallback = (data) => {
    const { action, index, status, type } = data;

    // Immediately unmount Joyride and clear dimming overlay on ANY exit trigger
    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === 'close' ||
      action === 'skip' ||
      action === 'stop' ||
      action === 'reset' ||
      type === 'tour:end'
    ) {
      setRunTour(false);
      setTourStepIndex(0);
      return;
    }

    if (type === 'step:after' || (action === 'next' && type === 'tooltip')) {
      setTourStepIndex(index + 1);
    } else if (action === 'prev') {
      setTourStepIndex(Math.max(0, index - 1));
    } else if (type === 'error:target_not_found') {
      setTourStepIndex(index + 1);
    }
  };

  const currentWave = WAVES[currentWaveIndex] || WAVES[0];

  const getTimeLimit = (baseLimit) => {
    if (difficulty === 'EASY') return baseLimit + 3.0;
    if (difficulty === 'HARD') return Math.max(3.0, baseLimit - 2.0);
    return baseLimit;
  };

  const startWave = (waveIdx = currentWaveIndex) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const wave = WAVES[waveIdx] || WAVES[0];
    const duration = getTimeLimit(wave.timeLimit);

    setCurrentWaveIndex(waveIdx);
    setTimeLeft(duration);
    setGameState('PLAYING');
    setSelectedAction(null);

    if (soundEnabled) {
      playAudioTone(440, 0.15, 'sawtooth', 0.1);
      setTimeout(() => playAudioTone(660, 0.2, 'sawtooth', 0.12), 150);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        // Freeze countdown timer while Joyride tour guide is active
        if (runTourRef.current) return prev;

        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          setGameState('BLACKOUT');
          setStreak(0);
          if (soundEnabled) {
            playAudioTone(180, 0.5, 'sawtooth', 0.3);
            setTimeout(() => playAudioTone(90, 0.8, 'square', 0.35), 250);
          }
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);
  };

  const handleAction = (actionKey) => {
    if (gameState !== 'PLAYING') return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAction(actionKey);

    const isCorrect = currentWave.correctActions.includes(actionKey);

    if (isCorrect) {
      const earned = currentWave.points + Math.round(timeLeft * 50) + streak * 100;
      const nextScore = score + earned;
      setScore(nextScore);
      setStreak((s) => s + 1);

      if (nextScore > highScore) {
        setHighScore(nextScore);
        try {
          localStorage.setItem('gridsense_gamer_highscore', String(nextScore));
        } catch {
          // ignore
        }
      }

      setGameState('VICTORY');
      if (soundEnabled) {
        playAudioTone(523.25, 0.12, 'triangle', 0.2);
        setTimeout(() => playAudioTone(659.25, 0.12, 'triangle', 0.2), 100);
        setTimeout(() => playAudioTone(783.99, 0.15, 'triangle', 0.2), 200);
        setTimeout(() => playAudioTone(1046.5, 0.3, 'sine', 0.25), 320);
      }
    } else {
      setGameState('BLACKOUT');
      setStreak(0);
      if (soundEnabled) {
        playAudioTone(220, 0.4, 'sawtooth', 0.3);
        setTimeout(() => playAudioTone(110, 0.8, 'square', 0.35), 200);
      }
    }
  };

  const handleNextWave = () => {
    if (currentWaveIndex + 1 < WAVES.length) {
      startWave(currentWaveIndex + 1);
    } else {
      setGameState('GAME_OVER');
      if (soundEnabled) {
        playAudioTone(600, 0.2, 'sine', 0.2);
        setTimeout(() => playAudioTone(800, 0.3, 'sine', 0.25), 180);
      }
    }
  };

  const handleRestartGame = () => {
    setScore(0);
    setStreak(0);
    startWave(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const totalTime = getTimeLimit(currentWave.timeLimit);
  const timeProgressPct = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));

  return (
    <div className="space-y-6">
      {/* Guided UI Tour (react-joyride) - Mounted strictly on demand */}
      {runTour && (
        <Joyride
          steps={GAME_TOUR_STEPS}
          run={runTour}
          stepIndex={tourStepIndex}
          continuous
          showProgress
          showSkipButton
          disableOverlayClose={false}
          spotlightClicks={false}
          callback={handleTourCallback}
          tooltipComponent={TourTooltip}
          styles={{
            options: {
              arrowColor: '#030712',
              backgroundColor: '#030712',
              overlayColor: 'rgba(2, 6, 23, 0.85)',
              primaryColor: '#06b6d4',
              textColor: '#f8fafc',
              zIndex: 10000,
            },
          }}
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-black border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-500 rounded-2xl shadow-xl shadow-amber-500/20 text-white flex items-center justify-center">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono uppercase">
                  Grid Defender Arena
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                  GAMER DEMO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-Time Tactical Microgrid Blackout Prevention Drill. Protect generator inertia against cascaded collapse!
              </p>
            </div>
          </div>

          {/* Stats Bar: Score, High Score, Audio & Difficulty */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Operator Score</span>
              <span className="text-base font-black text-cyan-400">{score.toLocaleString()} XP</span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs font-mono flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Record</span>
                <span className="text-base font-black text-amber-300">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-white/10 text-xs font-mono">
              {['EASY', 'NORMAL', 'HARD'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                    difficulty === diff
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleStartTour}
              title="Start Interactive Game UI Tour"
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono shadow-md border border-cyan-400/40 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-spin" />
              <span>How to Play (Tour)</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              title={soundEnabled ? 'Mute Game FX' : 'Enable Game FX'}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white cursor-pointer select-none"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* State: IDLE (Start Screen) */}
        {gameState === 'IDLE' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-pulse">
              <Gamepad2 className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
                Engage Tactical Microgrid Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                As Chief Substation Operator, you must counter 5 consecutive grid emergency waves. Choose the optimal SCADA dispatch before the generator frequency decays into regional blackout!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => startWave(0)}
                className="px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:scale-105 shadow-xl shadow-cyan-500/40 cursor-pointer transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Launch Wave 1 Drill</span>
              </button>
              <button
                type="button"
                onClick={handleStartTour}
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-cyan-300 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 cursor-pointer transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>How to Play (Tour)</span>
              </button>
            </div>
          </div>
        )}

        {/* State: PLAYING */}
        {gameState === 'PLAYING' && (
          <div className="space-y-6">
            {/* Objective & Wave Telemetry Container */}
            <div id="tour-game-objective" className="space-y-4">
              {/* Wave Title & Countdown Timer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                    DEFCON 1 ACTIVE SCENARIO
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white font-mono">
                    {currentWave.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-400">Wave {currentWaveIndex + 1} of {WAVES.length}</span>
                  <span className="px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-600/80 text-rose-300 font-black text-sm flex items-center gap-1.5 animate-pulse">
                    <Flame className="w-4 h-4 text-rose-500" />
                    {timeLeft.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Linear Countdown Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-100 ease-linear"
                  style={{ width: `${timeProgressPct}%` }}
                />
              </div>

              {/* Real-Time Telemetry Metrics Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/40 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Surge Load</span>
                    <span className="text-xl font-black text-rose-400">{currentWave.demandKw} kW</span>
                  </div>
                  <Activity className="w-6 h-6 text-rose-500 animate-pulse" />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/40 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Grid Frequency</span>
                    <span className="text-xl font-black text-amber-300">{currentWave.initialFreq} Hz</span>
                  </div>
                  <Radio className="w-6 h-6 text-amber-500" />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Transformer Core Temp</span>
                    <span className="text-xl font-black text-cyan-300">{currentWave.transformerTemp}°C</span>
                  </div>
                  <Flame className="w-6 h-6 text-cyan-500" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/50 p-3 rounded-xl border border-white/5">
                ⚠️ {currentWave.description}
              </p>
            </div>

            {/* Tactical Action Dispatch Buttons */}
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-3 font-mono">
                Select SCADA Mitigation Protocol:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  id="tour-game-discharge"
                  type="button"
                  onClick={() => handleAction('DISCHARGE_BESS')}
                  className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/80 to-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-bold text-xs font-mono">
                    <BatteryCharging className="w-4 h-4" />
                    <span>Discharge Battery (BESS)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Inject 150 kW electrochemical battery storage to absorb peak surge.
                  </p>
                </button>

                <button
                  id="tour-game-grid"
                  type="button"
                  onClick={() => handleAction('EMERGENCY_ISLAND')}
                  className="p-4 rounded-xl bg-gradient-to-b from-emerald-950/70 to-slate-900 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold text-xs font-mono">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Buy from Main Grid / Island</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Sever tie-line from compromised utility or negotiate emergency bulk reserves.
                  </p>
                </button>

                <button
                  id="tour-game-loadshed"
                  type="button"
                  onClick={() => handleAction('LOAD_SHED')}
                  className="p-4 rounded-xl bg-gradient-to-b from-amber-950/70 to-slate-900 border border-amber-500/50 hover:border-amber-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-bold text-xs font-mono">
                    <PowerOff className="w-4 h-4" />
                    <span>Selective Load Shedding</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Detach non-essential EV chargers &amp; HVAC to protect grid backbone.
                  </p>
                </button>

                <button
                  id="tour-game-var"
                  type="button"
                  onClick={() => handleAction('VAR_COMPENSATION')}
                  className="p-4 rounded-xl bg-gradient-to-b from-blue-950/70 to-slate-900 border border-blue-500/50 hover:border-blue-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-blue-400 font-bold text-xs font-mono">
                    <Zap className="w-4 h-4" />
                    <span>Dynamic VAR Boost</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Switch capacitor banks to correct power factor and stabilize phase angle.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: VICTORY */}
        {gameState === 'VICTORY' && (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                TACTICAL SUCCESS &bull; FREQUENCY STABILIZED
              </span>
              <h3 className="text-2xl font-black text-white font-mono mt-1">
                WAVE {currentWaveIndex + 1} DEFENDED!
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 max-w-md mx-auto">
                SCADA dispatch matched instantaneous surge load. Substation frequency returned to 50.00 Hz nominal with zero customer drop.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs font-mono py-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                +{currentWave.points} Base XP
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-cyan-300 border border-white/10 font-bold">
                Streak: {streak}x
              </span>
              {selectedAction && (
                <span className="px-3.5 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold hidden sm:inline">
                  Protocol: {selectedAction}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleNextWave}
                className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 hover:scale-105 shadow-xl shadow-emerald-950/60 cursor-pointer flex items-center gap-2"
              >
                <span>{currentWaveIndex + 1 < WAVES.length ? 'Proceed to Next Wave' : 'Complete Campaign'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* State: BLACKOUT */}
        {gameState === 'BLACKOUT' && (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/50 flex items-center justify-center mx-auto shadow-xl shadow-rose-950/80 animate-bounce">
              <PowerOff className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
                CASCADED SYSTEM COLLAPSE
              </span>
              <h3 className="text-2xl font-black text-rose-500 font-mono mt-1">
                REGIONAL GRID BLACKOUT
              </h3>
              <p className="text-xs text-rose-200 mt-1.5 max-w-md mx-auto">
                Under-frequency load shedding relays tripped main bus bars. Feeder current: 0.0 A.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => startWave(currentWaveIndex)}
                className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:scale-105 shadow-xl shadow-rose-950/70 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Black Start Auxiliary Reboot</span>
              </button>
            </div>
          </div>
        )}

        {/* State: GAME_OVER */}
        {gameState === 'GAME_OVER' && (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                CAMPAIGN CONQUERED &bull; MASTER OPERATOR
              </span>
              <h3 className="text-2xl font-black text-white font-mono mt-1">
                ALL 5 DEFENSE WAVES SURVIVED!
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 max-w-md mx-auto">
                Congratulations! You successfully defended the microgrid through peak surges, cloud drops, cyberattacks, and superstorms!
              </p>
            </div>

            <div className="text-xl font-mono font-black text-cyan-300 py-1">
              Final Operator Score: {score.toLocaleString()} XP
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleRestartGame}
                className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 shadow-xl shadow-cyan-500/40 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play New Campaign</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
