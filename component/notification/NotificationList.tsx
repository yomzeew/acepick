// This file has been removed as part of reverting notification settings

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationListProps {
  onNotificationPress?: (notification: any) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>No notifications</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});

export default NotificationList;
