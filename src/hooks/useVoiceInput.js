import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LOCALE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

const MIN_CONFIDENCE_CHARS = 3;

let ExpoSpeechRecognitionModule;
let useSpeechRecognitionEvent;
try {
  const mod = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch {
  ExpoSpeechRecognitionModule = null;
  useSpeechRecognitionEvent = () => {};
}

let activeSessionId = null;
let nextSessionId = 1;

export const MicState = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  ERROR: 'error',
};

function getFriendlyError(code) {
  const friendlyMap = {
    'no-speech': 'No voice detected. Try speaking again.',
    'speech-timeout': 'No voice detected. Try speaking again.',
    'audio-capture': 'Microphone not available.',
    'not-allowed': 'Microphone permission denied.',
    network: 'No internet for voice. Try again.',
    'service-not-allowed': 'Voice recognition is disabled on this device.',
    'language-not-supported': 'This language is not supported for voice input.',
    busy: 'Voice input is already running.',
    aborted: '',
  };

  return friendlyMap[code] ?? 'Could not understand. Please try again.';
}

export default function useVoiceInput({ onResult, onPartialResult } = {}) {
  const { locale } = useLanguage();
  const bcp47 = LOCALE_MAP[locale] ?? 'en-IN';

  const [micState, setMicState] = useState(MicState.IDLE);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const sessionIdRef = useRef(nextSessionId++);
  const partialRef = useRef('');
  const resultRef = useRef(onResult);
  const partialResultRef = useRef(onPartialResult);
  const resetTimerRef = useRef(null);
  const hadErrorRef = useRef(false);

  useEffect(() => {
    resultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    partialResultRef.current = onPartialResult;
  }, [onPartialResult]);

  const isActiveSession = useCallback(
    () => activeSessionId === sessionIdRef.current,
    []
  );

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const resetAfterError = useCallback(() => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      if (isActiveSession()) {
        activeSessionId = null;
      }
      hadErrorRef.current = false;
      setMicState(MicState.IDLE);
      setErrorMsg('');
    }, 2500);
  }, [clearResetTimer, isActiveSession]);

  useSpeechRecognitionEvent('start', () => {
    if (!isActiveSession()) return;
    setMicState(MicState.LISTENING);
    setPartialTranscript('');
  });

  useSpeechRecognitionEvent('end', () => {
    if (!isActiveSession()) return;

    if (hadErrorRef.current) {
      partialRef.current = '';
      setPartialTranscript('');
      return;
    }

    const fallbackText = partialRef.current.trim();
    if (fallbackText.length >= MIN_CONFIDENCE_CHARS) {
      setTranscript(fallbackText);
      resultRef.current?.(fallbackText);
    }

    activeSessionId = null;
    partialRef.current = '';
    setPartialTranscript('');
    setMicState(MicState.IDLE);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (!isActiveSession()) return;

    const text = event?.results?.[0]?.transcript?.trim() ?? '';
    if (!text) return;

    if (event?.isFinal) {
      setTranscript(text);
      setPartialTranscript('');
      partialRef.current = '';
      resultRef.current?.(text);
    } else {
      partialRef.current = text;
      setPartialTranscript(text);
      partialResultRef.current?.(text);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (!isActiveSession()) return;

    const code = event?.error ?? 'unknown';
    const message = getFriendlyError(code);
    hadErrorRef.current = true;
    partialRef.current = '';
    setPartialTranscript('');

    if (message) {
      setErrorMsg(message);
      setMicState(MicState.ERROR);
      resetAfterError();
    } else {
      activeSessionId = null;
      hadErrorRef.current = false;
      setMicState(MicState.IDLE);
      setErrorMsg('');
    }
  });

  const startListening = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) {
      setErrorMsg('Voice not available on this build.');
      setMicState(MicState.ERROR);
      resetAfterError();
      return;
    }

    if (micState !== MicState.IDLE) return;

    clearResetTimer();
    setTranscript('');
    setPartialTranscript('');
    setErrorMsg('');
    hadErrorRef.current = false;
    partialRef.current = '';
    activeSessionId = sessionIdRef.current;

    try {
      const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
      if (!available) {
        throw new Error('service-not-allowed');
      }

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission?.granted) {
        throw new Error('not-allowed');
      }

      ExpoSpeechRecognitionModule.start({
        lang: bcp47,
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        volumeChangeEventOptions: { enabled: false },
      });
    } catch (error) {
      const code = error?.message || error?.code || 'unknown';
      setErrorMsg(getFriendlyError(code));
      setMicState(MicState.ERROR);
      resetAfterError();
    }
  }, [bcp47, clearResetTimer, micState, resetAfterError]);

  const stopListening = useCallback(() => {
    if (!isActiveSession()) return;
    setMicState(MicState.PROCESSING);
    ExpoSpeechRecognitionModule?.stop();
  }, [isActiveSession]);

  useEffect(() => {
    return () => {
      clearResetTimer();
      if (isActiveSession()) {
        activeSessionId = null;
        try {
          ExpoSpeechRecognitionModule?.abort();
        } catch {}
      }
    };
  }, [clearResetTimer, isActiveSession]);

  return {
    transcript,
    partialTranscript,
    micState,
    errorMsg,
    startListening,
    stopListening,
    isListening: micState === MicState.LISTENING,
    isProcessing: micState === MicState.PROCESSING,
    isError: micState === MicState.ERROR,
  };
}
