import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
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
import { authService } from '../services/authService';

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
  const [selectedRole, setSelectedRole] = useState(null);
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const translateY = useSharedValue(SCREEN_H * 0.5);
  useEffect(() => {
    translateY.value = withTiming(0, { duration: 550 });
  }, []);
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const canSendOtp = selectedRole && mobile.length === 10 && !loading;

  const handleSendOtp = async () => {
    if (!canSendOtp) return;
    setError('');
    setLoading(true);
    try {
      const res = await authService.sendOtp(mobile);
      const { otpSessionId, mobileNumber, expiresInSeconds } = res.data;
      navigation.navigate('OTP', {
        mobileNumber: mobileNumber ?? mobile,
        otpSessionId,
        expiresInSeconds: expiresInSeconds ?? 30,
        selectedRole,
      });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetContent}
            bounces={false}
          >
            <View style={styles.secBadgeRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={color.GREEN} />
              <CustomText style={styles.secText}>SECURE LOGIN</CustomText>
            </View>
            <CustomText style={styles.title}>Welcome to Kisan Sahakar!</CustomText>
            <CustomText style={styles.subtitle}>
              Enter your mobile number to access your dashboard
            </CustomText>

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
                    onChangeText={(t) => { setMobile(t); setError(''); }}
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

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color={color.RED} />
                <CustomText style={styles.errorText}>{error}</CustomText>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, !canSendOtp && styles.btnDisabled]}
              activeOpacity={0.85}
              onPress={handleSendOtp}
              disabled={!canSendOtp}
            >
              {loading ? (
                <ActivityIndicator color={color.WHITE} />
              ) : (
                <>
                  <CustomText style={[styles.btnText, !canSendOtp && styles.btnTextDisabled]}>
                    Get OTP
                  </CustomText>
                  <View style={[styles.btnArrow, !canSendOtp && styles.btnArrowDisabled]}>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={!canSendOtp ? color.TEXT_MUTED : color.GREEN}
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

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
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
