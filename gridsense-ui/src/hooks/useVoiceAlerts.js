import { useState, useEffect, useRef, useCallback } from 'react';

// Web Audio synthesizer tone generator (guaranteed audio feedback across all modern browsers)
function playToneChime(isPositive = true) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Chromium requires resuming AudioContext on user interaction
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
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
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('gridsense_voice_muted') === 'true';
    } catch {
      return false;
    }
  });

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

  const speakAlert = useCallback(
    (text, forced = false, cooldownMs = 15000) => {
      if (isMuted) return;

      const now = Date.now();
      if (!forced && now - lastSpokenRef.current < cooldownMs) {
        return; // Respect cooldown to prevent alert spamming
      }

      // Always play audio chime feedback
      playToneChime(true);

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
    [isMuted]
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
        // User unmuted: provide immediate voice and tone confirmation
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
  };
}
