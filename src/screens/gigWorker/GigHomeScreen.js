import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../../components/CustomText';
import globalStyles from '../../styles/globalStyles';
import { color } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';

const AVAILABLE_GIGS = [
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
  },
];

function StatCard({ title, value, subtitle, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.statCard}>
      <CustomText style={styles.statTitle}>{title}</CustomText>
      <CustomText style={styles.statValue}>{value}</CustomText>
      {subtitle ? <CustomText style={styles.statSub}>{subtitle}</CustomText> : null}
    </Animated.View>
  );
}

function GigCard({ gig, onApply, applied, delay = 0 }) {
  const spotsLeft = gig.workersNeeded - gig.workersApplied;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.gigCard}>
      <View style={styles.gigHeader}>
        <View style={styles.gigAvatar}>
          <Ionicons name="person" size={24} color="#aaa" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <CustomText style={styles.gigFarmer}>{gig.farmerName}</CustomText>
          <CustomText style={styles.gigTask}>{gig.task}</CustomText>
        </View>
        <View style={styles.payBadge}>
          <CustomText style={styles.payText}>{gig.pay}</CustomText>
        </View>
      </View>

      <View style={styles.gigDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={color.GREEN} />
          <CustomText style={styles.detailText}>{gig.location} · {gig.distance}</CustomText>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={color.GREEN} />
          <CustomText style={styles.detailText}>{gig.date} · {gig.duration}</CustomText>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={14} color={color.GREEN} />
          <CustomText style={styles.detailText}>{spotsLeft} spots left of {gig.workersNeeded}</CustomText>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.applyBtn, applied && styles.applyBtnApplied]}
        onPress={() => onApply(gig.id)}
        activeOpacity={0.8}
        disabled={applied}
      >
        <CustomText style={[styles.applyText, applied && styles.applyTextApplied]}>
          {applied ? 'Applied' : 'Apply for Gig'}
        </CustomText>
        {!applied && (
          <Ionicons name="arrow-forward" size={16} color={color.WHITE} style={{ marginLeft: 6 }} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function GigHomeScreen({ navigation }) {
  const { t } = useLanguage();
  const [appliedIds, setAppliedIds] = useState([]);

  const handleApply = (id) => {
    setAppliedIds((prev) => [...prev, id]);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bgDark}>
          <View style={styles.statsRow}>
            <StatCard title={t('Today Earnings')} value="₹1,200" subtitle="2 gigs done" delay={100} />
            <StatCard title={t('Jobs Done')} value="02" delay={150} />
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <CustomText style={styles.sectionTitle}>Available Gigs</CustomText>
          {AVAILABLE_GIGS.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={color.BORDER} />
              <CustomText style={styles.emptyText}>No gigs available nearby</CustomText>
            </View>
          ) : (
            AVAILABLE_GIGS.map((g, i) => (
              <GigCard
                key={g.id}
                gig={g}
                onApply={handleApply}
                applied={appliedIds.includes(g.id)}
                delay={220 + i * 60}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.SURFACE },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },

  bgDark: {
    backgroundColor: color.GREEN_DARK,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    elevation: 2,
  },
  statTitle: { ...globalStyles.f12Regular, color: color.TEXT_SUB, marginBottom: 4 },
  statValue: { ...globalStyles.f20Bold, color: color.GREEN, marginBottom: 4 },
  statSub: { ...globalStyles.f10Regular, color: color.TEXT_MUTED },

  section: { gap: 12 },
  sectionTitle: { ...globalStyles.f14Bold, color: color.TEXT_MAIN },

  gigCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    elevation: 2,
    gap: 12,
  },
  gigHeader: { flexDirection: 'row', alignItems: 'center' },
  gigAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gigFarmer: { ...globalStyles.f14Bold, color: color.TEXT_MAIN },
  gigTask: { ...globalStyles.f12Regular, color: color.TEXT_SUB, marginTop: 2 },
  payBadge: {
    backgroundColor: color.YELLOW_BG,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  payText: { ...globalStyles.f12Bold, color: color.YELLOW_TEXT },

  gigDetails: { gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { ...globalStyles.f12Regular, color: color.TEXT_SUB },

  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.GREEN,
    borderRadius: 12,
    paddingVertical: 12,
  },
  applyBtnApplied: {
    backgroundColor: color.GREEN_BG,
    borderWidth: 1,
    borderColor: color.GREEN,
  },
  applyText: { ...globalStyles.f14Bold, color: color.WHITE },
  applyTextApplied: { color: color.GREEN },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { ...globalStyles.f12Regular, color: color.TEXT_MUTED },
});
