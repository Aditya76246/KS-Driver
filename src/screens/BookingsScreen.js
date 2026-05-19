import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BOOKINGS = [
  {
    id: 'KA-8821',
    status: 'new',
    farmerName: 'Rajesh Kumar',
    farmerAvatar: null,
    service: 'Tractor Ploughing',
    date: 'Today, 4:30 PM',
    distance: '4.2 km away',
    location: 'Nellore Sub-div',
    price: '₹2,450',
    area: '3.5 Acres',
    description: 'Farmer requests deep ploughing for 3.5 acres of cotton field near the irrigation canal.',
  },
  {
    id: 'KA-9023',
    status: 'new',
    farmerName: 'Venkata Subbaiah',
    farmerAvatar: null,
    service: 'Harvester Rental',
    date: 'Oct 24, 08:00 AM',
    distance: '12.5 km away',
    location: 'Ongole Mandal',
    price: '₹8,000',
    area: '5 Acres',
    description: 'Farmer requests deep harvesting for 5 acres of paddy field near the main canal road.',
  },
  {
    id: 'KA-8750',
    status: 'accepted',
    farmerName: 'Suresh Reddy',
    farmerAvatar: null,
    service: 'Rotavator',
    date: 'Oct 23, 09:00 AM',
    distance: '6.1 km away',
    location: 'Kandukur Block',
    price: '₹3,200',
    area: '4.0 Acres',
    description: 'Rotavator service requested for 4 acres of groundnut field prior to sowing.',
  },
  {
    id: 'KA-8640',
    status: 'ongoing',
    farmerName: 'Ramana Murthy',
    farmerAvatar: null,
    service: 'Tractor Ploughing',
    date: 'Today, 2:00 PM',
    distance: '3.8 km away',
    location: 'Kavali Taluk',
    price: '₹1,800',
    area: '2.5 Acres',
    description: 'Ploughing for 2.5 acres of chilli field. Operator already en route.',
  },
  {
    id: 'KA-8520',
    status: 'completed',
    farmerName: 'Laxmi Devi',
    farmerAvatar: null,
    service: 'Seeder Machine',
    date: 'Oct 20, 07:00 AM',
    distance: '9.0 km away',
    location: 'Markapur Zone',
    price: '₹2,100',
    area: '3.0 Acres',
    description: 'Seed sowing service for paddy. Completed successfully.',
  },
];

const TABS = [
  { key: 'new',       label: 'New',       statusColor: color.GREEN },
  { key: 'accepted',  label: 'Accepted',  statusColor: color.YELLOW_TEXT },
  { key: 'ongoing',   label: 'Ongoing',   statusColor: '#923357' },
  { key: 'completed', label: 'Completed', statusColor: color.TEXT_MUTED },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const map = {
    new:       { label: 'New',       bg: color.GREEN_BG,   text: color.GREEN },
    accepted:  { label: 'Accepted',  bg: color.YELLOW_BG,  text: color.YELLOW_TEXT },
    ongoing:   { label: 'Ongoing',   bg: '#fce4ec',        text: '#923357' },
    completed: { label: 'Completed', bg: color.AVATAR_BG,  text: color.TEXT_MUTED },
  };
  const s = map[status] || map.new;
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <CustomText style={[styles.chipText, { color: s.text }]}>{s.label}</CustomText>
    </View>
  );
}

function DetailRow({ icon, text, lib = 'Ionicons' }) {
  const IconComp = lib === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={styles.detailItem}>
      <IconComp name={icon} size={14} color={color.GREEN} />
      <CustomText style={styles.detailText}>{text}</CustomText>
    </View>
  );
}

function BookingCard({ booking, onAccept, onReject, onViewDetails, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.card}>

      {/* ── Header ── */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Ionicons name="person" size={26} color="#aaa" />
        </View>
        <View style={styles.cardHeaderInfo}>
          <CustomText style={styles.farmerName}>{booking.farmerName}</CustomText>
          <CustomText style={styles.bookingId}>ID: #{booking.id}</CustomText>
        </View>
        <View style={[styles.priceBadge, booking.status !== 'new' && styles.priceBadgeNeutral]}>
          <CustomText style={[
            styles.priceText,
            booking.status !== 'new' && styles.priceTextNeutral,
          ]}>
            {booking.price}
          </CustomText>
        </View>
      </View>

      {/* ── Info Grid ── */}
      <View style={styles.infoGrid}>
        <DetailRow icon="construct-outline"     text={booking.service} />
        <DetailRow icon="calendar-outline"      text={booking.date} />
        <DetailRow icon="location-outline"      text={booking.distance} />
        <DetailRow icon="map-outline"           text={booking.location} />
      </View>

      {/* ── Description (new/accepted only) ── */}
      {(booking.status === 'new' || booking.status === 'accepted') && (
        <CustomText style={styles.description} numberOfLines={2}>
          {booking.description}
        </CustomText>
      )}

      {/* ── Actions ── */}
      {booking.status === 'new' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept(booking.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={color.WHITE} />
            <CustomText style={styles.acceptText}>Accept</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => onViewDetails(booking)}
            activeOpacity={0.8}
          >
            <CustomText style={styles.viewText}>View Details</CustomText>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'accepted' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onViewDetails(booking)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={18} color={color.WHITE} />
            <CustomText style={styles.acceptText}>View Details</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => onReject(booking.id)}
            activeOpacity={0.8}
          >
            <CustomText style={styles.rejectText}>Reject</CustomText>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'ongoing' && (
        <TouchableOpacity
          style={[styles.acceptBtn, { flex: 1 }]}
          onPress={() => onViewDetails(booking)}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate-outline" size={18} color={color.WHITE} />
          <CustomText style={styles.acceptText}>Track Job</CustomText>
        </TouchableOpacity>
      )}

      {booking.status === 'completed' && (
        <TouchableOpacity
          style={styles.viewBtnFull}
          onPress={() => onViewDetails(booking)}
          activeOpacity={0.8}
        >
          <CustomText style={styles.viewText}>View Summary</CustomText>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BookingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('new');
  const [bookings, setBookings] = useState(BOOKINGS);

  const handleAccept = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'accepted' } : b))
    );
  };

  const handleReject = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'completed' } : b))
    );
  };

  const handleViewDetails = (booking) => {
    navigation.navigate('BookingDetail', { booking });
  };

  const filtered = bookings.filter((b) => b.status === activeTab);

  const countFor = (key) => bookings.filter((b) => b.status === key).length;

  return (
    <View style={styles.root}>

      {/* ── Status Tabs ── */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map((tab) => {
            const count = countFor(tab.key);
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.75}
              >
                <CustomText style={[styles.tabLabel, active && { color: color.GREEN }]}>
                  {tab.label}
                  {count > 0 ? ` (${count})` : ''}
                </CustomText>
                {active && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Cards ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={52} color={color.BORDER_LIGHT} />
            <CustomText style={styles.emptyTitle}>No bookings here</CustomText>
            <CustomText style={styles.emptySubtitle}>
              {activeTab === 'new'
                ? 'New booking requests will appear here'
                : `You have no ${activeTab} bookings`}
            </CustomText>
          </Animated.View>
        ) : (
          filtered.map((booking, i) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onAccept={handleAccept}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
              delay={i * 60}
            />
          ))
        )}
        <View style={{ height: 20 }} />
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

  // ── Tabs ──
  tabsWrapper: {
    backgroundColor: color.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: color.BORDER_LIGHT,
  },
  tabsScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginRight: 24,
    position: 'relative',
  },
  tabActive: {},
  tabLabel: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MUTED,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    borderRadius: 99,
    backgroundColor: color.GREEN,
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  // ── Card ──
  card: {
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

  // ── Card Header ──
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 3,
  },
  farmerName: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  bookingId: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
  },
  priceBadge: {
    backgroundColor: color.YELLOW_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },
  priceBadgeNeutral: {
    backgroundColor: color.GREEN_BG,
  },
  priceText: {
    ...globalStyles.f12Bold,
    color: color.YELLOW_TEXT,
  },
  priceTextNeutral: {
    color: color.GREEN,
  },

  // ── Info Grid ──
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '47%',
  },
  detailText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    flexShrink: 1,
  },

  // ── Description ──
  description: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    lineHeight: 18,
  },

  // ── Actions ──
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: color.GREEN,
    borderRadius: 12,
    paddingVertical: 13,
  },
  acceptText: {
    ...globalStyles.f12Bold,
    color: color.WHITE,
  },
  viewBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: color.GREEN,
    borderRadius: 12,
    paddingVertical: 13,
  },
  viewBtnFull: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: color.BORDER_LIGHT,
    borderRadius: 12,
    paddingVertical: 13,
  },
  viewText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },
  rejectBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: color.RED_REJECT,
    borderRadius: 12,
    paddingVertical: 13,
  },
  rejectText: {
    ...globalStyles.f12Bold,
    color: color.RED_REJECT,
  },

  // ── Chip ──
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  chipText: {
    ...globalStyles.f10Bold,
  },

  // ── Empty State ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MUTED,
  },
  emptySubtitle: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});