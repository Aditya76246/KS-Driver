import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Data ─────────────────────────────────────────────────────────────────────

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '2024.10.01';

const STATS = [
  { label: 'Operators',    value: '12,000+', icon: 'person-outline' },
  { label: 'Farmers Served', value: '85,000+', icon: 'leaf-outline' },
  { label: 'Districts',    value: '22',       icon: 'map-outline' },
  { label: 'Jobs Done',    value: '3.2 Lakh', icon: 'checkmark-circle-outline' },
];

const FEATURES = [
  {
    icon: 'flash-outline',
    title: 'Instant Booking Requests',
    desc: 'Receive real-time requests from farmers in your area and accept with one tap.',
  },
  {
    icon: 'cash-outline',
    title: 'Transparent Earnings',
    desc: 'Track every rupee earned. Payments credited directly to your bank in 3–5 days.',
  },
  {
    icon: 'language-outline',
    title: 'Telugu & English',
    desc: 'Switch between Telugu and English instantly — built for every operator in Andhra Pradesh.',
  },
  {
    icon: 'location-outline',
    title: 'Location-Based Matching',
    desc: 'Get matched with the nearest farmers to minimise travel and maximise jobs.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Verified KYC',
    desc: 'Secure Aadhaar-based verification protects both farmers and operators on every job.',
  },
  {
    icon: 'headset-outline',
    title: 'Dedicated Support',
    desc: 'Toll-free helpline, WhatsApp, and in-app ticketing — help is always a tap away.',
  },
];

const LINKS = [
  {
    icon: 'globe-outline',
    label: 'Visit our Website',
    url: 'https://kisansahakar.com',
  },
  {
    icon: 'logo-facebook',
    label: 'Follow us on Facebook',
    url: 'https://facebook.com/kisansahakar',
  },
  {
    icon: 'logo-instagram',
    label: 'Follow us on Instagram',
    url: 'https://instagram.com/kisansahakar',
  },
  {
    icon: 'logo-youtube',
    label: 'Follow us on YouTube',
    url: 'https://youtube.com/kisansahakar',
  },
  {
    icon: 'mail-outline',
    label: 'Email Us',
    url: 'mailto:hello@kisansahakar.in',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatItem({ stat, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.statItem}>
      <View style={styles.statIconBox}>
        <Ionicons name={stat.icon} size={20} color={color.GREEN} />
      </View>
      <CustomText style={styles.statValue}>{stat.value}</CustomText>
      <CustomText style={styles.statLabel}>{stat.label}</CustomText>
    </Animated.View>
  );
}

function FeatureItem({ feature, index }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(380)}
      style={styles.featureItem}
    >
      <View style={styles.featureIconBox}>
        <Ionicons name={feature.icon} size={20} color={color.GREEN} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <CustomText style={styles.featureTitle}>{feature.title}</CustomText>
        <CustomText style={styles.featureDesc}>{feature.desc}</CustomText>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <InnerScreenHeader navigation={navigation} title="About Kisan Sahakar" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Brand Hero ── */}
        <Animated.View entering={FadeInDown.delay(40).duration(400)} style={styles.brandCard}>
          <View style={styles.brandLogoBox}>
            {/* Replace with your actual KS logo image */}
            <Ionicons name="leaf" size={44} color={color.GREEN} />
          </View>
          <CustomText style={styles.brandName}>Kisan Sahakar</CustomText>
          <CustomText style={styles.brandTagline}>Smart Equipment. Stronger Farms.</CustomText>
          <View style={styles.versionRow}>
            <View style={styles.versionPill}>
              <CustomText style={styles.versionText}>v{APP_VERSION}</CustomText>
            </View>
            <View style={styles.versionPill}>
              <CustomText style={styles.versionText}>Build {BUILD_NUMBER}</CustomText>
            </View>
          </View>
        </Animated.View>

        {/* ── Mission ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionIconBox}>
              <Ionicons name="rocket-outline" size={20} color={color.GREEN} />
            </View>
            <CustomText style={styles.sectionTitle}>Our Mission</CustomText>
          </View>
          <CustomText style={styles.missionText}>
            Kisan Sahakar was born from a simple belief — every farmer in India deserves access to modern agricultural machinery, and every operator deserves a fair, reliable income.
          </CustomText>
          <CustomText style={[styles.missionText, { marginTop: 8 }]}>
            We connect tractor operators, harvester owners, and equipment operators directly with farmers in their area — eliminating middlemen, reducing costs, and ensuring fair pricing for both sides.
          </CustomText>
        </Animated.View>

        {/* ── Stats ── */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <CustomText style={styles.sectionLabel}>Our Impact</CustomText>
        </Animated.View>

        <View style={styles.statsGrid}>
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} delay={180 + i * 40} />
          ))}
        </View>

        {/* ── Features ── */}
        <Animated.View entering={FadeInDown.delay(360).duration(400)}>
          <CustomText style={styles.sectionLabel}>What We Offer</CustomText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).duration(400)} style={styles.featuresCard}>
          {FEATURES.map((feature, i) => (
            <View key={feature.title}>
              <FeatureItem feature={feature} index={i} />
              {i < FEATURES.length - 1 && <View style={styles.featureDivider} />}
            </View>
          ))}
        </Animated.View>

        {/* ── Team ── */}
        <Animated.View entering={FadeInDown.delay(480).duration(400)}>
          <CustomText style={styles.sectionLabel}>About the Company</CustomText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.teamCard}>
          <View style={styles.teamRow}>
            <View style={styles.teamIconBox}>
              <Ionicons name="business-outline" size={20} color={color.GREEN} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <CustomText style={styles.teamLabel}>Registered Name</CustomText>
              <CustomText style={styles.teamValue}>Kisan Sahakar Technologies Pvt. Ltd.</CustomText>
            </View>
          </View>
          <View style={styles.teamDivider} />
          <View style={styles.teamRow}>
            <View style={styles.teamIconBox}>
              <Ionicons name="location-outline" size={20} color={color.GREEN} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <CustomText style={styles.teamLabel}>Headquarters</CustomText>
              <CustomText style={styles.teamValue}>4th Floor, Agri-Tech Hub, Hyderabad — 500032, Telangana, India</CustomText>
            </View>
          </View>
          <View style={styles.teamDivider} />
          <View style={styles.teamRow}>
            <View style={styles.teamIconBox}>
              <Ionicons name="map-outline" size={20} color={color.GREEN} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <CustomText style={styles.teamLabel}>Current Coverage</CustomText>
              <CustomText style={styles.teamValue}>Andhra Pradesh & Telangana — 22 Districts</CustomText>
            </View>
          </View>
          <View style={styles.teamDivider} />
          <View style={styles.teamRow}>
            <View style={styles.teamIconBox}>
              <Ionicons name="calendar-outline" size={20} color={color.GREEN} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <CustomText style={styles.teamLabel}>Founded</CustomText>
              <CustomText style={styles.teamValue}>2022</CustomText>
            </View>
          </View>
        </Animated.View>

        {/* ── Follow Us ── */}
        <Animated.View entering={FadeInDown.delay(560).duration(400)}>
          <CustomText style={styles.sectionLabel}>Connect With Us</CustomText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(580).duration(400)} style={styles.linksCard}>
          {LINKS.map((link, i) => (
            <View key={link.label}>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => Linking.openURL(link.url)}
                activeOpacity={0.75}
              >
                <View style={styles.linkIconBox}>
                  <Ionicons name={link.icon} size={18} color={color.GREEN} />
                </View>
                <CustomText style={styles.linkLabel}>{link.label}</CustomText>
                <Ionicons name="open-outline" size={16} color={color.TEXT_MUTED} />
              </TouchableOpacity>
              {i < LINKS.length - 1 && <View style={styles.teamDivider} />}
            </View>
          ))}
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View entering={FadeInDown.delay(620).duration(400)} style={styles.footer}>
          <CustomText style={styles.footerText}>
            Made with ❤️ for the farmers of India
          </CustomText>
          <CustomText style={styles.footerSub}>
            © 2026 Glansa Solutions - Kisan Sahakar Technologies Pvt. Ltd. All rights reserved.
          </CustomText>
        </Animated.View>

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
    gap: 14,
  },

  // ── Brand Card ──
  brandCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  brandLogoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    ...globalStyles.f20Bold,
    color: color.TEXT_MAIN,
  },
  brandTagline: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    marginBottom: 6,
  },
  versionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  versionPill: {
    backgroundColor: color.SURFACE_LOW,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },
  versionText: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
  },

  // ── Mission ──
  missionCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  missionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    lineHeight: 20,
  },

  // ── Section Label ──
  sectionLabel: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MUTED,
    marginLeft: 2,
    marginBottom: -4,
  },
  sectionTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },

  // ── Stats Grid ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: '47.5%',
    backgroundColor: color.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },
  statLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
  },

  // ── Features ──
  featuresCard: {
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 12,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureTitle: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  featureDesc: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    lineHeight: 18,
  },
  featureDivider: {
    height: 1,
    backgroundColor: color.BORDER_LIGHT,
    marginLeft: 54,
  },

  // ── Team / Company ──
  teamCard: {
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
    gap: 0,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  teamIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  teamLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
  },
  teamValue: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
    lineHeight: 18,
  },
  teamDivider: {
    height: 1,
    backgroundColor: color.BORDER_LIGHT,
    marginLeft: 48,
  },

  // ── Links ──
  linksCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
    flex: 1,
  },

  // ── Footer ──
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  footerText: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MUTED,
  },
  footerSub: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
  },
});