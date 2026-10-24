import { useState, useEffect, useRef, useCallback } from 'react';

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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gridsense_voice_muted', String(next));
      } catch (e) {
        console.warn('Storage save failed:', e);
      }
      if (next && synthRef.current) {
        synthRef.current.cancel();
      }
      return next;
    });
  }, []);

  const speakAlert = useCallback(
    (text, forced = false, cooldownMs = 20000) => {
      if (isMuted || !synthRef.current) return;

      const now = Date.now();
      if (!forced && now - lastSpokenRef.current < cooldownMs) {
        return; // Respect cooldown to prevent alert spamming
      }

      try {
        // Cancel any pending speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.volume = 1.0;

        // Try to pick an authoritative English voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('David'))
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        synthRef.current.speak(utterance);
        lastSpokenRef.current = now;
      } catch (err) {
        console.warn('Voice alert synthesis error:', err);
      }
    },
    [isMuted]
  );

  return {
    isMuted,
    toggleMute,
    speakAlert,
  };
}
