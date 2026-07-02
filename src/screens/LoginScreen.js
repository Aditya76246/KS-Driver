import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeIn,
  FadeOut,
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
import { useLanguage } from '../context/LanguageContext';

// ─── Role cards config ────────────────────────────────────────────────────────
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

// ─── Role Card ────────────────────────────────────────────────────────────────
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
          size={28}
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const navigation = useNavigation();
  const { t }                                   = useLanguage();
  const { setIsLoggedIn, setUserRole, setUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState(null);
  const [showOtp,      setShowOtp]      = useState(false);
  const [mobile,       setMobile]       = useState('');
  const [otp,          setOtp]          = useState('');
  const [timer,        setTimer]        = useState(0);
  const [canResend,    setCanResend]    = useState(false);

  const otpRef = useRef(null);

  // Bottom sheet slide-up animation
  const translateY = useSharedValue(300);
  useEffect(() => {
    translateY.value = withTiming(0, { duration: 500 });
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Auto-focus OTP input
  useEffect(() => {
    if (showOtp) setTimeout(() => otpRef.current?.focus(), 300);
  }, [showOtp]);

  // OTP countdown timer
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

  // Dummy payload — see docs/LOGIN_API.md for full spec
  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      const dummyResponse = {
        success: true,
        token: 'ksd-dummy-jwt-token',
        user: {
          id: selectedRole === 'gigWorker' ? 'USR-002' : 'USR-001',
          mobile: `+91${mobile}`,
          name: selectedRole === 'gigWorker' ? 'Suresh Kumar' : 'Ramesh Patil',
          role: selectedRole,
          profileStatus: 'incomplete',
          kycStatus: 'pending',
        },
      };
      setUser(dummyResponse.user);
      setUserRole(dummyResponse.user.role);
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
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <ImageBackground source={SplashScreenBg} style={styles.bg} resizeMode="cover">
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.bottomContainer, animatedStyle]}>

              <CustomText style={styles.secTitle}>SECURE LOGIN</CustomText>
              <CustomText style={styles.title}>Welcome to Kisan Sahakar!</CustomText>
              <CustomText style={styles.subtitle}>
                We'll send a one-time code to your phone to access your dashboard
              </CustomText>

              {/* ── Role Selector ── */}
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

              {/* ── Mobile input (reveals after role is picked) ── */}
              {selectedRole && (
                <Animated.View entering={FadeInDown.duration(300)}>
                  <CustomText style={[styles.label, { marginTop: 20 }]}>Mobile Number</CustomText>
                  <View style={styles.inputContainer}>
                    <CustomText style={styles.prefix}>+91</CustomText>
                    <TextInput
                      placeholder={t('Enter mobile number')}
                      style={styles.input}
                      keyboardType="number-pad"
                      value={mobile}
                      onChangeText={setMobile}
                      maxLength={10}
                    />
                  </View>
                </Animated.View>
              )}

              {/* ── OTP ── */}
              {showOtp && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <CustomText style={[styles.label, { marginTop: 16 }]}>Enter OTP</CustomText>
                  {renderOtpBoxes()}
                  <View style={styles.resendContainer}>
                    <CustomText style={styles.resendText}>Didn't receive OTP? </CustomText>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={!canResend}
                      activeOpacity={0.7}
                    >
                      <CustomText
                        style={[styles.resendLink, { color: canResend ? color.GREEN : '#ccc' }]}
                      >
                        {canResend ? 'Resend' : `${t('Resend in')} ${timer}s`}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* ── CTA Button ── */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  !showOtp && !canSendOtp && styles.primaryBtnDisabled,
                ]}
                activeOpacity={0.8}
                onPress={showOtp ? handleVerifyOtp : handleSendOtp}
                disabled={!showOtp && !canSendOtp}
              >
                <CustomText style={styles.primaryText}>
                  {showOtp ? 'Verify OTP' : 'Send OTP'}
                </CustomText>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomContainer: {
    backgroundColor: '#ffffffee',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  secTitle: {
    ...globalStyles.f16ExtraBold,
    color: color.GREEN,
  },
  title: {
    ...globalStyles.f24ExtraBold,
  },
  subtitle: {
    color: '#777',
    marginBottom: 20,
    marginTop: 4,
    ...globalStyles.f12Bold,
  },
  label: {
    ...globalStyles.f16ExtraBold,
    marginBottom: 10,
  },

  // ── Role cards ──
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
    padding: 14,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: color.GREEN,
    backgroundColor: color.GREEN_BG,
  },
  roleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: color.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.BORDER_GREEN,
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

  // ── Mobile input ──
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.BORDER_GREEN,
    paddingLeft: 50,
  },
  prefix: {
    position: 'absolute',
    left: 15,
    ...globalStyles.f16Bold,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    paddingRight: 15,
    ...globalStyles.f16Regular,
  },

  // ── CTA button ──
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.GREEN,
    padding: 16,
    borderRadius: 30,
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryBtnDisabled: {
    backgroundColor: color.AVATAR_BG,
  },
  primaryText: {
    color: '#fff',
    ...globalStyles.f16Bold,
  },

  // ── OTP ──
  otpContainer: {
    position: 'relative',
  },
  otpBoxesWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 10,
  },
  otpBox: (isActive) => ({
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: color.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: isActive ? 1 : 0,
    borderColor: color.BORDER_GREEN,
  }),
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  otpText: {
    ...globalStyles.f16Bold,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  resendText: {
    ...globalStyles.f14Regular,
    color: '#666',
  },
  resendLink: {
    ...globalStyles.f14Bold,
    textDecorationLine: 'underline',
  },
});
