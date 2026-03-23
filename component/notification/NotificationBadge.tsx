import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useTheme } from '../../hooks/useTheme';
import { getColors } from '../../static/color';

interface NotificationBadgeProps {
  size?: number;
}

const NotificationBadge: React.FC<{ size?: number }> = ({ size = 20 }) => {
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const { theme } = useTheme();
  const colors = getColors(theme);

  if (!unreadCount || unreadCount === 0) {
    return null;
  }

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <View style={[styles.container, { 
      width: size, 
      height: size, 
      backgroundColor: colors.errorColor 
    }]}>
      <Text style={[styles.text, { 
        color: '#fff', 
        fontSize: size * 0.5 
      }]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationBadge;
