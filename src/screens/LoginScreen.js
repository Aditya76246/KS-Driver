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
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import SplashScreenBg from '../../assets/images/loginBg.png';
import globalStyles from '../styles/globalStyles';
import CustomText from '../components/CustomText';

const GREEN = '#2e7d32';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [showOtp, setShowOtp] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const otpRef = useRef(null);

  // 🔥 Bottom sheet animation
  const translateY = useSharedValue(300);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // 🔥 Auto focus OTP
  useEffect(() => {
    if (showOtp) {
      setTimeout(() => {
        otpRef.current?.focus();
      }, 300);
    }
  }, [showOtp]);

  // 🔥 OTP Timer
  useEffect(() => {
    let interval;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && showOtp) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, showOtp]);

  // 🔥 Handle Send OTP
  const handleSendOtp = () => {
    setShowOtp(true);
    setTimer(30);
    setCanResend(false);
  };

  // 🔥 Handle Resend OTP
  const handleResendOtp = () => {
    setOtp('');
    setTimer(30);
    setCanResend(false);
  };

  // 🔥 Handle Verify OTP
  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      navigation.getParent()?.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: { screen: 'HomeTab' },
          },
        ],
      });
    } else {
      alert('Please enter all 6 digits of OTP');
    }
  };

  // 🔥 OTP box renderer
  const renderOtpBoxes = () => {
    return (
      <View style={styles.otpContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => otpRef.current?.focus()}
          style={styles.otpBoxesWrapper}
        >
          {[0, 1, 2, 3, 4, 5].map((_, index) => (
            <View key={index} style={styles.otpBox(index === otp.length)}>
              <CustomText style={styles.otpText}>
                {otp[index] || ''}
              </CustomText>
            </View>
          ))}
        </TouchableOpacity>

        {/* Hidden Input */}
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
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <ImageBackground
        source={SplashScreenBg}
        style={styles.bg}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[styles.bottomContainer, animatedStyle]}
              layout={Layout.springify()}
            >
              <CustomText style={styles.title}>Welcome to Kisan Sahakar!</CustomText>
              <CustomText style={styles.subtitle}>Login to continue</CustomText>

              {/* Mobile */}
              <CustomText style={styles.label}>Mobile Number</CustomText>

              <View style={styles.inputRow}>
                <View style={styles.countryCode}>
                  <CustomText style={styles.codeText}>+91</CustomText>
                </View>

                <TextInput
                  placeholder="Enter mobile number"
                  style={styles.input}
                  keyboardType="number-pad"
                  value={mobile}
                  onChangeText={setMobile}
                  maxLength={10}
                />
              </View>

              {/* OTP */}
              {showOtp && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  layout={Layout.springify()}
                >
                  <CustomText style={[styles.label, { marginTop: 16 }]}>
                    Enter OTP
                  </CustomText>

                  {renderOtpBoxes()}

                  {/* Resend OTP */}
                  <View style={styles.resendContainer}>
                    <CustomText style={styles.resendText}>
                      Didn't receive OTP?{' '}
                    </CustomText>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={!canResend}
                      activeOpacity={0.7}
                    >
                      <CustomText
                        style={[
                          styles.resendLink,
                          { color: canResend ? GREEN : '#ccc' },
                        ]}
                      >
                        {canResend ? 'Resend' : `Resend in ${timer}s`}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.8}
                onPress={showOtp ? handleVerifyOtp : handleSendOtp}
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

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  bottomContainer: {
    backgroundColor: '#ffffffee',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  title: {
    ...globalStyles.f16Bold,
  },

  subtitle: {
    color: '#777',
    marginBottom: 20,
    ...globalStyles.f10Regular,
  },

  label: {
    fontSize: 14,
    ...globalStyles.f12Bold,
    marginBottom: 8,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  countryCode: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 10,
  },

  codeText: {
    ...globalStyles.f12Bold,
  },

  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 12,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    padding: 16,
    borderRadius: 30,
    justifyContent: 'center',
    marginTop: 24,
  },

  primaryText: {
    color: '#fff',
    ...globalStyles.f14Bold,
  },

  // 🔥 OTP styles
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
    backgroundColor: '#e7e7e7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: isActive ? 2 : 0,
    borderColor: '#2e7d32',
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

  // 🔥 Resend OTP styles
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },

  resendText: {
    ...globalStyles.f12Regular,
    color: '#666',
  },

  resendLink: {
    ...globalStyles.f12Bold,
    textDecorationLine: 'underline',
  },

});
