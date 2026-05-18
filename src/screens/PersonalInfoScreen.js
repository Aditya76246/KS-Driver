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
import InnerScreenHeader from '../components/InnerScreenHeader';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 3;

const GENDER_OPTIONS     = ['Male', 'Female', 'Other', 'Prefer not to say'];
const LICENSE_TYPES      = ['LMV (Light Motor Vehicle)', 'HMV (Heavy Motor Vehicle)', 'Transport Vehicle', 'Tractor License', 'Commercial Vehicle'];
const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'];
const VEHICLE_TYPES      = ['Tractor', 'Mini Tractor', 'Harvester', 'Power Tiller', 'Rotavator', 'Thresher', 'Sprayer Unit', 'Trolley'];
const BANK_OPTIONS       = [
  'State Bank of India', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Union Bank', 'IDBI Bank',
];

const STEP_META = [
  { label: 'Personal', icon: 'person-outline'     },
  { label: 'Driving',  icon: 'car-outline'         },
  { label: 'Bank',     icon: 'business-outline'    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Shared Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function StepIndicator({ current }) {
  return (
    <View style={styles.stepIndicatorRow}>
      {STEP_META.map((s, i) => {
        const isDone   = i < current - 1;
        const isActive = i === current - 1;
        return (
          <React.Fragment key={i}>
            <View style={styles.stepNode}>
              <View style={[styles.stepCircle, isDone && styles.stepCircleDone, isActive && styles.stepCircleActive]}>
                {isDone
                  ? <Ionicons name="checkmark" size={15} color={color.WHITE} />
                  : <Ionicons name={s.icon} size={15} color={isActive ? color.WHITE : color.TEXT_MUTED} />
                }
              </View>
              <CustomText style={[styles.stepNodeLabel, (isDone || isActive) && styles.stepNodeLabelActive]}>
                {s.label}
              </CustomText>
            </View>
            {i < TOTAL_STEPS - 1 && (
              <View style={styles.stepConnector}>
                <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function AvatarUpload({ uri, onPress }) {
  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.avatarImagePlaceholder}>
          <Ionicons name="person" size={52} color={uri ? color.GREEN : color.TEXT_MUTED} />
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

function InputField({ label, value, onChangeText, placeholder, icon, keyboardType = 'default', hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      {label ? <CustomText style={styles.fieldLabel}>{label}</CustomText> : null}
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        {icon && (
          <Ionicons name={icon} size={18} color={focused ? color.GREEN : color.TEXT_MUTED} style={styles.inputIcon} />
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
      {hint ? <CustomText style={styles.fieldHint}>{hint}</CustomText> : null}
    </View>
  );
}

function Dropdown({ label, value, onSelect, options, placeholder, sheetTitle, iconNode, hint }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      {label ? <CustomText style={styles.fieldLabel}>{label}</CustomText> : null}
      <TouchableOpacity
        style={[styles.inputBox, open && styles.inputBoxFocused]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        {iconNode && <View style={styles.inputIcon}>{iconNode}</View>}
        <CustomText style={[styles.dropdownValue, !value && { color: color.TEXT_MUTED }]}>
          {value || placeholder || 'Select'}
        </CustomText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={color.TEXT_MUTED} />
      </TouchableOpacity>
      {hint ? <CustomText style={styles.fieldHint}>{hint}</CustomText> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdownSheet}>
            <View style={styles.sheetHandle} />
            <CustomText style={styles.dropdownSheetTitle}>{sheetTitle || placeholder}</CustomText>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.dropdownOption, value === opt && styles.dropdownOptionActive]}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <CustomText style={[styles.dropdownOptionText, value === opt && styles.dropdownOptionTextActive]}>
                    {opt}
                  </CustomText>
                  {value === opt && <Ionicons name="checkmark-circle" size={18} color={color.GREEN} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function ChipSelector({ label, options, selected, onToggle, iconNode, hint }) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.chipLabelRow}>
        {iconNode}
        <CustomText style={styles.fieldLabel}>{label}</CustomText>
      </View>
      {hint ? <CustomText style={[styles.fieldHint, { marginTop: -4 }]}>{hint}</CustomText> : null}
      <View style={styles.chipsWrap}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(opt)}
              activeOpacity={0.75}
            >
              {active && <Ionicons name="checkmark" size={12} color={color.GREEN} style={{ marginRight: 4 }} />}
              <CustomText style={[styles.chipText, active && styles.chipTextActive]}>{opt}</CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function InfoBanner({ text }) {
  return (
    <View style={styles.infoBanner}>
      <Ionicons name="shield-checkmark-outline" size={18} color={color.GREEN} />
      <CustomText style={styles.infoBannerText}>{text}</CustomText>
    </View>
  );
}

// ─── Section Header inside a card ────────────────────────────────────────────
function CardSection({ title, iconName }) {
  return (
    <View style={styles.cardSectionHeader}>
      <View style={styles.cardSectionIconBox}>
        <Ionicons name={iconName} size={16} color={color.GREEN} />
      </View>
      <CustomText style={styles.cardSectionTitle}>{title}</CustomText>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Step 1 — Personal Information
// ═══════════════════════════════════════════════════════════════════════════════
function Step1({ data, onChange }) {
  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <View style={styles.titleBlock}>
        <CustomText style={styles.pageTitle}>Personal Information</CustomText>
        <CustomText style={styles.pageSubtitle}>
          Tell us about yourself so farmers can trust you with their work.
        </CustomText>
      </View>

      <AvatarUpload uri={data.photoUri} onPress={() => {}} />

      <View style={styles.formCard}>
        <InputField
          label="Full Name"
          value={data.fullName}
          onChangeText={(v) => onChange('fullName', v)}
          placeholder="Enter your full name"
          icon="person-outline"
        />

        <View style={styles.rowFields}>
          <View style={styles.rowFieldHalf}>
            <Dropdown
              label="Gender"
              value={data.gender}
              onSelect={(v) => onChange('gender', v)}
              options={GENDER_OPTIONS}
              placeholder="Select"
              sheetTitle="Select Gender"
              iconNode={<MaterialCommunityIcons name="gender-male-female" size={18} color={data.gender ? color.TEXT_MAIN : color.TEXT_MUTED} />}
            />
          </View>
          <View style={styles.rowFieldHalf}>
            <InputField
              label="Age"
              value={data.age}
              onChangeText={(v) => onChange('age', v)}
              placeholder="e.g. 28"
              icon="calendar-outline"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <InputField
          label="Mobile Number"
          value={data.mobile}
          onChangeText={(v) => onChange('mobile', v)}
          placeholder="+91 XXXXX XXXXX"
          icon="call-outline"
          keyboardType="phone-pad"
        />

        <InputField
          label="Address (Village / District)"
          value={data.address}
          onChangeText={(v) => onChange('address', v)}
          placeholder="e.g. Mapusa, North Goa"
          icon="location-outline"
        />
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Step 2 — Driving Details
// ═══════════════════════════════════════════════════════════════════════════════
function Step2({ data, onChange }) {
  const toggleVehicle = (v) =>
    onChange('vehicleTypes', data.vehicleTypes.includes(v)
      ? data.vehicleTypes.filter((x) => x !== v)
      : [...data.vehicleTypes, v]);

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <View style={styles.titleBlock}>
        <CustomText style={styles.pageTitle}>Driving Details</CustomText>
        <CustomText style={styles.pageSubtitle}>
          Share your driving background so we can match you with the right jobs.
        </CustomText>
      </View>

      {/* License card */}
      <View style={styles.formCard}>
        <CardSection title="License Information" iconName="ribbon-outline" />

        <InputField
          label="Driving License Number"
          value={data.licenseNumber}
          onChangeText={(v) => onChange('licenseNumber', v.toUpperCase())}
          placeholder="e.g. MH1234567890123"
          icon="card-outline"
          hint="Enter as printed on your license"
        />

        <Dropdown
          label="License Type"
          value={data.licenseType}
          onSelect={(v) => onChange('licenseType', v)}
          options={LICENSE_TYPES}
          placeholder="Select license type"
          sheetTitle="Select License Type"
          iconNode={<Ionicons name="document-text-outline" size={18} color={data.licenseType ? color.TEXT_MAIN : color.TEXT_MUTED} />}
        />

        <View style={styles.rowFields}>
          <View style={styles.rowFieldHalf}>
            <InputField
              label="Issue Date"
              value={data.licenseIssueDate}
              onChangeText={(v) => onChange('licenseIssueDate', v)}
              placeholder="DD/MM/YYYY"
              icon="calendar-outline"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={styles.rowFieldHalf}>
            <InputField
              label="Expiry Date"
              value={data.licenseExpiry}
              onChangeText={(v) => onChange('licenseExpiry', v)}
              placeholder="DD/MM/YYYY"
              icon="calendar-outline"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        <Dropdown
          label="Driving Experience"
          value={data.experience}
          onSelect={(v) => onChange('experience', v)}
          options={EXPERIENCE_OPTIONS}
          placeholder="Select experience"
          sheetTitle="Years of Driving Experience"
          iconNode={<MaterialCommunityIcons name="calendar-star" size={18} color={data.experience ? color.TEXT_MAIN : color.TEXT_MUTED} />}
        />
      </View>

      {/* Vehicles owned card */}
      <View style={styles.formCard}>
        <CardSection title="Vehicles Owned" iconName="construct-outline" />
        <ChipSelector
          label="Select the equipment you own"
          options={VEHICLE_TYPES}
          selected={data.vehicleTypes}
          onToggle={toggleVehicle}
          hint="Select all that apply"
          iconNode={<MaterialCommunityIcons name="tractor" size={16} color={color.GREEN} style={{ marginRight: 6 }} />}
        />
      </View>

      {/* Vehicle registration */}
      <View style={styles.formCard}>
        <CardSection title="Vehicle Registration" iconName="car-outline" />

        <InputField
          label="Primary Vehicle Number"
          value={data.vehicleNumber}
          onChangeText={(v) => onChange('vehicleNumber', v.toUpperCase())}
          placeholder="e.g. MH 12 AB 3456"
          icon="car-outline"
        />

        <View style={styles.rowFields}>
          <View style={styles.rowFieldHalf}>
            <InputField
              label="Make / Brand"
              value={data.vehicleMake}
              onChangeText={(v) => onChange('vehicleMake', v)}
              placeholder="e.g. Mahindra"
              icon="build-outline"
            />
          </View>
          <View style={styles.rowFieldHalf}>
            <InputField
              label="Model / Year"
              value={data.vehicleModel}
              onChangeText={(v) => onChange('vehicleModel', v)}
              placeholder="e.g. 575 / 2019"
              icon="settings-outline"
            />
          </View>
        </View>

        <InputField
          label="Number of Vehicles Owned"
          value={data.vehicleCount}
          onChangeText={(v) => onChange('vehicleCount', v)}
          placeholder="e.g. 2"
          icon="layers-outline"
          keyboardType="number-pad"
        />
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Step 3 — Bank Details
// ═══════════════════════════════════════════════════════════════════════════════
function Step3({ data, onChange }) {
  const mismatch =
    data.accountNumber.length > 0 &&
    data.confirmAccount.length > 0 &&
    data.accountNumber !== data.confirmAccount;
  const match =
    data.accountNumber.length > 0 &&
    data.confirmAccount.length > 0 &&
    data.accountNumber === data.confirmAccount;

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <View style={styles.titleBlock}>
        <CustomText style={styles.pageTitle}>Bank Details</CustomText>
        <CustomText style={styles.pageSubtitle}>
          Your earnings will be deposited directly after each job is completed.
        </CustomText>
      </View>

      <InfoBanner text="Your bank details are encrypted and stored securely. We never share them with third parties." />

      <View style={styles.formCard}>
        <InputField
          label="Account Holder Name"
          value={data.holderName}
          onChangeText={(v) => onChange('holderName', v)}
          placeholder="As per bank records"
          icon="person-outline"
        />

        <InputField
          label="Account Number"
          value={data.accountNumber}
          onChangeText={(v) => onChange('accountNumber', v)}
          placeholder="Enter account number"
          icon="card-outline"
          keyboardType="number-pad"
        />

        {/* Confirm account with match/error feedback */}
        <View style={styles.fieldGroup}>
          <CustomText style={styles.fieldLabel}>Confirm Account Number</CustomText>
          <View style={[styles.inputBox, mismatch && styles.inputBoxError, match && styles.inputBoxMatch]}>
            <Ionicons
              name="card-outline"
              size={18}
              color={mismatch ? '#c62828' : match ? color.GREEN : color.TEXT_MUTED}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={data.confirmAccount}
              onChangeText={(v) => onChange('confirmAccount', v)}
              placeholder="Re-enter account number"
              placeholderTextColor={color.TEXT_MUTED}
              keyboardType="number-pad"
            />
            {match   && <Ionicons name="checkmark-circle" size={18} color={color.GREEN} />}
            {mismatch && <Ionicons name="close-circle" size={18} color="#c62828" />}
          </View>
          {mismatch && (
            <View style={styles.inlineError}>
              <Ionicons name="alert-circle-outline" size={14} color="#c62828" />
              <CustomText style={styles.inlineErrorText}>Account numbers do not match</CustomText>
            </View>
          )}
        </View>

        <InputField
          label="IFSC Code"
          value={data.ifsc}
          onChangeText={(v) => onChange('ifsc', v.toUpperCase())}
          placeholder="e.g. SBIN0001234"
          icon="code-outline"
          hint="11-character code on your chequebook or passbook"
        />

        <Dropdown
          label="Bank Name"
          value={data.bankName}
          onSelect={(v) => onChange('bankName', v)}
          options={BANK_OPTIONS}
          placeholder="Select bank"
          sheetTitle="Select Your Bank"
          iconNode={<Ionicons name="business-outline" size={18} color={data.bankName ? color.TEXT_MAIN : color.TEXT_MUTED} />}
        />
      </View>

      {/* UPI alternative */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <CustomText style={styles.dividerText}>or link UPI instead</CustomText>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.upiBtn} activeOpacity={0.8}>
        <View style={styles.upiIconBox}>
          <MaterialCommunityIcons name="cellphone" size={20} color={color.GREEN} />
        </View>
        <View style={{ flex: 1 }}>
          <CustomText style={styles.upiBtnTitle}>Link UPI ID</CustomText>
          <CustomText style={styles.upiBtnSub}>Instant payouts via PhonePe / GPay / Paytm</CustomText>
        </View>
        <Ionicons name="chevron-forward" size={16} color={color.TEXT_MUTED} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Screen
// ═══════════════════════════════════════════════════════════════════════════════
export default function PersonalInfoScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);

  const [step1, setStep1] = useState({
    photoUri: null, fullName: '', gender: '', age: '', mobile: '', address: '',
  });

  const [step2, setStep2] = useState({
    licenseNumber: '', licenseType: '', licenseIssueDate: '', licenseExpiry: '',
    experience: '', vehicleTypes: [], vehicleNumber: '', vehicleMake: '',
    vehicleModel: '', vehicleCount: '',
  });

  const [step3, setStep3] = useState({
    holderName: '', accountNumber: '', confirmAccount: '', ifsc: '', bankName: '',
  });

  const ch1 = (k, v) => setStep1((p) => ({ ...p, [k]: v }));
  const ch2 = (k, v) => setStep2((p) => ({ ...p, [k]: v }));
  const ch3 = (k, v) => setStep3((p) => ({ ...p, [k]: v }));

  const canProceed =
    currentStep === 1
      ? step1.fullName.trim().length > 0 && step1.mobile.trim().length > 0
      : currentStep === 2
      ? step2.licenseNumber.trim().length > 0 && step2.licenseType.length > 0 && step2.vehicleTypes.length > 0
      : step3.holderName.trim().length > 0 &&
        step3.accountNumber.trim().length > 0 &&
        step3.accountNumber === step3.confirmAccount &&
        step3.ifsc.trim().length >= 11;

  const handleNext = () => {
    if (!canProceed) return;
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
    else {
      // Done — navigate.navigate('ProfileMain') etc.
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    else navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      <InnerScreenHeader
        navigation={{ goBack: handleBack }}
        title={STEP_META[currentStep - 1].label + ' Details'}
      />

      <View style={styles.stepIndicatorWrapper}>
        <StepIndicator current={currentStep} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 && <Step1 data={step1} onChange={ch1} />}
        {currentStep === 2 && <Step2 data={step2} onChange={ch2} />}
        {currentStep === 3 && <Step3 data={step3} onChange={ch3} />}
        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, !canProceed && styles.saveBtnDisabled]}
          onPress={handleNext}
          activeOpacity={canProceed ? 0.85 : 1}
        >
          <CustomText style={styles.saveBtnText}>
            {currentStep === TOTAL_STEPS ? 'Submit' : 'Save & Continue'}
          </CustomText>
          <Ionicons
            name={currentStep === TOTAL_STEPS ? 'checkmark' : 'arrow-forward'}
            size={20}
            color={color.WHITE}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
        <CustomText style={styles.stepCounter}>Step {currentStep} of {TOTAL_STEPS}</CustomText>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.SURFACE },

  // ── Step Indicator ──────────────────────────────────────────────────────────
  stepIndicatorWrapper: { paddingHorizontal: 24, paddingBottom: 16 },
  stepIndicatorRow:     { flexDirection: 'row', alignItems: 'flex-start' },
  stepNode:             { alignItems: 'center', gap: 6, width: 72 },
  stepCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: color.AVATAR_BG,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: color.BORDER_LIGHT,
  },
  stepCircleActive: { backgroundColor: color.GREEN, borderColor: color.GREEN },
  stepCircleDone:   { backgroundColor: color.GREEN, borderColor: color.GREEN },
  stepNodeLabel:        { ...globalStyles.f10Regular, color: color.TEXT_MUTED, textAlign: 'center' },
  stepNodeLabelActive:  { ...globalStyles.f10Bold,    color: color.GREEN },
  stepConnector:        { flex: 1, paddingTop: 18, paddingHorizontal: 2 },
  stepLine:             { height: 2, borderRadius: 99, backgroundColor: color.BORDER_LIGHT },
  stepLineDone:         { backgroundColor: color.GREEN },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  stepContent:   { gap: 20 },

  // ── Title ───────────────────────────────────────────────────────────────────
  titleBlock:   { gap: 6 },
  pageTitle:    { ...globalStyles.f16Bold,    color: color.TEXT_MAIN, lineHeight: 28 },
  pageSubtitle: { ...globalStyles.f12Regular, color: color.TEXT_SUB,  lineHeight: 20 },

  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatarSection:          { alignItems: 'center', gap: 10 },
  avatarContainer:        { position: 'relative' },
  avatarImagePlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: color.SURFACE_LOW,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: color.BORDER_LIGHT,
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: color.GREEN,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: color.WHITE,
  },
  uploadPhotoBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  uploadPhotoText: { ...globalStyles.f12Bold, color: color.GREEN },

  // ── Form Card ───────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: color.WHITE,
    borderRadius: 20, padding: 20, gap: 20,
    borderWidth: 1, borderColor: color.BORDER_LIGHT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },

  // ── Card Section Header ──────────────────────────────────────────────────────
  cardSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: -4 },
  cardSectionIconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center', alignItems: 'center',
  },
  cardSectionTitle: { ...globalStyles.f12Bold, color: color.GREEN },

  // ── Fields ──────────────────────────────────────────────────────────────────
  fieldGroup:      { gap: 8 },
  fieldLabel:      { ...globalStyles.f12Bold, color: color.TEXT_MAIN },
  fieldHint:       { ...globalStyles.f10Regular, color: color.TEXT_MUTED, lineHeight: 16 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 12, borderWidth: 1.5, borderColor: color.BORDER_LIGHT,
    height: 52, paddingHorizontal: 14,
  },
  inputBoxFocused: { borderColor: color.GREEN,  backgroundColor: color.WHITE   },
  inputBoxError:   { borderColor: '#ef9a9a',    backgroundColor: '#fff8f8'     },
  inputBoxMatch:   { borderColor: color.GREEN,  backgroundColor: '#f6ffed'     },
  inputIcon:       { marginRight: 10 },
  input:           { flex: 1, ...globalStyles.f12Regular, color: color.TEXT_MAIN, padding: 0 },
  dropdownValue:   { ...globalStyles.f12Regular, color: color.TEXT_MAIN, flex: 1 },

  // ── Inline error ────────────────────────────────────────────────────────────
  inlineError:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -2 },
  inlineErrorText: { ...globalStyles.f10Regular, color: '#c62828' },

  // ── Row fields ──────────────────────────────────────────────────────────────
  rowFields:    { flexDirection: 'row', gap: 12 },
  rowFieldHalf: { flex: 1 },

  // ── Chips ───────────────────────────────────────────────────────────────────
  chipLabelRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: -2 },
  chipsWrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 30, borderWidth: 1.5,
    borderColor: color.BORDER_LIGHT, backgroundColor: color.SURFACE_LOW,
  },
  chipActive:     { backgroundColor: color.GREEN_BG, borderColor: color.GREEN },
  chipText:       { ...globalStyles.f12Regular, color: color.TEXT_SUB  },
  chipTextActive: { ...globalStyles.f12Bold,    color: color.GREEN     },

  // ── Dropdown modal ──────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  dropdownSheet: {
    backgroundColor: color.WHITE,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 4,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 99,
    backgroundColor: color.BORDER_LIGHT, alignSelf: 'center', marginBottom: 12,
  },
  dropdownSheetTitle:       { ...globalStyles.f14Bold,    color: color.TEXT_MAIN, marginBottom: 8 },
  dropdownOption:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
  dropdownOptionActive:     { backgroundColor: color.GREEN_BG },
  dropdownOptionText:       { ...globalStyles.f14Regular, color: color.TEXT_MAIN },
  dropdownOptionTextActive: { ...globalStyles.f14Bold,    color: color.GREEN     },

  // ── Info Banner ─────────────────────────────────────────────────────────────
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: color.GREEN_BG, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: color.BORDER_GREEN,
  },
  infoBannerText: { ...globalStyles.f12Regular, color: color.GREEN_DARK, flex: 1, lineHeight: 18 },

  // ── Divider row (UPI) ────────────────────────────────────────────────────────
  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: color.BORDER_LIGHT },
  dividerText: { ...globalStyles.f12Regular, color: color.TEXT_MUTED },

  // ── UPI button ──────────────────────────────────────────────────────────────
  upiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: color.WHITE, borderRadius: 16,
    borderWidth: 1.5, borderColor: color.BORDER_GREEN,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  upiIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center', alignItems: 'center',
  },
  upiBtnTitle: { ...globalStyles.f14Bold,    color: color.GREEN       },
  upiBtnSub:   { ...globalStyles.f10Regular, color: color.TEXT_MUTED, marginTop: 2 },

  // ── Bottom bar ──────────────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: color.SURFACE,
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 8, borderTopWidth: 1, borderTopColor: color.BORDER_LIGHT,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.GREEN, borderRadius: 99, paddingVertical: 16,
  },
  saveBtnDisabled: { backgroundColor: color.AVATAR_BG },
  saveBtnText:     { ...globalStyles.f14Bold,    color: color.WHITE       },
  stepCounter:     { ...globalStyles.f12Regular, color: color.TEXT_MUTED, textAlign: 'center' },
});