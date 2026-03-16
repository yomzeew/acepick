import React, { createContext, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import MockApiService from '../services/mockDataService';

interface MockDataContextType {
  isMockMode: boolean;
  toggleMockMode: () => void;
  apiService: typeof MockApiService;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export const useMockDataContext = () => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockDataContext must be used within MockDataProvider');
  }
  return context;
};

interface MockDataProviderProps {
  children: React.ReactNode;
}

export const MockDataProvider: React.FC<MockDataProviderProps> = ({ children }) => {
  const [isMockMode, setIsMockMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleMockMode = () => {
    setIsMockMode(!isMockMode);
  };

  const contextValue: MockDataContextType = {
    isMockMode,
    toggleMockMode,
    apiService: MockApiService,
  };

  return (
    <MockDataContext.Provider value={contextValue}>
      {children}
      
      {/* Mock Mode Toggle Button */}
      <TouchableOpacity
        style={[
          styles.mockToggle,
          {
            backgroundColor: isMockMode ? '#10b981' : '#ef4444',
          },
        ]}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.mockToggleText}>
          {isMockMode ? '🟢 MOCK ON' : '🔴 MOCK OFF'}
        </Text>
      </TouchableOpacity>

      {/* Mock Mode Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Mock Data Settings
            </Text>
            
            <Text style={styles.modalText}>
              Current Status: {isMockMode ? 'ENABLED' : 'DISABLED'}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { backgroundColor: isMockMode ? '#ef4444' : '#10b981' },
              ]}
              onPress={toggleMockMode}
            >
              <Text style={styles.toggleButtonText}>
                {isMockMode ? 'Disable Mock Mode' : 'Enable Mock Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MockDataContext.Provider>
  );
};

const styles = StyleSheet.create({
  mockToggle: {
    position: 'absolute',
    top: 50,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1000,
  },
  mockToggleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  toggleButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default MockDataProvider;
