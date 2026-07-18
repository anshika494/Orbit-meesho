import { useState, useRef, useCallback, useEffect } from 'react';

// Wraps the browser's native speechSynthesis API.
// Zero dependencies — same philosophy as useSpeechRecognition.
// Returns speak(), cancel(), and status flags.
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Cancel any in-flight speech when the component unmounts.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text, lang = 'en-IN') => {
      if (!supported || !text) return;
      // Cancel whatever was already playing.
      window.speechSynthesis.cancel();

      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.92;  // slightly slower — clearer for low-literacy users
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, speaking, speak, cancel };
}
