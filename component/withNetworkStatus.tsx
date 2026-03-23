import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getColors } from '../static/color';
import NetworkService from '../services/networkService';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import { Textstyles } from 'static/textFontsize';

interface WithNetworkStatusProps {
  children: React.ReactNode;
  showOfflineModal?: boolean;
}

const WithNetworkStatus: React.FC<WithNetworkStatusProps> = ({ 
  children, 
  showOfflineModal = true 
}) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, secondaryTextColor, errorColor, successColor } = getColors(theme);
  
  const [networkStatus, setNetworkStatus] = useState(NetworkService.getInstance().getStatus());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const networkService = NetworkService.getInstance();
    
    const handleStatusChange = (status: any) => {
      setNetworkStatus(status);
      
      // Show modal when server is down for more than 3 seconds
      if (!status.serverReachable && status.isOnline) {
        const timer = setTimeout(() => {
          if (!NetworkService.getInstance().isServerReachable()) {
            setShowModal(true);
          }
        }, 3000);
        
        return () => clearTimeout(timer);
      } else {
        setShowModal(false);
      }
    };

    // Add listener
    networkService.addListener(handleStatusChange);

    // Cleanup
    return () => {
      networkService.removeListener(handleStatusChange);
    };
  }, []);

  const handleRetry = async () => {
    await NetworkService.getInstance().forceCheck();
  };

  const getStatusMessage = () => {
    if (!networkStatus.isOnline) {
      return {
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        action: 'Retry'
      };
    }
    if (!networkStatus.serverReachable) {
      return {
        title: 'Server Connection Lost',
        message: 'Unable to connect to the server. Please try again later.',
        action: 'Retry'
      };
    }
    return {
      title: 'Connected',
      message: 'Connection restored successfully.',
      action: 'OK'
    };
  };

  const statusInfo = getStatusMessage();

  return (
    <View style={styles.container}>
      {/* Network Status Banner */}
      <NetworkStatusIndicator />
      
      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Offline Modal */}
      {showOfflineModal && showModal && (
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor }]}>
              <View style={[styles.modalIcon, { backgroundColor: errorColor }]}>
                <Text style={styles.modalIconText}>!</Text>
              </View>
              
              <Text style={[styles.modalTitle, { color: primaryColor }]}>
                {statusInfo.title}
              </Text>
              
              <Text style={[styles.modalMessage, { color: secondaryTextColor }]}>
                {statusInfo.message}
              </Text>
              
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: primaryColor }]}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>{statusInfo.action}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.cancelText, { color: secondaryTextColor }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 120,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WithNetworkStatus;
