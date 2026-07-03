import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import SplashScreenBg from '../../assets/images/loginBg.png';
import globalStyles from '../styles/globalStyles';
import CustomText from '../components/CustomText';
import { color } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const { height: SCREEN_H } = Dimensions.get('window');

export default function OTPScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mobileNumber, otpSessionId, expiresInSeconds, selectedRole } = route.params;
  const { login } = useAuth();

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(expiresInSeconds ?? 30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(otpSessionId);

  const otpRef = useRef(null);
  const scrollRef = useRef(null);

  const translateY = useSharedValue(SCREEN_H * 0.5);
  useEffect(() => {
    translateY.value = withTiming(0, { duration: 550 });
    setTimeout(() => otpRef.current?.focus(), 350);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 450);
  }, []);
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setError('');
    setResendLoading(true);
    try {
      const res = await authService.resendOtp(mobileNumber);
      const { otpSessionId: newSessionId, expiresInSeconds: newExpiry } = res.data;
      setCurrentSessionId(newSessionId);
      setOtp('');
      setTimer(newExpiry ?? 30);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 4 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await authService.verifyOtp({
        mobileNumber,
        otpCode: otp,
        otpSessionId: currentSessionId,
      });
      const { accessToken, refreshToken, user } = res.data;
      await login({ accessToken, refreshToken, user, selectedRole });
      // AppNavigator's guard will automatically switch to the Main stack
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg ?? 'Invalid OTP. Please try again.');
      setOtp('');
      otpRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const renderOtpBoxes = () => (
    <View style={styles.otpContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => otpRef.current?.focus()}
        style={styles.otpBoxesWrapper}
      >
        {[0, 1, 2, 3].map((_, index) => (
          <View key={index} style={styles.otpBox(index === otp.length)}>
            <CustomText style={styles.otpText}>{otp[index] ?? ''}</CustomText>
          </View>
        ))}
      </TouchableOpacity>
      <TextInput
        ref={otpRef}
        value={otp}
        onChangeText={(t) => { setOtp(t); setError(''); }}
        keyboardType="number-pad"
        maxLength={4}
        style={styles.hiddenInput}
        pointerEvents="none"
      />
    </View>
  );

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ImageBackground
        source={SplashScreenBg}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.brandArea}>
          <CustomText style={styles.brandTagline}>Empowering Farm Workers</CustomText>
        </View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.sheetHandle} />

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetContent}
            bounces={false}
          >
            {/* Back */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={18} color={color.TEXT_MAIN} />
              <CustomText style={styles.backText}>Change number</CustomText>
            </TouchableOpacity>

            <View style={styles.secBadgeRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={color.GREEN} />
              <CustomText style={styles.secText}>OTP VERIFICATION</CustomText>
            </View>
            <CustomText style={styles.title}>Enter OTP</CustomText>
            <CustomText style={styles.subtitle}>
              A 4-digit code was sent to{' '}
              <CustomText style={styles.subtitleBold}>+91 {mobileNumber}</CustomText>
            </CustomText>

            <Animated.View entering={FadeIn.duration(250)}>
              {renderOtpBoxes()}

              <View style={styles.resendRow}>
                <CustomText style={styles.resendText}>Didn't receive the code?  </CustomText>
                {resendLoading ? (
                  <ActivityIndicator size="small" color={color.GREEN} />
                ) : (
                  <TouchableOpacity onPress={handleResend} disabled={!canResend} activeOpacity={0.7}>
                    <CustomText style={[styles.resendLink, !canResend && styles.resendDisabled]}>
                      {canResend ? 'Resend OTP' : `Resend in ${formatTimer(timer)}`}
                    </CustomText>
                  </TouchableOpacity>
                )}
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={14} color={color.RED} />
                  <CustomText style={styles.errorText}>{error}</CustomText>
                </View>
              )}
            </Animated.View>

            <TouchableOpacity
              style={[styles.btn, (otp.length !== 4 || loading) && styles.btnDisabled]}
              activeOpacity={0.85}
              onPress={handleVerify}
              disabled={otp.length !== 4 || loading}
            >
              {loading ? (
                <ActivityIndicator color={color.WHITE} />
              ) : (
                <>
                  <CustomText style={[styles.btnText, otp.length !== 4 && styles.btnTextDisabled]}>
                    Verify & Continue
                  </CustomText>
                  <View style={[styles.btnArrow, otp.length !== 4 && styles.btnArrowDisabled]}>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={otp.length !== 4 ? color.TEXT_MUTED : color.GREEN}
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>

            <CustomText style={styles.terms}>
              By continuing, you agree to our{' '}
              <CustomText style={styles.termsLink}>Terms of Service</CustomText>
              {' & '}
              <CustomText style={styles.termsLink}>Privacy Policy</CustomText>
            </CustomText>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.WHITE,
  },

  brandArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  brandTagline: {
    ...globalStyles.f12Regular,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 3,
  },

  sheet: {
    backgroundColor: color.WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: SCREEN_H * 0.42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 22,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.BORDER_LIGHT,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  sheetContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 26,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    ...globalStyles.f12Medium,
    color: color.TEXT_MAIN,
  },

  secBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  secText: {
    ...globalStyles.f10ExtraBold,
    color: color.GREEN,
    letterSpacing: 1.2,
  },
  title: {
    ...globalStyles.f24ExtraBold,
    color: color.TEXT_MAIN,
    lineHeight: 30,
  },
  subtitle: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18,
  },
  subtitleBold: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },

  // OTP boxes
  otpContainer: {
    position: 'relative',
  },
  otpBoxesWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  otpBox: (isActive) => ({
    width: 46,
    height: 54,
    borderRadius: 12,
    backgroundColor: isActive ? color.WHITE : color.SURFACE_LOW,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: isActive ? 2 : 1.5,
    borderColor: isActive ? color.GREEN : color.BORDER_LIGHT,
  }),
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  otpText: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  resendText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
  },
  resendLink: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },
  resendDisabled: {
    color: color.TEXT_MUTED,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: color.RED_BG,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    ...globalStyles.f12Regular,
    color: color.RED,
    flex: 1,
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.GREEN,
    height: 54,
    borderRadius: 27,
    marginTop: 22,
    gap: 10,
  },
  btnDisabled: {
    backgroundColor: color.SURFACE_LOW,
  },
  btnText: {
    ...globalStyles.f16Bold,
    color: color.WHITE,
  },
  btnTextDisabled: {
    color: color.TEXT_MUTED,
  },
  btnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnArrowDisabled: {
    backgroundColor: color.BORDER_LIGHT,
  },

  terms: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
  termsLink: {
    ...globalStyles.f10Regular,
    color: color.GREEN,
  },
});
