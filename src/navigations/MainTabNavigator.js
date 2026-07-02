import React, { useRef, useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import CustomHeader from '../components/CustomHeader';
import CustomText from '../components/CustomText';
import NotificationSheet from '../components/NotificationSheet';
import globalStyles from '../styles/globalStyles';

import HomeStackNavigator from './HomeStackNavigator';
import BookingsStackNavigator from './BookingsStackNavigator';
import EarningsStackNavigator from './EarningsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import GigHomeStackNavigator from './GigHomeStackNavigator';
import GigJobsStackNavigator from './GigJobsStackNavigator';

import { AuthContext } from '../context/AuthContext';
import { color } from '../styles/theme';

const Tab = createBottomTabNavigator();

// ─── Tab configs per role ─────────────────────────────────────────────────────

const DRIVER_TAB_CONFIG = [
  { name: 'HomeTab', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'BookingsTab', label: 'Bookings', icon: 'clipboard', iconOutline: 'clipboard-outline' },
  { name: 'EarningsTab', label: 'Earnings', icon: 'cash', iconOutline: 'cash-outline' },
  { name: 'ProfileTab', label: 'Profile', icon: 'person-circle', iconOutline: 'person-circle-outline' },
];

const GIG_TAB_CONFIG = [
  { name: 'HomeTab', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'BookingsTab', label: 'Jobs', icon: 'briefcase', iconOutline: 'briefcase-outline' },
  { name: 'EarningsTab', label: 'Earnings', icon: 'cash', iconOutline: 'cash-outline' },
  { name: 'ProfileTab', label: 'Profile', icon: 'person-circle', iconOutline: 'person-circle-outline' },
];

// ─── Root screen names per role (for inner-screen detection) ──────────────────

const DRIVER_ROOT_ROUTES = {
  HomeTab: 'HomeMain',
  BookingsTab: 'BookingsMain',
  EarningsTab: 'EarningsMain',
  ProfileTab: 'ProfileMain',
};

const GIG_ROOT_ROUTES = {
  HomeTab: 'GigHomeMain',
  BookingsTab: 'GigJobsMain',
  EarningsTab: 'EarningsMain',
  ProfileTab: 'ProfileMain',
};

// ─── Seed notification data ───────────────────────────────────────────────────
const SEED_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'booking_request',
    title: 'New booking request',
    body: 'Rajesh Kumar — Tractor Ploughing, 3.5 Acres · Nellore',
    time: '2m ago',
    read: false,
    booking: {
      id: 'KA-8821',
      farmerName: 'Rajesh Kumar',
      service: 'Tractor Ploughing',
      area: '3.5 Acres',
      location: 'Nellore Sub-div',
      distance: '4.2 km away',
      date: 'Today, 4:30 PM',
      price: '₹2,450',
      description: 'Farmer requests deep ploughing for 3.5 acres of cotton field near the irrigation canal.',
      status: 'new',
    },
  },
  {
    id: 'n2',
    type: 'booking_request',
    title: 'New booking request',
    body: 'Venkata Subbaiah — Harvester Rental, 5 Acres · Ongole',
    time: '18m ago',
    read: false,
    booking: {
      id: 'KA-9023',
      farmerName: 'Venkata Subbaiah',
      service: 'Harvester Rental',
      area: '5 Acres',
      location: 'Ongole Mandal',
      distance: '12.5 km away',
      date: 'Oct 24, 08:00 AM',
      price: '₹8,000',
      description: 'Farmer requests harvesting for 5 acres of paddy field near the main canal road.',
      status: 'new',
    },
  },
  {
    id: 'n3',
    type: 'payment',
    title: 'Payment received',
    body: '₹3,200 credited for KA-8750 · Suresh Reddy',
    time: '2h ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'alert',
    title: 'KYC document expiring',
    body: 'Your driving license expires in 12 days. Update now.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Profile incomplete',
    body: 'Complete your bank details to start receiving payments.',
    time: '2 days ago',
    read: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isInnerStackScreen(route, rootRoutes) {
  const rootRouteName = rootRoutes[route.name];
  const focusedRouteName = getFocusedRouteNameFromRoute(route);
  return Boolean(focusedRouteName && focusedRouteName !== rootRouteName);
}

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

  const bgColor = bgAnim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', color.GREEN_LIGHT] });
  const iconColor = isFocused ? color.GREEN : '#9aab96';
  const iconName = isFocused ? tab.icon : tab.iconOutline;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale: scaleAnim }, { translateY }] }]}>
        <Animated.View style={[styles.iconPill, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </Animated.View>
        <CustomText
          style={[
            styles.tabLabel,
            { color: isFocused ? color.GREEN : '#9aab96' },
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

function CustomTabBar({ state, descriptors, navigation, tabConfig, rootRoutes }) {
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const tabBarStyle = focusedDescriptor?.options?.tabBarStyle;

  if (isInnerStackScreen(focusedRoute, rootRoutes) || tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const tab = tabConfig.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              if (isFocused) {
                navigation.navigate(route.name, { screen: rootRoutes[route.name] });
              } else {
                navigation.navigate(route.name);
              }
            }
          };

          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

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
  const { userRole } = useContext(AuthContext);

  const TAB_CONFIG = userRole === 'gigWorker' ? GIG_TAB_CONFIG : DRIVER_TAB_CONFIG;
  const TAB_ROUTES = userRole === 'gigWorker' ? GIG_ROOT_ROUTES : DRIVER_ROOT_ROUTES;

  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [sheetVisible, setSheetVisible] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationsChange = useCallback((updater) => {
    setNotifications(updater);
  }, []);

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => (
          <CustomTabBar {...props} tabConfig={TAB_CONFIG} rootRoutes={TAB_ROUTES} />
        )}
        screenOptions={({ route }) => ({
          header: ({ navigation, options }) => {
            if (isInnerStackScreen(route, TAB_ROUTES) || options?.tabBarStyle?.display === 'none') {
              return null;
            }
            return (
              <CustomHeader
                unreadCount={unreadCount}
                onNotificationPress={() => setSheetVisible(true)}
              />
            );
          },
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={userRole === 'gigWorker' ? GigHomeStackNavigator : HomeStackNavigator}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="BookingsTab"
          component={userRole === 'gigWorker' ? GigJobsStackNavigator : BookingsStackNavigator}
          options={{ title: userRole === 'gigWorker' ? 'Jobs' : 'Bookings' }}
        />
        <Tab.Screen
          name="EarningsTab"
          component={EarningsStackNavigator}
          options={{ title: 'Earnings' }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>

      <NotificationSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        notifications={notifications}
        onNotificationsChange={handleNotificationsChange}
      />
    </>
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
  },
});
