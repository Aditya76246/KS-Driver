import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const BOOKING_REQUESTS = [
  {
    id: '1',
    name: 'Suresh Reddy',
    service: 'Threshing Request',
    estimate: '₹1,200 Est.',
    equipment: 'John Deere 5050D',
    area: '4.5 Acres',
    distance: '2.4 km away',
    timing: 'Starts 10:30 AM',
    avatar: null,
  },
  {
    id: '2',
    name: 'Vikas Patel',
    service: 'Ploughing Request',
    estimate: '₹850 Est.',
    equipment: 'Mahindra 575',
    area: '3.0 Acres',
    distance: '1.8 km away',
    timing: 'Starts 12:00 PM',
    avatar: null,
  },
];

const QUICK_ACTIONS = [
  { id: 'BookingsTab', label: 'My Trips',  icon: 'clipboard-list',  lib: 'FontAwesome5',            color: color.GREEN,      bg: color.GREEN_LIGHT },
  { id: 'EarningsTab', label: 'Earnings',  icon: 'cash-multiple',   lib: 'MaterialCommunityIcons',  color: color.YELLOW_TEXT, bg: color.YELLOW_BG },
  { id: 'FuelTab',     label: 'Fuel Log',  icon: 'gas-station',     lib: 'MaterialCommunityIcons',  color: '#923357',         bg: '#fce4ec' },
  { id: 'SupportTab',  label: 'Support',   icon: 'headset',         lib: 'MaterialCommunityIcons',  color: color.TEXT_SUB,    bg: color.AVATAR_BG },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function OnlineToggle({ isOnline, onToggle }) {
  return (
    <TouchableOpacity
      style={styles.toggleWrapper}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <View style={[styles.toggleTrack, isOnline && styles.toggleTrackActive]}>
        <View style={[styles.toggleThumb, isOnline ? styles.thumbOnline : styles.thumbOffline]}>
          <CustomText style={[styles.toggleLabel, { color: isOnline ? color.WHITE : color.TEXT_SUB }]}>
            {isOnline ? 'Online' : 'Offline'}
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ProfileBanner({ onPress }) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.profileBanner}>
      <View style={styles.profileBannerLeft}>
        <View style={styles.profileWarningIcon}>
          <Ionicons name="person-circle-outline" size={28} color={color.GREEN} />
        </View>
        <View style={{ flex: 1 }}>
          <CustomText style={styles.profileBannerTitle}>Complete Your Profile & KYC</CustomText>
          <CustomText style={styles.profileBannerSub}>Verify your details to start accepting jobs</CustomText>
        </View>
      </View>
      <TouchableOpacity style={styles.profileBannerBtn} onPress={onPress} activeOpacity={0.8}>
        <CustomText style={styles.profileBannerBtnText}>Update</CustomText>
        <Ionicons name="arrow-forward" size={14} color={color.WHITE} style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function StatCard({ title, value, subtitle, progress, goal, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.statCard}>
      <CustomText style={styles.statCardTitle}>{title}</CustomText>
      <CustomText style={styles.statCardValue}>{value}</CustomText>
      {subtitle ? (
        <View style={styles.statSubRow}>
          <Ionicons name="trending-up" size={14} color={color.GREEN} />
          <CustomText style={styles.statSubText}>{subtitle}</CustomText>
        </View>
      ) : null}
      {progress !== undefined ? (
        <>
          <CustomText style={styles.statGoalText}>
            {Math.round(progress * 12)} / {goal} Goal
          </CustomText>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { flex: progress }]} />
            <View style={{ flex: 1 - progress }} />
          </View>
        </>
      ) : null}
    </Animated.View>
  );
}

function QuickActionButton({ action, onPress }) {
  const IconComp =
    action.lib === 'MaterialCommunityIcons'
      ? MaterialCommunityIcons
      : FontAwesome5;
  return (
    <TouchableOpacity style={styles.qaButton} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.qaIconBox, { backgroundColor: action.bg }]}>
        <IconComp name={action.icon} size={22} color={action.color} />
      </View>
      <CustomText style={styles.qaLabel}>{action.label}</CustomText>
    </TouchableOpacity>
  );
}

function BookingCard({ booking, onAccept, onReject, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.bookingCard}>
      {/* Header */}
      <View style={styles.bookingHeader}>
        <View style={styles.bookingAvatar}>
          <Ionicons name="person" size={28} color="#aaa" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <CustomText style={styles.bookingName}>{booking.name}</CustomText>
          <CustomText style={styles.bookingService}>{booking.service}</CustomText>
        </View>
        <View style={styles.estimateBadge}>
          <CustomText style={styles.estimateText}>{booking.estimate}</CustomText>
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="tractor" size={16} color={color.GREEN} />
          <View style={{ marginLeft: 6 }}>
            <CustomText style={styles.detailLabel}>EQUIPMENT</CustomText>
            <CustomText style={styles.detailValue}>{booking.equipment}</CustomText>
          </View>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="grid" size={16} color={color.GREEN} />
          <View style={{ marginLeft: 6 }}>
            <CustomText style={styles.detailLabel}>AREA</CustomText>
            <CustomText style={styles.detailValue}>{booking.area}</CustomText>
          </View>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={color.GREEN} />
          <View style={{ marginLeft: 6 }}>
            <CustomText style={styles.detailLabel}>DISTANCE</CustomText>
            <CustomText style={styles.detailValue}>{booking.distance}</CustomText>
          </View>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={color.GREEN} />
          <View style={{ marginLeft: 6 }}>
            <CustomText style={styles.detailLabel}>TIMING</CustomText>
            <CustomText style={styles.detailValue}>{booking.timing}</CustomText>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.bookingActions}>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(booking.id)} activeOpacity={0.8}>
          <CustomText style={styles.rejectText}>Reject</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(booking.id)} activeOpacity={0.8}>
          <CustomText style={styles.acceptText}>Accept</CustomText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(true);
  const [bookings, setBookings] = useState(BOOKING_REQUESTS);
  const [profileComplete] = useState(false);

  const handleAccept = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleReject = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Online/Offline toggle — top right */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <OnlineToggle isOnline={isOnline} onToggle={() => setIsOnline((v) => !v)} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile completion banner */}
        {!profileComplete && (
          <ProfileBanner onPress={() => navigation.navigate('ProfileTab', { screen: 'PersonalInfo' })} />
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Today Earnings"
            value="₹2,450"
            subtitle="12% vs yesterday"
            delay={150}
          />
          <StatCard
            title="Trips Completed"
            value="08"
            progress={8 / 12}
            goal={12}
            delay={200}
          />
        </View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
          <CustomText style={styles.sectionTitle}>Quick Actions</CustomText>
          <View style={styles.qaRow}>
            {QUICK_ACTIONS.map((action) => (
              <QuickActionButton
                key={action.id}
                action={action}
                onPress={() => navigation.navigate(action.id)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Booking Requests */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText style={styles.sectionTitle}>New Booking Requests</CustomText>
            <TouchableOpacity onPress={() => navigation.navigate('BookingsTab')}>
              <CustomText style={styles.seeAll}>See All</CustomText>
            </TouchableOpacity>
          </View>

          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={color.BORDER} />
              <CustomText style={styles.emptyText}>No new booking requests</CustomText>
            </View>
          ) : (
            bookings.map((b, i) => (
              <BookingCard
                key={b.id}
                booking={b}
                onAccept={handleAccept}
                onReject={handleReject}
                delay={320 + i * 60}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.SURFACE,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  toggleWrapper: {
    alignItems: 'flex-end',
  },
  toggleTrack: {
    width: 110,
    height: 36,
    borderRadius: 99,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center',
    padding: 3,
  },
  toggleTrackActive: {
    backgroundColor: color.GREEN_BG,
  },
  toggleThumb: {
    height: 30,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  thumbOnline: {
    backgroundColor: color.GREEN,
    alignSelf: 'flex-end',
  },
  thumbOffline: {
    backgroundColor: color.WHITE,
    alignSelf: 'flex-start',
  },
  toggleLabel: {
    ...globalStyles.f12Bold,
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },

  // ── Profile Banner ──
  profileBanner: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: color.BORDER_GREEN,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileWarningIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: color.GREEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBannerTitle: {
    ...globalStyles.f12Bold,
    color: color.GREEN_DARK,
  },
  profileBannerSub: {
    ...globalStyles.f10Regular,
    color: color.TEXT_SUB,
    marginTop: 2,
  },
  profileBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.GREEN,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 30,
  },
  profileBannerBtnText: {
    ...globalStyles.f12Bold,
    color: color.WHITE,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  },
  statCardTitle: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    marginBottom: 4,
  },
  statCardValue: {
    ...globalStyles.f20Bold,
    color: color.GREEN,
    marginBottom: 4,
  },
  statSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statSubText: {
    ...globalStyles.f10Regular,
    color: color.GREEN,
  },
  statGoalText: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
    marginBottom: 8,
  },
  progressTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 99,
    backgroundColor: color.SURFACE_CONTAINER,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    backgroundColor: color.YELLOW,
    borderRadius: 99,
  },

  // ── Sections ──
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },
  seeAll: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  // ── Quick Actions ──
  qaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qaButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  qaIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qaLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_SUB,
    textAlign: 'center',
  },

  // ── Booking Card ──
  bookingCard: {
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
    gap: 14,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingAvatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bookingName: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },
  bookingService: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    marginTop: 2,
  },
  estimateBadge: {
    backgroundColor: color.YELLOW_BG,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  estimateText: {
    ...globalStyles.f12Bold,
    color: color.YELLOW_TEXT,
  },

  // ── Details Grid ──
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '46%',
  },
  detailLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  detailValue: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },

  // ── Actions ──
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: color.RED_REJECT,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    ...globalStyles.f14Bold,
    color: color.RED_REJECT,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: color.GREEN,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    ...globalStyles.f14Bold,
    color: color.WHITE,
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
  },
});