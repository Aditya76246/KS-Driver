import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { showAlert } from '../services/alertService';

// Image paths from the API are relative to the server root (e.g. "Documents/Aadhaar/xxx.jpg")
// BASE_URL is like "https://api.kisansahakar.in/api/" — strip /api/ to get the root
const IMAGE_ROOT = BASE_URL.replace(/\/api\/?$/, '/');
const getImageUrl = (path) => (path ? IMAGE_ROOT + path : null);

// ─── Document config ──────────────────────────────────────────────────────────
const getDocuments = (isDriver) => [
  {
    id: 'aadhaar',
    title: 'Aadhaar Card',
    subtitle: 'Upload front and back side clearly',
    iconName: 'finger-print-outline',
    required: true,
    sides: [
      { label: 'Front Side', apiKey: 'AadhaarFrontImage' },
      { label: 'Back Side',  apiKey: 'AadhaarBackImage'  },
    ],
    tips: 'All 12 digits must be visible',
  },
  {
    id: 'license',
    title: 'Driving License',
    subtitle: isDriver
      ? 'Valid commercial, tractor or transport license'
      : 'Upload if available (optional for gig workers)',
    iconName: 'car-outline',
    required: isDriver,
    sides: [
      { label: 'Front Side', apiKey: 'DrivingLicenseFrontImage' },
      { label: 'Back Side',  apiKey: 'DrivingLicenseBackImage'  },
    ],
    tips: 'License must be currently valid',
  },
  {
    id: 'insurance',
    title: 'Vehicle Insurance',
    subtitle: isDriver
      ? 'Active insurance policy for your primary vehicle'
      : 'Upload if available (optional for gig workers)',
    iconName: 'shield-checkmark-outline',
    required: isDriver,
    sides: [
      { label: 'Policy Document', apiKey: 'VehicleInsuranceImage' },
    ],
    tips: 'Policy must not be expired',
  },
];

// ─── Pick image helper ────────────────────────────────────────────────────────
async function pickImage(source) {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Camera access is needed to take a photo.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) return result.assets[0];
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Photo library access is needed to select a document.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) return result.assets[0];
  }
  return null;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Upload Slot ──────────────────────────────────────────────────────────────
function UploadSlot({ label, file, onCamera, onGallery, onRemove }) {
  return (
    <View style={styles.slotWrapper}>
      <CustomText style={styles.slotLabel}>{label}</CustomText>
      {file ? (
        <View style={styles.slotUploaded}>
          <View style={styles.slotUploadedLeft}>
            <View style={styles.slotFileIcon}>
              <Ionicons
                name={file.isRemote ? 'cloud-done-outline' : 'image-outline'}
                size={20}
                color={color.GREEN}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomText style={styles.slotFileName} numberOfLines={1}>
                {file.fileName || 'document.jpg'}
              </CustomText>
              <CustomText style={styles.slotFileSize}>
                {file.isRemote ? 'Already uploaded' : formatSize(file.fileSize)}
              </CustomText>
            </View>
          </View>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={20} color={color.TEXT_MUTED} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.slotEmpty}>
          <TouchableOpacity style={styles.slotBtn} onPress={onCamera} activeOpacity={0.75}>
            <Ionicons name="camera-outline" size={22} color={color.TEXT_SUB} />
            <CustomText style={styles.slotBtnText}>Camera</CustomText>
          </TouchableOpacity>
          <View style={styles.slotDivider} />
          <TouchableOpacity style={styles.slotBtn} onPress={onGallery} activeOpacity={0.75}>
            <Ionicons name="images-outline" size={22} color={color.TEXT_SUB} />
            <CustomText style={styles.slotBtnText}>Gallery</CustomText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────
function DocCard({ doc, uploads, onUpload, onRemove, delay }) {
  const uploadedCount = doc.sides.filter((s) => uploads[s.apiKey]).length;
  const allUploaded   = uploadedCount === doc.sides.length;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(380)} style={styles.docCard}>
      <View style={styles.docCardHeader}>
        <View style={styles.docIconBox}>
          <Ionicons name={doc.iconName} size={24} color={color.GREEN} />
        </View>

        <View style={styles.docCardInfo}>
          <View style={styles.docCardTitleRow}>
            <CustomText style={styles.docCardTitle}>{doc.title}</CustomText>
            <View style={[styles.badge, doc.required ? styles.badgeRequired : styles.badgeOptional]}>
              <CustomText style={[styles.badgeText, doc.required ? styles.badgeTextRequired : styles.badgeTextOptional]}>
                {doc.required ? 'Required' : 'Optional'}
              </CustomText>
            </View>
          </View>
          <CustomText style={styles.docCardSubtitle}>{doc.subtitle}</CustomText>
        </View>

        {allUploaded ? (
          <View style={styles.statusDone}>
            <Ionicons name="checkmark" size={14} color={color.WHITE} />
          </View>
        ) : uploadedCount > 0 ? (
          <View style={styles.statusPartial}>
            <CustomText style={styles.statusPartialText}>{uploadedCount}/{doc.sides.length}</CustomText>
          </View>
        ) : null}
      </View>

      <View style={styles.tipRow}>
        <Ionicons name="information-circle-outline" size={14} color={color.TEXT_MUTED} />
        <CustomText style={styles.tipText}>{doc.tips}</CustomText>
      </View>

      <View style={styles.slotsContainer}>
        {doc.sides.map((side) => (
          <UploadSlot
            key={side.apiKey}
            label={side.label}
            file={uploads[side.apiKey] || null}
            onCamera={async () => {
              const asset = await pickImage('camera');
              if (asset) onUpload(side.apiKey, asset);
            }}
            onGallery={async () => {
              const asset = await pickImage('gallery');
              if (asset) onUpload(side.apiKey, asset);
            }}
            onRemove={() => onRemove(side.apiKey)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Progress Summary ─────────────────────────────────────────────────────────
function UploadProgress({ uploads, documents }) {
  const requiredSlots = documents
    .filter((d) => d.required)
    .flatMap((d) => d.sides.map((s) => s.apiKey));
  const totalSlots    = documents.flatMap((d) => d.sides.map((s) => s.apiKey));
  const uploadedCount = Object.keys(uploads).length;
  const requiredDone  = requiredSlots.filter((k) => uploads[k]).length;
  const pct           = totalSlots.length ? Math.round((uploadedCount / totalSlots.length) * 100) : 0;
  const allRequiredDone = requiredDone === requiredSlots.length;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressTopRow}>
        <View style={styles.progressTextCol}>
          <CustomText style={styles.progressTitle}>
            {allRequiredDone ? 'Required documents uploaded!' : 'Upload Progress'}
          </CustomText>
          <CustomText style={styles.progressSub}>
            {uploadedCount} of {totalSlots.length} files uploaded
          </CustomText>
        </View>
        <CustomText style={[styles.progressPct, allRequiredDone && styles.progressPctDone]}>
          {pct}%
        </CustomText>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }, allRequiredDone && styles.progressFillDone]} />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DocumentsScreen({ navigation }) {
  const { user, userRole } = useAuth();
  const isDriver  = userRole === 'driver';
  const DOCUMENTS = getDocuments(isDriver);

  // uploads: { AadhaarFrontImage: asset, ... }
  // asset shape: ImagePicker asset (local) OR { uri, fileName, fileSize: null, isRemote: true }
  const [uploads, setUploads]       = useState({});
  const [submitting, setSubmitting]  = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const handleUpload = (key, asset) => setUploads((p) => ({ ...p, [key]: asset }));
  const handleRemove = (key) => setUploads((p) => { const n = { ...p }; delete n[key]; return n; });

  // Load already-uploaded documents from the server on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        const stored = raw ? JSON.parse(raw) : {};
        const userId = stored?.userId ?? stored?.id;
        console.log('DocumentsScreen: userId from AsyncStorage:', userId);
        if (!userId) return;

        const { data } = await apiClient.get(`GigAndDriverDocuments/view-documents/${userId}`);
        const ALL_KEYS = [
          'AadhaarFrontImage', 'AadhaarBackImage',
          'DrivingLicenseFrontImage', 'DrivingLicenseBackImage',
          'VehicleInsuranceImage',
        ];
        const mapped = {};
        for (const key of ALL_KEYS) {
          if (data[key]) {
            mapped[key] = {
              uri: getImageUrl(data[key]),
              fileName: data[key].split('/').pop(),
              fileSize: null,
              isRemote: true,
            };
          }
        }
        setUploads(mapped);
      } catch (err) {
        // 404 = no documents yet, ignore; anything else log
        if (err?.response?.status !== 404) {
          console.warn('Could not load existing documents:', err?.message);
        }
      } finally {
        setFetchLoading(false);
      }
    })();
  }, []);

  // Required docs validation
  const requiredApiKeys = DOCUMENTS
    .filter((d) => d.required)
    .flatMap((d) => d.sides.map((s) => s.apiKey));
  const canSubmit = requiredApiKeys.every((k) => uploads[k]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);

      const formData = new FormData();
      const raw = await AsyncStorage.getItem('user');
      const stored = raw ? JSON.parse(raw) : {};
      const userId = stored?.userId ?? stored?.id ?? 0;

      formData.append('UserId', userId);

      const allApiKeys = DOCUMENTS.flatMap((d) => d.sides.map((s) => s.apiKey));
      for (const key of allApiKeys) {
        const asset = uploads[key];
        // Only include newly picked files; remote ones are already on the server
        if (asset && !asset.isRemote) {
          formData.append(key, {
            uri:  asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: asset.fileName || `${key}.jpg`,
          });
        }
      }

      await apiClient.post('GigAndDriverDocuments/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showAlert('Documents Submitted', 'Your documents have been submitted for verification.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.response?.data ?? 'Failed to upload documents.';
      showAlert('Error', typeof msg === 'string' ? msg : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const missingRequired = requiredApiKeys.length - requiredApiKeys.filter((k) => uploads[k]).length;

  if (fetchLoading) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <InnerScreenHeader navigation={navigation} title="My Documents" />
        <View style={styles.fetchLoader}>
          <ActivityIndicator size="large" color={color.GREEN} />
          <CustomText style={styles.fetchLoaderText}>Loading your documents…</CustomText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <InnerScreenHeader navigation={navigation} title="My Documents" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(0).duration(350)} style={styles.titleBlock}>
          <CustomText style={styles.pageTitle}>Upload Documents</CustomText>
          <CustomText style={styles.pageSubtitle}>
            {isDriver
              ? 'Verified documents help build trust with farmers and unlock more job opportunities.'
              : 'Aadhaar is required. Driving license and vehicle insurance are optional for gig workers.'}
          </CustomText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(350)}>
          <UploadProgress uploads={uploads} documents={DOCUMENTS} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.guidelineBanner}>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle-outline" size={15} color={color.GREEN} />
            <CustomText style={styles.guidelineText}>Photos must be clear and fully visible</CustomText>
          </View>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle-outline" size={15} color={color.GREEN} />
            <CustomText style={styles.guidelineText}>Accepted formats: JPG, PNG (max 5 MB)</CustomText>
          </View>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle-outline" size={15} color={color.GREEN} />
            <CustomText style={styles.guidelineText}>Documents must be valid and not expired</CustomText>
          </View>
        </Animated.View>

        {DOCUMENTS.map((doc, i) => (
          <DocCard
            key={doc.id}
            doc={doc}
            uploads={uploads}
            onUpload={handleUpload}
            onRemove={handleRemove}
            delay={140 + i * 60}
          />
        ))}

        <Animated.View entering={FadeInDown.delay(360).duration(350)} style={styles.securityNote}>
          <MaterialCommunityIcons name="lock-outline" size={16} color={color.TEXT_MUTED} />
          <CustomText style={styles.securityNoteText}>
            All documents are encrypted with AES-256 and stored securely. Only authorised verifiers can access them.
          </CustomText>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={canSubmit && !submitting ? 0.85 : 1}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={color.WHITE} />
          ) : (
            <>
              <CustomText style={styles.submitBtnText}>
                {canSubmit
                  ? 'Submit for Verification'
                  : `Upload ${missingRequired} required file${missingRequired === 1 ? '' : 's'}`}
              </CustomText>
              <Ionicons
                name={canSubmit ? 'checkmark' : 'cloud-upload-outline'}
                size={20}
                color={color.WHITE}
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
        <CustomText style={styles.bottomNote}>Your data is encrypted and secure</CustomText>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.SURFACE },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },

  titleBlock: { gap: 6 },
  pageTitle: { ...globalStyles.f16Bold, color: color.TEXT_MAIN, lineHeight: 28 },
  pageSubtitle: { ...globalStyles.f12Regular, color: color.TEXT_SUB, lineHeight: 20 },

  progressCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18, padding: 16, gap: 10,
    borderWidth: 1, borderColor: color.BORDER_LIGHT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  progressTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTextCol: { gap: 2 },
  progressTitle: { ...globalStyles.f14Bold, color: color.TEXT_MAIN },
  progressSub: { ...globalStyles.f12Regular, color: color.TEXT_SUB },
  progressPct: { ...globalStyles.f16Bold, color: color.TEXT_MUTED },
  progressPctDone: { color: color.GREEN },
  progressTrack: {
    height: 8, borderRadius: 99,
    backgroundColor: color.AVATAR_BG, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: color.GREEN },
  progressFillDone: { backgroundColor: color.GREEN },

  guidelineBanner: {
    backgroundColor: color.GREEN_BG,
    borderRadius: 16, padding: 14, gap: 8,
    borderWidth: 1, borderColor: color.BORDER_GREEN,
  },
  guidelineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guidelineText: { ...globalStyles.f12Regular, color: color.GREEN_DARK, lineHeight: 18 },

  docCard: {
    backgroundColor: color.WHITE,
    borderRadius: 20, padding: 16, gap: 14,
    borderWidth: 1, borderColor: color.BORDER_LIGHT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  docCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  docIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  docCardInfo: { flex: 1, gap: 3 },
  docCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  docCardTitle: { ...globalStyles.f14Bold, color: color.TEXT_MAIN },
  docCardSubtitle: { ...globalStyles.f12Regular, color: color.TEXT_SUB },

  badge: {
    borderRadius: 30, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1,
  },
  badgeRequired: { backgroundColor: '#fff3e0', borderColor: '#ffe0b2' },
  badgeOptional: { backgroundColor: color.SURFACE_LOW, borderColor: color.BORDER_LIGHT },
  badgeText: { ...globalStyles.f10Regular },
  badgeTextRequired: { color: '#e65100' },
  badgeTextOptional: { color: color.TEXT_MUTED },

  statusDone: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: color.GREEN,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  statusPartial: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff3e0',
    borderWidth: 1.5, borderColor: '#fb8c00',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  statusPartialText: { ...globalStyles.f10Bold, color: '#fb8c00' },

  tipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
  },
  tipText: { ...globalStyles.f10Regular, color: color.TEXT_MUTED, flex: 1, lineHeight: 16 },

  slotsContainer: { gap: 12 },
  slotWrapper: { gap: 6 },
  slotLabel: { ...globalStyles.f12Bold, color: color.TEXT_MAIN },

  slotEmpty: {
    flexDirection: 'row', borderRadius: 14,
    borderWidth: 1.5, borderColor: color.BORDER_LIGHT,
    borderStyle: 'dashed', backgroundColor: color.SURFACE_LOW,
    overflow: 'hidden', height: 80,
  },
  slotBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  slotBtnText: { ...globalStyles.f12Regular, color: color.TEXT_SUB },
  slotDivider: { width: 1, backgroundColor: color.BORDER_LIGHT, marginVertical: 16 },

  slotUploaded: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: color.GREEN_BG,
    borderRadius: 14, borderWidth: 1.5, borderColor: color.GREEN,
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  slotUploadedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  slotFileIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: color.WHITE,
    justifyContent: 'center', alignItems: 'center',
  },
  slotFileName: { ...globalStyles.f12Bold, color: color.GREEN, flex: 1 },
  slotFileSize: { ...globalStyles.f10Regular, color: color.TEXT_MUTED, marginTop: 2 },

  securityNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 14, padding: 14,
  },
  securityNoteText: { ...globalStyles.f10Regular, color: color.TEXT_MUTED, flex: 1, lineHeight: 16 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: color.SURFACE,
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 6, borderTopWidth: 1, borderTopColor: color.BORDER_LIGHT,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.GREEN, borderRadius: 99, paddingVertical: 16,
  },
  submitBtnDisabled: { backgroundColor: color.AVATAR_BG },
  submitBtnText: { ...globalStyles.f14Bold, color: color.WHITE },
  bottomNote: { ...globalStyles.f12Regular, color: color.TEXT_MUTED, textAlign: 'center' },

  fetchLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  fetchLoaderText: { ...globalStyles.f12Regular, color: color.TEXT_MUTED },
});
