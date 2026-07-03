import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../../components/CustomText';
import globalStyles from '../../styles/globalStyles';
import { color } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';

// ── Static data ───────────────────────────────────────────────────────────────

const CLUSTERS = [
  {
    id: 'c1',
    title: '3 gigs near you',
    copy: 'Harvest, transplanting & loading within 5 km',
    gradient: ['#082F1B', '#116834'],
    chips: ['Paddy', 'Loading', '5 km'],
  },
  {
    id: 'c2',
    title: 'Best pay today',
    copy: '₹850/day harvest cutting in Nellore',
    gradient: ['#1A3A5C', '#1D4ED8'],
    chips: ['Harvest', '₹850/day', 'Today'],
  },
  {
    id: 'c3',
    title: 'FPO group work',
    copy: 'Sorting & packing — 12 worker group',
    gradient: ['#4A1A00', '#C05621'],
    chips: ['Packing', 'Hourly', 'Group'],
  },
];

const RUNNING_GIGS = [
  {
    id: 'rg1',
    task: 'Paddy Transplanting',
    farmerName: 'Ramu Reddy',
    village: 'Nellore',
    pay: '₹600',
    endTime: '1:00 PM',
  },
  {
    id: 'rg2',
    task: 'Weed Removal',
    farmerName: 'Krishnaiah',
    village: 'Ongole',
    pay: '₹500',
    endTime: '12:30 PM',
  },
];

const NEARBY_GIGS = [
  {
    id: 'g1',
    farmerName: 'Ramu Reddy',
    task: 'Paddy Transplanting',
    location: 'Nellore',
    distance: '3.2 km',
    date: 'Today, 7:00 AM',
    duration: '6 hrs',
    pay: '₹600',
    workersNeeded: 6,
    workersApplied: 4,
    farmerRating: '4.8',
  },
  {
    id: 'g2',
    farmerName: 'Krishnaiah',
    task: 'Weed Removal',
    location: 'Ongole',
    distance: '5.1 km',
    date: 'Tomorrow, 6:30 AM',
    duration: '5 hrs',
    pay: '₹500',
    workersNeeded: 4,
    workersApplied: 2,
    farmerRating: '4.6',
  },
  {
    id: 'g3',
    farmerName: 'Venkatesh Rao',
    task: 'Manual Harvesting',
    location: 'Kandukur',
    distance: '8.4 km',
    date: 'Oct 25, 6:00 AM',
    duration: '8 hrs',
    pay: '₹800',
    workersNeeded: 8,
    workersApplied: 5,
    farmerRating: '4.9',
  },
];

const EARNINGS = [
  { label: 'Confirmed', value: '₹12,480', icon: 'checkmark-circle', iconColor: color.GREEN },
  { label: 'Pending',   value: '₹1,970',  icon: 'time',             iconColor: color.YELLOW },
  { label: 'Withdrawn', value: '₹8,200',  icon: 'card',             iconColor: '#3B82F6' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function ClusterCard({ cluster, cardWidth }) {
  return (
    <View style={[styles.clusterCard, { width: cardWidth }]}>
      <LinearGradient
        colors={cluster.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative circles for depth */}
      <View style={styles.clusterDecorA} />
      <View style={styles.clusterDecorB} />
      <View style={styles.clusterContent}>
        <CustomText style={styles.clusterTitle}>{cluster.title}</CustomText>
        <CustomText style={styles.clusterCopy}>{cluster.copy}</CustomText>
        <View style={styles.clusterChips}>
          {cluster.chips.map((chip) => (
            <View key={chip} style={styles.chipWrap}>
              <CustomText style={styles.chipText}>{chip}</CustomText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function RunningGigCard({ gig, cardWidth }) {
  return (
    <View style={[styles.runningCard, { width: cardWidth }]}>
      <View style={styles.runningTop}>
        <View style={styles.ongoingBadge}>
          <View style={styles.ongoingDot} />
          <CustomText style={styles.ongoingText}>ONGOING</CustomText>
        </View>
        <CustomText style={styles.runningPay}>{gig.pay}</CustomText>
      </View>
      <CustomText style={styles.runningTask} numberOfLines={1}>{gig.task}</CustomText>
      <CustomText style={styles.runningMeta}>{gig.farmerName} · {gig.village}</CustomText>
      <View style={styles.runningBottom}>
        <TouchableOpacity style={styles.trackBtn} activeOpacity={0.8}>
          <Ionicons name="navigate-circle" size={16} color={color.GREEN} />
          <CustomText style={styles.trackText}>Track</CustomText>
        </TouchableOpacity>
        <CustomText style={styles.endsAt}>Ends {gig.endTime}</CustomText>
      </View>
    </View>
  );
}

function InfoChip({ icon, text }) {
  return (
    <View style={styles.infoChip}>
      <Ionicons name={icon} size={13} color={color.GREEN} />
      <CustomText style={styles.infoChipText}>{text}</CustomText>
    </View>
  );
}

function NearbyGigCard({ gig, applied, onApply, delay = 0 }) {
  const spotsLeft = gig.workersNeeded - gig.workersApplied;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.gigCard}>
      <View style={styles.gigCardHeader}>
        <View style={styles.gigAvatar}>
          <Ionicons name="person" size={18} color={color.WHITE} />
        </View>
        <View style={styles.gigHeaderText}>
          <CustomText style={styles.gigFarmer}>{gig.farmerName}</CustomText>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <CustomText style={styles.ratingText}>{gig.farmerRating}</CustomText>
          </View>
        </View>
        <View style={styles.payBadge}>
          <CustomText style={styles.payValue}>{gig.pay}</CustomText>
          <CustomText style={styles.payDur}>/{gig.duration}</CustomText>
        </View>
      </View>

      <CustomText style={styles.gigTask}>{gig.task}</CustomText>

      <View style={styles.gigChips}>
        <InfoChip icon="location-outline" text={`${gig.location} · ${gig.distance}`} />
        <InfoChip icon="time-outline" text={gig.date} />
        <InfoChip icon="people-outline" text={`${spotsLeft} spots left of ${gig.workersNeeded}`} />
      </View>

      <TouchableOpacity
        style={[styles.applyBtn, applied && styles.applyBtnApplied]}
        onPress={() => !applied && onApply(gig.id)}
        activeOpacity={0.85}
        disabled={applied}
      >
        <CustomText style={[styles.applyText, applied && styles.applyTextApplied]}>
          {applied ? 'Applied ✓' : 'Apply for Gig'}
        </CustomText>
        {!applied && <Ionicons name="arrow-forward" size={15} color={color.WHITE} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function GigHomeScreen({ navigation }) {
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [appliedIds, setAppliedIds] = useState([]);

  const clusterScrollRef = useRef(null);
  const clusterIndex = useRef(0);
  const cardWidth = width - 40;

  // Auto-advance cluster carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (clusterIndex.current + 1) % CLUSTERS.length;
      clusterScrollRef.current?.scrollTo({ x: next * (cardWidth + 12), animated: true });
      clusterIndex.current = next;
    }, 3500);
    return () => clearInterval(interval);
  }, [cardWidth]);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.content}>

          {/* Cluster carousel */}
          <ScrollView
            ref={clusterScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth + 12}
            snapToAlignment="start"
            contentContainerStyle={styles.carouselContent}
            onMomentumScrollEnd={(e) => {
              clusterIndex.current = Math.round(
                e.nativeEvent.contentOffset.x / (cardWidth + 12)
              );
            }}
          >
            {CLUSTERS.map((cluster) => (
              <ClusterCard key={cluster.id} cluster={cluster} cardWidth={cardWidth} />
            ))}
          </ScrollView>

          {/* Earnings summary */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.earningsGrid}>
            {EARNINGS.map((item) => (
              <View key={item.label} style={styles.earningsCard}>
                <Ionicons name={item.icon} size={17} color={item.iconColor} />
                <CustomText style={styles.earningsValue}>{item.value}</CustomText>
                <CustomText style={styles.earningsLabel}>{item.label}</CustomText>
              </View>
            ))}
          </Animated.View>

          {/* Running gigs */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.sectionHeader}>
            <View>
              <CustomText style={styles.sectionTitle}>Running Gigs</CustomText>
              <CustomText style={styles.sectionSub}>Your active bookings</CustomText>
            </View>
            <View style={styles.activePill}>
              <View style={styles.activeDot} />
              <CustomText style={styles.activePillText}>Active</CustomText>
            </View>
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.75 + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.runningScrollContent}
          >
            {RUNNING_GIGS.map((gig) => (
              <RunningGigCard key={gig.id} gig={gig} cardWidth={width * 0.75} />
            ))}
          </ScrollView>

          {/* Nearby alerts */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.sectionHeader}>
            <View>
              <CustomText style={styles.sectionTitle}>Nearby Job Alerts</CustomText>
              <CustomText style={styles.sectionSub}>Accept quickly before slot closes</CustomText>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <CustomText style={styles.livePillText}>Live</CustomText>
            </View>
          </Animated.View>

          {NEARBY_GIGS.map((gig, i) => (
            <NearbyGigCard
              key={gig.id}
              gig={gig}
              applied={appliedIds.includes(gig.id)}
              onApply={(id) => setAppliedIds((prev) => [...prev, id])}
              delay={220 + i * 60}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4FAF2',
  },

  // ── Content ─────────────────────────────────────────────────────────────────
  content: {
    paddingTop: 16,
  },

  // ── Cluster carousel ────────────────────────────────────────────────────────
  carouselContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  clusterCard: {
    height: 168,
    borderRadius: 24,
    overflow: 'hidden',
  },
  clusterDecorA: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -60,
  },
  clusterDecorB: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: 30,
  },
  clusterContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  clusterTitle: {
    ...globalStyles.f20ExtraBold,
    color: '#FFFFFF',
  },
  clusterCopy: {
    ...globalStyles.f12Regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    lineHeight: 18,
  },
  clusterChips: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },
  chipWrap: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  chipText: {
    ...globalStyles.f10Bold,
    color: '#12351F',
  },

  // ── Earnings grid ───────────────────────────────────────────────────────────
  earningsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
  },
  earningsCard: {
    flex: 1,
    minHeight: 90,
    padding: 12,
    borderRadius: 18,
    backgroundColor: color.WHITE,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  earningsValue: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
    marginTop: 6,
  },
  earningsLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    marginTop: 3,
  },

  // ── Section header ──────────────────────────────────────────────────────────
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 26,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    ...globalStyles.f20Bold,
    color: color.TEXT_MAIN,
  },
  sectionSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    marginTop: 3,
  },

  // ── Pills ───────────────────────────────────────────────────────────────────
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F0FDFA',
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activePillText: {
    ...globalStyles.f12Bold,
    color: '#059669',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: color.GREEN_BG,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.GREEN,
  },
  livePillText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  // ── Running gig card ────────────────────────────────────────────────────────
  runningScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
  },
  runningCard: {
    backgroundColor: color.WHITE,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    gap: 8,
    elevation: 3,
    shadowColor: '#08341E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  runningTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ongoingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: color.GREEN,
  },
  ongoingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.WHITE,
  },
  ongoingText: {
    ...globalStyles.f10ExtraBold,
    color: color.WHITE,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  runningPay: {
    ...globalStyles.f14Bold,
    color: color.GREEN,
  },
  runningTask: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },
  runningMeta: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
  },
  runningBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: color.BORDER_LIGHT,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },
  endsAt: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
  },

  // ── Nearby gig card ─────────────────────────────────────────────────────────
  gigCard: {
    backgroundColor: color.WHITE,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  gigCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gigAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: color.GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gigHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  gigFarmer: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
  },
  payBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
    backgroundColor: color.YELLOW_BG,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  payValue: {
    ...globalStyles.f14Bold,
    color: color.YELLOW_TEXT,
  },
  payDur: {
    ...globalStyles.f10Regular,
    color: color.YELLOW_TEXT,
  },
  gigTask: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },
  gigChips: {
    gap: 6,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: color.SURFACE_LOW,
    alignSelf: 'flex-start',
  },
  infoChipText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.GREEN,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 6,
  },
  applyBtnApplied: {
    backgroundColor: color.GREEN_BG,
    borderWidth: 1,
    borderColor: color.GREEN,
  },
  applyText: {
    ...globalStyles.f14Bold,
    color: color.WHITE,
  },
  applyTextApplied: {
    color: color.GREEN,
  },
});
