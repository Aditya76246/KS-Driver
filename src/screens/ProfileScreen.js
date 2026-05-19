import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Profile completion steps ─────────────────────────────────────────────────
const COMPLETION_STEPS = [
  { id: 'basic', label: 'Basic Details', icon: 'person-outline', status: 'done' },
  { id: 'farm', label: 'Driving Details', icon: 'leaf-outline', status: 'done' },
  { id: 'bank', label: 'Bank Details', icon: 'business-outline', status: 'partial', progress: '0/2' },
];

// ─── Menu sections ────────────────────────────────────────────────────────────
const ACCOUNT_MENU = [
  { id: 'PersonalInfo', label: 'Personal Information', sub: 'View and update your personal details', icon: 'person-outline' },
  { id: 'Documents', label: 'My Documents', sub: 'Manage your uploaded documents', icon: 'document-text-outline' },
];

const SUPPORT_MENU = [
  { id: 'help', label: 'Help & Support', sub: 'Get help, chat or call us', icon: 'headset-outline' },
  { id: 'about', label: 'About Kisan Sahakar', sub: 'Know more about the app', icon: 'information-circle-outline' },
  { id: 'terms', label: 'Terms & Conditions', sub: 'Read our terms and conditions', icon: 'reader-outline' },
  { id: 'privacy', label: 'Privacy Policy', sub: 'Read our privacy policy', icon: 'lock-closed-outline' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CompletionStep({ step }) {
  const isDone = step.status === 'done';
  const isPartial = step.status === 'partial';

  return (
    <View style={styles.stepItem}>
      <View style={[styles.stepIconBox, isDone ? styles.stepIconDone : styles.stepIconPending]}>
        <Ionicons name={step.icon} size={20} color={isDone ? color.GREEN : color.TEXT_MUTED} />
      </View>
      <CustomText style={styles.stepLabel}>{step.label}</CustomText>
      {isDone ? (
        <Ionicons name="checkmark-circle" size={18} color={color.GREEN} style={styles.stepBadge} />
      ) : (
        <CustomText style={styles.stepProgress}>{step.progress}</CustomText>
      )}
    </View>
  );
}

function MenuItem({ item, onPress, isLast }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={item.icon} size={20} color={color.GREEN} />
      </View>
      <View style={styles.menuText}>
        <CustomText style={styles.menuLabel}>{item.label}</CustomText>
        <CustomText style={styles.menuSub}>{item.sub}</CustomText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={color.TEXT_MUTED} />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const completionPct = 66;

  const handleMenuPress = (id) => {
    navigation.navigate(id);
  };

  const handleLogout = () => {
    navigation.getParent()?.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  return (
    <View style={styles.root}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Profile Card ── */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.profileCard}>
          <View style={styles.profileCardInner}>

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={44} color="#aaa" />
              </View>
              <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
                <Ionicons name="camera" size={14} color={color.WHITE} />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.profileInfo}>
              <CustomText style={styles.profileName}>Ramesh Patil</CustomText>

              <View style={styles.roleBadge}>
                <MaterialCommunityIcons name="calendar-month-outline" size={13} color={color.GREEN} />
                <CustomText style={styles.roleText}>Individual Farmer</CustomText>
              </View>

              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={14} color={color.TEXT_SUB} />
                <CustomText style={styles.contactText}>+91 98765 43210</CustomText>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={14} color={color.TEXT_SUB} />
                <CustomText style={styles.contactText}>rameshpatil@gmail.com</CustomText>
              </View>
            </View>

            {/* Edit arrow */}
            <TouchableOpacity style={styles.editArrow} onPress={() => handleMenuPress('PersonalInfo')}>
              <Ionicons name="chevron-forward" size={20} color={color.TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Profile Completion Card ── */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <View style={{ flex: 1 }}>
              <CustomText style={styles.completionTitle}>Profile Completion</CustomText>
              <CustomText style={styles.completionSub}>Complete your profile to get better experience</CustomText>
            </View>
            <TouchableOpacity style={styles.completeNowBtn} onPress={() => handleMenuPress('PersonalInfo')} activeOpacity={0.85}>
              <CustomText style={styles.completeNowText}>Complete Now</CustomText>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
          </View>
          <CustomText style={styles.progressLabel}>{completionPct}% Complete</CustomText>

          {/* Steps */}
          <View style={styles.stepsRow}>
            {COMPLETION_STEPS.map((step) => (
              <CompletionStep key={step.id} step={step} />
            ))}
          </View>
        </Animated.View>

        {/* ── Account & Settings ── */}
        <Animated.View entering={FadeInDown.delay(190).duration(400)}>
          <CustomText style={styles.sectionTitle}>Account & Settings</CustomText>
          <View style={styles.menuCard}>
            {ACCOUNT_MENU.map((item, i) => (
              <MenuItem
                key={item.id}
                item={item}
                onPress={handleMenuPress}
                isLast={i === ACCOUNT_MENU.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Support & About ── */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <CustomText style={styles.sectionTitle}>Support & About</CustomText>
          <View style={styles.menuCard}>
            {SUPPORT_MENU.map((item, i) => (
              <MenuItem
                key={item.id}
                item={item}
                onPress={handleMenuPress}
                isLast={i === SUPPORT_MENU.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Logout ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={color.RED_REJECT} />
            <CustomText style={styles.logoutText}>Logout</CustomText>
          </TouchableOpacity>
        </Animated.View>

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
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },

  // ── Profile Card ──
  profileCard: {
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
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: color.GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: color.WHITE,
  },
  profileInfo: {
    flex: 1,
    gap: 5,
  },
  profileName: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: color.GREEN_BG,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
  },
  roleText: {
    ...globalStyles.f10Regular,
    color: color.GREEN,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
  },
  editArrow: {
    paddingTop: 2,
  },

  // ── Completion Card ──
  completionCard: {
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
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completionTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
  },
  completionSub: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
    marginTop: 2,
  },
  completeNowBtn: {
    backgroundColor: color.GREEN,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  completeNowText: {
    ...globalStyles.f12Bold,
    color: color.WHITE,
  },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: color.AVATAR_BG,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.GREEN,
    borderRadius: 99,
  },
  progressLabel: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
    textAlign: 'right',
    marginTop: -6,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  stepIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconDone: {
    backgroundColor: color.GREEN_BG,
  },
  stepIconPending: {
    backgroundColor: color.SURFACE_LOW,
  },
  stepLabel: {
    ...globalStyles.f10Regular,
    color: color.TEXT_SUB,
    textAlign: 'center',
  },
  stepBadge: {
    marginTop: -2,
  },
  stepProgress: {
    ...globalStyles.f10Bold,
    color: '#e65100',
  },

  // ── Section Title ──
  sectionTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MUTED,
    marginBottom: 8,
    marginLeft: 2,
  },

  // ── Menu Card ──
  menuCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: color.BORDER_LIGHT,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  menuSub: {
    ...globalStyles.f10Regular,
    color: color.TEXT_MUTED,
  },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: color.WHITE,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: color.BORDER_RED,
    paddingVertical: 16,
  },
  logoutText: {
    ...globalStyles.f14Bold,
    color: color.RED_REJECT,
  },
});
