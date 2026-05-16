import React from 'react';
import { Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from './CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';


export default function CustomHeader({
  userName = 'Sourav',
  subtitle = 'Welcome to',
  brandName = 'KisanSahakar',
  notificationCount = 2,
  onNotificationPress,
  onProfilePress,
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.container}>
        <View style={styles.copy}>
          <CustomText style={styles.title} numberOfLines={1}>
            Hello, {userName} <CustomText style={styles.wave}>{'\uD83D\uDC4B'}</CustomText>
          </CustomText>

          <View style={styles.subtitleRow}>
            <CustomText style={styles.subtitle}>{subtitle} </CustomText>
            <CustomText style={styles.brand}>{brandName}</CustomText>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onNotificationPress}
            style={styles.iconButton}
            android_ripple={{ color: '#edf4ef', borderless: true }}
          >
            <Ionicons name="notifications-outline" size={20} color={color.GREEN} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <CustomText style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </CustomText>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={onProfilePress}
            style={styles.iconButton}
            android_ripple={{ color: '#f1f3f4', borderless: true }}
          >
            <Ionicons name="person-outline" size={20} color={color.TEXT_DARK} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },

  container: {
    minHeight: 54,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#edf0f2',
  },

  copy: {
    flex: 1,
    paddingRight: 14,
  },

  title: {
    color: '#101114',
    ...globalStyles.f16Bold,
  },

  wave: {
    fontSize: 20,
  },

  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  subtitle: {
    color: '#65656a',
    ...globalStyles.f12Regular,
  },

  brand: {
    color: color.GREEN,
    ...globalStyles.f12Bold,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#e4e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  badge: {
    position: 'absolute',
    top: -2,
    right: -1,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: color.RED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  badgeText: {
    color: '#fff',
    lineHeight: 12,
    ...globalStyles.f10Bold,
  },
});
