import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomText from '../components/CustomText';
import InnerScreenHeader from '../components/InnerScreenHeader';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Document config ──────────────────────────────────────────────────────────
const DOCUMENTS = [
  {
    id: 'aadhaar',
    title: 'Aadhaar Card',
    subtitle: 'Upload front and back side clearly',
    iconName: 'finger-print-outline',
    required: true,
    sides: ['Front Side', 'Back Side'],
    tips: 'All 12 digits must be visible',
  },
  {
    id: 'license',
    title: 'Driving License',
    subtitle: 'Valid commercial, tractor or transport license',
    iconName: 'car-outline',
    required: true,
    sides: ['Front Side', 'Back Side'],
    tips: 'License must be currently valid',
  },
  {
    id: 'insurance',
    title: 'Vehicle Insurance',
    subtitle: 'Active insurance policy for your primary vehicle',
    iconName: 'shield-checkmark-outline',
    required: true,
    sides: ['Policy Document'],
    tips: 'Policy must not be expired',
  },
];

// ─── Upload button ────────────────────────────────────────────────────────────
function UploadSlot({ label, file, onCamera, onGallery, onRemove }) {
  return (
    <View style={styles.slotWrapper}>
      <CustomText style={styles.slotLabel}>{label}</CustomText>
      {file ? (
        /* Uploaded state */
        <View style={styles.slotUploaded}>
          <View style={styles.slotUploadedLeft}>
            <View style={styles.slotFileIcon}>
              <Ionicons name="image-outline" size={20} color={color.GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <CustomText style={styles.slotFileName} numberOfLines={1}>{file.name}</CustomText>
              <CustomText style={styles.slotFileSize}>{file.size}</CustomText>
            </View>
          </View>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={20} color={color.TEXT_MUTED} />
          </TouchableOpacity>
        </View>
      ) : (
        /* Empty state */
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
  const uploadedCount = doc.sides.filter((_, i) => uploads[`${doc.id}_${i}`]).length;
  const allUploaded   = uploadedCount === doc.sides.length;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(380)} style={styles.docCard}>
      {/* Card header */}
      <View style={styles.docCardHeader}>
        <View style={styles.docIconBox}>
          <Ionicons name={doc.iconName} size={24} color={color.GREEN} />
        </View>

        <View style={styles.docCardInfo}>
          <View style={styles.docCardTitleRow}>
            <CustomText style={styles.docCardTitle}>{doc.title}</CustomText>
            {doc.required && (
              <View style={styles.requiredBadge}>
                <CustomText style={styles.requiredBadgeText}>Required</CustomText>
              </View>
            )}
          </View>
          <CustomText style={styles.docCardSubtitle}>{doc.subtitle}</CustomText>
        </View>

        {/* Status badge */}
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

      {/* Tip row */}
      <View style={styles.tipRow}>
        <Ionicons name="information-circle-outline" size={14} color={color.TEXT_MUTED} />
        <CustomText style={styles.tipText}>{doc.tips}</CustomText>
      </View>

      {/* Upload slots */}
      <View style={styles.slotsContainer}>
        {doc.sides.map((sideLabel, i) => {
          const key = `${doc.id}_${i}`;
          return (
            <UploadSlot
              key={key}
              label={sideLabel}
              file={uploads[key] || null}
              onCamera={() => onUpload(key, { name: `${doc.id}_${sideLabel.toLowerCase().replace(' ', '_')}.jpg`, size: '1.2 MB' })}
              onGallery={() => onUpload(key, { name: `${doc.id}_${sideLabel.toLowerCase().replace(' ', '_')}.jpg`, size: '890 KB' })}
              onRemove={() => onRemove(key)}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

// ─── Progress summary bar ─────────────────────────────────────────────────────
function UploadProgress({ uploads }) {
  const totalSlots    = DOCUMENTS.reduce((acc, d) => acc + d.sides.length, 0);
  const uploadedSlots = Object.keys(uploads).length;
  const pct           = Math.round((uploadedSlots / totalSlots) * 100);
  const allDone       = uploadedSlots === totalSlots;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressTopRow}>
        <View style={styles.progressTextCol}>
          <CustomText style={styles.progressTitle}>
            {allDone ? 'All documents uploaded!' : 'Upload Progress'}
          </CustomText>
          <CustomText style={styles.progressSub}>
            {uploadedSlots} of {totalSlots} files uploaded
          </CustomText>
        </View>
        <CustomText style={[styles.progressPct, allDone && styles.progressPctDone]}>
          {pct}%
        </CustomText>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }, allDone && styles.progressFillDone]} />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DocumentsScreen({ navigation }) {
  // uploads: { 'aadhaar_0': { name, size }, 'license_1': {...}, ... }
  const [uploads, setUploads] = useState({});

  const handleUpload = (key, file) => setUploads((p) => ({ ...p, [key]: file }));
  const handleRemove = (key) => setUploads((p) => { const next = { ...p }; delete next[key]; return next; });

  const totalSlots    = DOCUMENTS.reduce((acc, d) => acc + d.sides.length, 0);
  const uploadedSlots = Object.keys(uploads).length;
  const canSubmit     = uploadedSlots === totalSlots;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <InnerScreenHeader navigation={navigation} title="My Documents" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page title */}
        <Animated.View entering={FadeInDown.delay(0).duration(350)} style={styles.titleBlock}>
          <CustomText style={styles.pageTitle}>Upload Documents</CustomText>
          <CustomText style={styles.pageSubtitle}>
            Verified documents help build trust with farmers and unlock more job opportunities.
          </CustomText>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View entering={FadeInDown.delay(60).duration(350)}>
          <UploadProgress uploads={uploads} />
        </Animated.View>

        {/* Guidelines banner */}
        <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.guidelineBanner}>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle-outline" size={15} color={color.GREEN} />
            <CustomText style={styles.guidelineText}>Photos must be clear and fully visible</CustomText>
          </View>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle-outline" size={15} color={color.GREEN} />
            <CustomText style={styles.guidelineText}>Accepted formats: JPG, PNG, PDF (max 5 MB)</CustomText>
          </View>
          <View style={styles.guidelineRow}>
            <Ionicons name="checkmark-circle-outline" size={15} color={color.GREEN} />
            <CustomText style={styles.guidelineText}>Documents must be valid and not expired</CustomText>
          </View>
        </Animated.View>

        {/* Document cards */}
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

        {/* Security note */}
        <Animated.View entering={FadeInDown.delay(360).duration(350)} style={styles.securityNote}>
          <MaterialCommunityIcons name="lock-outline" size={16} color={color.TEXT_MUTED} />
          <CustomText style={styles.securityNoteText}>
            All documents are encrypted with AES-256 and stored securely. Only authorised verifiers can access them.
          </CustomText>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={() => {}}
          activeOpacity={canSubmit ? 0.85 : 1}
        >
          <CustomText style={styles.submitBtnText}>
            {canSubmit ? 'Submit for Verification' : `Upload ${totalSlots - uploadedSlots} more file${totalSlots - uploadedSlots === 1 ? '' : 's'}`}
          </CustomText>
          <Ionicons
            name={canSubmit ? 'checkmark' : 'cloud-upload-outline'}
            size={20}
            color={color.WHITE}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
        <CustomText style={styles.bottomNote}>Your data is encrypted and secure</CustomText>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: color.SURFACE },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },

  // ── Title ──────────────────────────────────────────────────────────────────
  titleBlock:   { gap: 6 },
  pageTitle:    { ...globalStyles.f16Bold,    color: color.TEXT_MAIN, lineHeight: 28 },
  pageSubtitle: { ...globalStyles.f12Regular, color: color.TEXT_SUB,  lineHeight: 20 },

  // ── Progress Card ──────────────────────────────────────────────────────────
  progressCard: {
    backgroundColor: color.WHITE,
    borderRadius: 18, padding: 16, gap: 10,
    borderWidth: 1, borderColor: color.BORDER_LIGHT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  progressTopRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTextCol: { gap: 2 },
  progressTitle:   { ...globalStyles.f14Bold,    color: color.TEXT_MAIN },
  progressSub:     { ...globalStyles.f12Regular, color: color.TEXT_SUB  },
  progressPct:     { ...globalStyles.f16Bold,    color: color.TEXT_MUTED },
  progressPctDone: { color: color.GREEN },
  progressTrack: {
    height: 8, borderRadius: 99,
    backgroundColor: color.AVATAR_BG, overflow: 'hidden',
  },
  progressFill:     { height: '100%', borderRadius: 99, backgroundColor: color.GREEN },
  progressFillDone: { backgroundColor: color.GREEN },

  // ── Guidelines banner ──────────────────────────────────────────────────────
  guidelineBanner: {
    backgroundColor: color.GREEN_BG,
    borderRadius: 16, padding: 14, gap: 8,
    borderWidth: 1, borderColor: color.BORDER_GREEN,
  },
  guidelineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guidelineText: { ...globalStyles.f12Regular, color: color.GREEN_DARK, lineHeight: 18 },

  // ── Document Card ──────────────────────────────────────────────────────────
  docCard: {
    backgroundColor: color.WHITE,
    borderRadius: 20, padding: 16, gap: 14,
    borderWidth: 1, borderColor: color.BORDER_LIGHT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  docCardHeader:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  docIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: color.GREEN_BG,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  docCardInfo:     { flex: 1, gap: 3 },
  docCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  docCardTitle:    { ...globalStyles.f14Bold,    color: color.TEXT_MAIN },
  docCardSubtitle: { ...globalStyles.f12Regular, color: color.TEXT_SUB  },
  requiredBadge: {
    backgroundColor: '#fff3e0',
    borderRadius: 30, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: '#ffe0b2',
  },
  requiredBadgeText: { ...globalStyles.f10Regular, color: '#e65100' },

  // ── Status icons ──────────────────────────────────────────────────────────
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

  // ── Tip row ────────────────────────────────────────────────────────────────
  tipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
  },
  tipText: { ...globalStyles.f10Regular, color: color.TEXT_MUTED, flex: 1, lineHeight: 16 },

  // ── Slots container ────────────────────────────────────────────────────────
  slotsContainer: { gap: 12 },
  slotWrapper:    { gap: 6 },
  slotLabel:      { ...globalStyles.f12Bold, color: color.TEXT_MAIN },

  // ── Empty slot ─────────────────────────────────────────────────────────────
  slotEmpty: {
    flexDirection: 'row', borderRadius: 14,
    borderWidth: 1.5, borderColor: color.BORDER_LIGHT,
    borderStyle: 'dashed', backgroundColor: color.SURFACE_LOW,
    overflow: 'hidden', height: 80,
  },
  slotBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  slotBtnText: { ...globalStyles.f12Regular, color: color.TEXT_SUB },
  slotDivider: { width: 1, backgroundColor: color.BORDER_LIGHT, marginVertical: 16 },

  // ── Uploaded slot ──────────────────────────────────────────────────────────
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
  slotFileName: { ...globalStyles.f12Bold,    color: color.GREEN,      flex: 1 },
  slotFileSize: { ...globalStyles.f10Regular, color: color.TEXT_MUTED, marginTop: 2 },

  // ── Security note ──────────────────────────────────────────────────────────
  securityNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 14, padding: 14,
  },
  securityNoteText: { ...globalStyles.f10Regular, color: color.TEXT_MUTED, flex: 1, lineHeight: 16 },

  // ── Bottom bar ─────────────────────────────────────────────────────────────
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
  submitBtnText:     { ...globalStyles.f14Bold,    color: color.WHITE       },
  bottomNote:        { ...globalStyles.f12Regular, color: color.TEXT_MUTED, textAlign: 'center' },
});
