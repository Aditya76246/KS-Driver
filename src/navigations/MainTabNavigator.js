import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import CustomHeader from '../components/CustomHeader';
import CustomText from '../components/CustomText';
import globalStyles from '../styles/globalStyles';

import HomeStackNavigator from './HomeStackNavigator';
import BookingsStackNavigator from './BookingsStackNavigator';
import EarningsStackNavigator from './EarningsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator();

const GREEN = '#2e7d32';
const GREEN_LIGHT = '#d4edda';
const SURFACE = '#f7fbf0';

const TAB_CONFIG = [
  { name: 'HomeTab',     label: 'Home',     icon: 'home',           iconOutline: 'home-outline'         },
  { name: 'BookingsTab', label: 'Bookings', icon: 'clipboard',      iconOutline: 'clipboard-outline'    },
  { name: 'EarningsTab', label: 'Earnings', icon: 'cash',           iconOutline: 'cash-outline'         },
  { name: 'ProfileTab',  label: 'Profile',  icon: 'person-circle',  iconOutline: 'person-circle-outline'},
];

// ─── Animated Tab Button ──────────────────────────────────────────────────────

function TabButton({ tab, isFocused, onPress, onLongPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.12 : 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }),
      Animated.timing(bgAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: isFocused ? -6 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 130,
      }),
    ]).start();
  }, [isFocused]);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', GREEN_LIGHT],
  });

  const iconColor = isFocused ? GREEN : '#9aab96';
  const iconName = isFocused ? tab.icon : tab.iconOutline;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabInner,
          {
            transform: [{ scale: scaleAnim }, { translateY }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconPill,
            { backgroundColor: bgColor },
          ]}
        >
          <Ionicons name={iconName} size={22} color={iconColor} />
        </Animated.View>
        <CustomText
          style={[
            styles.tabLabel,
            { color: isFocused ? GREEN : '#9aab96' },
            isFocused && styles.tabLabelActive,
          ]}
        >
          {tab.label}
        </CustomText>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const tab = TAB_CONFIG.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabButton
              key={route.key}
              tab={tab}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Navigator ───────────────────────────────────────────────────────────

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ navigation, route }) => ({
        header: () => (
          <CustomHeader
            onProfilePress={() => navigation.navigate('ProfileTab')}
          />
        ),
      })}
    >
      <Tab.Screen name="HomeTab"     component={HomeStackNavigator}     options={{ title: 'Home' }}     />
      <Tab.Screen name="BookingsTab" component={BookingsStackNavigator} options={{ title: 'Bookings' }} />
      <Tab.Screen name="EarningsTab" component={EarningsStackNavigator} options={{ title: 'Earnings' }} />
      <Tab.Screen name="ProfileTab"  component={ProfileStackNavigator}  options={{ title: 'Profile' }}  />
    </Tab.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBarWrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5eadf',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },

  tabBar: {
    flexDirection: 'row',
    paddingTop: 18,
    paddingHorizontal: 8,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
  },

  tabInner: {
    alignItems: 'center',
    gap: 3,
  },

  iconPill: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabLabel: {
    ...globalStyles.f10Regular,
  },

  tabLabelActive: {
    ...globalStyles.f10Bold,
    fontSize: 11,
  },
});