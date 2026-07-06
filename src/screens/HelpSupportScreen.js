import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import VoiceInputButton from '../components/VoiceInputButton'; 
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';
import { showAlert } from '../services/alertService';

// ─── Data (unchanged) ─────────────────────────────────────────────────────────

const CONTACT_OPTIONS = [
  {
    id: 'call',
    icon: 'call-outline',
    label: 'Call Us',
    sub: 'Mon – Sat, 9 AM – 6 PM',
    value: '1800-XXX-XXXX',
    badge: 'Toll Free',
    badgeColor: color.GREEN,
    badgeBg: color.GREEN_BG,
    action: () => Linking.openURL('tel:1800XXXXXXX'),
  },
  {
    id: 'whatsapp',
    icon: 'logo-whatsapp',
    label: 'WhatsApp',
    sub: 'Typically replies in minutes',
    value: '+91 98765 43210',
    badge: 'Quick Reply',
    badgeColor: '#2E7D32',
    badgeBg: '#E8F5E9',
    action: () => Linking.openURL('https://wa.me/919876543210'),
  },
  {
    id: 'email',
    icon: 'mail-outline',
    label: 'Email Support',
    sub: 'Response within 24 hours',
    value: 'support@kisansahakar.in',
    badge: null,
    action: () => Linking.openURL('mailto:support@kisansahakar.in'),
  },
];

const FAQS = [
  {
    id: '1',
    q: 'How do I accept a booking request?',
    a: 'On the Home screen, new booking requests appear as cards. Tap "Accept" on any request to confirm it. You can also view full details before accepting by tapping "View Details." Once accepted, the booking moves to your Accepted tab in Bookings.',
  },
  {
    id: '2',
    q: 'How do I go Online or Offline?',
    a: 'On the Home screen, use the Online/Offline toggle in the top-right area of the screen. When Online, you will receive new booking requests from nearby farmers. Going Offline pauses all incoming requests.',
  },
  {
    id: '3',
    q: 'When will I receive my payment?',
    a: 'Earnings are credited to your registered bank account within 3–5 business days after a job is marked as completed. You can track all transactions in the Earnings tab.',
  },
  {
    id: '4',
    q: 'How do I complete my KYC verification?',
    a: 'Go to Profile → Personal Information and follow the 3-step profile completion wizard.',
  },
  {
    id: '5',
    q: 'Can I cancel an accepted booking?',
    a: 'Yes, you can cancel a booking up to 2 hours before the scheduled time without penalty.',
  },
  {
    id: '6',
    q: 'What if the farmer is not present at the location?',
    a: 'If the farmer is not reachable or present, tap "Report Issue" on the booking detail screen.',
  },
  {
    id: '7',
    q: 'How do I switch the app language to Telugu?',
    a: 'On the Home screen, tap the language toggle at the top to switch between English and Telugu.',
  },
  {
    id: '8',
    q: 'What equipment types are supported on the platform?',
    a: 'Currently supported: Tractor, Harvester Rental, Rotavator, Seeder Machine, and Sprayer.',
  },
];

// ─── FAQ Item (unchanged) ─────────────────────────────────────────────────────
function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 35).duration(350)}
      style={styles.faqItem}
    >
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.75}
      >
        <View style={styles.faqIconBox}>
          <CustomText style={styles.faqNumber}>{index + 1}</CustomText>
        </View>
        <CustomText style={[styles.faqQ, open && styles.faqQOpen]}>
          {item.q}
        </CustomText>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={open ? color.GREEN : color.TEXT_MUTED}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.faqBody}>
          <CustomText style={styles.faqA}>{item.a}</CustomText>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Contact Card (unchanged) ─────────────────────────────────────────────────
function ContactCard({ option, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <TouchableOpacity
        style={styles.contactCard}
        onPress={option.action}
        activeOpacity={0.8}
      >
        <View style={styles.contactIconBox}>
          <Ionicons name={option.icon} size={22} color={color.GREEN} />
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.contactLabelRow}>
            <CustomText style={styles.contactLabel}>{option.label}</CustomText>
            {option.badge && (
              <View style={[styles.contactBadge, { backgroundColor: option.badgeBg }]}>
                <CustomText style={[styles.contactBadgeText, { color: option.badgeColor }]}>
                  {option.badge}
                </CustomText>
              </View>
            )}
          </View>
          <CustomText style={styles.contactValue}>{option.value}</CustomText>
          <CustomText style={styles.contactSub}>{option.sub}</CustomText>
        </View>
        <View style={styles.contactArrow}>
          <Ionicons name="chevron-forward" size={18} color={color.TEXT_MUTED} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HelpSupportScreen({ navigation }) {
  const [query,      setQuery]      = useState('');
  const [ticketText, setTicketText] = useState('');   // ← now controlled

  const filteredFaqs = FAQS.filter(
    (f) =>
      query.trim() === '' ||
      f.q.toLowerCase().includes(query.toLowerCase()) ||
      f.a.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmitTicket = () => {
    showAlert(
      'Support Request Sent',
      'Our team will get back to you within 24 hours on your registered mobile number.',
      [{ text: 'OK', onPress: () => setTicketText('') }]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <InnerScreenHeader navigation={navigation} title="Help & Support" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Banner ── */}
        <Animated.View entering={FadeInDown.delay(40).duration(400)} style={styles.heroBanner}>
          <View style={styles.heroBannerIcon}>
            <Ionicons name="headset-outline" size={32} color={color.GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.heroBannerTitle}>How can we help you?</CustomText>
            <CustomText style={styles.heroBannerSub}>
              Search FAQs, call us, or send a message
            </CustomText>
          </View>
        </Animated.View>

        {/* ── Search FAQs — now with mic button ── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={color.TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs..."
            placeholderTextColor={color.TEXT_MUTED}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={color.TEXT_MUTED} />
            </TouchableOpacity>
          ) : (
            /* Mic replaces the clear button when field is empty */
            <VoiceInputButton
              size="sm"
              onResult={(text) => setQuery(text)}
              onPartialResult={(text) => setQuery(text)}
            />
          )}
        </Animated.View>

        {/* ── Contact Options ── */}
        <Animated.View entering={FadeInDown.delay(110).duration(400)}>
          <CustomText style={styles.sectionLabel}>Contact Us</CustomText>
        </Animated.View>

        {CONTACT_OPTIONS.map((opt, i) => (
          <ContactCard key={opt.id} option={opt} delay={140 + i * 40} />
        ))}

        {/* ── FAQs ── */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)}>
          <CustomText style={styles.sectionLabel}>
            Frequently Asked Questions
            {query.trim() !== '' && (
              <CustomText style={styles.faqCount}>
                {'  '}{filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
              </CustomText>
            )}
          </CustomText>
        </Animated.View>

        {filteredFaqs.length > 0 ? (
          <View style={styles.faqList}>
            {filteredFaqs.map((item, i) => (
              <FaqItem key={item.id} item={item} index={i} />
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.noResults}>
            <Ionicons name="search-outline" size={36} color={color.BORDER_LIGHT} />
            <CustomText style={styles.noResultsText}>No FAQs match "{query}"</CustomText>
            <CustomText style={styles.noResultsSub}>Try a different keyword or contact us directly</CustomText>
          </Animated.View>
        )}

        {/* ── Raise a Ticket — now with voice ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <CustomText style={styles.sectionLabel}>Still need help?</CustomText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(330).duration(400)} style={styles.ticketCard}>
          <CustomText style={styles.ticketTitle}>Raise a Support Ticket</CustomText>
          <CustomText style={styles.ticketSub}>
            Describe your issue and our team will respond to your registered mobile within 24 hours.
          </CustomText>

          {/* Ticket text area + mic button row */}
          <View style={styles.ticketInputWrapper}>
            <TextInput
              style={styles.ticketInput}
              placeholder="Describe your issue here..."
              placeholderTextColor={color.TEXT_MUTED}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={ticketText}
              onChangeText={setTicketText}
            />
            {/* Floating mic in bottom-right corner of the textarea */}
            <View style={styles.ticketMicWrapper}>
              <VoiceInputButton
                size="md"
                onResult={(text) => setTicketText((prev) => prev ? prev + ' ' + text : text)}
                onPartialResult={(text) => {
                  // Show partial appended to existing text without replacing it
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.ticketBtn, !ticketText.trim() && styles.ticketBtnDisabled]}
            onPress={handleSubmitTicket}
            activeOpacity={ticketText.trim() ? 0.8 : 1}
          >
            <Ionicons name="send-outline" size={16} color={color.WHITE} />
            <CustomText style={styles.ticketBtnText}>Submit Request</CustomText>
          </TouchableOpacity>
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

  heroBanner: {
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
  heroBannerIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBannerTitle: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },
  heroBannerSub: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    marginTop: 3,
  },

  // ── Search box — mic replaces clear icon ──
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: color.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 8,       // reduced from 12 to keep height consistent with mic button
  },
  searchInput: {
    flex: 1,
    ...globalStyles.f12Regular,
    color: color.TEXT_MAIN,
    padding: 0,
    paddingVertical: 4,
  },

  sectionLabel: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MUTED,
    marginLeft: 2,
    marginBottom: -4,
  },
  faqCount: {
    ...globalStyles.f12Regular,
    color: color.GREEN,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.WHITE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  contactIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo:     { flex: 1, gap: 2 },
  contactLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactLabel:    { ...globalStyles.f14Bold,    color: color.TEXT_MAIN },
  contactBadge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 30 },
  contactBadgeText:{ ...globalStyles.f10Bold },
  contactValue:    { ...globalStyles.f12Bold,    color: color.GREEN },
  contactSub:      { ...globalStyles.f10Regular, color: color.TEXT_MUTED },
  contactArrow:    { padding: 4 },

  faqList: { gap: 8 },
  faqItem: {
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
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  faqIconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  faqNumber:  { ...globalStyles.f10Bold,    color: color.GREEN      },
  faqQ:       { ...globalStyles.f12Bold,    color: color.TEXT_MAIN, flex: 1 },
  faqQOpen:   { color: color.GREEN },
  faqBody: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: color.BORDER_LIGHT, paddingTop: 12,
  },
  faqA: { ...globalStyles.f12Regular, color: color.TEXT_SUB, lineHeight: 20 },

  noResults: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  noResultsText: { ...globalStyles.f14Bold,    color: color.TEXT_MUTED },
  noResultsSub:  { ...globalStyles.f12Regular, color: color.TEXT_MUTED, textAlign: 'center' },

  // ── Ticket card ──
  ticketCard: {
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
  ticketTitle: { ...globalStyles.f14Bold,    color: color.TEXT_MAIN },
  ticketSub:   { ...globalStyles.f12Regular, color: color.TEXT_MUTED, lineHeight: 18, marginTop: -4 },

  ticketInputWrapper: {
    position: 'relative',
  },
  ticketInput: {
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 12,
    padding: 14,
    paddingBottom: 52,         // extra space so text doesn't go under the mic
    ...globalStyles.f12Regular,
    color: color.TEXT_MAIN,
    minHeight: 110,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
  },
  ticketMicWrapper: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },

  ticketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: color.GREEN,
    borderRadius: 12,
    paddingVertical: 14,
  },
  ticketBtnDisabled: {
    backgroundColor: color.AVATAR_BG,
  },
  ticketBtnText: { ...globalStyles.f14Bold, color: color.WHITE },
});