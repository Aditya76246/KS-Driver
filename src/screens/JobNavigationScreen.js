import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Platform,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedRN, { FadeInDown, FadeIn } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Phases ───────────────────────────────────────────────────────────────────
const PHASE = {
  NAVIGATING: 'navigating',  // Driving to farm — map visible, "I've Reached" CTA
  COMPLETED:  'completed',   // Drop OTP verified — job done
};

// Demo OTP — swap with the value issued from your backend
const MOCK_DROP_OTP = '7263';

// ─────────────────────────────────────────────────────────────────────────────
// Open Google Maps with navigation to the farm
// ─────────────────────────────────────────────────────────────────────────────
export function openGoogleMapsNav(lat, lng, label) {
  const encodedLabel = encodeURIComponent(label || 'Farm Location');
  const androidUrl  = `google.navigation:q=${lat},${lng}&mode=d`;
  const iosUrl      = `maps:0,0?q=${encodedLabel}@${lat},${lng}`;
  const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

  const nativeUrl = Platform.OS === 'ios' ? iosUrl : androidUrl;

  Linking.canOpenURL(nativeUrl)
    .then((ok) => Linking.openURL(ok ? nativeUrl : webFallback))
    .catch(() => Linking.openURL(webFallback));
}

// ─────────────────────────────────────────────────────────────────────────────
// Fake map — replace <FakeMap> with <MapView> from react-native-maps
// ─────────────────────────────────────────────────────────────────────────────
function PulsingDot() {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.7,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.pulseRing, { transform: [{ scale: anim }] }]}>
      <View style={styles.pulseCore} />
    </Animated.View>
  );
}

function FakeMap({ farmLocation }) {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapBg}>

        {/* ── Grid lines ── */}
        {[...Array(9)].map((_, i) => (
          <View
            key={`h${i}`}
            style={[styles.mapLine, styles.mapLineH, { top: `${(i + 1) * 10}%` }]}
          />
        ))}
        {[...Array(7)].map((_, i) => (
          <View
            key={`v${i}`}
            style={[styles.mapLine, styles.mapLineV, { left: `${(i + 1) * 13}%` }]}
          />
        ))}

        {/* ── Highlighted roads ── */}
        <View style={[styles.road, { top: '38%', left: 0, right: 0, height: 7 }]} />
        <View style={[styles.road, { left: '42%', top: 0, bottom: 0, width: 7 }]} />

        {/* ── Route dashes operator → farm ── */}
        <View style={styles.routeDotted1} />
        <View style={styles.routeDotted2} />

        {/* ── Farm destination pin ── */}
        <View style={styles.farmPin}>
          <View style={styles.farmPinBubble}>
            <MaterialCommunityIcons name="tractor" size={16} color={color.WHITE} />
          </View>
          <View style={styles.farmPinTail} />
        </View>
        {/* Farm label floats to the right of the pin */}
        <View style={styles.farmLabel}>
          <CustomText style={styles.farmLabelText} numberOfLines={1}>
            {farmLocation?.name || 'Farm'}
          </CustomText>
        </View>

        {/* ── Driver (you) dot ── */}
        <View style={styles.driverDot}>
          <PulsingDot />
        </View>

        {/* ── Navigating pill ── */}
        <View style={styles.navPill}>
          <View style={styles.navPillDot} />
          <CustomText style={styles.navPillText}>Navigating…</CustomText>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drop OTP bottom sheet
// ─────────────────────────────────────────────────────────────────────────────
function DropOtpSheet({ visible, onSubmit, onClose }) {
  const [otp, setOtp]     = useState('');
  const [error, setError] = useState('');
  const inputRef          = useRef(null);

  useEffect(() => {
    if (visible) {
      setOtp('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [visible]);

  const handleVerify = () => {
    if (otp.length < 4) {
      setError('Please enter the 4-digit OTP');
      return;
    }
    if (otp !== MOCK_DROP_OTP) {
      setError('Incorrect OTP. Ask the farmer and try again.');
      setOtp('');
      return;
    }
    setError('');
    onSubmit();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        {/* Inner sheet — swallow touches so tapping inside doesn't close */}
        <Pressable style={styles.otpSheet} onPress={() => {}}>

          {/* Handle bar */}
          <View style={styles.sheetHandle} />

          {/* Shield icon */}
          <View style={styles.otpIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={38} color={color.GREEN} />
          </View>

          <CustomText style={styles.otpTitle}>Drop OTP Verification</CustomText>
          <CustomText style={styles.otpSub}>
            Ask the farmer for the 4-digit OTP sent to their phone to confirm the drop
          </CustomText>

          {/* ── 4 digit boxes ── */}
          <View style={styles.otpRow}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.otpBoxesWrap}
            >
              {[0, 1, 2, 3].map((_, i) => {
                const isCurrent = i === otp.length && !error;
                const isFilled  = !!otp[i];
                return (
                  <View
                    key={i}
                    style={[
                      styles.otpBox,
                      isCurrent && styles.otpBoxCurrent,
                      isFilled  && styles.otpBoxFilled,
                      error     && styles.otpBoxError,
                    ]}
                  >
                    <CustomText style={[
                      styles.otpDigit,
                      isFilled && styles.otpDigitFilled,
                    ]}>
                      {otp[i] || ''}
                    </CustomText>
                  </View>
                );
              })}
            </TouchableOpacity>

            {/* Hidden real TextInput behind the boxes */}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={(v) => {
                setOtp(v.replace(/\D/g, '').slice(0, 4));
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={4}
              style={styles.hiddenInput}
            />
          </View>

          {/* Error / hint line */}
          {error ? (
            <View style={styles.feedbackRow}>
              <Ionicons name="alert-circle-outline" size={14} color={color.RED_REJECT} />
              <CustomText style={styles.feedbackError}>{error}</CustomText>
            </View>
          ) : (
            <View style={styles.feedbackRow}>
              <Ionicons name="information-circle-outline" size={14} color={color.TEXT_MUTED} />
              <CustomText style={styles.feedbackHint}>
                Demo OTP: {MOCK_DROP_OTP}
              </CustomText>
            </View>
          )}

          {/* Confirm button */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              otp.length < 4 && styles.confirmBtnDisabled,
            ]}
            onPress={handleVerify}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={color.WHITE} />
            <CustomText style={styles.confirmBtnText}>Confirm Drop</CustomText>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function JobNavigationScreen({ navigation, route }) {
  const { booking } = route.params;
  const insets = useSafeAreaInsets();

  const [phase, setPhase]         = useState(PHASE.NAVIGATING);
  const [showOtp, setShowOtp]     = useState(false);

  // Farm location — wire real lat/lng from booking API
  const farmLocation = {
    name:    booking.location || 'Farm Location',
    address: booking.location || 'Andhra Pradesh',
    lat:     15.8281,
    lng:     79.9955,
  };

  const handleOtpSuccess = () => {
    setShowOtp(false);
    setPhase(PHASE.COMPLETED);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* ── Full-bleed map ── */}
      <FakeMap farmLocation={farmLocation} />

      {/* ── Top overlay: back button + phase banner ── */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topRow}>

          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color={color.GREEN_DARK} />
          </TouchableOpacity>

          {/* Phase banner */}
          <AnimatedRN.View
            key={phase}
            entering={FadeIn.duration(300)}
            style={[
              styles.phaseBanner,
              phase === PHASE.COMPLETED
                ? { backgroundColor: color.GREEN }
                : { backgroundColor: color.GREEN_DARK },
            ]}
          >
            <View style={styles.phaseBannerIcon}>
              <Ionicons
                name={phase === PHASE.COMPLETED ? 'checkmark-circle' : 'navigate'}
                size={20}
                color={color.WHITE}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomText style={styles.phaseBannerTitle}>
                {phase === PHASE.COMPLETED ? 'Drop Confirmed!' : 'Navigating to Farm'}
              </CustomText>
              <CustomText style={styles.phaseBannerSub}>
                {phase === PHASE.COMPLETED
                  ? 'Job completed successfully'
                  : 'Tap Open Maps to get directions'}
              </CustomText>
            </View>
          </AnimatedRN.View>

        </View>
      </View>

      {/* ── Bottom sheet ── */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>

        {/* ── Farmer + booking summary ── */}
        <AnimatedRN.View
          entering={FadeInDown.delay(60).duration(380)}
          style={styles.summaryRow}
        >
          <View style={styles.summaryAvatar}>
            <Ionicons name="person" size={22} color={color.TEXT_MUTED} />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.summaryFarmer}>{booking.farmerName}</CustomText>
            <CustomText style={styles.summaryService}>
              {booking.service}  ·  {booking.area}
            </CustomText>
          </View>
          <View style={styles.summaryPriceBox}>
            <CustomText style={styles.summaryPriceLabel}>Est.</CustomText>
            <CustomText style={styles.summaryPriceValue}>{booking.price}</CustomText>
          </View>
        </AnimatedRN.View>

        {/* ── Open Maps button (always visible while navigating) ── */}
        {phase === PHASE.NAVIGATING && (
          <AnimatedRN.View entering={FadeInDown.delay(100).duration(380)}>
            <TouchableOpacity
              style={styles.mapsCard}
              onPress={() => openGoogleMapsNav(farmLocation.lat, farmLocation.lng, farmLocation.name)}
              activeOpacity={0.82}
            >
              {/* Left: location pin icon */}
              <View style={styles.mapsCardIconBox}>
                <Ionicons name="location" size={22} color={color.WHITE} />
              </View>

              {/* Middle: address */}
              <View style={{ flex: 1 }}>
                <CustomText style={styles.mapsCardTitle}>
                  {farmLocation.name}
                </CustomText>
                <CustomText style={styles.mapsCardAddress} numberOfLines={1}>
                  {farmLocation.address}
                </CustomText>
              </View>

              {/* Right: open chip */}
              <View style={styles.mapsOpenChip}>
                <MaterialCommunityIcons name="google-maps" size={15} color={color.WHITE} />
                <CustomText style={styles.mapsOpenChipText}>Open Maps</CustomText>
              </View>
            </TouchableOpacity>
          </AnimatedRN.View>
        )}

        {/* ── Info chips ── */}
        <AnimatedRN.View
          entering={FadeInDown.delay(140).duration(380)}
          style={styles.chipsRow}
        >
          <View style={styles.chip}>
            <Ionicons name="navigate-outline" size={13} color={color.GREEN} />
            <CustomText style={styles.chipText}>{booking.distance}</CustomText>
          </View>
          <View style={styles.chip}>
            <Ionicons name="calendar-outline" size={13} color={color.GREEN} />
            <CustomText style={styles.chipText}>{booking.date}</CustomText>
          </View>
          <View style={styles.chip}>
            <MaterialCommunityIcons name="resize" size={13} color={color.GREEN} />
            <CustomText style={styles.chipText}>{booking.area}</CustomText>
          </View>
        </AnimatedRN.View>

        {/* ── CTA: Navigating phase ── */}
        {phase === PHASE.NAVIGATING && (
          <AnimatedRN.View
            entering={FadeInDown.delay(180).duration(380)}
            style={styles.ctaRow}
          >
            {/* Call farmer */}
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL('tel:+919876543210')}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={20} color={color.GREEN} />
            </TouchableOpacity>

            {/* I've Reached → opens OTP sheet */}
            <TouchableOpacity
              style={styles.reachedBtn}
              onPress={() => setShowOtp(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="location" size={20} color={color.WHITE} />
              <CustomText style={styles.reachedBtnText}>I've Reached</CustomText>
            </TouchableOpacity>
          </AnimatedRN.View>
        )}

        {/* ── CTA: Completed phase ── */}
        {phase === PHASE.COMPLETED && (
          <AnimatedRN.View
            entering={FadeInDown.duration(350)}
            style={styles.completedBlock}
          >
            {/* Success badge */}
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={26} color={color.GREEN} />
              <View>
                <CustomText style={styles.completedBadgeTitle}>Drop Confirmed</CustomText>
                <CustomText style={styles.completedBadgeSub}>
                  Payment credited in 3–5 business days
                </CustomText>
              </View>
            </View>

            {/* Back to Bookings */}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => navigation.navigate('BookingsMain')}
              activeOpacity={0.85}
            >
              <CustomText style={styles.doneBtnText}>Back to Bookings</CustomText>
              <Ionicons name="arrow-forward" size={18} color={color.WHITE} />
            </TouchableOpacity>
          </AnimatedRN.View>
        )}

      </View>

      {/* ── Drop OTP Modal ── */}
      <DropOtpSheet
        visible={showOtp}
        onSubmit={handleOtpSuccess}
        onClose={() => setShowOtp(false)}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.SURFACE_LOW },

  // ── Map ──────────────────────────────────────────────────────────────────────
  mapContainer: { ...StyleSheet.absoluteFillObject },
  mapBg: {
    flex: 1,
    backgroundColor: '#d8e8d8',
    overflow: 'hidden',
    position: 'relative',
  },
  mapLine: { position: 'absolute', backgroundColor: 'rgba(160,195,160,0.4)' },
  mapLineH: { left: 0, right: 0, height: 1 },
  mapLineV: { top: 0, bottom: 0, width: 1 },

  road: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 3,
  },

  // Route dotted lines
  routeDotted1: {
    position: 'absolute',
    top: '44%',
    left: '22%',
    width: '22%',
    height: 3,
    backgroundColor: color.GREEN,
    borderRadius: 2,
    opacity: 0.65,
  },
  routeDotted2: {
    position: 'absolute',
    top: '32%',
    left: '44%',
    width: 3,
    height: '12%',
    backgroundColor: color.GREEN,
    borderRadius: 2,
    opacity: 0.65,
  },

  // Farm pin
  farmPin: {
    position: 'absolute',
    top: '22%',
    left: '41%',
    alignItems: 'center',
  },
  farmPinBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 6,
  },
  farmPinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: color.GREEN,
  },

  // Farm label
  farmLabel: {
    position: 'absolute',
    top: '22%',
    left: '52%',
    marginTop: 6,
  },
  farmLabelText: {
    ...globalStyles.f10Bold,
    color: color.GREEN_DARK,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  // Driver dot
  driverDot: {
    position: 'absolute',
    top: '48%',
    left: '26%',
  },
  pulseRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(30,136,229,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E88E5',
    borderWidth: 2.5,
    borderColor: color.WHITE,
  },

  // Navigating pill on map
  navPill: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -70 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: color.GREEN_DARK,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
  },
  navPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.YELLOW,
  },
  navPillText: { ...globalStyles.f10Bold, color: color.WHITE },

  // ── Top overlay ───────────────────────────────────────────────────────────────
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: color.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexShrink: 0,
  },
  phaseBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 5,
  },
  phaseBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseBannerTitle: { ...globalStyles.f12Bold,    color: color.WHITE },
  phaseBannerSub:   { ...globalStyles.f10Regular, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // ── Bottom sheet ──────────────────────────────────────────────────────────────
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color.WHITE,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryFarmer:     { ...globalStyles.f14Bold,    color: color.TEXT_MAIN },
  summaryService:    { ...globalStyles.f12Regular, color: color.TEXT_MUTED, marginTop: 2 },
  summaryPriceBox:   { alignItems: 'flex-end' },
  summaryPriceLabel: { ...globalStyles.f10Regular, color: color.TEXT_MUTED },
  summaryPriceValue: { ...globalStyles.f16Bold,    color: color.YELLOW_TEXT },

  // Open Maps card
  mapsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.GREEN_DARK,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: color.GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  mapsCardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapsCardTitle:   { ...globalStyles.f12Bold,    color: color.WHITE },
  mapsCardAddress: { ...globalStyles.f10Regular, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  mapsOpenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  mapsOpenChipText: { ...globalStyles.f10Bold, color: color.WHITE },

  // Info chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: color.SURFACE_LOW,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },
  chipText: { ...globalStyles.f10Regular, color: color.TEXT_SUB },

  // CTA row
  ctaRow: { flexDirection: 'row', gap: 12 },
  callBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: color.BORDER_GREEN,
  },
  reachedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: color.GREEN,
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: color.GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  reachedBtnText: { ...globalStyles.f14Bold, color: color.WHITE },

  // Completed block
  completedBlock: { gap: 12 },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: color.GREEN_BG,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: color.BORDER_GREEN,
  },
  completedBadgeTitle: { ...globalStyles.f14Bold,    color: color.GREEN },
  completedBadgeSub:   { ...globalStyles.f10Regular, color: color.TEXT_MUTED, marginTop: 2 },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: color.GREEN,
    borderRadius: 16,
    paddingVertical: 15,
  },
  doneBtnText: { ...globalStyles.f14Bold, color: color.WHITE },

  // ── Drop OTP Sheet ────────────────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'flex-end',
  },
  otpSheet: {
    backgroundColor: color.WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    alignItems: 'center',
    gap: 14,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    backgroundColor: color.BORDER_LIGHT,
    marginBottom: 4,
  },
  otpIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpTitle: {
    ...globalStyles.f20Bold,
    color: color.TEXT_MAIN,
    textAlign: 'center',
  },
  otpSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -6,
  },

  // OTP boxes
  otpRow: { width: '100%', alignItems: 'center', position: 'relative' },
  otpBoxesWrap: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  otpBox: {
    width: 64,
    height: 72,
    borderRadius: 16,
    backgroundColor: color.SURFACE_LOW,
    borderWidth: 2,
    borderColor: color.BORDER_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxCurrent: {
    borderColor: color.GREEN,
    backgroundColor: color.GREEN_BG,
  },
  otpBoxFilled: {
    borderColor: color.GREEN_DARK,
    backgroundColor: color.GREEN_BG,
  },
  otpBoxError: {
    borderColor: color.RED_REJECT,
    backgroundColor: color.RED_BG,
  },
  otpDigit: {
    ...globalStyles.f24Bold,
    color: color.TEXT_MUTED,
  },
  otpDigitFilled: {
    color: color.GREEN_DARK,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },

  // Feedback
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
  },
  feedbackError: { ...globalStyles.f12Regular, color: color.RED_REJECT },
  feedbackHint:  { ...globalStyles.f12Regular, color: color.TEXT_MUTED },

  // Confirm button
  confirmBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: color.GREEN,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 4,
    shadowColor: color.GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { ...globalStyles.f16Bold, color: color.WHITE },
});