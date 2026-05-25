import React, { useRef, useEffect } from 'react';
import {
  View,
  Modal,
  Animated,
  PanResponder,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomText from './CustomText';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72;
  
// ─── Icon config per notification type ────────────────────────────────────────
function typeConfig(type) {
  switch (type) {
    case 'booking_request':
      return { icon: 'clipboard-outline', iconColor: color.WHITE, bg: color.GREEN };
    case 'payment':
      return { icon: 'cash-outline', iconColor: color.YELLOW_TEXT, bg: color.YELLOW_BG };
    case 'alert':
      return { icon: 'alert-circle-outline', iconColor: color.RED_REJECT, bg: color.RED_BG };
    case 'system':
    default:
      return { icon: 'information-circle-outline', iconColor: color.TEXT_SUB, bg: color.AVATAR_BG };
  }
}

// ─── Single notification row ──────────────────────────────────────────────────
function NotificationRow({ item, onAccept, onViewBooking, onMarkRead }) {
  const cfg = typeConfig(item.type);
  const isBooking = item.type === 'booking_request';
  const isUnread = !item.read;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => {
        onMarkRead(item.id);
        if (isBooking && item.booking) onViewBooking(item.booking);
      }}
      style={[styles.notifRow, isUnread && styles.notifRowUnread]}
    >
      {/* Unread indicator dot */}
      {isUnread && <View style={styles.unreadDot} />}

      {/* Type icon */}
      <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={20} color={cfg.iconColor} />
      </View>

      {/* Text content */}
      <View style={styles.notifContent}>
        <View style={styles.notifTopRow}>
          <CustomText
            style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </CustomText>
          <CustomText style={styles.notifTime}>{item.time}</CustomText>
        </View>

        <CustomText style={styles.notifBody} numberOfLines={2}>
          {item.body}
        </CustomText>

        {/* Inline action buttons for unread booking requests */}
        {isBooking && isUnread && (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => onAccept(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color={color.WHITE} />
              <CustomText style={styles.acceptText}>Accept</CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => {
                onMarkRead(item.id);
                if (item.booking) onViewBooking(item.booking);
              }}
              activeOpacity={0.8}
            >
              <CustomText style={styles.viewText}>View details</CustomText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationSheet({
  visible,
  onClose,
  notifications = [],
  onNotificationsChange,
  navigation,
}) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Animate in / out ──────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ── Swipe-down to dismiss ─────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 1.2) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // ── Mutation helpers ──────────────────────────────────────────────────────
  const handleMarkRead = (id) => {
    onNotificationsChange?.((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    onNotificationsChange?.((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Accepting from inside the sheet marks it read and converts the card type
  const handleAccept = (notifId) => {
    onNotificationsChange?.((prev) =>
      prev.map((n) =>
        n.id === notifId
          ? { ...n, read: true, type: 'system', title: 'Booking accepted' }
          : n
      )
    );
  };

  // Navigate to BookingDetail, closing the sheet first
  const handleViewBooking = (booking) => {
    onClose();
    setTimeout(() => {
      navigation?.navigate('BookingsTab', {
        screen: 'BookingDetail',
        params: { booking }, 
      });
    }, 320);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Dimmed overlay — tap to close */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 8, transform: [{ translateY }] },
        ]}
      >
        {/* Drag handle — only this area triggers the pan responder */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <CustomText style={styles.headerTitle}>Notifications</CustomText>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <CustomText style={styles.unreadBadgeText}>{unreadCount}</CustomText>
              </View>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
              <CustomText style={styles.markAllText}>Mark all read</CustomText>
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable notification list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={color.BORDER_LIGHT} />
              <CustomText style={styles.emptyTitle}>No notifications</CustomText>
              <CustomText style={styles.emptySubtitle}>You're all caught up!</CustomText>
            </View>
          ) : (
            notifications.map((item, index) => (
              <View key={item.id}>
                <NotificationRow
                  item={item}
                  onAccept={handleAccept}
                  onViewBooking={handleViewBooking}
                  onMarkRead={handleMarkRead}
                />
                {index < notifications.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))
          )}

          <View style={{ height: 16 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Overlay ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // ── Sheet ──
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: color.SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  // ── Drag handle ──
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 99,
    backgroundColor: color.BORDER,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.BORDER_LIGHT,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },
  unreadBadge: {
    backgroundColor: color.GREEN,
    borderRadius: 99,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: color.WHITE,
  },
  markAllText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  // ── List ──
  listContent: {
    paddingTop: 6,
  },

  // ── Notification row ──
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    position: 'relative',
  },
  notifRowUnread: {
    backgroundColor: color.WHITE,
  },

  unreadDot: {
    position: 'absolute',
    left: 6,
    top: 22,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.GREEN,
  },

  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MAIN,
    flex: 1,
  },
  notifTitleUnread: {
    ...globalStyles.f12Bold,
  },
  notifTime: {
    fontSize: 10,
    color: color.TEXT_MUTED,
    flexShrink: 0,
    marginTop: 1,
  },
  notifBody: {
    ...globalStyles.f12Regular,
    color: color.TEXT_SUB,
    lineHeight: 18,
  },

  // ── Booking action buttons ──
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: color.GREEN,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  acceptText: {
    ...globalStyles.f12Bold,
    color: color.WHITE,
  },
  viewBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: color.GREEN,
  },
  viewText: {
    ...globalStyles.f12Bold,
    color: color.GREEN,
  },

  // ── Row divider ──
  divider: {
    height: 1,
    backgroundColor: color.BORDER_LIGHT,
    marginLeft: 70,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    ...globalStyles.f14Bold,
    color: color.TEXT_MUTED,
  },
  emptySubtitle: {
    ...globalStyles.f12Regular,
    color: color.TEXT_MUTED,
  },
});