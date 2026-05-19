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
    title: '1. Acceptance of Terms',
    content:
      'By downloading, installing, or using the Kisan Sahakar application ("App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App. These terms apply to all users of the App, including farmers, equipment operators, and visitors.',
  },
  {
    id: '2',
    title: '2. Eligibility',
    content:
      'You must be at least 18 years of age to use this App. By using the App, you represent and warrant that you meet this requirement. Kisan Sahakar reserves the right to terminate accounts of users who do not meet eligibility criteria.',
  },
  {
    id: '3',
    title: '3. User Accounts',
    content:
      'To access certain features of the App, you must register for an account using a valid mobile number. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use of your account.',
  },
  {
    id: '4',
    title: '4. Services & Bookings',
    content:
      'Kisan Sahakar is a platform that connects farmers with agricultural equipment operators. We do not own or operate any equipment. All bookings made through the App are agreements between the farmer and the operator. Kisan Sahakar acts solely as an intermediary and is not party to any service agreement.',
  },
  {
    id: '5',
    title: '5. Payments & Earnings',
    content:
      'All pricing displayed in the App is estimated based on the job details provided. Final amounts may vary based on actual work completed. Payments are processed through secure third-party payment gateways. Kisan Sahakar may retain a platform fee as described in the operator agreement. Earnings are credited within 3–5 business days after job completion.',
  },
  {
    id: '6',
    title: '6. User Conduct',
    content:
      'You agree not to use the App for any unlawful purpose or in any way that could damage, disable, or impair the App. You must not attempt to gain unauthorised access to any part of the App or its related systems. Any misuse, including providing false information or engaging in fraudulent bookings, will result in immediate account termination.',
  },
  {
    id: '7',
    title: '7. Cancellation Policy',
    content:
      'Bookings may be cancelled by either party up to 2 hours before the scheduled service time without penalty. Cancellations made after this window may attract a cancellation fee. Repeated cancellations by operators may result in account suspension. Kisan Sahakar reserves the right to modify the cancellation policy at any time.',
  },
  {
    id: '8',
    title: '8. Limitation of Liability',
    content:
      'Kisan Sahakar is not liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the App, including but not limited to equipment damage, crop loss, or personal injury. Our total liability in connection with any service shall not exceed the amount paid for that specific booking.',
  },
  {
    id: '9',
    title: '9. Intellectual Property',
    content:
      'All content on the App, including text, graphics, logos, icons, images, and software, is the property of Kisan Sahakar or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.',
  },
  {
    id: '10',
    title: '10. Changes to Terms',
    content:
      'Kisan Sahakar reserves the right to modify these Terms and Conditions at any time. Changes will be communicated through the App or via SMS to your registered mobile number. Continued use of the App after any changes constitutes your acceptance of the new terms.',
  },
  {
    id: '11',
    title: '11. Governing Law',
    content:
      'These Terms and Conditions are governed by the laws of India. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana.',
  },
  {
    id: '12',
    title: '12. Contact Us',
    content:
      'If you have any questions about these Terms and Conditions, please contact our support team at support@kisansahakar.in or call us on our helpline at 1800-XXX-XXXX (toll-free, Mon–Sat, 9 AM–6 PM).',
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
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.75}
      >
        <CustomText style={[styles.accordionTitle, open && styles.accordionTitleOpen]}>
          {section.title}
        </CustomText>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={open ? color.GREEN : color.TEXT_MUTED}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.accordionBody}>
          <CustomText style={styles.accordionContent}>{section.content}</CustomText>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TermsScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <InnerScreenHeader navigation={navigation} title="Terms & Conditions" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Intro Banner ── */}
        <Animated.View entering={FadeInDown.delay(40).duration(400)} style={styles.introBanner}>
          <View style={styles.introBannerIconBox}>
            <Ionicons name="reader-outline" size={28} color={color.GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.introBannerTitle}>Terms & Conditions</CustomText>
            <CustomText style={styles.introBannerSub}>
              Last updated: 1 October 2024
            </CustomText>
          </View>
        </Animated.View>

        {/* ── Intro Text ── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <CustomText style={styles.introText}>
            Please read these terms carefully before using the Kisan Sahakar platform. These terms govern your relationship with us and define your rights and responsibilities.
          </CustomText>
        </Animated.View>

        {/* ── Accordion Sections ── */}
        <View style={styles.accordionList}>
          {SECTIONS.map((section, i) => (
            <AccordionItem key={section.id} section={section} index={i} />
          ))}
        </View>

        {/* ── Footer Note ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={16} color={color.TEXT_MUTED} />
          <CustomText style={styles.footerNoteText}>
            By continuing to use Kisan Sahakar, you agree to these Terms & Conditions.
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: color.BORDER_LIGHT,
  },
  accordionContent: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    lineHeight: 20,
    paddingTop: 12,
  },

  // ── Footer Note ──
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 12,
    padding: 14,
  },
  footerNoteText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    flex: 1,
    lineHeight: 18,
  },
});
