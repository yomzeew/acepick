import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, Text } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead, deleteNotificationAsync, clearError, markAllNotificationsAsRead } from '../redux/slices/notificationSlice';
import { Notification } from '../types/notificationTypes';
import { useTheme } from '../hooks/useTheme';
import { getColors } from '../static/color';
import { Textstyles } from '../static/textFontsize';
import { ThemeText } from '../component/ThemeText';
import ContainerTemplate from '../component/dashboardComponent/containerTemplate';
import EmptyView from '../component/emptyview';
import { Ionicons } from '@expo/vector-icons';
import NotificationItem from '../component/notification/NotificationItem';
import { RootState } from '../redux/store';

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const { notifications, unreadCount, isLoading, error } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }) as any);
    dispatch(fetchUnreadCount() as any);
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchNotifications({ page: 1 }) as any);
      dispatch(fetchUnreadCount() as any);
    }, [dispatch])
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleNotificationPress = (notification: Notification) => {
    switch (notification.type) {
      case 'job':
        router.push(notification.data?.jobId ? `/jobs/${notification.data.jobId}` : '/(Authenticated)/(dashboard)/professionals');
        break;
      case 'order':
        router.push(notification.data?.orderId ? `/orders/${notification.data.orderId}` : '/(Authenticated)/(dashboard)/delivery');
        break;
      case 'payment':
        router.push(notification.data?.transactionId ? `/wallet/transaction/${notification.data.transactionId}` : '/(Authenticated)/(dashboard)/client');
        break;
      case 'chat':
        router.push(notification.data?.senderId ? `/(Authenticated)/(chatcallmessage)/mainchat/${notification.data.senderId}` : '/(Authenticated)/(chatcallmessage)');
        break;
      case 'system':
        router.push(notification.data?.navigateTo ? notification.data.navigateTo : '/(Authenticated)/(dashboard)');
        break;
      case 'profile':
        router.push('/(Authenticated)/(dashboard)/client');
        break;
      default:
        router.push('/(Authenticated)/(dashboard)');
        break;
    }
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications({ page: 1 }) as any);
    dispatch(fetchUnreadCount() as any);
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead() as any).unwrap();
      handleRefresh();
    } catch {
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await dispatch(markNotificationAsRead(notificationId) as any).unwrap();
    } catch {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await dispatch(deleteNotificationAsync(notificationId) as any).unwrap();
    } catch {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onMarkAsRead={handleMarkAsRead}
      onDelete={handleDelete}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.selectioncardColor }]}>
        <Ionicons name="notifications-off" size={64} color={colors.subText} />
      </View>
      <EmptyView height={20} />
      <ThemeText size={Textstyles.text_medium} className="text-center font-bold">
        No notifications yet
      </ThemeText>
      <EmptyView height={8} />
      <ThemeText size={Textstyles.text_small} type="secondary" className="text-center">
        We'll notify you when something important happens
      </ThemeText>
      <EmptyView height={24} />
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: colors.primaryColor }]}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ContainerTemplate>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <EmptyView height={40} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.selectioncardColor }]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={colors.primaryColor} />
          </TouchableOpacity>

          {/* Title + Badge */}
          <View style={styles.titleRow}>
            <ThemeText size={Textstyles.text_cmedium} className="font-bold">
              Notifications
            </ThemeText>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primaryColor }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Mark All Read */}
          {unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={[styles.markAllButton, { borderColor: colors.primaryColor }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.markAllText, { color: colors.primaryColor }]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerRightPlaceholder} />
          )}

        </View>

        {/* Subheader count */}
        {notifications.length > 0 && (
          <View style={styles.subHeader}>
            <Text style={[styles.subHeaderText, { color: colors.subText }]}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>
        )}

        {/* Content */}
        {notifications.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor={colors.primaryColor}
                colors={[colors.primaryColor]}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.borderColor }]} />}
            style={styles.list}
          />
        )}

      </View>
    </ContainerTemplate>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 8,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  markAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '600',
  },
  headerRightPlaceholder: {
    width: 80,
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subHeaderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 30,
  },
  separator: {
    height: 1,
    marginHorizontal: 4,
  },
});