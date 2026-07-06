import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import VoiceTextInput from '../components/VoiceTextInput';
import LocationPicker, { EMPTY_LOCATION } from '../components/LocationPicker';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { showAlert } from '../services/alertService';

// ─── Constants
const TOTAL_STEPS = 3;

const GENDER_OPTIONS     = ['Male', 'Female', 'Other', 'Prefer not to say'];
const AVAILABILITY_OPTIONS = [
  'Available Now', 'Morning (6 AM – 12 PM)', 'Afternoon (12 PM – 6 PM)',
  'Evening (6 PM – 9 PM)', 'Full Day', 'Weekdays Only', 'Weekends Only',
];
const BANK_OPTIONS = [
  'State Bank of India', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Union Bank', 'IDBI Bank',
];

const DRIVER_CATEGORIES = [
  'Tractor Driver', 'Agricultural Equipment Operator', 'Transport Driver',
  'Farm Machinery Operator', 'Irrigation Specialist', 'Harvester Operator',
];
const GIG_CATEGORIES = [
  'Farm Laborer', 'Crop Harvesting', 'Spraying & Pesticides',
  'Transplanting', 'Land Preparation', 'Irrigation Work',
  'Post-Harvest Processing', 'Weeding',
];
const DRIVER_SKILLS = [
  'Tractor Operation', 'Harvester Operation', 'Rotavator', 'Power Tiller',
  'Sprayer Unit', 'Thresher', 'Trolley', 'Irrigation Pumps',
];
const GIG_SKILLS = [
  'Manual Harvesting', 'Transplanting', 'Weeding', 'Spraying',
  'Sorting & Grading', 'Packing', 'Land Preparation', 'Irrigation',
];
const VEHICLE_TYPES = [
  'Tractor', 'Mini Tractor', 'Harvester', 'Power Tiller',
  'Rotavator', 'Thresher', 'Sprayer Unit', 'Trolley',
];

const STEP_META = [
  { label: 'Personal',     icon: 'person-outline'  },
  { label: 'Professional', icon: 'briefcase-outline' },
  { label: 'Bank',         icon: 'business-outline' },
];


// ─── Step Indicator ───────────────────────────────────────────────────────────
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

// ─── Avatar Upload ────────────────────────────────────────────────────────────
function AvatarUpload({ uri, onPress }) {
  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onPress} activeOpacity={0.85}>
        {uri ? (
          <Image source={{ uri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarImagePlaceholder}>
            <Ionicons name="person" size={52} color={color.TEXT_MUTED} />
          </View>
        )}
        <View style={styles.avatarEditBadge}>
          <Ionicons name="camera" size={14} color={color.WHITE} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.uploadPhotoBtn}>
        <Ionicons name="cloud-upload-outline" size={15} color={color.GREEN} />
        <CustomText style={styles.uploadPhotoText}>{uri ? 'Change Photo' : 'Upload Photo'}</CustomText>
      </TouchableOpacity>
    </View>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
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

// ─── Chip Selector ────────────────────────────────────────────────────────────
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
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please allow access to your photo library to upload a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      onChange('photoUri', result.assets[0].uri);
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <View style={styles.titleBlock}>
        <CustomText style={styles.pageTitle}>Personal Information</CustomText>
        <CustomText style={styles.pageSubtitle}>
          Tell us about yourself so farmers can trust you with their work.
        </CustomText>
      </View>

      <AvatarUpload uri={data.photoUri} onPress={pickPhoto} />

      <View style={styles.formCard}>
        <VoiceTextInput
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
            <VoiceTextInput
              label="Age"
              value={data.age}
              onChangeText={(v) => onChange('age', v.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 28"
              icon="calendar-outline"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <VoiceTextInput
          label="Mobile Number"
          value={data.mobile}
          onChangeText={(v) => onChange('mobile', v)}
          placeholder="+91 XXXXX XXXXX"
          icon="call-outline"
          keyboardType="phone-pad"
          voiceEnabled={false}
        />
      </View>

      <View style={styles.formCard}>
        <CardSection title="Location" iconName="location-outline" />
        <LocationPicker
          value={data.location}
          onChange={(v) => onChange('location', v)}
        />
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Step 2 — Professional Details
// ═══════════════════════════════════════════════════════════════════════════════
function Step2({ data, onChange, isDriver }) {
  const categoryOptions = isDriver ? DRIVER_CATEGORIES : GIG_CATEGORIES;
  const skillOptions    = isDriver ? DRIVER_SKILLS     : GIG_SKILLS;

  const toggleSkill = (v) =>
    onChange('skills', data.skills.includes(v)
      ? data.skills.filter((x) => x !== v)
      : [...data.skills, v]);

  const toggleVehicle = (v) =>
    onChange('vehicleTypes', data.vehicleTypes.includes(v)
      ? data.vehicleTypes.filter((x) => x !== v)
      : [...data.vehicleTypes, v]);

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.stepContent}>
      <View style={styles.titleBlock}>
        <CustomText style={styles.pageTitle}>Professional Details</CustomText>
        <CustomText style={styles.pageSubtitle}>
          Share your work background so we can match you with the right opportunities.
        </CustomText>
      </View>

      <View style={styles.formCard}>
        <CardSection title="Work Profile" iconName="briefcase-outline" />

        <Dropdown
          label="Category"
          value={data.category}
          onSelect={(v) => onChange('category', v)}
          options={categoryOptions}
          placeholder="Select your work category"
          sheetTitle="Select Category"
          iconNode={<Ionicons name="grid-outline" size={18} color={data.category ? color.TEXT_MAIN : color.TEXT_MUTED} />}
        />

        <ChipSelector
          label={isDriver ? 'Equipment Skills' : 'Work Skills'}
          options={skillOptions}
          selected={data.skills}
          onToggle={toggleSkill}
          hint="Select all that apply"
          iconNode={<Ionicons name="construct-outline" size={16} color={color.GREEN} style={{ marginRight: 6 }} />}
        />

        <View style={styles.rowFields}>
          <View style={styles.rowFieldHalf}>
            <VoiceTextInput
              label="Experience (Years)"
              value={data.experienceYears}
              onChangeText={(v) => onChange('experienceYears', v.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 5"
              icon="time-outline"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.rowFieldHalf}>
            <View style={styles.fieldGroup}>
              <CustomText style={styles.fieldLabel}>Hourly Rate (₹)</CustomText>
              <View style={styles.inputBox}>
                <CustomText style={[styles.inputIcon, { color: color.GREEN, ...globalStyles.f14Bold }]}>₹</CustomText>
                <TextInput
                  style={styles.input}
                  value={data.hourlyRate}
                  onChangeText={(v) => onChange('hourlyRate', v.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 150"
                  placeholderTextColor={color.TEXT_MUTED}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <Dropdown
          label="Availability"
          value={data.availability}
          onSelect={(v) => onChange('availability', v)}
          options={AVAILABILITY_OPTIONS}
          placeholder="Select availability"
          sheetTitle="When are you available?"
          iconNode={<Ionicons name="calendar-outline" size={18} color={data.availability ? color.TEXT_MAIN : color.TEXT_MUTED} />}
        />
      </View>

      {isDriver && (
        <>
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

          <View style={styles.formCard}>
            <CardSection title="Primary Vehicle" iconName="car-outline" />

            <VoiceTextInput
              label="Vehicle Number"
              value={data.vehicleNumber}
              onChangeText={(v) => onChange('vehicleNumber', v.toUpperCase())}
              placeholder="e.g. AP 12 AB 3456"
              icon="car-outline"
            />

            <View style={styles.rowFields}>
              <View style={styles.rowFieldHalf}>
                <VoiceTextInput
                  label="Make / Brand"
                  value={data.vehicleMake}
                  onChangeText={(v) => onChange('vehicleMake', v)}
                  placeholder="e.g. Mahindra"
                  icon="build-outline"
                />
              </View>
              <View style={styles.rowFieldHalf}>
                <VoiceTextInput
                  label="Model / Year"
                  value={data.vehicleModel}
                  onChangeText={(v) => onChange('vehicleModel', v)}
                  placeholder="e.g. 575 / 2019"
                  icon="settings-outline"
                />
              </View>
            </View>
          </View>
        </>
      )}
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
        <VoiceTextInput
          label="Account Holder Name"
          value={data.holderName}
          onChangeText={(v) => onChange('holderName', v)}
          placeholder="As per bank records"
          icon="person-outline"
          hint="Speak your name as printed on your passbook"
        />

        <VoiceTextInput
          label="Account Number"
          value={data.accountNumber}
          onChangeText={(v) => onChange('accountNumber', v)}
          placeholder="Enter account number"
          icon="card-outline"
          keyboardType="number-pad"
          voiceEnabled={false}
        />

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
            {match    && <Ionicons name="checkmark-circle" size={18} color={color.GREEN} />}
            {mismatch && <Ionicons name="close-circle"     size={18} color="#c62828"    />}
          </View>
          {mismatch && (
            <View style={styles.inlineError}>
              <Ionicons name="alert-circle-outline" size={14} color="#c62828" />
              <CustomText style={styles.inlineErrorText}>Account numbers do not match</CustomText>
            </View>
          )}
        </View>

        <VoiceTextInput
          label="IFSC Code"
          value={data.ifsc}
          onChangeText={(v) => onChange('ifsc', v.toUpperCase())}
          placeholder="e.g. SBIN0001234"
          icon="code-outline"
          hint="11-character code on your chequebook or passbook"
          voiceEnabled={false}
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
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Screen
// ═══════════════════════════════════════════════════════════════════════════════
export default function PersonalInfoScreen({ navigation }) {
  const { user, userRole } = useAuth();
  const isDriver = userRole === 'driver';

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting]   = useState(false);

  const [step1, setStep1] = useState({
    photoUri: null, fullName: '', gender: '', age: '', mobile: '',
    location: EMPTY_LOCATION,
  });

  // Pre-fill mobile from the user stored in AsyncStorage during login
  useEffect(() => {
    AsyncStorage.getItem('user').then((raw) => {
      if (!raw) return;
      const stored = JSON.parse(raw);
      const mobile = stored?.mobileNumber ?? stored?.mobile ?? stored?.phone ?? '';
      if (mobile) setStep1((p) => ({ ...p, mobile: String(mobile) }));
    }).catch(() => {});
  }, []);
  const [step2, setStep2] = useState({
    category: '', skills: [], experienceYears: '', hourlyRate: '',
    availability: '', vehicleTypes: [], vehicleNumber: '',
    vehicleMake: '', vehicleModel: '',
  });
  const [step3, setStep3] = useState({
    holderName: '', accountNumber: '', confirmAccount: '', ifsc: '', bankName: '',
  });

  const ch1 = (k, v) => setStep1((p) => ({ ...p, [k]: v }));
  const ch2 = (k, v) => setStep2((p) => ({ ...p, [k]: v }));
  const ch3 = (k, v) => setStep3((p) => ({ ...p, [k]: v }));

  const canProceed =
    currentStep === 1
      ? step1.fullName.trim().length > 0 &&
        step1.mobile.trim().length >= 10 &&
        !!step1.location.stateId &&
        !!step1.location.districtId
      : currentStep === 2
      ? step2.category.length > 0 &&
        step2.skills.length > 0 &&
        step2.experienceYears.trim().length > 0 &&
        step2.hourlyRate.trim().length > 0 &&
        step2.availability.length > 0
      : step3.holderName.trim().length > 0 &&
        step3.accountNumber.trim().length > 0 &&
        step3.accountNumber === step3.confirmAccount &&
        step3.ifsc.trim().length >= 11 &&
        step3.bankName.length > 0;

  const submitProfile = async () => {
    try {
      setSubmitting(true);

      const formData = new FormData();
      const raw = await AsyncStorage.getItem('user');
      const stored = raw ? JSON.parse(raw) : {};
      const userId = stored?.userId ?? stored?.id ?? 0;

      formData.append('UserId', userId);
      formData.append('Name',            step1.fullName.trim());
      formData.append('Gender',          step1.gender);
      formData.append('Age',             parseInt(step1.age) || 0);
      formData.append('MobileNumber',    step1.mobile.trim());
      formData.append('Role',            userRole ?? '');
      formData.append('Category',        step2.category);
      formData.append('Skills',          step2.skills.join(', '));
      formData.append('ExperienceYears', parseInt(step2.experienceYears) || 0);
      formData.append('HourlyRate',      parseFloat(step2.hourlyRate) || 0);
      formData.append('Availability',    step2.availability);
      formData.append('Location',        step1.location.villageName || step1.location.mandalName || '');
      formData.append('Pincode',         step1.location.pincode || '');
      formData.append('State',           step1.location.stateName || '');
      formData.append('District',        step1.location.districtName || '');
      formData.append('Mandal',          step1.location.mandalName || '');
      formData.append('Village',         step1.location.villageName || '');

      if (step1.photoUri) {
        formData.append('ProfileImageUrl', {
          uri:  step1.photoUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      await apiClient.post('Profile/gig-driver-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showAlert('Profile Saved', 'Your profile has been updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.response?.data ?? 'Something went wrong. Please try again.';
      showAlert('Error', typeof msg === 'string' ? msg : 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
      submitProfile();
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
        {currentStep === 2 && <Step2 data={step2} onChange={ch2} isDriver={isDriver} />}
        {currentStep === 3 && <Step3 data={step3} onChange={ch3} />}
        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, (!canProceed || submitting) && styles.saveBtnDisabled]}
          onPress={handleNext}
          activeOpacity={canProceed && !submitting ? 0.85 : 1}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={color.WHITE} />
          ) : (
            <>
              <CustomText style={styles.saveBtnText}>
                {currentStep === TOTAL_STEPS ? 'Submit' : 'Save & Continue'}
              </CustomText>
              <Ionicons
                name={currentStep === TOTAL_STEPS ? 'checkmark' : 'arrow-forward'}
                size={20}
                color={color.WHITE}
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
        <CustomText style={styles.stepCounter}>Step {currentStep} of {TOTAL_STEPS}</CustomText>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.SURFACE },

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

  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  stepContent:   { gap: 20 },

  titleBlock:   { gap: 6 },
  pageTitle:    { ...globalStyles.f16Bold,    color: color.TEXT_MAIN, lineHeight: 28 },
  pageSubtitle: { ...globalStyles.f12Regular, color: color.TEXT_SUB,  lineHeight: 20 },

  avatarSection:          { alignItems: 'center', gap: 10 },
  avatarContainer:        { position: 'relative' },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: color.BORDER_LIGHT,
  },
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

  formCard: {
    backgroundColor: color.WHITE,
    borderRadius: 20, padding: 20, gap: 20,
    borderWidth: 1, borderColor: color.BORDER_LIGHT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },

  cardSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: -4 },
  cardSectionIconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center', alignItems: 'center',
  },
  cardSectionTitle: { ...globalStyles.f12Bold, color: color.GREEN },

  fieldGroup:  { gap: 8 },
  fieldLabel:  { ...globalStyles.f12Bold, color: color.TEXT_MAIN },
  fieldHint:   { ...globalStyles.f10Regular, color: color.TEXT_MUTED, lineHeight: 16 },
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

  inlineError:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -2 },
  inlineErrorText: { ...globalStyles.f10Regular, color: '#c62828' },

  rowFields:    { flexDirection: 'row', gap: 12 },
  rowFieldHalf: { flex: 1 },

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

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: color.GREEN_BG, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: color.BORDER_GREEN,
  },
  infoBannerText: { ...globalStyles.f12Regular, color: color.GREEN_DARK, flex: 1, lineHeight: 18 },

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
