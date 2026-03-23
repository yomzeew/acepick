import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getColors } from '../static/color';
import NetworkService from '../services/networkService';
import { Textstyles } from 'static/textFontsize';

interface NetworkStatusIndicatorProps {
  style?: any;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ style }) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, secondaryTextColor, successColor, errorColor } = getColors(theme);
  
  const [networkStatus, setNetworkStatus] = useState(NetworkService.getInstance().getStatus());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const networkService = NetworkService.getInstance();
    
    const handleStatusChange = (status: any) => {
      setNetworkStatus(status);
      
      // Show indicator when server is down
      if (!status.serverReachable && status.isOnline) {
        setIsVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Hide indicator when server is up
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
        });
      }
    };

    // Add listener
    networkService.addListener(handleStatusChange);

    // Cleanup
    return () => {
      networkService.removeListener(handleStatusChange);
    };
  }, [fadeAnim]);

  if (!isVisible) return null;

  const getStatusMessage = () => {
    if (!networkStatus.isOnline) {
      return 'No internet connection';
    }
    if (!networkStatus.serverReachable) {
      return 'Server connection lost';
    }
    return 'Connected';
  };

  const getStatusColor = () => {
    if (!networkStatus.isOnline || !networkStatus.serverReachable) {
      return errorColor;
    }
    return successColor;
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: backgroundColor,
          borderColor: getStatusColor(),
          opacity: fadeAnim
        },
        style
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.message, { color: getStatusColor() }]}>
          {getStatusMessage()}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    borderWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NetworkStatusIndicator;
