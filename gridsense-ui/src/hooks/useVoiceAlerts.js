import { useState, useEffect, useRef, useCallback } from 'react';

// Web Audio synthesizer tone generator (guaranteed audio feedback across all modern browsers)
function playToneChime(isPositive = true, isEmergency = false) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Chromium and iOS require resuming AudioContext on user interaction
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (isEmergency) {
      // High-urgency SCADA alarm siren warble (880Hz -> 659Hz -> 880Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);
      osc.frequency.setValueAtTime(659.25, now + 0.36);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isPositive) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // Audio context may be restricted by strict browser policies
  }
}

export function useVoiceAlerts() {
  const [isMuted, setIsMuted] = useState(false);

  // Audio is enabled and primed by default
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(true);

  const lastSpokenRef = useRef(0);
  const synthRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const voicesRef = useRef([]);

  // Initialize SpeechSynthesis and register voices listener
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) {
            voicesRef.current = v;
          }
        } catch {
          // ignore
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Direct user-gesture audio unlocker for mobile browsers
  const unlockAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        // Silent speech utterance to prime mobile audio channel
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0.01;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {
        console.warn('Silent utterance unlock error:', e);
      }
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
    } catch {
      // ignore
    }

    setIsAudioUnlocked(true);
    setIsMuted(false);
    try {
      localStorage.setItem('gridsense_voice_muted', 'false');
    } catch {
      // ignore
    }
    playToneChime(true);
  }, []);

  // Automatically prime audio context on first user tap/click anywhere
  useEffect(() => {
    const handleFirstInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [unlockAudio]);

  const speakAlert = useCallback(
    (text, forced = false, cooldownMs = 15000) => {
      // Strict gating: do not speak if muted or audio has not been unlocked via user gesture (unless explicitly forced)
      if (isMuted) return;
      if (!isAudioUnlocked && !forced) return;
      if (!isAudioUnlocked && forced) {
        setIsAudioUnlocked(true);
      }

      const now = Date.now();
      if (!forced && now - lastSpokenRef.current < cooldownMs) {
        return; // Respect cooldown to prevent alert spamming
      }

      // Audio chime / siren feedback (positive tone vs emergency SCADA alert warble)
      const isEmergency = /critical|overload|warning|emergency|failure|danger|breach|alarm/i.test(text);
      playToneChime(!isEmergency, isEmergency);

      if (!synthRef.current) return;

      try {
        // Unstick Chromium paused state if needed
        if (synthRef.current.paused) {
          synthRef.current.resume();
        }
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Retain reference so garbage collector does not silence speech in Chromium
        activeUtteranceRef.current = utterance;

        const availableVoices = voicesRef.current.length > 0
          ? voicesRef.current
          : synthRef.current.getVoices();

        if (availableVoices && availableVoices.length > 0) {
          const preferredVoice = availableVoices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Google') ||
                v.name.includes('Natural') ||
                v.name.includes('Samantha') ||
                v.name.includes('David') ||
                v.name.includes('English'))
          );
          if (preferredVoice) utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          activeUtteranceRef.current = null;
        };

        utterance.onerror = () => {
          activeUtteranceRef.current = null;
        };

        synthRef.current.speak(utterance);
        lastSpokenRef.current = now;
      } catch (err) {
        console.warn('Voice alert synthesis error:', err);
      }
    },
    [isMuted, isAudioUnlocked]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gridsense_voice_muted', String(next));
      } catch (e) {
        console.warn('Storage save failed:', e);
      }

      if (synthRef.current) {
        if (synthRef.current.paused) {
          try {
            synthRef.current.resume();
          } catch {
            // ignore
          }
        }
        synthRef.current.cancel();
      }

      if (!next) {
        // User unmuted: also ensure audio is unlocked on this user gesture
        setIsAudioUnlocked(true);
        playToneChime(true);
        setTimeout(() => {
          speakAlert('GridSense voice telemetry online. Monitoring active grid.', true, 0);
        }, 120);
      } else {
        // User muted
        playToneChime(false);
      }

      return next;
    });
  }, [speakAlert]);

  return {
    isMuted,
    toggleMute,
    speakAlert,
    isAudioUnlocked,
    unlockAudio,
  };
}
