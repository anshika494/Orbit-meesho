import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, VolumeX } from 'lucide-react';
import { runOnboardAgent, STARTER_MESSAGES } from '../../agents/onboardAgent';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTTS } from '../../hooks/useTTS';
import { useLanguage } from '../../context/LanguageContext';

export default function ChatInterface({ messages, setMessages, onExtracted, onLog }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    try { return window.localStorage.getItem('orbit-tts') !== 'off'; }
    catch { return true; }
  });
  const scrollRef = useRef(null);
  const { t, speechLang } = useLanguage();
  const {
    supported: micSupported,
    listening,
    interimTranscript,
    finalTranscript,
    error: micError,
    start: startListening,
    stop: stopListening,
    reset: resetTranscript,
  } = useSpeechRecognition(speechLang);

  const { supported: ttsSupported, speaking, speak, cancel } = useTTS();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  // Reflect live speech into the text box while the person is talking, so
  // they can see what the browser is hearing in real time.
  useEffect(() => {
    if (listening && interimTranscript) {
      setInput(interimTranscript);
    }
  }, [interimTranscript, listening]);

  // Once the browser is confident the utterance is complete, actually act
  // on it — send it as a message, the same as if it had been typed.
  useEffect(() => {
    if (finalTranscript) {
      send(finalTranscript);
      resetTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTranscript]);

  useEffect(() => {
    if (micError) onLog('SYSTEM', `Voice input error: ${micError}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micError]);

  function toggleTts() {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    if (!next) cancel();
    try { window.localStorage.setItem('orbit-tts', next ? 'on' : 'off'); }
    catch { /* ignore */ }
  }

  async function send(text) {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const { reply, extracted } = await runOnboardAgent(
        nextMessages.map((m) => ({ role: m.role, content: m.content })),
        onLog
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (extracted) onExtracted(extracted);
      // Speak the AI reply aloud if TTS is enabled.
      if (ttsEnabled) speak(reply, speechLang);
    } catch (err) {
      onLog('SYSTEM', `Onboard Agent error: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMic() {
    if (!micSupported) return;
    if (listening) {
      stopListening();
    } else {
      setInput('');
      startListening();
    }
  }

  return (
    <div className="chat-interface card">
      {/* Chat header with TTS toggle */}
      <div className="chat-header">
        <span className="chat-header-title">Orbit Onboard</span>
        {ttsSupported && (
          <button
            type="button"
            className={`chat-tts-btn ${ttsEnabled ? 'tts-on' : 'tts-off'}`}
            title={ttsEnabled ? 'Voice replies: ON (click to mute)' : 'Voice replies: OFF (click to enable)'}
            onClick={toggleTts}
            aria-label={ttsEnabled ? 'Mute voice replies' : 'Enable voice replies'}
          >
            {ttsEnabled
              ? <><Volume2 size={15} /> <span>Voice ON</span></>
              : <><VolumeX size={15} /> <span>Voice OFF</span></>
            }
            {speaking && <span className="tts-speaking-dot" />}
          </button>
        )}
      </div>

      <div className="chat-scroll">
        {messages.length === 0 && (
          <div className="chat-starters">
            <p className="chat-starters-label">{t('onboard.tryLabel')}</p>
            {STARTER_MESSAGES.map((s) => (
              <button key={s} className="chat-starter-chip" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble-row ${m.role === 'user' ? 'user' : 'agent'}`}>
            {m.role !== 'user' && <div className="chat-avatar">O</div>}
            <div className={`chat-bubble ${m.role === 'user' ? 'user' : 'agent'}`}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-row agent">
            <div className="chat-avatar">O</div>
            <div className="chat-bubble agent typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error">
            Agent temporarily unavailable — retrying...
            <button className="btn-secondary" onClick={() => send(messages[messages.length - 1]?.content ?? '')}>
              Retry
            </button>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <button
          type="button"
          className={`chat-mic-btn ${listening ? 'listening' : ''}`}
          aria-label={micSupported ? 'Voice input' : t('onboard.micUnsupported')}
          title={micSupported ? 'Tap to speak' : t('onboard.micUnsupported')}
          onClick={toggleMic}
          disabled={!micSupported}
        >
          <Mic size={18} />
        </button>
        <input
          className="chat-text-input"
          placeholder={listening ? t('onboard.listening') : t('onboard.inputPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary chat-send-btn" disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
