import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function playToneFeedback(freq = 600, duration = 0.15) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context may be restricted
  }
}

export function useVoiceCommands({ onStartSimulation, onStopSimulation, onStartTour }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      playToneFeedback(580, 0.12);
      setFeedback('🎙️ Listening... (Say: "Start tour", "Simulate grid", "Play game", "Show 3D", "Impact")');
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(text);
      playToneFeedback(880, 0.2);

      // Voice Command Routing Logic
      if (text.includes('tour') || text.includes('guide') || text.includes('walkthrough')) {
        setFeedback('Command Recognized: Launching Guided UI Tour');
        if (onStartTour) onStartTour();
      } else if (text.includes('start forecast') || text.includes('simulate grid') || text.includes('run forecast') || text.includes('forecast')) {
        setFeedback('Command Recognized: Starting 24h simulation');
        if (onStartSimulation) onStartSimulation();
      } else if (text.includes('stop forecast') || text.includes('stop simulation') || text.includes('halt')) {
        setFeedback('Command Recognized: Halting simulation');
        if (onStopSimulation) onStopSimulation();
      } else if (text.includes('play game') || text.includes('open game') || text.includes('defender') || text.includes('gamer')) {
        setFeedback('Command Recognized: Launching Gamer Defender Arena');
        navigate('/defender');
      } else if (text.includes('impact') || text.includes('pitch') || text.includes('innovation') || text.includes('roadmap')) {
        setFeedback('Command Recognized: Opening Impact & Innovation Pitch Deck');
        navigate('/impact');
      } else if (text.includes('show twin') || text.includes('3d') || text.includes('digital twin')) {
        setFeedback('Command Recognized: Opening 3D Digital Twin');
        navigate('/twin');
      } else if (text.includes('show drone') || text.includes('drones') || text.includes('aerial')) {
        setFeedback('Command Recognized: Opening Drone Fleet Operations');
        navigate('/drones');
      } else if (text.includes('show ar') || text.includes('scanner') || text.includes('augmented')) {
        setFeedback('Command Recognized: Opening AR Diagnostics');
        navigate('/ar');
      } else if (text.includes('show weather') || text.includes('weather') || text.includes('gps')) {
        setFeedback('Command Recognized: Opening Satellite Weather Ingestion');
        navigate('/weather');
      } else if (text.includes('marketplace') || text.includes('trading') || text.includes('p2p')) {
        setFeedback('Command Recognized: Opening P2P Energy Marketplace');
        navigate('/marketplace');
      } else if (text.includes('show analytics') || text.includes('go to analytics') || text.includes('open analytics')) {
        setFeedback('Command Recognized: Navigating to Analytics');
        navigate('/analytics');
      } else if (text.includes('go to settings') || text.includes('show settings') || text.includes('open settings') || text.includes('configure')) {
        setFeedback('Command Recognized: Navigating to Settings');
        navigate('/settings');
      } else if (text.includes('show history') || text.includes('show logs') || text.includes('event logs')) {
        setFeedback('Command Recognized: Navigating to Event Logs');
        navigate('/history');
      } else if (text.includes('show dashboard') || text.includes('go to dashboard') || text.includes('go home') || text.includes('live')) {
        setFeedback('Command Recognized: Navigating to Live Dashboard');
        navigate('/');
      } else {
        setFeedback(`Heard: "${text}" (Say "Start tour", "Simulate grid", "Play game", or "Impact")`);
      }

      setTimeout(() => setFeedback(null), 4000);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setFeedback('Microphone permission blocked. Please allow microphone in browser.');
      } else {
        setFeedback(`Voice error: ${event.error}`);
      }
      setTimeout(() => setFeedback(null), 3500);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [navigate, onStartSimulation, onStopSimulation, onStartTour]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setFeedback('Web Speech API not supported in this browser.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
        setFeedback('Voice listening error. Click again.');
        setTimeout(() => setFeedback(null), 2500);
      }
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    feedback,
    isSupported,
    toggleListening,
  };
}
