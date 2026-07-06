import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomText from './CustomText';
import VoiceTextInput from './VoiceTextInput';
import { color } from '../styles/theme';
import globalStyles from '../styles/globalStyles';
import locationService from '../services/locationService';

export const EMPTY_LOCATION = {
  pincode: '',
  stateId: null,    stateName: '',
  districtId: null, districtName: '',
  mandalId: null,   mandalName: '',
  villageId: null,  villageName: '',
  manualAddress: '',
};

// ─── Searchable Bottom Sheet ──────────────────────────────────────────────────
function SearchableSheet({ visible, onClose, title, items, selectedId, onSelect, loading }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : items;

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={ss.overlay} onPress={handleClose}>
        <View style={ss.sheet}>
          <View style={ss.handle} />
          <View style={ss.header}>
            <CustomText style={ss.title}>{title}</CustomText>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={20} color={color.TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          <View style={ss.searchBox}>
            <Ionicons name="search" size={16} color={color.TEXT_MUTED} />
            <TextInput
              style={ss.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              placeholderTextColor={color.TEXT_MUTED}
              autoCorrect={false}
              returnKeyType="done"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={color.TEXT_MUTED} />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color={color.GREEN} style={{ marginVertical: 24 }} />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 320 }}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.map((item) => (
                <TouchableOpacity
                  key={String(item.id)}
                  style={[ss.option, selectedId === item.id && ss.optionActive]}
                  onPress={() => { onSelect(item); handleClose(); }}
                  activeOpacity={0.7}
                >
                  <CustomText style={[ss.optionText, selectedId === item.id && ss.optionTextActive]}>
                    {item.name}
                  </CustomText>
                  {selectedId === item.id && (
                    <Ionicons name="checkmark-circle" size={18} color={color.GREEN} />
                  )}
                </TouchableOpacity>
              ))}
              {filtered.length === 0 && !loading && (
                <CustomText style={ss.emptyText}>No results found</CustomText>
              )}
            </ScrollView>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Location Row Trigger ─────────────────────────────────────────────────────
function LocationRow({ label, required, value, onPress, disabled, loading, placeholder, iconName }) {
  return (
    <View style={styles.fieldGroup}>
      <View style={{ flexDirection: 'row' }}>
        <CustomText style={styles.fieldLabel}>{label}</CustomText>
        {required && <CustomText style={styles.requiredStar}> *</CustomText>}
      </View>
      <TouchableOpacity
        style={[
          styles.inputBox,
          disabled && styles.inputBoxDisabled,
          !!value && styles.inputBoxFilled,
        ]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={value ? color.GREEN : disabled ? color.BORDER_LIGHT : color.TEXT_MUTED}
          style={styles.inputIcon}
        />
        <CustomText style={[styles.dropdownValue, !value && styles.placeholderText]}>
          {value || placeholder}
        </CustomText>
        {loading ? (
          <ActivityIndicator size="small" color={color.GREEN} />
        ) : (
          <Ionicons
            name="chevron-down"
            size={16}
            color={disabled ? color.BORDER_LIGHT : color.TEXT_MUTED}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LocationPicker
// ═══════════════════════════════════════════════════════════════════════════════
export default function LocationPicker({ value = EMPTY_LOCATION, onChange }) {
  const [states,    setStates]    = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals,   setMandals]   = useState([]);
  const [villages,  setVillages]  = useState([]);

  const [loadingStates,    setLoadingStates]    = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMandals,   setLoadingMandals]   = useState(false);
  const [loadingVillages,  setLoadingVillages]  = useState(false);
  const [loadingPincode,   setLoadingPincode]   = useState(false);

  const [openSheet,   setOpenSheet]   = useState(null);
  const [pincodeText, setPincodeText] = useState(value?.pincode || '');
  const [pincodeErr,  setPincodeErr]  = useState('');
  const [postOffices, setPostOffices] = useState([]);
  const [showManual,  setShowManual]  = useState(false);
  const [loadingGPS,  setLoadingGPS]  = useState(false);
  const [gpsError,    setGpsError]    = useState('');

  const debounceRef = useRef(null);

  // Load states once on mount
  useEffect(() => {
    setLoadingStates(true);
    locationService.getStates()
      .then(setStates)
      .catch(() => {})
      .finally(() => setLoadingStates(false));
  }, []);

  // Load districts when stateId changes
  useEffect(() => {
    if (!value?.stateId) { setDistricts([]); return; }
    setLoadingDistricts(true);
    locationService.getDistricts(value.stateId)
      .then(setDistricts)
      .catch(() => {})
      .finally(() => setLoadingDistricts(false));
  }, [value?.stateId]);

  // Load mandals when districtId changes
  useEffect(() => {
    if (!value?.districtId) { setMandals([]); return; }
    setLoadingMandals(true);
    locationService.getMandals(value.districtId)
      .then(setMandals)
      .catch(() => {})
      .finally(() => setLoadingMandals(false));
  }, [value?.districtId]);

  // Load villages when mandalId changes
  useEffect(() => {
    if (!value?.mandalId) { setVillages([]); return; }
    setLoadingVillages(true);
    locationService.getVillages(value.mandalId)
      .then(setVillages)
      .catch(() => {})
      .finally(() => setLoadingVillages(false));
  }, [value?.mandalId]);

  const handleGetCurrentLocation = async () => {
    setLoadingGPS(true);
    setGpsError('');
    setPincodeErr('');
    try {
      const pin = await locationService.getCurrentLocationPincode();
      setPincodeText(pin);
      await fetchByPincode(pin);
    } catch (err) {
      const msg =
        err.code === 'PERMISSION_DENIED'
          ? 'Location permission denied. Please allow access in Settings.'
          : err.code === 'PINCODE_NOT_FOUND'
          ? 'Pincode not found for your area. Enter it manually below.'
          : 'Could not detect location. Check GPS and try again.';
      setGpsError(msg);
    } finally {
      setLoadingGPS(false);
    }
  };

  const handlePincodeChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    setPincodeText(cleaned);
    setPincodeErr('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (cleaned.length === 6) {
      debounceRef.current = setTimeout(() => fetchByPincode(cleaned), 700);
    }
  };

  const fetchByPincode = async (pin) => {
    setLoadingPincode(true);
    setPincodeErr('');
    try {
      const res = await locationService.getByPincode(pin);
      // API pincode response: camelCase IDs, blockName for mandal, postOfficeNames as string[]
      const base = {
        pincode:      pin,
        stateId:      res.stateId      ?? null,
        stateName:    res.stateName    ?? '',
        districtId:   res.districtId   ?? null,
        districtName: res.districtName ?? '',
        mandalId:     res.mandalId     ?? null,
        mandalName:   res.blockName    ?? '',
        villageId:    null,
        villageName:  '',
        manualAddress: value?.manualAddress || '',
      };
      // postOfficeNames is string[] — convert to {id, name} for the picker sheet
      const officeNames = res.postOfficeNames ?? [];
      const offices = officeNames.map((n) => ({ id: n, name: n }));
      if (offices.length === 1) {
        onChange({ ...base, villageId: null, villageName: offices[0].name });
      } else if (offices.length > 1) {
        setPostOffices(offices);
        onChange(base);
        setOpenSheet('postOffice');
      } else {
        onChange(base);
      }
    } catch {
      setPincodeErr('Pincode not found. Select location using the dropdowns below.');
    } finally {
      setLoadingPincode(false);
    }
  };

  const update = (patch) => onChange({ ...value, pincode: pincodeText, ...patch });

  const selectState = (item) => update({
    stateId: item.id, stateName: item.name,
    districtId: null, districtName: '',
    mandalId: null, mandalName: '',
    villageId: null, villageName: '',
  });

  const selectDistrict = (item) => update({
    districtId: item.id, districtName: item.name,
    mandalId: null, mandalName: '',
    villageId: null, villageName: '',
  });

  const selectMandal = (item) => update({
    mandalId: item.id, mandalName: item.name,
    villageId: null, villageName: '',
  });

  const selectVillage    = (item) => update({ villageId: item.id,   villageName: item.name });
  const selectPostOffice = (item) => update({ villageId: null,     villageName: item.name });

  return (
    <View style={styles.container}>

      {/* ── Use Current Location ── */}
      <TouchableOpacity
        style={[styles.gpsCard, loadingGPS && styles.gpsCardActive]}
        onPress={handleGetCurrentLocation}
        disabled={loadingGPS}
        activeOpacity={0.8}
      >
        <View style={styles.gpsIconBox}>
          {loadingGPS
            ? <ActivityIndicator size="small" color={color.GREEN} />
            : <Ionicons name="navigate" size={18} color={color.GREEN} />
          }
        </View>
        <View style={{ flex: 1 }}>
          <CustomText style={styles.gpsBtnTitle}>
            {loadingGPS ? 'Getting your location…' : 'Use Current Location'}
          </CustomText>
          <CustomText style={styles.gpsBtnSub}>Auto-detect pincode, state & district</CustomText>
        </View>
        {!loadingGPS && <Ionicons name="chevron-forward" size={16} color={color.TEXT_MUTED} />}
      </TouchableOpacity>

      {gpsError ? (
        <View style={styles.inlineError}>
          <Ionicons name="alert-circle-outline" size={14} color="#c62828" />
          <CustomText style={styles.inlineErrorText}>{gpsError}</CustomText>
        </View>
      ) : null}

      {/* ── Divider ── */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <CustomText style={styles.dividerText}>or enter pincode</CustomText>
        <View style={styles.dividerLine} />
      </View>

      {/* ── Pincode ── */}
      <View style={styles.fieldGroup}>
        <CustomText style={styles.fieldLabel}>Pincode</CustomText>
        <View style={[
          styles.inputBox,
          pincodeErr ? styles.inputBoxError : null,
          pincodeText.length === 6 && !pincodeErr && value?.stateId ? styles.inputBoxFilled : null,
        ]}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={pincodeText.length === 6 && !pincodeErr ? color.GREEN : color.TEXT_MUTED}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={pincodeText}
            onChangeText={handlePincodeChange}
            placeholder="Enter 6-digit pincode"
            placeholderTextColor={color.TEXT_MUTED}
            keyboardType="number-pad"
            maxLength={6}
          />
          {loadingPincode
            ? <ActivityIndicator size="small" color={color.GREEN} />
            : pincodeText.length === 6 && !pincodeErr && value?.stateId
            ? <Ionicons name="checkmark-circle" size={18} color={color.GREEN} />
            : null}
        </View>
        {pincodeErr
          ? <View style={styles.inlineError}>
              <Ionicons name="alert-circle-outline" size={14} color="#c62828" />
              <CustomText style={styles.inlineErrorText}>{pincodeErr}</CustomText>
            </View>
          : <CustomText style={styles.fieldHint}>Auto-fills state, district & mandal</CustomText>
        }
      </View>

      {/* ── State ── */}
      <LocationRow
        label="State" required
        value={value?.stateName}
        placeholder={loadingStates ? 'Loading states…' : 'Select State'}
        loading={loadingStates && !value?.stateId}
        iconName="map-outline"
        onPress={() => setOpenSheet('state')}
      />

      {/* ── District ── */}
      <LocationRow
        label="District" required
        value={value?.districtName}
        placeholder={value?.stateId ? 'Select District' : 'Select state first'}
        loading={loadingDistricts}
        disabled={!value?.stateId}
        iconName="business-outline"
        onPress={() => setOpenSheet('district')}
      />

      {/* ── Mandal ── */}
      <LocationRow
        label="Mandal / Block"
        value={value?.mandalName}
        placeholder={value?.districtId ? 'Select Mandal' : 'Select district first'}
        loading={loadingMandals}
        disabled={!value?.districtId}
        iconName="grid-outline"
        onPress={() => setOpenSheet('mandal')}
      />

      {/* ── Village / Post Office ── */}
      <LocationRow
        label="Village / Post Office"
        value={value?.villageName}
        placeholder={value?.mandalId ? 'Select Village' : 'Select mandal first'}
        loading={loadingVillages}
        disabled={!value?.mandalId}
        iconName="home-outline"
        onPress={() => setOpenSheet('village')}
      />

      {/* ── Manual fallback ── */}
      {!showManual && (
        <TouchableOpacity style={styles.manualToggle} onPress={() => setShowManual(true)} activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={14} color={color.GREEN} />
          <CustomText style={styles.manualToggleText}>Not listed? Enter manually</CustomText>
        </TouchableOpacity>
      )}
      {showManual && (
        <VoiceTextInput
          label="Full Address (Manual)"
          value={value?.manualAddress || ''}
          onChangeText={(v) => onChange({ ...value, manualAddress: v })}
          placeholder="Village, Mandal, District, State"
          icon="create-outline"
          hint="e.g. Kandukur, Nellore, Andhra Pradesh"
        />
      )}

      {/* ── Bottom Sheets ── */}
      <SearchableSheet
        visible={openSheet === 'state'}
        onClose={() => setOpenSheet(null)}
        title="Select State"
        items={states}
        selectedId={value?.stateId}
        onSelect={selectState}
        loading={loadingStates}
      />
      <SearchableSheet
        visible={openSheet === 'district'}
        onClose={() => setOpenSheet(null)}
        title="Select District"
        items={districts}
        selectedId={value?.districtId}
        onSelect={selectDistrict}
        loading={loadingDistricts}
      />
      <SearchableSheet
        visible={openSheet === 'mandal'}
        onClose={() => setOpenSheet(null)}
        title="Select Mandal / Block"
        items={mandals}
        selectedId={value?.mandalId}
        onSelect={selectMandal}
        loading={loadingMandals}
      />
      <SearchableSheet
        visible={openSheet === 'village'}
        onClose={() => setOpenSheet(null)}
        title="Select Village / Post Office"
        items={villages}
        selectedId={value?.villageId}
        onSelect={selectVillage}
        loading={loadingVillages}
      />
      <SearchableSheet
        visible={openSheet === 'postOffice'}
        onClose={() => setOpenSheet(null)}
        title="Select Post Office"
        items={postOffices}
        selectedId={value?.villageName}
        onSelect={selectPostOffice}
        loading={false}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { gap: 16 },

  fieldGroup: { gap: 8 },
  fieldLabel:    { ...globalStyles.f12Bold,    color: color.TEXT_MAIN },
  requiredStar:  { ...globalStyles.f12Bold,    color: '#c62828' },
  fieldHint:     { ...globalStyles.f10Regular, color: color.TEXT_MUTED, lineHeight: 16 },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 12, borderWidth: 1.5, borderColor: color.BORDER_LIGHT,
    height: 52, paddingHorizontal: 14,
  },
  inputBoxDisabled: { opacity: 0.5 },
  inputBoxFilled:   { borderColor: color.GREEN, backgroundColor: color.WHITE },
  inputBoxError:    { borderColor: '#ef9a9a', backgroundColor: '#fff8f8' },
  inputIcon:        { marginRight: 10 },
  dropdownValue:    { ...globalStyles.f12Regular, color: color.TEXT_MAIN, flex: 1 },
  placeholderText:  { color: color.TEXT_MUTED },
  textInput:        { flex: 1, ...globalStyles.f12Regular, color: color.TEXT_MAIN, padding: 0 },

  inlineError:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  inlineErrorText: { ...globalStyles.f10Regular, color: '#c62828' },

  manualToggle:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  manualToggleText: { ...globalStyles.f12Regular, color: color.GREEN },

  gpsCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: color.GREEN_BG,
    borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: color.GREEN_LIGHT,
  },
  gpsCardActive: { opacity: 0.7 },
  gpsIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: color.WHITE,
    justifyContent: 'center', alignItems: 'center',
  },
  gpsBtnTitle: { ...globalStyles.f12Bold,    color: color.GREEN_DARK },
  gpsBtnSub:   { ...globalStyles.f10Regular, color: color.TEXT_MUTED, marginTop: 2 },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: color.BORDER_LIGHT },
  dividerText: { ...globalStyles.f10Regular, color: color.TEXT_MUTED },
});

const ss = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: color.WHITE,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 99,
    backgroundColor: color.BORDER_LIGHT, alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  title: { ...globalStyles.f14Bold, color: color.TEXT_MAIN },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: color.SURFACE_LOW,
    borderRadius: 10, borderWidth: 1.5, borderColor: color.BORDER_LIGHT,
    paddingHorizontal: 12, height: 44, marginBottom: 8,
  },
  searchInput: { flex: 1, ...globalStyles.f12Regular, color: color.TEXT_MAIN, padding: 0 },

  option:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
  optionActive:     { backgroundColor: color.GREEN_BG },
  optionText:       { ...globalStyles.f14Regular, color: color.TEXT_MAIN },
  optionTextActive: { ...globalStyles.f14Bold,    color: color.GREEN },

  emptyText: { ...globalStyles.f12Regular, color: color.TEXT_MUTED, textAlign: 'center', paddingVertical: 24 },
});
