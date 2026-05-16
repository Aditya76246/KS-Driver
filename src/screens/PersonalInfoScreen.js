import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';   // ← new
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_STEPS   = 3;
const CURRENT_STEP  = 1;

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

// ─── Step Progress Bar ────────────────────────────────────────────────────────
function StepProgressBar({ current, total }) {
  return (
    <View style={styles.progressBarRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            i < current ? styles.progressSegmentActive : styles.progressSegmentInactive,
            i < total - 1 && { marginRight: 6 },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────
function AvatarUpload({ uri, onPress }) {
  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.avatarImagePlaceholder}>
          <Ionicons
            name="person"
            size={56}
            color={uri ? color.GREEN : color.TEXT_MUTED}
          />
        </View>
        <View style={styles.avatarEditBadge}>
          <Ionicons name="camera" size={14} color={color.WHITE} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.uploadPhotoBtn}>
        <Ionicons name="cloud-upload-outline" size={15} color={color.GREEN} />
        <CustomText style={styles.uploadPhotoText}>Upload Photo</CustomText>
      </TouchableOpacity>
    </View>
  );
}

// ─── Labelled Input ───────────────────────────────────────────────────────────
function InputField({ label, value, onChangeText, placeholder, icon, keyboardType = 'default' }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <CustomText style={styles.fieldLabel}>{label}</CustomText>
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? color.GREEN : color.TEXT_MUTED}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={color.TEXT_MUTED}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

// ─── Gender Dropdown ──────────────────────────────────────────────────────────
function GenderDropdown({ value, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={[styles.inputBox, open && styles.inputBoxFocused]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="gender-male-female"
          size={18}
          color={value ? color.TEXT_MAIN : color.TEXT_MUTED}
          style={styles.inputIcon}
        />
        <CustomText style={[styles.dropdownValue, !value && { color: color.TEXT_MUTED }]}>
          {value || 'Select'}
        </CustomText>
        <Ionicons name="chevron-down" size={16} color={color.TEXT_MUTED} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdownSheet}>
            <CustomText style={styles.dropdownSheetTitle}>Select Gender</CustomText>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownOption, value === opt && styles.dropdownOptionActive]}
                onPress={() => { onSelect(opt); setOpen(false); }}
                activeOpacity={0.7}
              >
                <CustomText style={[styles.dropdownOptionText, value === opt && styles.dropdownOptionTextActive]}>
                  {opt}
                </CustomText>
                {value === opt && <Ionicons name="checkmark" size={16} color={color.GREEN} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Age Picker ───────────────────────────────────────────────────────────────
function AgePicker({ value, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.inputBox, value && styles.inputBoxFilled]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name="calendar-outline"
        size={18}
        color={value ? color.TEXT_MAIN : color.TEXT_MUTED}
        style={styles.inputIcon}
      />
      <CustomText style={[styles.dropdownValue, !value && { color: color.TEXT_MUTED }]}>
        {value || 'Age'}
      </CustomText>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PersonalInfoScreen({ navigation }) {
  const [photoUri, setPhotoUri] = useState(null);
  const [fullName, setFullName]  = useState('');
  const [gender,   setGender]    = useState('');
  const [age,      setAge]       = useState('');
  const [address,  setAddress]   = useState('');

  const isValid = fullName.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;
    // Navigate to next step: navigation.navigate('FarmDetails');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      {/* ── Header — back button + centered title ── */}
      <InnerScreenHeader navigation={navigation} title="Personal Info" />

      {/* ── Step Progress ── */}
      <View style={styles.progressWrapper}>
        <StepProgressBar current={CURRENT_STEP} total={TOTAL_STEPS} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Page Title ── */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.titleBlock}>
          <CustomText style={styles.pageTitle}>Set up your profile</CustomText>
          <CustomText style={styles.pageSubtitle}>
            Tell us more about yourself to start finding the best agricultural jobs near you.
          </CustomText>
        </Animated.View>

        {/* ── Avatar ── */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)}>
          <AvatarUpload uri={photoUri} onPress={() => { /* trigger image picker */ }} />
        </Animated.View>

        {/* ── Form Card ── */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.formCard}>

          <InputField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            icon="person-outline"
          />

          <View style={styles.rowFields}>
            <View style={styles.rowFieldHalf}>
              <CustomText style={styles.fieldLabel}>Gender</CustomText>
              <GenderDropdown value={gender} onSelect={setGender} />
            </View>
            <View style={styles.rowFieldHalf}>
              <CustomText style={styles.fieldLabel}>Age</CustomText>
              <AgePicker
                value={age}
                onPress={() => setAge(age ? '' : '28')}
              />
            </View>
          </View>

          <InputField
            label="Address (Village / District)"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Mapusa, North Goa"
            icon="location-outline"
          />

        </Animated.View>

        {/* spacer so content clears the fixed CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Fixed Bottom CTA ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={isValid ? 0.85 : 1}
        >
          <CustomText style={styles.saveBtnText}>Save & Continue</CustomText>
          <Ionicons name="arrow-forward" size={20} color={color.WHITE} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        <CustomText style={styles.stepIndicator}>Step {CURRENT_STEP} of {TOTAL_STEPS}</CustomText>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.SURFACE,
  },

  // ── Step Progress Bar ──
  progressWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: color.SURFACE,
  },
  progressBarRow: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 99,
  },
  progressSegment: {
    flex: 1,
    borderRadius: 99,
    height: 5,
  },
  progressSegmentActive:   { backgroundColor: color.GREEN },
  progressSegmentInactive: { backgroundColor: color.AVATAR_BG },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 24,
  },

  // ── Title ──
  titleBlock: {
    gap: 8,
  },
  pageTitle: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
    lineHeight: 32,
  },
  pageSubtitle: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    lineHeight: 22,
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: color.SURFACE_LOW,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: color.BORDER_LIGHT,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: color.WHITE,
  },
  uploadPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  uploadPhotoText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  // ── Form Card ──
  formCard: {
    backgroundColor: color.WHITE,
    borderRadius: 20,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: color.BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  // ── Fields ──
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    ...globalStyles.f12Bold,
    color: color.TEXT_MAIN,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.BORDER_LIGHT,
    height: 52,
    paddingHorizontal: 14,
  },
  inputBoxFocused: {
    borderColor: color.GREEN,
    backgroundColor: color.WHITE,
  },
  inputBoxFilled: {
    borderColor: color.BORDER_LIGHT,
    backgroundColor: color.SURFACE_LOW,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...globalStyles.f12Regular,
    color: color.TEXT_MAIN,
    padding: 0,
  },

  // ── Row fields ──
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  rowFieldHalf: {
    flex: 1,
    gap: 8,
  },

  // ── Dropdown ──
  dropdownValue: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MAIN,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  dropdownSheet: {
    backgroundColor: color.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 4,
  },
  dropdownSheetTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MAIN,
    marginBottom: 12,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dropdownOptionActive:     { backgroundColor: color.GREEN_BG },
  dropdownOptionText:       { ...globalStyles.f14Regular, color: color.TEXT_MAIN },
  dropdownOptionTextActive: { ...globalStyles.f14Bold,    color: color.GREEN },

  // ── Bottom CTA ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color.SURFACE,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: color.BORDER_LIGHT,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.GREEN,
    borderRadius: 99,
    paddingVertical: 16,
  },
  saveBtnDisabled: {
    backgroundColor: color.AVATAR_BG,
  },
  saveBtnText: {
    ...globalStyles.f14Bold,
    color: color.WHITE,
  },
  stepIndicator: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
    textAlign: 'center',
  },
});