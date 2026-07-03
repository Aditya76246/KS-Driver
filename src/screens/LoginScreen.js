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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import SplashScreenBg from '../../assets/images/loginBg.png';
import globalStyles from '../styles/globalStyles';
import CustomText from '../components/CustomText';
import { color } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const { height: SCREEN_H } = Dimensions.get('window');

const ROLES = [
  {
    key: 'driver',
    title: 'Equipment Driver',
    description: 'Operate tractors, harvesters & farm equipment',
    icon: 'tractor',
  },
  {
    key: 'gigWorker',
    title: 'Gig Worker',
    description: 'Farm labour, daily wage & seasonal work',
    icon: 'account-hard-hat',
  },
];

function RoleCard({ role, selected, onSelect }) {
  const isSelected = selected === role.key;
  return (
    <TouchableOpacity
      style={[styles.roleCard, isSelected && styles.roleCardSelected]}
      onPress={() => onSelect(role.key)}
      activeOpacity={0.8}
    >
      <View style={[styles.roleIconBox, isSelected && styles.roleIconBoxSelected]}>
        <MaterialCommunityIcons
          name={role.icon}
          size={20}
          color={isSelected ? color.WHITE : color.GREEN}
        />
      </View>
      <CustomText style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>
        {role.title}
      </CustomText>
      <CustomText style={[styles.roleDesc, isSelected && styles.roleDescSelected]}>
        {role.description}
      </CustomText>
      {isSelected && (
        <View style={styles.roleCheckBadge}>
          <Ionicons name="checkmark-circle" size={18} color={color.GREEN} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const { setIsLoggedIn, setUserRole, setUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const otpRef = useRef(null);
  const scrollRef = useRef(null);

  // Slide-up entrance animation for the sheet
  const translateY = useSharedValue(SCREEN_H * 0.5);
  useEffect(() => {
    translateY.value = withTiming(0, { duration: 550 });
  }, []);
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Auto-focus OTP + scroll to bottom so the button stays visible above keyboard
  useEffect(() => {
    if (showOtp) {
      setTimeout(() => otpRef.current?.focus(), 300);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400);
    }
  }, [showOtp]);

  // OTP countdown
  useEffect(() => {
    let interval;
    if (showOtp && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0 && showOtp) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, showOtp]);

  const handleSendOtp = () => {
    setShowOtp(true);
    setTimer(30);
    setCanResend(false);
  };

  const handleResendOtp = () => {
    setOtp('');
    setTimer(30);
    setCanResend(false);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      const user = {
        id: selectedRole === 'gigWorker' ? 'USR-002' : 'USR-001',
        mobile: `+91${mobile}`,
        name: selectedRole === 'gigWorker' ? 'Suresh Kumar' : 'Ramesh Patil',
        role: selectedRole,
        profileStatus: 'incomplete',
        kycStatus: 'pending',
      };
      setUser(user);
      setUserRole(user.role);
      setIsLoggedIn(true);
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'HomeTab' } }],
      });
    } else {
      alert('Please enter all 6 digits of OTP');
    }
  };

  const canSendOtp = selectedRole && mobile.length === 10;

  const renderOtpBoxes = () => (
    <View style={styles.otpContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => otpRef.current?.focus()}
        style={styles.otpBoxesWrapper}
      >
        {[0, 1, 2, 3, 4, 5].map((_, index) => (
          <View key={index} style={styles.otpBox(index === otp.length)}>
            <CustomText style={styles.otpText}>{otp[index] || ''}</CustomText>
          </View>
        ))}
      </TouchableOpacity>
      <TextInput
        ref={otpRef}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.hiddenInput}
        pointerEvents="none"
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Full-screen background image sits behind everything */}
      <ImageBackground
        source={SplashScreenBg}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/*
        Layout strategy: KAV shrinks its own height when the keyboard opens
        (behavior="height" on Android, behavior="padding" on iOS).
        The brandArea (flex:1) absorbs that reduction, so the sheet stays
        pinned to the bottom without ever going off-screen.
        The ScrollView inside the sheet handles any content overflow.
      */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Branding — collapses naturally when KAV shrinks */}
        <View style={styles.brandArea}>
          <CustomText style={styles.brandTagline}>Empowering Farm Workers</CustomText>
        </View>

        {/* Bottom sheet — pinned to bottom, scrollable inside */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.sheetHandle} />

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetContent}
            bounces={false}
          >
            {/* Header */}
            <View style={styles.secBadgeRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={color.GREEN} />
              <CustomText style={styles.secText}>SECURE LOGIN</CustomText>
            </View>
            <CustomText style={styles.title}>Welcome to Kisan Sahakar!</CustomText>
            <CustomText style={styles.subtitle}>
              Enter your mobile number to access your dashboard
            </CustomText>

            {/* Role Selector */}
            <CustomText style={styles.label}>I am a</CustomText>
            <View style={styles.roleRow}>
              {ROLES.map((role) => (
                <RoleCard
                  key={role.key}
                  role={role}
                  selected={selectedRole}
                  onSelect={setSelectedRole}
                />
              ))}
            </View>

            {/* Mobile input — slides in after role is picked */}
            {selectedRole && (
              <Animated.View entering={FadeInDown.duration(280)}>
                <CustomText style={[styles.label, { marginTop: 18 }]}>Mobile Number</CustomText>
                <View style={styles.inputRow}>
                  <View style={styles.prefixBox}>
                    <CustomText style={styles.prefix}>🇮🇳  +91</CustomText>
                  </View>
                  <TextInput
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={color.TEXT_MUTED}
                    style={styles.input}
                    keyboardType="number-pad"
                    value={mobile}
                    onChangeText={setMobile}
                    maxLength={10}
                  />
                  {mobile.length === 10 && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={color.GREEN}
                      style={{ marginRight: 14 }}
                    />
                  )}
                </View>
              </Animated.View>
            )}

            {/* OTP section */}
            {showOtp && (
              <Animated.View entering={FadeIn.duration(250)}>
                <View style={styles.otpLabelRow}>
                  <CustomText style={[styles.label, { marginTop: 18, marginBottom: 0 }]}>
                    Enter OTP
                  </CustomText>
                  <CustomText style={styles.otpSentTo}>Sent to +91 {mobile}</CustomText>
                </View>
                {renderOtpBoxes()}
                <View style={styles.resendRow}>
                  <CustomText style={styles.resendText}>Didn't receive the code? </CustomText>
                  <TouchableOpacity onPress={handleResendOtp} disabled={!canResend} activeOpacity={0.7}>
                    <CustomText style={[styles.resendLink, !canResend && styles.resendDisabled]}>
                      {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.btn, !showOtp && !canSendOtp && styles.btnDisabled]}
              activeOpacity={0.85}
              onPress={showOtp ? handleVerifyOtp : handleSendOtp}
              disabled={!showOtp && !canSendOtp}
            >
              <CustomText style={[styles.btnText, !showOtp && !canSendOtp && styles.btnTextDisabled]}>
                {showOtp ? 'Verify & Continue' : 'Get OTP'}
              </CustomText>
              <View style={[styles.btnArrow, !showOtp && !canSendOtp && styles.btnArrowDisabled]}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={!showOtp && !canSendOtp ? color.TEXT_MUTED : color.GREEN}
                />
              </View>
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

  // ── Branding area ──────────────────────────────────────────────────────────
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

  // ── Sheet ──────────────────────────────────────────────────────────────────
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

  // ── Sheet header ───────────────────────────────────────────────────────────
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
    marginBottom: 18,
    lineHeight: 18,
  },
  label: {
    ...globalStyles.f12SemiBold,
    color: color.TEXT_MUTED,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // ── Role cards ─────────────────────────────────────────────────────────────
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: color.BORDER_LIGHT,
    backgroundColor: color.SURFACE_LOW,
    padding: 13,
    alignItems: 'center',
    gap: 5,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: color.GREEN,
    backgroundColor: color.GREEN_BG,
  },
  roleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },
  roleIconBoxSelected: {
    backgroundColor: color.GREEN,
    borderColor: color.GREEN,
  },
  roleTitle: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
    textAlign: 'center',
    marginTop: 2,
  },
  roleTitleSelected: {
    color: color.GREEN_DARK,
  },
  roleDesc: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 14,
  },
  roleDescSelected: {
    color: color.GREEN,
  },
  roleCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // ── Mobile input ───────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.SURFACE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: color.BORDER,
    height: 54,
    overflow: 'hidden',
  },
  prefixBox: {
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: color.BORDER_LIGHT,
    height: '100%',
    justifyContent: 'center',
  },
  prefix: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    ...globalStyles.f16Regular,
    color: color.TEXT_MAIN,
    height: '100%',
  },

  // ── OTP ────────────────────────────────────────────────────────────────────
  otpLabelRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  otpSentTo: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    marginBottom: 2,
  },
  otpContainer: {
    position: 'relative',
  },
  otpBoxesWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginTop: 14,
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

  // ── CTA button ─────────────────────────────────────────────────────────────
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

  // ── Terms ──────────────────────────────────────────────────────────────────
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
