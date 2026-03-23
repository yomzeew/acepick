import React from 'react';
import { View } from 'react-native';
import NotificationIcon from '../icons/notificationIcon';
import NotificationBadge from './NotificationBadge';

const NotificationIconWithBadge: React.FC<{ badgeSize?: number }> = ({ badgeSize = 16 }) => {
  return (
    <View style={{ position: 'relative' }}>
      <NotificationIcon />
      <NotificationBadge size={badgeSize} />
    </View>
  );
};

export default NotificationIconWithBadge;
