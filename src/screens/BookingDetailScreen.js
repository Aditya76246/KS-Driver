import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomText from '../components/CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';
import { openGoogleMapsNav } from './JobNavigationScreen';

// ─── Placeholder hero image (swap with real image from API) ──────────────────
// Replace this URI with: { uri: booking.imageUrl } once API is ready
const HERO_PLACEHOLDER = {
  uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
};

const BOTTOM_BAR_HIDE_OFFSET = 110;

// ─── Info Row helper ──────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, lib = 'Ionicons', accent = false }) {
  const IconComp = lib === 'MaterialCommunityIcons' ? MaterialCommunityIcons
    : lib === 'FontAwesome5' ? FontAwesome5
    : Ionicons;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <IconComp name={icon} size={18} color={color.GREEN} />
      </View>
      <View style={styles.infoText}>
        <CustomText style={styles.infoLabel}>{label}</CustomText>
        <CustomText style={[styles.infoValue, accent && styles.infoValueAccent]}>
          {value}
        </CustomText>
      </View>
    </View>
  );
}

// ─── Section Card helper ──────────────────────────────────────────────────────

function SectionCard({ title, children, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.sectionCard}>
      <CustomText style={styles.sectionTitle}>{title}</CustomText>
      <View style={styles.sectionBody}>{children}</View>
    </Animated.View>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, onHero = false }) {
  const map = {
    new:       { label: 'New Request', bg: color.GREEN_BG,   text: color.GREEN,      icon: 'radio-button-on-outline' },
    accepted:  { label: 'Accepted',    bg: color.YELLOW_BG,  text: color.YELLOW_TEXT, icon: 'checkmark-circle-outline' },
    ongoing:   { label: 'Ongoing',     bg: '#fce4ec',        text: '#923357',        icon: 'time-outline' },
    completed: { label: 'Completed',   bg: color.GREEN_BG,   text: color.GREEN,      icon: 'checkmark-done-circle-outline' },
  };
  const s = map[status] || map.new;

  // On hero image, use a frosted/semi-transparent style
  const heroBg = 'rgba(255,255,255,0.18)';
  const heroText = '#fff';
  const heroBorder = 'rgba(255,255,255,0.35)';

  return (
    <View style={[
      styles.statusBadge,
      { backgroundColor: onHero ? heroBg : s.bg },
      onHero && { borderWidth: 1, borderColor: heroBorder },
    ]}>
      <Ionicons name={s.icon} size={14} color={onHero ? heroText : s.text} />
      <CustomText style={[styles.statusText, { color: onHero ? heroText : s.text }]}>
        {s.label}
      </CustomText>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BookingDetailScreen({ navigation, route }) {
  const { booking } = route.params;
  const [status, setStatus] = useState(booking.status);
  const insets = useSafeAreaInsets();
  const bottomBarHidden = useRef(false);
  const bottomBarProgress = useSharedValue(0);

  const hideBottomBar = () => {
    if (bottomBarHidden.current) return;
    bottomBarHidden.current = true;
    bottomBarProgress.value = withTiming(1, { duration: 220 });
  };

  const showBottomBar = () => {
    if (!bottomBarHidden.current) return;
    bottomBarHidden.current = false;
    bottomBarProgress.value = withTiming(0, { duration: 240 });
  };

  const bottomBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - bottomBarProgress.value,
    transform: [
      { translateY: bottomBarProgress.value * BOTTOM_BAR_HIDE_OFFSET },
    ],
  }));

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y <= 4) {
      showBottomBar();
      return;
    }

    hideBottomBar();
  };

  const handleScrollEnd = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y <= 4 || bottomBarHidden.current) {
      showBottomBar();
    }
  };

  const handleAccept = () => {
    Alert.alert('Accept Booking', `Accept job from ${booking.farmerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          setStatus('accepted');
          // TODO: API call
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
          // TODO: API call
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        stickyHeaderIndices={[0]}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollBegin={hideBottomBar}
        onMomentumScrollEnd={handleScrollEnd}
      >

        {/* ── Hero Image with Gradient Overlay ── */}
        <View style={styles.heroImageContainer}>
          {/* Swap HERO_PLACEHOLDER with { uri: booking.imageUrl } when API is ready */}
          <Image
            source={HERO_PLACEHOLDER}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Dark gradient: dark-top for nav, clear mid, dark-bottom for text */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.63)', 'rgba(0,0,0,0.0)', 'rgba(0, 0, 0, 0.86)']}
            locations={[0, 0.38, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Back button */}
          <Animated.View
            entering={FadeIn.delay(80).duration(350)}
            style={[styles.heroBackBtn, { top: insets.top + 10 }]}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <View style={styles.backCircle}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Status badge top-right */}
          <Animated.View
            entering={FadeIn.delay(140).duration(350)}
            style={[styles.heroBadgeWrap, { top: insets.top + 10 }]}
          >
            <StatusBadge status={status} onHero />
          </Animated.View>

          {/* Bottom overlay: name, ID, price, meta chips */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(420)}
            style={styles.heroOverlayDetails}
          >
            <View style={styles.heroNameRow}>
              <View style={{ flex: 1 }}>
                <CustomText style={styles.heroNameOverlay}>{booking.farmerName}</CustomText>
                <CustomText style={styles.heroIdOverlay}>Booking #{booking.id}</CustomText>
              </View>
              <View style={styles.heroPriceChip}>
                <CustomText style={styles.heroPriceChipLabel}>Est.</CustomText>
                <CustomText style={styles.heroPriceChipValue}>{booking.price}</CustomText>
              </View>
            </View>

            {/* Quick meta chips row */}
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaChip}>
                <Ionicons name="construct-outline" size={12} color="rgba(255,255,255,0.9)" />
                <CustomText style={styles.heroMetaText}>{booking.service}</CustomText>
              </View>
              <View style={styles.heroMetaChip}>
                <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.9)" />
                <CustomText style={styles.heroMetaText}>{booking.date}</CustomText>
              </View>
              <View style={styles.heroMetaChip}>
                <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.9)" />
                <CustomText style={styles.heroMetaText}>{booking.distance}</CustomText>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ── Content Cards ── */}
        <View style={styles.cardsContainer}>

          {/* ── Job Details ── */}
          <SectionCard title="Job Details" delay={120}>
            <InfoRow
              icon="construct-outline"
              label="Service Type"
              value={booking.service}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="resize-outline"
              label="Area"
              value={booking.area}
              accent
            />
            <View style={styles.divider} />
            <InfoRow
              icon="calendar-outline"
              label="Scheduled Date & Time"
              value={booking.date}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="map-outline"
              label="Location"
              value={booking.location}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="location-outline"
              label="Distance from You"
              value={booking.distance}
              accent
            />
          </SectionCard>

          {/* ── Description ── */}
          <SectionCard title="Job Description" delay={180}>
            <View style={styles.descriptionBox}>
              <CustomText style={styles.descriptionText}>
                {booking.description}
              </CustomText>
            </View>
          </SectionCard>

          {/* ── Payment Breakdown ── */}
          <SectionCard title="Payment Breakdown" delay={240}>
            <View style={styles.payRow}>
              <CustomText style={styles.payLabel}>Base Rate</CustomText>
              <CustomText style={styles.payValue}>{booking.price}</CustomText>
            </View>
            <View style={styles.divider} />
            <View style={styles.payRow}>
              <CustomText style={styles.payLabel}>Platform Fee</CustomText>
              <CustomText style={[styles.payValue, { color: color.TEXT_MUTED }]}>—</CustomText>
            </View>
            <View style={styles.divider} />
            <View style={[styles.payRow, styles.payRowTotal]}>
              <CustomText style={styles.payTotalLabel}>Total Estimate</CustomText>
              <CustomText style={styles.payTotalValue}>{booking.price}</CustomText>
            </View>
          </SectionCard>

          {/* ── Contact ── */}
          <SectionCard title="Farmer Contact" delay={300}>
            <InfoRow icon="call-outline" label="Phone" value="+91 98765 43210" />
            <View style={styles.divider} />
            <InfoRow icon="location-outline" label="Village" value={booking.location} />
          </SectionCard>

          {/* spacer for fixed CTA */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* ── Fixed Bottom CTA ── */}
      {status === 'new' && (
        <Animated.View
          entering={FadeInDown.delay(360).duration(400)}
          style={styles.bottomBarShell}
        >
          <Animated.View style={[styles.bottomBar, bottomBarAnimatedStyle]}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={handleReject}
              activeOpacity={0.8}
            >
              <CustomText style={styles.rejectText}>Reject</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={color.WHITE} />
              <CustomText style={styles.acceptText}>Accept Booking</CustomText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {status === 'accepted' && (
        <Animated.View
          entering={FadeInDown.delay(360).duration(400)}
          style={styles.bottomBarShell}
        >
          <Animated.View style={[styles.bottomBar, bottomBarAnimatedStyle]}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={handleReject}
              activeOpacity={0.8}
            >
              <CustomText style={styles.rejectText}>Cancel Job</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => {
                openGoogleMapsNav(15.8281, 79.9955, booking.location);
                navigation.navigate('JobNavigation', { booking });
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-outline" size={20} color={color.WHITE} />
              <CustomText style={styles.acceptText}>Start Navigation</CustomText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {(status === 'completed' || status === 'ongoing') && (
        <Animated.View
          entering={FadeInDown.delay(360).duration(400)}
          style={styles.bottomBarShell}
        >
          <Animated.View style={[styles.bottomBarSingle, bottomBarAnimatedStyle]}>
            <TouchableOpacity
              style={styles.acceptBtnFull}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <CustomText style={styles.acceptText}>Back to Bookings</CustomText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.SURFACE,
  },

  // ── Scroll ──
  scrollContent: {
    paddingBottom: 16,
    gap: 0,
  },

  // ── Hero Image ──
  heroImageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBackBtn: {
    position: 'absolute',
    left: 16,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBadgeWrap: {
    position: 'absolute',
    right: 16,
  },
  heroOverlayDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 10,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroNameOverlay: {
    ...globalStyles.f16Bold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroIdOverlay: {
    ...globalStyles.f12Regular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  heroPriceChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  heroPriceChipLabel: {
    ...globalStyles.f10Regular,
    color: 'rgba(255,255,255,0.7)',
  },
  heroPriceChipValue: {
    ...globalStyles.f14Bold,
    color: '#fff',
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroMetaText: {
    ...globalStyles.f10Regular,
    color: 'rgba(255,255,255,0.92)',
  },

  // ── Cards container ──
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  // ── Status Badge ──
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
  },
  statusText: {
    ...globalStyles.f10Bold,
  },

  // ── Section Card ──
  sectionCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  sectionTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },
  sectionBody: {
    gap: 0,
  },

  // ── Info Row ──
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    letterSpacing: 0.3,
  },
  infoValue: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  infoValueAccent: {
    color: color.GREEN,
    ...globalStyles.f14Bold,
  },

  divider: {
    height: 1,
    backgroundColor: color.BORDER_LIGHT,
    marginLeft: 48,
  },

  // ── Description ──
  descriptionBox: {
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 12,
    padding: 14,
  },
  descriptionText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    lineHeight: 20,
  },

  // ── Payment ──
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  payRowTotal: {
    backgroundColor: color.GREEN_BG,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 2,
  },
  payLabel: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
  },
  payValue: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  payTotalLabel: {
    ...globalStyles.f14Bold,
    color: color.GREEN,
  },
  payTotalValue: {
    ...globalStyles.f16Bold,
    color: color.GREEN,
  },

  // ── Bottom Bar ──
  bottomBarShell: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: color.SURFACE,
    borderTopWidth: 1,
    borderTopColor: color.BORDER_LIGHT,
  },
  bottomBarSingle: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: color.SURFACE,
    borderTopWidth: 1,
    borderTopColor: color.BORDER_LIGHT,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: color.GREEN,
    borderRadius: 99,
    paddingVertical: 15,
  },
  acceptBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: color.GREEN,
    borderRadius: 99,
    paddingVertical: 15,
  },
  acceptText: {
    ...globalStyles.f14Bold,
    color: color.WHITE,
  },
  rejectBtn: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.RED_REJECT,
    borderRadius: 99,
    paddingVertical: 15,
  },
  rejectText: {
    ...globalStyles.f14Bold,
    color: color.RED_REJECT,
  },
});
