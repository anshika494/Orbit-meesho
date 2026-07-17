import { useState, useRef, useEffect, useCallback } from 'react';

// Wraps the browser's native SpeechRecognition API (Chrome, Edge, and most
// Chromium-based browsers support this with no library install — it's a
// browser capability, not something we can npm-install our way into for
// browsers that don't have it, like Firefox/Safari as of this writing).
//
// Returns live interim transcript while the person is talking, and marks
// `finalTranscript` once the browser is confident the utterance is done —
// that's the signal the caller should use to actually act on what was said.
export function useSpeechRecognition(lang = 'en-IN') {
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const SpeechRecognitionImpl =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const supported = !!SpeechRecognitionImpl;

  useEffect(() => {
    if (!supported) return undefined;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += chunk;
        } else {
          interim += chunk;
        }
      }
      if (interim) setInterimTranscript(interim);
      if (final) setFinalTranscript((prev) => (prev ? `${prev} ${final}` : final).trim());
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch (e) {
        /* already stopped */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, supported]);

  const start = useCallback(() => {
    if (!supported || !recognitionRef.current || listening) return;
    setError(null);
    setInterimTranscript('');
    setFinalTranscript('');
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      // start() throws if called while already running — safe to ignore
    }
  }, [supported, listening]);

  const stop = useCallback(() => {
    if (!supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      /* already stopped */
    }
  }, [supported]);

  const reset = useCallback(() => {
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  return { supported, listening, interimTranscript, finalTranscript, error, start, stop, reset };
}
