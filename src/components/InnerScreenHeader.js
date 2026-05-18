import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomText from './CustomText';
import { color } from '../styles/theme';
import globalStyles from '../styles/globalStyles';

export default function InnerScreenHeader({ navigation, title, rightElement }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingTop: insets.top + 6 },
      ]}
    >
      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.75}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.backPill}>
          <Ionicons name="chevron-back" size={20} color={color.GREEN} />
        </View>
      </TouchableOpacity>

      {/* Title */}
      {title ? (
        <View style={styles.titleContainer} pointerEvents="none">
          <CustomText style={styles.title} numberOfLines={1}>
            {title}
          </CustomText>
        </View>
      ) : (
        <View style={styles.titleContainer} />
      )}

      {/* Right slot */}
      <View style={styles.rightSlot}>
        {rightElement ?? <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: color.SURFACE,
  },

  // ── Back pill button ──
  backBtn: {
    // touch target kept large via hitSlop
  },
  backPill: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: color.GREEN_BG,      // light green tint
    justifyContent: 'center',
    alignItems: 'center',
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  title: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },

  rightSlot: {
    width: 40,          
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
