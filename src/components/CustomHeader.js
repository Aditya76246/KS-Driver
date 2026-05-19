import React, { useState, useRef } from 'react';
import { Animated, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from './CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

// ─── Animated Online/Offline Toggle ───────────────────────────────────────────
function StatusToggle({ isOnline, onToggle }) {
  const anim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;

  const handlePress = () => {
    Animated.spring(anim, {
      toValue: isOnline ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 8,
    }).start();
    onToggle();
  };

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.18)', color.ORANGE],
  });

  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 18],
  });

  const thumbScale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.85, 1],
  });

  const dotOpacity = anim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOnline }}
      accessibilityLabel={isOnline ? 'Online' : 'Offline'}
      style={styles.toggleWrapper}
      android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: true, radius: 22 }}
    >
      <CustomText style={[styles.toggleLabel, isOnline && styles.toggleLabelActive]}>
        {isOnline ? 'Online' : 'Away'}
      </CustomText>

      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [
                { translateX: thumbTranslate },
                { scale: thumbScale },
              ],
            },
          ]}
        >
          <Animated.View style={[styles.thumbDot, { opacity: dotOpacity }]} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────
export default function CustomHeader({
  userName = 'Sourav',
  subtitle = 'Welcome to',
  brandName = 'KisanSahakar',
  location = 'Hyderabad, Telangana',
  notificationCount = 2,
  onNotificationPress,
  onLocationPress,
}) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={color.GREEN_DARK} />

      <View style={styles.container}>

        {/* Left — copy stack */}
        <View style={styles.copy}>

          {/* Location row with chevron */}
          <Pressable
            onPress={onLocationPress}
            style={styles.locationRow}
            android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: false }}
            accessibilityLabel="Change location"
          >
            <Ionicons name="location-sharp" size={13} color={color.ORANGE} />
            <CustomText style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
              {location}
            </CustomText>
            <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.5)" />
          </Pressable>

          {/* Welcome message */}
          <View style={styles.subtitleRow}>
            <CustomText style={styles.subtitle}>{subtitle} </CustomText>
            <CustomText style={styles.brand}>{brandName}</CustomText>
          </View>
        </View>

        {/* Right — actions */}
        <View style={styles.actions}>
          {/* Notification bell */}
          <Pressable
            onPress={onNotificationPress}
            style={styles.bellButton}
            android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: true, radius: 22 }}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications" size={20} color="#fff" />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <CustomText style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </CustomText>
              </View>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Status toggle */}
          <StatusToggle isOnline={isOnline} onToggle={() => setIsOnline(v => !v)} />
        </View>
      </View>

      {/* Bottom accent line */}
      <View style={styles.accentLine} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: color.GREEN_DARK,
  },

  container: {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: color.GREEN_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // ── Copy (left stack) ──
  copy: {
    flex: 1,
    gap: 3,
  },

  // ── Location row ──
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',    // shrink-wrap width to content
  },

  locationText: {
    color: '#fff',
   ...globalStyles.f10Bold,
    letterSpacing: 0.2,
    flexShrink: 1,              // allows text to truncate with ellipsis
    maxWidth: 160,              // hard cap before chevron gets squeezed
  },

  // ── Welcome row ──
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    ...globalStyles.f12Regular,
  },

  brand: {
    color: color.ORANGE,
    ...globalStyles.f12Bold,
    letterSpacing: 0.4,
  },

  // ── Actions ──
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#FF4757',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: color.GREEN_DARK,
  },

  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },

  divider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 1,
  },

  // ── Toggle ──
  toggleWrapper: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },

  toggleLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  toggleLabelActive: {
    color: color.ORANGE,
  },

  track: {
    width: 40,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  thumbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.ORANGE,
  },

  // ── Bottom accent ──
  accentLine: {
    height: 2,
    marginHorizontal: 16,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});