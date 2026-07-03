import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../../components/CustomText';
import globalStyles from '../../styles/globalStyles';
import { color } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';

// ── Static data ───────────────────────────────────────────────────────────────

const MY_JOBS = [
  {
    id: 'j1',
    farmerName: 'Suresh Reddy',
    task: 'Paddy Transplanting',
    location: 'Nellore',
    distance: '3.2 km',
    date: 'Today, 7:00 AM',
    duration: '6 hrs',
    pay: '₹600',
    status: 'ongoing',
    farmerRating: '4.8',
  },
  {
    id: 'j2',
    farmerName: 'Venkata Rao',
    task: 'Manual Harvesting',
    location: 'Ongole',
    distance: '5.1 km',
    date: 'Yesterday, 6:00 AM',
    duration: '8 hrs',
    pay: '₹800',
    status: 'completed',
    farmerRating: '4.6',
  },
  {
    id: 'j3',
    farmerName: 'Krishnaiah',
    task: 'Weed Removal',
    location: 'Kandukur',
    distance: '8.4 km',
    date: 'Oct 23, 6:30 AM',
    duration: '5 hrs',
    pay: '₹500',
    status: 'applied',
    farmerRating: '4.9',
  },
];

const STATUS_CONFIG = {
  ongoing:   { label: 'Ongoing',   bg: color.GREEN_BG,  textColor: color.GREEN,      icon: 'radio-button-on' },
  completed: { label: 'Completed', bg: '#E3F2FD',       textColor: '#1565C0',        icon: 'checkmark-circle' },
  applied:   { label: 'Applied',   bg: color.YELLOW_BG, textColor: color.YELLOW_TEXT, icon: 'time' },
};

const FILTERS = ['All', 'Ongoing', 'Completed', 'Applied'];

function getStats(jobs) {
  const ongoing = jobs.filter((j) => j.status === 'ongoing').length;
  const earned = jobs
    .filter((j) => j.status === 'completed')
    .reduce((sum, j) => sum + parseInt(j.pay.replace(/[₹,]/g, ''), 10), 0);
  return { total: jobs.length, ongoing, earned };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function InfoChip({ icon, text }) {
  return (
    <View style={styles.infoChip}>
      <Ionicons name={icon} size={13} color={color.GREEN} />
      <CustomText style={styles.infoChipText}>{text}</CustomText>
    </View>
  );
}

function JobCard({ job, onMarkDone, delay = 0 }) {
  const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG.applied;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.card}>

      {/* Farmer row */}
      <View style={styles.cardHeader}>
        <View style={styles.farmerAvatar}>
          <Ionicons name="person" size={18} color={color.WHITE} />
        </View>
        <View style={styles.farmerInfo}>
          <CustomText style={styles.farmerName}>{job.farmerName}</CustomText>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <CustomText style={styles.ratingText}>{job.farmerRating}</CustomText>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Ionicons name={sc.icon} size={10} color={sc.textColor} />
          <CustomText style={[styles.statusText, { color: sc.textColor }]}>{sc.label}</CustomText>
        </View>
      </View>

      {/* Task + pay */}
      <View>
        <CustomText style={styles.taskName}>{job.task}</CustomText>
        <View style={styles.payRow}>
          <CustomText style={styles.payValue}>{job.pay}</CustomText>
          <CustomText style={styles.payLabel}>worker pay</CustomText>
        </View>
      </View>

      {/* Info chips */}
      <View style={styles.chipsWrap}>
        <InfoChip icon="location-outline"  text={`${job.location} · ${job.distance}`} />
        <InfoChip icon="time-outline"      text={job.date} />
        <InfoChip icon="hourglass-outline" text={job.duration} />
      </View>

      <View style={styles.divider} />

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.8}>
          <CustomText style={styles.outlineBtnText}>View Details</CustomText>
        </TouchableOpacity>

        {job.status === 'ongoing' && (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => onMarkDone(job.id)}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={15} color={color.WHITE} />
            <CustomText style={styles.primaryBtnText}>Mark Done</CustomText>
          </TouchableOpacity>
        )}

        {job.status === 'completed' && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#1565C0" />
            <CustomText style={styles.completedBadgeText}>Paid</CustomText>
          </View>
        )}

        {job.status === 'applied' && (
          <View style={styles.waitingBadge}>
            <Ionicons name="hourglass" size={13} color={color.YELLOW_TEXT} />
            <CustomText style={styles.waitingBadgeText}>Awaiting confirmation</CustomText>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function GigJobsScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState(MY_JOBS);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleMarkDone = (id) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: 'completed' } : j)));

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return jobs;
    return jobs.filter((j) => j.status === activeFilter.toLowerCase());
  }, [jobs, activeFilter]);

  const stats = useMemo(() => getStats(jobs), [jobs]);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Summary strip */}
        <View style={styles.summaryStrip}>
          <View style={styles.statItem}>
            <CustomText style={styles.statValue}>{stats.total}</CustomText>
            <CustomText style={styles.statLabel}>Total Jobs</CustomText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <CustomText style={styles.statValue}>{stats.ongoing}</CustomText>
            <CustomText style={styles.statLabel}>Ongoing</CustomText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <CustomText style={styles.statValue}>₹{stats.earned}</CustomText>
            <CustomText style={styles.statLabel}>Earned</CustomText>
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              activeOpacity={0.8}
            >
              <CustomText style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cards */}
        <View style={styles.cardList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="briefcase-outline" size={32} color={color.GREEN} />
              </View>
              <CustomText style={styles.emptyTitle}>No jobs here</CustomText>
              <CustomText style={styles.emptyText}>
                Jobs in this category will appear here
              </CustomText>
            </View>
          ) : (
            filtered.map((j, i) => (
              <JobCard key={j.id} job={j} onMarkDone={handleMarkDone} delay={i * 60} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5FBF6' },

  // ── Summary strip ────────────────────────────────────────────────────────────
  summaryStrip: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: color.GREEN_DARK,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { ...globalStyles.f20ExtraBold, color: '#FFFFFF' },
  statLabel: { ...globalStyles.f10Regular, color: 'rgba(255,255,255,0.65)' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.18)' },

  // ── Filter tabs ──────────────────────────────────────────────────────────────
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: color.WHITE,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },
  filterTabActive: {
    backgroundColor: color.GREEN,
    borderColor: color.GREEN,
  },
  filterText: { ...globalStyles.f12Bold, color: color.TEXT_MUTED },
  filterTextActive: { color: color.WHITE },

  // ── Card list ────────────────────────────────────────────────────────────────
  cardList: { paddingHorizontal: 16, gap: 14 },

  // ── Job card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E1F0E6',
    gap: 10,
    elevation: 2,
    shadowColor: '#082F1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  farmerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerInfo: { flex: 1 },
  farmerName: { ...globalStyles.f12Bold, color: '#14351F' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingText: { ...globalStyles.f10Regular, color: color.TEXT_MUTED },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 30,
  },
  statusText: { ...globalStyles.f10Bold },

  taskName: { ...globalStyles.f16ExtraBold, color: '#14351F', marginBottom: 2 },
  payRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  payValue: { ...globalStyles.f20Bold, color: '#15803D' },
  payLabel: { ...globalStyles.f12Regular, color: '#6A8170' },

  chipsWrap: { gap: 6 },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F0FAF3',
    alignSelf: 'flex-start',
  },
  infoChipText: { ...globalStyles.f10Regular, color: '#14351F' },

  divider: { height: 1, backgroundColor: '#EDF5EF' },

  // ── Action row ───────────────────────────────────────────────────────────────
  actionRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  outlineBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: { ...globalStyles.f12Bold, color: '#15803D' },
  primaryBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: color.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  primaryBtnText: { ...globalStyles.f12Bold, color: color.WHITE },
  completedBadge: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  completedBadgeText: { ...globalStyles.f12Bold, color: '#1565C0' },
  waitingBadge: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: color.YELLOW_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  waitingBadgeText: { ...globalStyles.f10Bold, color: color.YELLOW_TEXT },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: color.GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { ...globalStyles.f16Bold, color: '#14351F' },
  emptyText: { ...globalStyles.f12Regular, color: '#6A8170', textAlign: 'center', maxWidth: 220 },
});
