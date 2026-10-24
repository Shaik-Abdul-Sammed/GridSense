import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useVoiceCommands({ onStartSimulation, onStopSimulation }) {
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
      setFeedback('Listening for voice commands...');
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(text);

      // Voice Command Routing Logic
      if (text.includes('start forecast') || text.includes('simulate grid') || text.includes('run forecast')) {
        setFeedback('Command Recognized: Starting 24h simulation');
        if (onStartSimulation) onStartSimulation();
      } else if (text.includes('stop forecast') || text.includes('stop simulation') || text.includes('halt')) {
        setFeedback('Command Recognized: Halting simulation');
        if (onStopSimulation) onStopSimulation();
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
        setFeedback(`Heard: "${text}" (Say "Start forecast", "Show analytics", or "Go to settings")`);
      }

      setTimeout(() => setFeedback(null), 4000);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      setFeedback(`Voice error: ${event.error}`);
      setTimeout(() => setFeedback(null), 3000);
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
  }, [navigate, onStartSimulation, onStopSimulation]);

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
