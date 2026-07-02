import React, { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import useConversationalBooking, { ConversationPhase } from '../hooks/useConversationalBooking';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

const PHASE_LABELS = {
  [ConversationPhase.IDLE]:       'Tap the mic to speak, or type below.',
  [ConversationPhase.LISTENING]:  'Listening… speak now (up to 10 seconds).',
  [ConversationPhase.THINKING]:   'Processing your request…',
  [ConversationPhase.SPEAKING]:   'Speaking… please wait.',
  [ConversationPhase.CONFIRMING]: 'Say "Yes" to confirm or "No" to cancel.',
  [ConversationPhase.BOOKING]:    'Creating your booking…',
  [ConversationPhase.ERROR]:      'Something went wrong. Please try again.',
};

// ─── Isolated 10-second progress ticker ──────────────────────────────────────
const ListeningTimer = memo(function ListeningTimer({ isListening }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isListening) { setSeconds(0); return; }
    setSeconds(0);
    const id = setInterval(() => setSeconds(s => s < 10 ? s + 1 : 10), 1000);
    return () => clearInterval(id);
  }, [isListening]);

  if (!isListening) return null;

  return (
    <View style={styles.listeningBar}>
      <View style={[styles.listeningProgress, { width: `${(seconds / 10) * 100}%` }]} />
    </View>
  );
});

const SLOTS_IN_ORDER = [
  { slot: 'service_type', label: 'Service' },
  { slot: 'area_acres',   label: 'Area'    },
  { slot: 'date',         label: 'Date'    },
  { slot: 'village',      label: 'Village' },
];

// ─── Step progress — horizontal 4-step tracker ───────────────────────────────
const StepProgress = memo(function StepProgress({ slots, isComplete }) {
  const currentIndex = isComplete
    ? SLOTS_IN_ORDER.length
    : SLOTS_IN_ORDER.findIndex(({ slot }) => !slots[slot]);

  return (
    <View style={styles.stepRow}>
      {SLOTS_IN_ORDER.map(({ slot, label }, index) => {
        const isDone    = Boolean(slots[slot]);
        const isCurrent = index === currentIndex;
        const isLast    = index === SLOTS_IN_ORDER.length - 1;

        return (
          <React.Fragment key={slot}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                isDone    && styles.stepCircleDone,
                isCurrent && styles.stepCircleCurrent,
              ]}>
                {isDone
                  ? <Ionicons name="checkmark" size={10} color={color.WHITE} />
                  : <CustomText style={[styles.stepNum, isCurrent && styles.stepNumCurrent]}>
                      {index + 1}
                    </CustomText>
                }
              </View>
              <CustomText style={[
                styles.stepLabel,
                isDone    && styles.stepLabelDone,
                isCurrent && styles.stepLabelCurrent,
              ]}>
                {label}
              </CustomText>
              <CustomText style={styles.stepValue} numberOfLines={1}>
                {slots[slot] || (isCurrent ? '…' : '—')}
              </CustomText>
            </View>

            {!isLast && (
              <View style={[styles.stepConnector, isDone && styles.stepConnectorFilled]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
});

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({ item, isPartial }) {
  const isFarmer = item.role === 'farmer';
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[styles.messageRow, isFarmer ? styles.messageRowFarmer : styles.messageRowAssistant]}
    >
      <View style={[
        styles.messageBubble,
        isFarmer ? styles.messageBubbleFarmer : styles.messageBubbleAssistant,
        isPartial && styles.messageBubblePartial,
      ]}>
        <CustomText style={[
          styles.messageText,
          isFarmer ? styles.messageTextFarmer : styles.messageTextAssistant,
        ]}>
          {item.text}{isPartial ? ' …' : ''}
        </CustomText>
      </View>
    </Animated.View>
  );
});

// ─── Voice control panel ─────────────────────────────────────────────────────
const VoicePanel = memo(function VoicePanel({
  phase, slots, isComplete, error, bookingResult,
  hasMessages, onBegin, onListen, onStop, onReset, onConfirm,
}) {
  const isListening  = phase === ConversationPhase.LISTENING;
  const isConfirming = phase === ConversationPhase.CONFIRMING;
  const isBusy = phase === ConversationPhase.SPEAKING
    || phase === ConversationPhase.BOOKING
    || phase === ConversationPhase.THINKING;

  const indicator = useMemo(() => {
    const map = {
      [ConversationPhase.LISTENING]:  '🎤 LIVE',
      [ConversationPhase.SPEAKING]:   '🔊 SPEAKING',
      [ConversationPhase.THINKING]:   '⏳ THINKING',
      [ConversationPhase.BOOKING]:    '📤 BOOKING',
      [ConversationPhase.CONFIRMING]: '✅ CONFIRM',
      [ConversationPhase.ERROR]:      '⚠️ ERROR',
    };
    return map[phase] || '⏹️ READY';
  }, [phase]);

  // Mid-conversation: just start mic without repeating the opening prompt.
  // First time or fresh start: call begin (which speaks the intro then auto-listens).
  const mainAction = isListening
    ? onStop
    : (hasMessages || isConfirming) ? onListen : onBegin;

  const mainLabel = isListening ? 'Stop listening'
    : phase === ConversationPhase.BOOKING ? 'Booking…'
    : isBusy ? 'Please wait…'
    : hasMessages ? 'Tap to speak'
    : 'Start voice booking';

  const currentStepLabel = useMemo(() => {
    if (isComplete) return 'All details collected';
    const next = SLOTS_IN_ORDER.find(({ slot }) => !slots[slot]);
    return next ? `Step ${SLOTS_IN_ORDER.indexOf(next) + 1} of 4 — ${next.label}` : '';
  }, [slots, isComplete]);

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.voicePanel}>
      {/* Header row */}
      <View style={styles.voiceHeader}>
        <View style={styles.voiceIconBox}>
          <Ionicons name="mic-outline" size={22} color={color.GREEN} />
        </View>
        <View style={styles.voiceTextBlock}>
          <View style={styles.titleRow}>
            <CustomText style={styles.panelTitle}>Farm Service Booking</CustomText>
            <CustomText style={styles.indicator}>{indicator}</CustomText>
          </View>
          <CustomText style={styles.panelSub}>{PHASE_LABELS[phase]}</CustomText>
        </View>
      </View>

      <ListeningTimer isListening={isListening} />

      {/* Buttons */}
      <View style={styles.voiceActions}>
        {/* Main mic / stop */}
        <Pressable
          style={({ pressed }) => [
            styles.actionButton, styles.primaryButton,
            pressed && styles.buttonPressed,
            isBusy && styles.buttonDisabled,
          ]}
          onPress={mainAction}
          disabled={isBusy}
        >
          {phase === ConversationPhase.BOOKING
            ? <ActivityIndicator size="small" color={color.WHITE} />
            : <Ionicons name={isListening ? 'stop' : 'mic'} size={18} color={color.WHITE} />
          }
          <CustomText style={styles.buttonText}>{mainLabel}</CustomText>
        </Pressable>

        {/* CONFIRMING: Yes + No */}
        {isConfirming && (
          <>
            <Pressable
              style={({ pressed }) => [styles.actionButton, styles.confirmYes, pressed && styles.buttonPressed]}
              onPress={onConfirm}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={color.WHITE} />
              <CustomText style={styles.buttonText}>Yes, Confirm</CustomText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionButton, styles.confirmNo, pressed && styles.buttonPressed]}
              onPress={onReset}
            >
              <Ionicons name="close-circle-outline" size={18} color={color.RED_REJECT} />
              <CustomText style={[styles.secondaryButtonText, { color: color.RED_REJECT }]}>No, Cancel</CustomText>
            </Pressable>
          </>
        )}

        {/* Reset — only when not in confirming flow */}
        {!isConfirming && hasMessages && (
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={onReset}
          >
            <Ionicons name="refresh-outline" size={18} color={color.GREEN} />
            <CustomText style={styles.secondaryButtonText}>Reset</CustomText>
          </Pressable>
        )}
      </View>

      {/* Step-by-step progress */}
      <StepProgress slots={slots} isComplete={isComplete} />

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <CustomText style={styles.errorTitle}>Error</CustomText>
          <CustomText style={styles.errorText}>{error}</CustomText>
        </View>
      ) : null}

      {/* Booking result */}
      {bookingResult ? (
        <View style={styles.resultBox}>
          <CustomText style={styles.resultTitle}>
            {bookingResult.message || 'Booking successful!'}
          </CustomText>
          {bookingResult.bookingId ? (
            <CustomText style={styles.resultSub}>Booking ID: {bookingResult.bookingId}</CustomText>
          ) : null}
          <View style={styles.resultPayload}>
            <CustomText style={styles.payloadText}>{JSON.stringify(bookingResult, null, 2)}</CustomText>
          </View>
        </View>
      ) : null}

      {/* Conversation section header */}
      <View style={styles.chatHeader}>
        <CustomText style={styles.chatTitle}>Conversation</CustomText>
        <CustomText style={styles.chatSubtitle}>{currentStepLabel}</CustomText>
      </View>
    </Animated.View>
  );
});

// ─── Typed text input bar ─────────────────────────────────────────────────────
const TextInputBar = memo(function TextInputBar({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  return (
    <View style={styles.inputBar}>
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder="Type your response…"
        placeholderTextColor={color.TEXT_MUTED}
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
        multiline={false}
      />
      <Pressable
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        style={({ pressed }) => [
          styles.sendButton,
          (disabled || !text.trim()) && styles.sendButtonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons name="send" size={18} color={color.WHITE} />
      </Pressable>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SpeechCommandDemoScreen({ navigation }) {
  const flatListRef = useRef(null);

  const {
    phase,
    slots,
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
  } = useConversationalBooking();

  const hasMessages = messages.length > 0;

  // Disable text input while AI is speaking/thinking/booking/mic is live
  const inputDisabled = phase === ConversationPhase.SPEAKING
    || phase === ConversationPhase.THINKING
    || phase === ConversationPhase.BOOKING
    || phase === ConversationPhase.LISTENING;

  // Merge real messages + live partial transcript bubble at the tail
  const listData = useMemo(() => {
    if (!partialTranscript) return messages;
    return [...messages, { id: '__partial__', role: 'farmer', text: partialTranscript }];
  }, [messages, partialTranscript]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, partialTranscript, scrollToBottom]);

  const renderItem = useCallback(
    ({ item }) => <MessageBubble item={item} isPartial={item.id === '__partial__'} />,
    [],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <InnerScreenHeader navigation={navigation} title="Voice Booking" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        {/* Fixed voice control panel — does not scroll */}
        <View style={styles.panelContainer}>
          <VoicePanel
            phase={phase}
            slots={slots}
            isComplete={isComplete}
            error={error}
            bookingResult={bookingResult}
            hasMessages={hasMessages}
            onBegin={begin}
            onListen={listen}
            onStop={stop}
            onReset={reset}
            onConfirm={confirm}
          />
        </View>

        {/* Only the chat messages scroll */}
        <FlatList
          ref={flatListRef}
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={32} color={color.TEXT_MUTED} />
              <CustomText style={styles.emptyTitle}>No conversation yet</CustomText>
              <CustomText style={styles.emptySub}>
                Tap the mic or type below to start your booking.
              </CustomText>
            </View>
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          windowSize={5}
          initialNumToRender={8}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
          onContentSizeChange={scrollToBottom}
        />

        <TextInputBar onSend={sendText} disabled={inputDisabled} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.SURFACE,
  },

  flex: {
    flex: 1,
  },

  panelContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: color.BORDER_LIGHT,
    backgroundColor: color.SURFACE,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 16,
  },

  // ─── Voice panel ────────────────────────────────────────────────────────────
  voicePanel: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  voiceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  voiceTextBlock: {
    flex: 1,
    gap: 4,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  panelTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },

  indicator: {
    ...globalStyles.f11Bold,
    color: color.GREEN,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: color.GREEN_BG,
  },

  panelSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    lineHeight: 18,
  },

  // ─── Progress bar ───────────────────────────────────────────────────────────
  listeningBar: {
    height: 4,
    backgroundColor: color.BORDER_LIGHT,
    borderRadius: 2,
    overflow: 'hidden',
  },

  listeningProgress: {
    height: '100%',
    backgroundColor: color.GREEN,
    borderRadius: 2,
  },

  // ─── Buttons ────────────────────────────────────────────────────────────────
  voiceActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },

  primaryButton: {
    backgroundColor: color.GREEN,
    borderColor: color.GREEN,
  },

  secondaryButton: {
    backgroundColor: color.WHITE,
    borderColor: color.GREEN,
  },

  confirmYes: {
    backgroundColor: color.GREEN,
    borderColor: color.GREEN,
  },

  confirmNo: {
    backgroundColor: color.WHITE,
    borderColor: color.RED_REJECT,
  },

  buttonText: {
    ...globalStyles.f12Bold,
    color: color.WHITE,
  },

  secondaryButtonText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  // ─── Step progress ───────────────────────────────────────────────────────────
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: color.SURFACE_LOW,
    borderWidth: 1.5,
    borderColor: color.BORDER_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepCircleDone: {
    backgroundColor: color.GREEN,
    borderColor: color.GREEN,
  },

  stepCircleCurrent: {
    borderColor: color.GREEN,
    backgroundColor: color.GREEN_BG,
  },

  stepNum: {
    fontSize: 10,
    fontWeight: '600',
    color: color.TEXT_MUTED,
  },

  stepNumCurrent: {
    color: color.GREEN,
  },

  stepConnector: {
    height: 1.5,
    flex: 0.6,
    marginTop: 11,
    backgroundColor: color.BORDER_LIGHT,
  },

  stepConnectorFilled: {
    backgroundColor: color.GREEN,
  },

  stepLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
  },

  stepLabelDone: {
    color: color.GREEN,
  },

  stepLabelCurrent: {
    color: color.GREEN,
    fontWeight: '600',
  },

  stepValue: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
    maxWidth: 60,
  },

  // ─── Error & result ─────────────────────────────────────────────────────────
  errorBox: {
    backgroundColor: color.RED_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.RED_REJECT,
    padding: 12,
  },

  errorTitle: {
    ...globalStyles.f12Bold,
    color: color.RED_REJECT,
    marginBottom: 4,
  },

  errorText: {
    ...globalStyles.f12Regular,
    color: color.RED_REJECT,
  },

  resultBox: {
    backgroundColor: color.GREEN_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.GREEN,
    padding: 12,
    gap: 4,
  },

  resultTitle: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },

  resultSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
  },

  resultPayload: {
    backgroundColor: color.WHITE,
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
  },

  payloadText: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    lineHeight: 18,
  },

  // ─── Conversation header ────────────────────────────────────────────────────
  chatHeader: {
    gap: 4,
    paddingTop: 4,
  },

  chatTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },

  chatSubtitle: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
  },

  // ─── Message bubbles ────────────────────────────────────────────────────────
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },

  messageRowFarmer: {
    justifyContent: 'flex-end',
  },

  messageRowAssistant: {
    justifyContent: 'flex-start',
  },

  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },

  messageBubbleFarmer: {
    backgroundColor: color.GREEN,
    borderBottomRightRadius: 4,
  },

  messageBubbleAssistant: {
    backgroundColor: color.WHITE,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },

  messageBubblePartial: {
    opacity: 0.6,
  },

  messageText: {
    ...globalStyles.f12Regular,
    lineHeight: 18,
  },

  messageTextFarmer: {
    color: color.WHITE,
  },

  messageTextAssistant: {
    color: color.TEXT_MAIN,
  },

  // ─── Empty state ────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 10,
  },

  emptyTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },

  emptySub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
  },

  // ─── Text input bar ─────────────────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: color.BORDER_LIGHT,
    backgroundColor: color.WHITE,
  },

  textInput: {
    flex: 1,
    ...globalStyles.f14Regular,
    color: color.TEXT_MAIN,
    backgroundColor: color.SURFACE,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: color.GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: color.BORDER_LIGHT,
  },
});
