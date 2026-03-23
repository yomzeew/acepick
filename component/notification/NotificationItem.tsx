import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../../types/notificationTypes';
import { useTheme } from '../../hooks/useTheme';
import { getColors } from '../../static/color';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
}) => {
  const { theme } = useTheme();
  const colors = getColors(theme);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'job':
        return 'briefcase';
      case 'order':
        return 'cube';
      case 'payment':
        return 'card';
      case 'chat':
        return 'chatbubble';
      case 'system':
        return 'notifications';
      case 'profile':
        return 'person';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'job':
        return '#33658A';
      case 'order':
        return '#FF6B6B';
      case 'payment':
        return '#4ECDC4';
      case 'chat':
        return '#45B7D1';
      case 'system':
        return '#95A5A6';
      case 'profile':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };
  
  // Simple time formatting function
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const timeAgo = formatTimeAgo(notification.createdAt);

  const handlePress = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onPress(notification);
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.selectioncardColor, borderBottomColor: colors.borderColor },
        !notification.read && styles.unreadContainer,
      ]}
      onPress={handlePress}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: getIconColor(notification.type) }]}>
          <Ionicons
            name={getIconForType(notification.type)}
            size={20}
            color="#fff"
          />
        </View>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: colors.secondaryTextColor },
              !notification.read && styles.unreadTitle,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={[styles.message, { color: colors.subText }]} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={[styles.time, { color: colors.subText }]}>{timeAgo}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="close" size={16} color={colors.subText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  unreadContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue for unread
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default NotificationItem;
