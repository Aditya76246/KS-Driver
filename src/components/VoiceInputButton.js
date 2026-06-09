import React, { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomText from './CustomText';
import useVoiceInput from '../hooks/useVoiceInput';
import { color } from '../styles/theme';
import globalStyles from '../styles/globalStyles';

const SIZE = {
  sm: { button: 36, icon: 16, pulse: 52 },
  md: { button: 46, icon: 20, pulse: 66 },
  lg: { button: 56, icon: 24, pulse: 80 },
};

export default function VoiceInputButton({
  onResult,
  onPartialResult,
  size = 'md',
  style,
  disabled = false,
}) {
  const {
    startListening,
    stopListening,
    isListening,
    isProcessing,
    isError,
    errorMsg,
  } = useVoiceInput({ onResult, onPartialResult });

  const tokens = SIZE[size] ?? SIZE.md;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef(null);

  const startPulse = useCallback(() => {
    pulseAnim.setValue(0);
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseLoop.current?.stop();
    pulseLoop.current = null;
    pulseAnim.setValue(0);
  }, [pulseAnim]);

  useEffect(() => {
    if (isListening) {
      startPulse();
    } else {
      stopPulse();
    }

    return stopPulse;
  }, [isListening, startPulse, stopPulse]);

  const handlePress = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.55],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.55, 0.2, 0],
  });

  const buttonBg = isListening
    ? color.RED_REJECT
    : isError
    ? color.RED_BG
    : color.GREEN_BG;

  const iconColor = isListening
    ? color.WHITE
    : isError
    ? color.RED_REJECT
    : color.GREEN;

  const iconName = isListening ? 'mic' : 'mic-outline';

  return (
    <View style={[styles.wrapper, style]}>
      {isListening && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseRing,
            {
              width: tokens.pulse,
              height: tokens.pulse,
              borderRadius: tokens.pulse / 2,
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}

      <Pressable
        onPress={handlePress}
        disabled={disabled || isProcessing}
        accessibilityRole="button"
        accessibilityLabel={isListening ? 'Stop recording' : 'Start voice input'}
        accessibilityState={{ busy: isListening || isProcessing, disabled }}
        style={({ pressed }) => [
          styles.button,
          {
            width: tokens.button,
            height: tokens.button,
            borderRadius: tokens.button / 2,
            backgroundColor: buttonBg,
            borderColor: isListening || isError
              ? color.RED_REJECT
              : color.BORDER_GREEN,
            opacity: pressed ? 0.78 : disabled ? 0.5 : 1,
          },
        ]}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={color.GREEN} />
        ) : (
          <Ionicons name={iconName} size={tokens.icon} color={iconColor} />
        )}
      </Pressable>

      {isError && errorMsg.length > 0 && (
        <View style={styles.errorBubble}>
          <CustomText style={styles.errorText}>{errorMsg}</CustomText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  pulseRing: {
    position: 'absolute',
    backgroundColor: color.RED_REJECT,
  },

  button: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  errorBubble: {
    position: 'absolute',
    bottom: -28,
    backgroundColor: color.RED_BG,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: color.RED_REJECT,
    width: 180,
    zIndex: 10,
  },

  errorText: {
    ...globalStyles.f10Regular,
    color: color.RED_REJECT,
    textAlign: 'center',
  },
});
