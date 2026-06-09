import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomText from './CustomText';
import VoiceInputButton from './VoiceInputButton';
import { color } from '../styles/theme';
import globalStyles from '../styles/globalStyles';

export default function VoiceTextInput({
  label,
  hint,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines,
  maxLength,
  // Voice
  voiceEnabled = true,
  // Extra
  style,
  inputStyle,
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  // Flash animation when voice fills the field
  const flashAnim = useRef(new Animated.Value(0)).current;

  const flashField = () => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const borderColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      focused ? color.BORDER_GREEN : color.BORDER_LIGHT,
      color.GREEN,
    ],
  });

  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      focused ? color.WHITE : color.SURFACE_LOW,
      color.GREEN_BG,
    ],
  });

  const handleVoiceResult = (text) => {
    onChangeText?.(text);
    flashField();
  };

  const handleVoicePartial = (text) => {
    // Show partial in field while still speaking
    onChangeText?.(text);
  };

  return (
    <View style={[styles.fieldGroup, style]}>
      {label ? (
        <CustomText style={styles.fieldLabel}>{label}</CustomText>
      ) : null}

      <Animated.View
        style={[
          styles.inputBox,
          multiline && styles.inputBoxMulti,
          { borderColor, backgroundColor: bgColor },
        ]}
      >
        {/* Left icon */}
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? color.GREEN : color.TEXT_MUTED}
            style={styles.leftIcon}
          />
        ) : null}

        {/* Text input */}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMulti,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={color.TEXT_MUTED}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
          allowFontScaling={false}
          {...rest}
        />

        {/* Mic button — right side */}
        {voiceEnabled ? (
          <VoiceInputButton
            size="sm"
            onResult={handleVoiceResult}
            onPartialResult={handleVoicePartial}
            style={styles.micButton}
          />
        ) : null}
      </Animated.View>

      {hint ? (
        <CustomText style={styles.fieldHint}>{hint}</CustomText>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },

  fieldLabel: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },

  fieldHint: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    lineHeight: 16,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    height: 52,
    paddingHorizontal: 14,
    gap: 8,
  },

  inputBoxMulti: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },

  leftIcon: {
    flexShrink: 0,
  },

  input: {
    flex: 1,
    ...globalStyles.f12Regular,
    color: color.TEXT_MAIN,
    padding: 0,
  },

  inputMulti: {
    paddingTop: 2,
  },

  micButton: {
    flexShrink: 0,
    marginLeft: 4,
  },
});
