import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Content ──────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: '1',
    icon: 'person-outline',
    title: 'Information We Collect',
    items: [
      {
        label: 'Personal Information',
        text: 'When you register, we collect your name, mobile number, email address, date of birth, and gender. For operators, we also collect Aadhaar number, bank account details, and vehicle registration information for KYC verification.',
      },
      {
        label: 'Location Data',
        text: 'We collect your real-time location while the App is active and you are marked as "Online." This is used to match you with nearby farmers and display your distance to booking requests. Location data is not stored permanently after a session ends.',
      },
      {
        label: 'Usage Data',
        text: 'We collect information about how you interact with the App, including pages visited, features used, and actions taken. This helps us improve the App experience and diagnose technical issues.',
      },
    ],
  },
  {
    id: '2',
    icon: 'shield-checkmark-outline',
    title: 'How We Use Your Information',
    items: [
      {
        label: 'Service Delivery',
        text: 'Your personal and location data is used to facilitate bookings, match operators with farmers, calculate distances, and process payments.',
      },
      {
        label: 'Account Management',
        text: 'We use your mobile number for OTP-based authentication, account recovery, and important service notifications.',
      },
      {
        label: 'Improvement & Analytics',
        text: 'Aggregated, anonymised usage data helps us understand usage patterns and improve the App. We never use individually identifiable data for analytics without your consent.',
      },
      {
        label: 'Legal Compliance',
        text: 'We may use or disclose your information where required to comply with applicable law, court orders, or government regulations.',
      },
    ],
  },
  {
    id: '3',
    icon: 'share-social-outline',
    title: 'Information Sharing',
    items: [
      {
        label: 'With Other Users',
        text: 'When a booking is made, your name, contact number, and general location are shared with the other party (farmer or operator) to facilitate the service.',
      },
      {
        label: 'With Service Providers',
        text: 'We share data with trusted third-party providers including payment gateways, SMS services, and cloud storage providers, solely for the purpose of delivering our services.',
      },
      {
        label: 'We Do Not Sell Your Data',
        text: 'Kisan Sahakar does not sell, rent, or trade your personal information to any third party for their independent marketing purposes.',
      },
    ],
  },
  {
    id: '4',
    icon: 'lock-closed-outline',
    title: 'Data Security',
    items: [
      {
        label: 'Encryption',
        text: 'All data transmitted between your device and our servers is encrypted using TLS (Transport Layer Security). Sensitive data such as bank details and Aadhaar numbers are stored using AES-256 encryption.',
      },
      {
        label: 'Access Controls',
        text: 'Access to user data is restricted to authorised personnel only, on a need-to-know basis. All internal access is logged and regularly audited.',
      },
      {
        label: 'Incident Response',
        text: 'In the event of a data breach, we will notify affected users within 72 hours and take immediate steps to contain and remediate the issue.',
      },
    ],
  },
  {
    id: '5',
    icon: 'options-outline',
    title: 'Your Rights & Choices',
    items: [
      {
        label: 'Access & Correction',
        text: 'You can view and update your personal information at any time through the Profile section of the App.',
      },
      {
        label: 'Data Deletion',
        text: 'You may request deletion of your account and all associated personal data by contacting our support team. Note that certain data may be retained for legal or financial compliance purposes.',
      },
      {
        label: 'Location Permissions',
        text: 'You can revoke location permissions at any time through your device settings. Note that revoking location access will prevent you from going Online and accepting bookings.',
      },
      {
        label: 'Marketing Communications',
        text: 'You can opt out of promotional SMS and notifications through the App settings. Transactional messages (e.g., OTP, booking confirmations) cannot be opted out of.',
      },
    ],
  },
  {
    id: '6',
    icon: 'time-outline',
    title: 'Data Retention',
    items: [
      {
        label: 'Active Accounts',
        text: 'We retain your data for as long as your account is active or as needed to provide services.',
      },
      {
        label: 'Deleted Accounts',
        text: 'Upon account deletion, personal data is purged within 30 days. Transaction records are retained for 7 years as required by Indian financial regulations.',
      },
    ],
  },
  {
    id: '7',
    icon: 'people-outline',
    title: 'Children\'s Privacy',
    items: [
      {
        label: 'Age Restriction',
        text: 'Our App is not directed at children under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal data, we will delete it promptly.',
      },
    ],
  },
  {
    id: '8',
    icon: 'refresh-outline',
    title: 'Changes to This Policy',
    items: [
      {
        label: 'Notification of Changes',
        text: 'We may update this Privacy Policy from time to time. Material changes will be communicated via the App or SMS to your registered mobile number. Continued use of the App after changes are posted constitutes your acceptance.',
      },
    ],
  },
  {
    id: '9',
    icon: 'mail-outline',
    title: 'Contact & Grievances',
    items: [
      {
        label: 'Data Protection Officer',
        text: 'For any privacy-related concerns, requests, or grievances, please contact our Data Protection Officer at privacy@kisansahakar.in or write to: Kisan Sahakar Technologies Pvt. Ltd., 4th Floor, Agri-Tech Hub, Hyderabad — 500032, Telangana, India.',
      },
      {
        label: 'Response Time',
        text: 'We aim to acknowledge all privacy requests within 48 hours and resolve them within 30 days.',
      },
    ],
  },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({ section, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(350)}
      style={styles.accordionItem}
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.75}
      >
        <View style={[styles.sectionIconBox, open && styles.sectionIconBoxOpen]}>
          <Ionicons
            name={section.icon}
            size={18}
            color={open ? color.WHITE : color.GREEN}
          />
        </View>
        <CustomText style={[styles.accordionTitle, open && styles.accordionTitleOpen]}>
          {section.title}
        </CustomText>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={open ? color.GREEN : color.TEXT_MUTED}
        />
      </TouchableOpacity>

      {/* Body */}
      {open && (
        <View style={styles.accordionBody}>
          {section.items.map((item, i) => (
            <View key={i} style={[styles.policyItem, i < section.items.length - 1 && styles.policyItemBorder]}>
              <View style={styles.policyItemDot} />
              <View style={{ flex: 1, gap: 4 }}>
                <CustomText style={styles.policyItemLabel}>{item.label}</CustomText>
                <CustomText style={styles.policyItemText}>{item.text}</CustomText>
              </View>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <InnerScreenHeader navigation={navigation} title="Privacy Policy" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Intro Banner ── */}
        <Animated.View entering={FadeInDown.delay(40).duration(400)} style={styles.introBanner}>
          <View style={styles.introBannerIconBox}>
            <Ionicons name="lock-closed-outline" size={28} color={color.GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.introBannerTitle}>Privacy Policy</CustomText>
            <CustomText style={styles.introBannerSub}>
              Last updated: 1 October 2024
            </CustomText>
          </View>
        </Animated.View>

        {/* ── Intro Text ── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <CustomText style={styles.introText}>
            Your privacy matters to us. This policy explains what data Kisan Sahakar collects, why we collect it, how it is used, and the choices you have regarding your information.
          </CustomText>
        </Animated.View>

        {/* ── Highlight Pills ── */}
        <Animated.View entering={FadeInDown.delay(110).duration(400)} style={styles.pillsRow}>
          {[
            { icon: 'ban-outline',          label: 'Never sold' },
            { icon: 'lock-closed-outline',  label: 'Encrypted' },
            { icon: 'person-outline',       label: 'Your control' },
          ].map((pill) => (
            <View key={pill.label} style={styles.pill}>
              <Ionicons name={pill.icon} size={14} color={color.GREEN} />
              <CustomText style={styles.pillText}>{pill.label}</CustomText>
            </View>
          ))}
        </Animated.View>

        {/* ── Accordion Sections ── */}
        <View style={styles.accordionList}>
          {SECTIONS.map((section, i) => (
            <AccordionItem key={section.id} section={section} index={i} />
          ))}
        </View>

        {/* ── Footer Note ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.footerNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color={color.GREEN} />
          <CustomText style={styles.footerNoteText}>
            Kisan Sahakar is committed to protecting your privacy and handling your data with transparency and respect.
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

  // ── Intro Banner ──
  introBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  introBannerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introBannerTitle: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },
  introBannerSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    marginTop: 2,
  },

  // ── Intro Text ──
  introText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    lineHeight: 20,
    paddingHorizontal: 2,
  },

  // ── Pills ──
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: color.GREEN_BG,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30,
  },
  pillText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  // ── Accordion ──
  accordionList: {
    gap: 8,
  },
  accordionItem: {
    backgroundColor: color.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIconBoxOpen: {
    backgroundColor: color.GREEN,
  },
  accordionTitle: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
    flex: 1,
  },
  accordionTitleOpen: {
    color: color.GREEN,
  },
  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: color.BORDER_LIGHT,
    gap: 0,
  },

  // ── Policy Item ──
  policyItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  policyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: color.BORDER_LIGHT,
  },
  policyItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.GREEN,
    marginTop: 6,
    flexShrink: 0,
  },
  policyItemLabel: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  policyItemText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    lineHeight: 20,
  },

  // ── Footer Note ──
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: color.GREEN_BG,
    borderRadius: 12,
    padding: 14,
  },
  footerNoteText: {
    ...globalStyles.f12Regular,
    color: color.GREEN,
    flex: 1,
    lineHeight: 18,
  },
});
