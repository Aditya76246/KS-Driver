import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

import { useLanguage } from '../context/LanguageContext';
import useVoiceInput from './useVoiceInput';
import {
  REQUIRED_BOOKING_SLOTS,
  callConversationalBookingApi,
  createVoiceBooking,
  resetMockTurnCount,
} from '../utils/conversationalBookingApi';

const STORAGE_KEY = 'voiceBookingDraft.v1';

export const ConversationPhase = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  CONFIRMING: 'confirming',
  BOOKING: 'booking',
  ERROR: 'error',
};

const EMPTY_SLOTS = {
  service_type: null,
  area_acres: null,
  date: null,
  village: null,
};

const SPEECH_LANG = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

const START_PROMPT = {
  en: 'Which service or equipment do you need?',
  hi: 'आपको कौन सी सेवा या उपकरण चाहिए?',
  te: 'మీకు ఏ సేవ లేదా పరికరం కావాలి?',
};

const RESUME_PROMPT = {
  en: 'I saved your booking details. Tap the mic to continue.',
  hi: 'आपकी बुकिंग जानकारी सुरक्षित है। जारी रखने के लिए माइक दबाएं।',
  te: 'మీ బుకింగ్ వివరాలు సేవ్ అయ్యాయి. కొనసాగించడానికి మైక్ నొక్కండి.',
};

const ERROR_PROMPT = {
  en: 'Network failed. Your details are saved. Try again.',
  hi: 'नेटवर्क समस्या है। आपकी जानकारी सुरक्षित है। फिर कोशिश करें।',
  te: 'నెట్వర్క్ సమస్య. మీ వివరాలు సేవ్ అయ్యాయి. మళ్లీ ప్రయత్నించండి.',
};

const COMPLETE_PROMPT = {
  en: 'Please confirm this booking.',
  hi: 'कृपया इस बुकिंग की पुष्टि करें।',
  te: 'దయచేసి ఈ బుకింగ్ నిర్ధారించండి.',
};

function cleanSlots(nextSlots) {
  return Object.entries(nextSlots).reduce((acc, [key, value]) => {
    acc[key] = value === undefined ? null : value;
    return acc;
  }, {});
}

function hasAllRequiredSlots(slots) {
  return REQUIRED_BOOKING_SLOTS.every((slot) => {
    const value = slots[slot];
    return value !== null && value !== undefined && String(value).trim().length > 0;
  });
}

function getMissingSlots(slots) {
  return REQUIRED_BOOKING_SLOTS.filter((slot) => !slots[slot]);
}

function makeMessage(role, text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    createdAt: new Date().toISOString(),
  };
}

function isAffirmative(text) {
  const normalized = text.toLowerCase();
  return ['yes', 'confirm', 'book', 'ok', 'okay', 'haan', 'ha', 'हाँ', 'ठीक', 'అవును', 'సరే'].some(
    (word) => normalized.includes(word)
  );
}

function isNegative(text) {
  const normalized = text.toLowerCase();
  return ['no', 'cancel', 'stop', 'nahin', 'nahi', 'नहीं', 'रद्द', 'వద్దు', 'రద్దు'].some(
    (word) => normalized.includes(word)
  );
}

export default function useConversationalBooking() {
  const { locale } = useLanguage();
  const [phase, setPhase] = useState(ConversationPhase.IDLE);
  const [slots, setSlots] = useState(EMPTY_SLOTS);
  const [messages, setMessages] = useState([]);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false);

  const phaseRef = useRef(ConversationPhase.IDLE);
  const slotsRef = useRef(EMPTY_SLOTS);
  const messagesRef = useRef([]);
  const appStateRef = useRef(AppState.currentState);
  const awaitingConfirmationRef = useRef(false);
  const isMountedRef = useRef(true);

  const missingSlots = useMemo(() => getMissingSlots(slots), [slots]);
  const isComplete = useMemo(() => hasAllRequiredSlots(slots), [slots]);

  const setSafePhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const addMessage = useCallback((role, text) => {
    if (!text) return;

    setMessages((current) => {
      const nextMessages = [...current, makeMessage(role, text)].slice(-12);
      messagesRef.current = nextMessages;
      return nextMessages;
    });
  }, []);

  const speak = useCallback(
    (text, { listenAfter = false, confirming = false } = {}) =>
      new Promise((resolve) => {
        if (!text) {
          resolve();
          return;
        }

        setSafePhase(ConversationPhase.SPEAKING);
        Speech.stop();
        Speech.speak(text, {
          language: SPEECH_LANG[locale] || 'en-IN',
          pitch: 1,
          rate: 0.92,
          onDone: () => {
            if (!isMountedRef.current) return;
            setSafePhase(confirming ? ConversationPhase.CONFIRMING : ConversationPhase.IDLE);

            if (listenAfter) {
              // Call the mic imperative API directly — no phase-reactive effect needed,
              // avoids the stale-closure setTimeout race that caused the visible stutter.
              setSafePhase(ConversationPhase.LISTENING);
              startListeningRef.current?.();
            }

            resolve();
          },
          onStopped: resolve,
          onError: () => {
            if (!isMountedRef.current) return;
            setSafePhase(confirming ? ConversationPhase.CONFIRMING : ConversationPhase.IDLE);
            resolve();
          },
        });
      }),
    [locale, setSafePhase]
  );

  const persistDraft = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          slots: slotsRef.current,
          messages: messagesRef.current,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {}
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const handleBookingCreate = useCallback(async () => {
    setSafePhase(ConversationPhase.BOOKING);
    setError('');

    try {
      const created = await createVoiceBooking({ slots: slotsRef.current, locale });
      setBookingResult(created);
      await clearDraft();
      awaitingConfirmationRef.current = false;
      addMessage('assistant', 'Booking request created.');
      await speak('Booking request created.', { listenAfter: false });
    } catch (apiError) {
      setError(apiError.message);
      setSafePhase(ConversationPhase.ERROR);
      addMessage('assistant', ERROR_PROMPT[locale] || ERROR_PROMPT.en);
      await persistDraft();
      await speak(ERROR_PROMPT[locale] || ERROR_PROMPT.en);
    }
  }, [addMessage, clearDraft, locale, persistDraft, setSafePhase, speak]);

  const handleAssistantTurn = useCallback(
    async (transcript) => {
      const cleanTranscript = transcript.trim();
      if (!cleanTranscript) return;

      setPartialTranscript('');
      addMessage('farmer', cleanTranscript);

      if (awaitingConfirmationRef.current) {
        if (isAffirmative(cleanTranscript)) {
          await handleBookingCreate();
          return;
        }

        if (isNegative(cleanTranscript)) {
          awaitingConfirmationRef.current = false;
          setSafePhase(ConversationPhase.IDLE);
          setBookingResult(null);
          addMessage('assistant', 'Booking cancelled.');
          await clearDraft();
          await speak('Booking cancelled.');
          return;
        }

        setSafePhase(ConversationPhase.CONFIRMING);
        await speak(COMPLETE_PROMPT[locale] || COMPLETE_PROMPT.en, { confirming: true });
        return;
      }

      setSafePhase(ConversationPhase.THINKING);
      setError('');

      try {
        const result = await callConversationalBookingApi({
          transcript: cleanTranscript,
          slots: slotsRef.current,
          locale,
          messages: messagesRef.current,
        });

        const nextSlots = cleanSlots({ ...slotsRef.current, ...result.slots });
        slotsRef.current = nextSlots;
        setSlots(nextSlots);
        await persistDraft();

        const turnComplete = hasAllRequiredSlots(nextSlots);
        const assistantSpeech =
          result.speech || (turnComplete ? COMPLETE_PROMPT[locale] : START_PROMPT[locale]) || START_PROMPT.en;

        addMessage('assistant', assistantSpeech);

        if (turnComplete) {
          awaitingConfirmationRef.current = true;
          await speak(assistantSpeech, { confirming: true });
          return;
        }

        await speak(assistantSpeech, { listenAfter: true });
      } catch (apiError) {
        setError(apiError.message);
        setSafePhase(ConversationPhase.ERROR);
        addMessage('assistant', ERROR_PROMPT[locale] || ERROR_PROMPT.en);
        await persistDraft();
        await speak(ERROR_PROMPT[locale] || ERROR_PROMPT.en);
      }
    },
    [
      addMessage,
      clearDraft,
      handleBookingCreate,
      locale,
      persistDraft,
      setSafePhase,
      speak,
    ]
  );

  const {
    startListening,
    stopListening,
    isListening,
    errorMsg: micError,
  } = useVoiceInput({
    onResult: handleAssistantTurn,
    onPartialResult: setPartialTranscript,
  });

  // Keep startListening in a ref so the listen() callback can call it
  // imperatively without creating a dependency cycle or double-firing.
  const startListeningRef = useRef(startListening);
  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);


  useEffect(() => {
    if (micError) {
      setError(micError);
      setSafePhase(ConversationPhase.ERROR);
    }
  }, [micError, setSafePhase]);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    resetMockTurnCount();

    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved);
        if (parsed?.slots && !hasAllRequiredSlots(EMPTY_SLOTS)) {
          const nextSlots = cleanSlots({ ...EMPTY_SLOTS, ...parsed.slots });
          slotsRef.current = nextSlots;
          setSlots(nextSlots);
          messagesRef.current = parsed.messages || [];
          setMessages(parsed.messages || []);
          setHasRecoveredDraft(Object.values(nextSlots).some(Boolean));
        }
      } catch {}
    });

    return () => {
      isMountedRef.current = false;
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (previousState === 'active' && nextAppState.match(/inactive|background/)) {
        await persistDraft();
        Speech.stop();
        if (phaseRef.current === ConversationPhase.LISTENING) {
          stopListening();
        }
        setSafePhase(ConversationPhase.IDLE);
      }
    });

    return () => subscription.remove();
  }, [persistDraft, setSafePhase, stopListening]);

  const begin = useCallback(async () => {
    awaitingConfirmationRef.current = false;
    setError('');
    setBookingResult(null);
    const prompt = hasRecoveredDraft
      ? RESUME_PROMPT[locale] || RESUME_PROMPT.en
      : START_PROMPT[locale] || START_PROMPT.en;

    addMessage('assistant', prompt);
    await speak(prompt, { listenAfter: !hasRecoveredDraft });
  }, [addMessage, hasRecoveredDraft, locale, speak]);

  const listen = useCallback(() => {
    if (
      phaseRef.current === ConversationPhase.SPEAKING ||
      phaseRef.current === ConversationPhase.THINKING ||
      phaseRef.current === ConversationPhase.BOOKING
    ) {
      return;
    }

    setError('');
    setSafePhase(ConversationPhase.LISTENING);
    startListeningRef.current?.();
  }, [setSafePhase]);

  const stop = useCallback(() => {
    if (phaseRef.current === ConversationPhase.LISTENING) {
      stopListening();
    }
    setSafePhase(ConversationPhase.IDLE);
  }, [setSafePhase, stopListening]);

  const reset = useCallback(async () => {
    Speech.stop();
    if (phaseRef.current === ConversationPhase.LISTENING) {
      stopListening();
    }
    awaitingConfirmationRef.current = false;
    slotsRef.current = EMPTY_SLOTS;
    messagesRef.current = [];
    setSlots(EMPTY_SLOTS);
    setMessages([]);
    setPartialTranscript('');
    setError('');
    setBookingResult(null);
    setHasRecoveredDraft(false);
    setSafePhase(ConversationPhase.IDLE);
    await clearDraft();
    resetMockTurnCount();
  }, [clearDraft, setSafePhase, stopListening]);

  const confirm = useCallback(() => {
    if (phaseRef.current === ConversationPhase.CONFIRMING) {
      handleBookingCreate();
    }
  }, [handleBookingCreate]);

  const sendText = useCallback((text) => {
    if (!text?.trim()) return;
    const p = phaseRef.current;
    if (
      p === ConversationPhase.SPEAKING ||
      p === ConversationPhase.THINKING ||
      p === ConversationPhase.BOOKING
    ) return;
    handleAssistantTurn(text.trim());
  }, [handleAssistantTurn]);

  return {
    phase,
    slots,
    missingSlots,
    messages,
    partialTranscript,
    error,
    bookingResult,
    isComplete,
    begin,
    listen,
    stop,
    reset,
    confirm,
    sendText,
  };
}