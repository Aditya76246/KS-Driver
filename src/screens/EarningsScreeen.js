import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import CustomText from '../components/CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PERIOD_TABS = [
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year',  label: 'This Year' },
];

const STATS = {
  week: {
    total: '₹14,250',
    jobs: 9,
    avgPerJob: '₹1,583',
    pending: '₹3,200',
    growth: '+18%',
    positive: true,
    bars: [0.4, 0.6, 0.3, 0.8, 0.55, 0.9, 0.7],
    barLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    todayIndex: 5,
  },
  month: {
    total: '₹52,800',
    jobs: 34,
    avgPerJob: '₹1,553',
    pending: '₹8,400',
    growth: '+12%',
    positive: true,
    bars: [0.5, 0.4, 0.7, 0.6, 0.3, 0.8, 0.55, 0.65, 0.45, 0.9, 0.7, 0.6],
    barLabels: ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28', '30', ''],
    todayIndex: 9,
  },
  year: {
    total: '₹4,18,500',
    jobs: 298,
    avgPerJob: '₹1,404',
    pending: '₹22,600',
    growth: '+34%',
    positive: true,
    bars: [0.4, 0.55, 0.6, 0.5, 0.7, 0.85, 0.9, 0.8, 0.65, 0.75, 0.6, 0.7],
    barLabels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    todayIndex: 9,
  },
};

const TRANSACTIONS = [
  {
    id: 'TXN-1041',
    farmerName: 'Suresh Reddy',
    service: 'Tractor Ploughing',
    date: 'Today, 2:30 PM',
    amount: '₹2,450',
    status: 'credited',
    area: '3.5 Acres',
    location: 'Nellore Sub-div',
  },
  {
    id: 'TXN-1040',
    farmerName: 'Ramana Murthy',
    service: 'Rotavator',
    date: 'Yesterday, 11:00 AM',
    amount: '₹3,200',
    status: 'pending',
    area: '4.0 Acres',
    location: 'Kavali Taluk',
  },
  {
    id: 'TXN-1039',
    farmerName: 'Laxmi Devi',
    service: 'Seeder Machine',
    date: 'Oct 20, 07:00 AM',
    amount: '₹2,100',
    status: 'credited',
    area: '3.0 Acres',
    location: 'Markapur Zone',
  },
  {
    id: 'TXN-1038',
    farmerName: 'Venkata Subbaiah',
    service: 'Harvester Rental',
    date: 'Oct 18, 08:00 AM',
    amount: '₹8,000',
    status: 'credited',
    area: '5 Acres',
    location: 'Ongole Mandal',
  },
  {
    id: 'TXN-1037',
    farmerName: 'Rajesh Kumar',
    service: 'Tractor Ploughing',
    date: 'Oct 15, 10:00 AM',
    amount: '₹1,800',
    status: 'failed',
    area: '2.5 Acres',
    location: 'Kavali Taluk',
  },
  {
    id: 'TXN-1036',
    farmerName: 'Pooja Nair',
    service: 'Sprayer Unit',
    date: 'Oct 12, 09:30 AM',
    amount: '₹1,200',
    status: 'credited',
    area: '2.0 Acres',
    location: 'Tenali Block',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BarChart({ bars, barLabels, todayIndex }) {
  const maxBar = Math.max(...bars);

  return (
    <View style={styles.chartWrapper}>
      <View style={styles.chartBars}>
        {bars.map((val, i) => {
          const isToday = i === todayIndex;
          const heightPct = (val / maxBar) * 100;
          return (
            <View key={i} style={styles.barGroup}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPct}%` },
                    isToday && styles.barFillActive,
                  ]}
                />
              </View>
              <CustomText style={[styles.barLabel, isToday && styles.barLabelActive]}>
                {barLabels[i]}
              </CustomText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatPill({ icon, label, value, accent = false }) {
  return (
    <View style={[styles.statPill, accent && styles.statPillAccent]}>
      <View style={[styles.statPillIcon, accent && styles.statPillIconAccent]}>
        <Ionicons name={icon} size={16} color={accent ? color.YELLOW_TEXT : color.GREEN} />
      </View>
      <View style={{ gap: 2 }}>
        <CustomText style={[styles.statPillValue, accent && styles.statPillValueAccent]}>
          {value}
        </CustomText>
        <CustomText style={[styles.statPillLabel, accent && styles.statPillLabelAccent]}>
          {label}
        </CustomText>
      </View>
    </View>
  );
}

function TransactionCard({ txn, index }) {
  const statusMap = {
    credited: { label: 'Credited',  bg: color.GREEN_BG,  text: color.GREEN,      icon: 'checkmark-circle' },
    pending:  { label: 'Pending',   bg: color.YELLOW_BG, text: color.YELLOW_TEXT, icon: 'time' },
    failed:   { label: 'Failed',    bg: color.RED_BG,    text: color.RED_REJECT,  icon: 'close-circle' },
  };
  const s = statusMap[txn.status] || statusMap.pending;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(380)} style={styles.txnCard}>
      {/* Left: Avatar + info */}
      <View style={styles.txnLeft}>
        <View style={styles.txnAvatar}>
          <Ionicons name="person" size={22} color="#aaa" />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <CustomText style={styles.txnFarmer}>{txn.farmerName}</CustomText>
          <CustomText style={styles.txnService}>{txn.service}</CustomText>
          <View style={styles.txnMeta}>
            <Ionicons name="calendar-outline" size={11} color={color.TEXT_MUTED} />
            <CustomText style={styles.txnDate}>{txn.date}</CustomText>
            <CustomText style={styles.txnDot}>·</CustomText>
            <CustomText style={styles.txnId}>{txn.id}</CustomText>
          </View>
        </View>
      </View>

      {/* Right: Amount + status */}
      <View style={styles.txnRight}>
        <CustomText style={[styles.txnAmount, txn.status === 'failed' && styles.txnAmountFailed]}>
          {txn.status === 'failed' ? txn.amount : `+${txn.amount}`}
        </CustomText>
        <View style={[styles.txnStatusChip, { backgroundColor: s.bg }]}>
          <Ionicons name={s.icon} size={11} color={s.text} />
          <CustomText style={[styles.txnStatusText, { color: s.text }]}>{s.label}</CustomText>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EarningsScreen() {
  const [activePeriod, setActivePeriod] = useState('week');
  const { i18n } = useTranslation();
  const textMap = i18n.getResourceBundle(i18n.language)?.text || {};
  const tx = (value) => textMap[value] || value;
  const stats = STATS[activePeriod];

  return (
    <View style={styles.root}>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero Earnings Card ── */}
        <Animated.View entering={FadeInDown.delay(40).duration(400)} style={styles.heroCard}>
          {/* Period Selector */}
          <View style={styles.periodTabs}>
            {PERIOD_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.periodTab, activePeriod === tab.key && styles.periodTabActive]}
                onPress={() => setActivePeriod(tab.key)}
                activeOpacity={0.75}
              >
                <CustomText style={[styles.periodTabText, activePeriod === tab.key && styles.periodTabTextActive]}>
                  {tab.label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Total Earnings */}
          <View style={styles.totalRow}>
            <View style={{ flex: 1 }}>
              <CustomText style={styles.totalLabel}>Total Earnings</CustomText>
              <CustomText style={styles.totalValue}>{stats.total}</CustomText>
              <View style={styles.growthRow}>
                <Ionicons
                  name={stats.positive ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={stats.positive ? color.GREEN : color.RED_REJECT}
                />
                <CustomText style={[styles.growthText, !stats.positive && styles.growthTextDown]}>
                  {stats.growth}{tx(' vs last period')}
                </CustomText>
              </View>
            </View>

            <View style={styles.pendingBox}>
              <Ionicons name="time-outline" size={14} color={color.ORANGE} />
              <CustomText style={styles.pendingLabel}>Pending</CustomText>
              <CustomText style={styles.pendingValue}>{stats.pending}</CustomText>
            </View>
          </View>

          {/* Bar Chart */}
          <BarChart bars={stats.bars} barLabels={stats.barLabels} todayIndex={stats.todayIndex} />
        </Animated.View>

        {/* ── Stat Pills Row ── */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.pillsRow}>
          <StatPill icon="briefcase-outline"    label="Total Jobs"    value={stats.jobs.toString()} />
          <StatPill icon="cash-outline"         label="Avg / Job"     value={stats.avgPerJob} />
          <StatPill icon="wallet-outline"       label="Pending"       value={stats.pending} accent />
        </Animated.View>

        {/* ── Payout Info Banner ── */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.payoutBanner}>
          <View style={styles.payoutBannerIcon}>
            <Ionicons name="flash-outline" size={20} color={color.GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.payoutBannerTitle}>Next Payout in 2 days</CustomText>
            <CustomText style={styles.payoutBannerSub}>
              ₹8,400 will be credited to your bank account ending in ••4521
            </CustomText>
          </View>
          <View style={styles.payoutChevron}>
            <Ionicons name="chevron-forward" size={16} color={color.TEXT_MUTED} />
          </View>
        </Animated.View>

        {/* ── Transactions Header ── */}
        <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.sectionHeader}>
          <CustomText style={styles.sectionTitle}>Recent Transactions</CustomText>
          <TouchableOpacity activeOpacity={0.7}>
            <CustomText style={styles.seeAllText}>See All</CustomText>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Transaction Cards ── */}
        <View style={styles.txnList}>
          {TRANSACTIONS.map((txn, i) => (
            <TransactionCard key={txn.id} txn={txn} index={i} />
          ))}
        </View>

        <View style={{ height: 32 }} />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: color.GREEN_DARK,
    borderRadius: 22,
    padding: 18,
    gap: 16,
    shadowColor: color.GREEN_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },

  // ── Period Tabs ──
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: color.WHITE,
  },
  periodTabText: {
    ...globalStyles.f10Bold,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.2,
  },
  periodTabTextActive: {
    color: color.GREEN_DARK,
  },

  // ── Total Row ──
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  totalLabel: {
    ...globalStyles.f12Regular,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
  },
  totalValue: {
    ...globalStyles.f28Bold,
    color: color.WHITE,
    letterSpacing: -0.5,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  growthText: {
    ...globalStyles.f10Regular,
    color: '#81c784',
  },
  growthTextDown: {
    color: '#ef9a9a',
  },

  // ── Pending Box ──
  pendingBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    minWidth: 88,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pendingLabel: {
    ...globalStyles.f10Regular,
    color: 'rgba(255,255,255,0.55)',
  },
  pendingValue: {
    ...globalStyles.f14Bold,
    color: color.YELLOW,
  },

  // ── Bar Chart ──
  chartWrapper: {
    height: 90,
    paddingTop: 4,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: '100%',
    height: 68,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    minHeight: 6,
  },
  barFillActive: {
    backgroundColor: color.ORANGE,
  },
  barLabel: {
    ...globalStyles.f8Regular,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
  barLabelActive: {
    color: color.ORANGE,
    ...globalStyles.f8Bold,
  },

  // ── Stat Pills ──
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: color.WHITE,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statPillAccent: {
    backgroundColor: color.YELLOW_BG,
    borderColor: '#ffe082',
  },
  statPillIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statPillIconAccent: {
    backgroundColor: '#fff3cd',
  },
  statPillValue: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  statPillValueAccent: {
    color: color.YELLOW_TEXT,
  },
  statPillLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
  },
  statPillLabelAccent: {
    color: '#9a7800',
  },

  // ── Payout Banner ──
  payoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.WHITE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: color.BORDER_GREEN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  payoutBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutBannerTitle: {
    ...globalStyles.f12Bold,
    color: color.GREEN_DARK,
  },
  payoutBannerSub: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    marginTop: 2,
    lineHeight: 15,
  },
  payoutChevron: {
    padding: 4,
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
  },
  sectionTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },
  seeAllText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  // ── Transaction List ──
  txnList: {
    gap: 10,
  },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.WHITE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  txnLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txnAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  txnFarmer: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  txnService: {
    ...globalStyles.f10Regular,
    color: color.TEXT_SUB,
  },
  txnMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  txnDate: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
  },
  txnDot: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
  },
  txnId: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
  },
  txnRight: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  txnAmount: {
    ...globalStyles.f14Bold,
    color: color.GREEN,
  },
  txnAmountFailed: {
    color: color.RED_REJECT,
  },
  txnStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 30,
  },
  txnStatusText: {
    ...globalStyles.f10Bold,
  },
});
