import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomText from './CustomText';
import { color } from '../styles/theme';
import globalStyles from '../styles/globalStyles';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Type definitions ─────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  success: {
    icon: 'checkmark-circle',
    iconColor: color.GREEN,
    iconBg: color.GREEN_BG,
  },
  error: {
    icon: 'close-circle',
    iconColor: color.RED,
    iconBg: color.RED_BG,
  },
  warning: {
    icon: 'warning',
    iconColor: color.ORANGE,
    iconBg: color.ORANGE_BG,
  },
  info: {
    icon: 'information-circle',
    iconColor: color.GREEN,
    iconBg: color.GREEN_BG,
  },
  confirm: {
    icon: 'help-circle',
    iconColor: color.ORANGE,
    iconBg: color.ORANGE_BG,
  },
};

// Auto-detect type from title / buttons when not explicitly provided
function detectType(title = '', buttons = []) {
  const t = title.toLowerCase();
  if (t.includes('error') || t.includes('fail') || t.includes('invalid') || t.includes('wrong'))
    return 'error';
  if (
    t.includes('success') || t.includes('saved') || t.includes('submitted') ||
    t.includes('sent') || t.includes('done') || t.includes('complete') ||
    t.includes('verified') || t.includes('uploaded')
  )
    return 'success';
  if (t.includes('permission') || t.includes('required') || t.includes('warning'))
    return 'warning';
  if (buttons.length > 1)
    return 'confirm';
  return 'info';
}

// ─── Component ────────────────────────────────────────────────────────────────
const CustomAlert = forwardRef((_, ref) => {
  const [visible, setVisible]   = useState(false);
  const [config, setConfig]     = useState(null);

  const  scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bgAnim      = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    show({ title, message, buttons, type }) {
      const resolvedType = type || detectType(title, buttons || []);
      setConfig({
        title,
        message,
        buttons: buttons?.length ? buttons : [{ text: 'OK' }],
        type: resolvedType,
      });
      setVisible(true);

      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      bgAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 130,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    },
  }));

  const dismiss = (callback) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      callback?.();
    });
  };

  if (!config) return null;

  const tc = TYPE_CONFIG[config.type] || TYPE_CONFIG.info;

  const bgOpacity = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.55],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => dismiss()}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]} />

      {/* Card wrapper — centered */}
      <View style={styles.centeredView} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: tc.iconBg }]}>
            <Ionicons name={tc.icon} size={46} color={tc.iconColor} />
          </View>

          {/* Title */}
          <CustomText style={styles.title}>{config.title}</CustomText>

          {/* Message */}
          {!!config.message && (
            <CustomText style={styles.message}>{config.message}</CustomText>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Buttons */}
          <View style={[
            styles.btnRow,
            config.buttons.length === 1 && styles.btnRowSingle,
          ]}>
            {config.buttons.map((btn, i) => {
              const isCancel      = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              const isPrimary     = !isCancel;

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.btn,
                    config.buttons.length === 1 && styles.btnFull,
                    isCancel      && styles.btnCancel,
                    isDestructive && styles.btnDestructive,
                    isPrimary && !isDestructive && styles.btnPrimary,
                  ]}
                  onPress={() => dismiss(btn.onPress)}
                  activeOpacity={0.8}
                >
                  <CustomText
                    style={[
                      styles.btnText,
                      isCancel      && styles.btnTextCancel,
                      isDestructive && styles.btnTextDestructive,
                      isPrimary && !isDestructive && styles.btnTextPrimary,
                    ]}
                  >
                    {btn.text}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default CustomAlert;

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = Math.min(SCREEN_W - 48, 340);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  card: {
    width: CARD_W,
    backgroundColor: color.WHITE,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },

  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  title: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
    textAlign: 'center',
    lineHeight: 24,
  },

  message: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 4,
  },

  divider: {
    height: 1,
    backgroundColor: color.BORDER_LIGHT,
    width: '100%',
    marginTop: 4,
  },

  // ── Button row ──────────────────────────────────────────────────────────────
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 2,
  },
  btnRowSingle: {
    justifyContent: 'center',
  },

  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFull: {
    flex: 1,
  },

  // Cancel — outlined
  btnCancel: {
    backgroundColor: color.SURFACE_LOW,
    borderWidth: 1.5,
    borderColor: color.BORDER_LIGHT,
  },
  btnTextCancel: {
    ...globalStyles.f14Bold,
    color: color.TEXT_SUB,
  },

  // Primary — green filled
  btnPrimary: {
    backgroundColor: color.GREEN,
  },
  btnTextPrimary: {
    ...globalStyles.f14Bold,
    color: color.WHITE,
  },

  // Destructive — red filled
  btnDestructive: {
    backgroundColor: color.RED,
  },
  btnTextDestructive: {
    ...globalStyles.f14Bold,
    color: color.WHITE,
  },

  btnText: {
    ...globalStyles.f14Bold,
    color: color.WHITE,
  },
});
