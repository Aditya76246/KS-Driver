import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

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

function StatusBadge({ status }) {
  const map = {
    new:       { label: 'New Request', bg: color.GREEN_BG,   text: color.GREEN,      icon: 'radio-button-on-outline' },
    accepted:  { label: 'Accepted',    bg: color.YELLOW_BG,  text: color.YELLOW_TEXT, icon: 'checkmark-circle-outline' },
    ongoing:   { label: 'Ongoing',     bg: '#fce4ec',        text: '#923357',        icon: 'time-outline' },
    completed: { label: 'Completed',   bg: color.GREEN_BG,   text: color.GREEN,      icon: 'checkmark-done-circle-outline' },
  };
  const s = map[status] || map.new;
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Ionicons name={s.icon} size={14} color={s.text} />
      <CustomText style={[styles.statusText, { color: s.text }]}>{s.label}</CustomText>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BookingDetailScreen({ navigation, route }) {
  const { booking } = route.params;
  const [status, setStatus] = useState(booking.status);

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
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <InnerScreenHeader navigation={navigation} title="Booking Details" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero Card: Farmer ── */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.heroAvatar}>
              <Ionicons name="person" size={40} color="#aaa" />
            </View>
            <View style={styles.heroInfo}>
              <CustomText style={styles.heroName}>{booking.farmerName}</CustomText>
              <CustomText style={styles.heroId}>ID: #{booking.id}</CustomText>
              <StatusBadge status={status} />
            </View>
          </View>
          <View style={styles.heroPriceBox}>
            <CustomText style={styles.heroPriceLabel}>Estimate</CustomText>
            <CustomText style={styles.heroPrice}>{booking.price}</CustomText>
          </View>
        </Animated.View>

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
      </ScrollView>

      {/* ── Fixed Bottom CTA ── */}
      {status === 'new' && (
        <Animated.View entering={FadeInDown.delay(360).duration(400)} style={styles.bottomBar}>
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
      )}

      {status === 'accepted' && (
        <Animated.View entering={FadeInDown.delay(360).duration(400)} style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={handleReject}
            activeOpacity={0.8}
          >
            <CustomText style={styles.rejectText}>Cancel Job</CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => {/* TODO: navigate to map / start job */}}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate-outline" size={20} color={color.WHITE} />
            <CustomText style={styles.acceptText}>Start Navigation</CustomText>
          </TouchableOpacity>
        </Animated.View>
      )}

      {(status === 'completed' || status === 'ongoing') && (
        <Animated.View entering={FadeInDown.delay(360).duration(400)} style={styles.bottomBarSingle}>
          <TouchableOpacity
            style={styles.acceptBtnFull}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <CustomText style={styles.acceptText}>Back to Bookings</CustomText>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
    paddingBottom: 16,
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  heroAvatar: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroInfo: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  heroName: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },
  heroId: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
  },
  heroPriceBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  heroPriceLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
  },
  heroPrice: {
    ...globalStyles.f14Bold,
    color: color.YELLOW_TEXT,
  },

  // ── Status Badge ──
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
    marginTop: 2,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
