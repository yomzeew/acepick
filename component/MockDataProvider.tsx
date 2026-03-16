import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getColors } from '../static/color';
import MockApiService, { MockUser, MockJob, MockDelivery, MockReview, MockChat } from '../services/mockDataService';

interface MockDataContextType {
  isMockMode: boolean;
  toggleMockMode: () => void;
  mockData: {
    users: MockUser[];
    jobs: MockJob[];
    deliveries: MockDelivery[];
    reviews: MockReview[];
    chats: MockChat[];
  };
  apiService: typeof MockApiService;
  currentUser: MockUser | null;
  setCurrentUser: (user: MockUser | null) => void;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within MockDataProvider');
  }
  return context;
};

interface MockDataProviderProps {
  children: React.ReactNode;
}

export const MockDataProvider: React.FC<MockDataProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor } = getColors(theme);
  
  const [isMockMode, setIsMockMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);

  // Mock data
  const mockData = {
    users: [
      {
        id: '1',
        email: 'client@example.com',
        fullName: 'John Doe',
        role: 'client' as const,
        phone: '+1234567890',
        avatar: 'https://picsum.photos/seed/user1/200/200',
        profile: {
          verified: true,
          totalDisputes: 0,
          totalReview: 12,
          location: 'Lagos, Nigeria',
          bio: 'Looking for reliable professionals for home repairs',
          rating: 4.5,
        },
        wallet: {
          currentBalance: 50000,
          pendingBalance: 5000,
          totalEarnings: 0,
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z',
      },
      {
        id: '2',
        email: 'pro@example.com',
        fullName: 'Mike Wilson',
        role: 'professional' as const,
        phone: '+1234567891',
        avatar: 'https://picsum.photos/seed/user2/200/200',
        profile: {
          verified: true,
          totalDisputes: 1,
          totalReview: 28,
          location: 'Abuja, Nigeria',
          bio: 'Experienced electrician with 10+ years of experience',
          rating: 4.8,
        },
        wallet: {
          currentBalance: 150000,
          pendingBalance: 25000,
          totalEarnings: 750000,
        },
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z',
      },
      {
        id: '3',
        email: 'delivery@example.com',
        fullName: 'Sarah Johnson',
        role: 'delivery' as const,
        phone: '+1234567892',
        avatar: 'https://picsum.photos/seed/user3/200/200',
        profile: {
          verified: true,
          totalDisputes: 0,
          totalReview: 45,
          location: 'Port Harcourt, Nigeria',
          bio: 'Reliable delivery partner with own vehicle',
          rating: 4.9,
        },
        wallet: {
          currentBalance: 80000,
          pendingBalance: 15000,
          totalEarnings: 320000,
        },
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z',
      },
    ],
    jobs: [
      {
        id: '1',
        title: 'Electrical Wiring Installation',
        description: 'Need professional electrician to install wiring in new 3-bedroom apartment',
        category: 'Electrical',
        status: 'pending' as const,
        client: {
          id: '1',
          fullName: 'John Doe',
          avatar: 'https://picsum.photos/seed/user1/200/200',
          rating: 4.5,
        },
        budget: 50000,
        location: 'Lagos, Nigeria',
        coordinates: { latitude: 6.5244, longitude: 3.3792 },
        createdAt: '2024-03-15T08:00:00Z',
        updatedAt: '2024-03-15T08:00:00Z',
        images: ['https://picsum.photos/seed/job1/400/300'],
      },
      {
        id: '2',
        title: 'Plumbing Repair',
        description: 'Fix leaking pipe in bathroom and install new fixtures',
        category: 'Plumbing',
        status: 'in_progress' as const,
        client: {
          id: '1',
          fullName: 'John Doe',
          avatar: 'https://picsum.photos/seed/user1/200/200',
          rating: 4.5,
        },
        professional: {
          id: '2',
          fullName: 'Mike Wilson',
          avatar: 'https://picsum.photos/seed/user2/200/200',
          rating: 4.8,
          profession: 'Electrician',
        },
        budget: 35000,
        location: 'Lagos, Nigeria',
        coordinates: { latitude: 6.5244, longitude: 3.3792 },
        createdAt: '2024-03-14T10:00:00Z',
        updatedAt: '2024-03-15T09:00:00Z',
        images: ['https://picsum.photos/seed/job2/400/300'],
      },
    ],
    deliveries: [
      {
        id: '1',
        orderNumber: 'DEL-001',
        status: 'pending' as const,
        client: {
          id: '1',
          fullName: 'John Doe',
          phone: '+1234567890',
          address: '123 Main Street, Lagos, Nigeria',
        },
        package: {
          description: 'Electronics Package',
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 15 },
        },
        pickupLocation: 'Victoria Island, Lagos',
        deliveryLocation: 'Ikoyi, Lagos',
        estimatedDelivery: '2024-03-15T18:00:00Z',
        price: 2500,
        createdAt: '2024-03-15T12:00:00Z',
      },
      {
        id: '2',
        orderNumber: 'DEL-002',
        status: 'in_transit' as const,
        client: {
          id: '5',
          fullName: 'Emma Davis',
          phone: '+1234567893',
          address: '456 Oak Avenue, Abuja, Nigeria',
        },
        deliveryPartner: {
          id: '3',
          fullName: 'Sarah Johnson',
          phone: '+1234567892',
          vehicle: 'Motorcycle',
        },
        package: {
          description: 'Food Delivery',
          weight: 1.2,
          dimensions: { length: 25, width: 25, height: 10 },
        },
        pickupLocation: 'Central Market, Abuja',
        deliveryLocation: 'Gwarimpa, Abuja',
        estimatedDelivery: '2024-03-15T17:30:00Z',
        price: 1500,
        createdAt: '2024-03-15T13:30:00Z',
      },
    ],
    reviews: [
      {
        id: '1',
        userId: '1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Excellent service! Very professional and knowledgeable. Fixed my electrical issues quickly and efficiently.',
        serviceType: 'Electrical',
        date: '2024-02-20',
        helpful: 12,
      },
      {
        id: '2',
        userId: '5',
        userName: 'Emma Davis',
        rating: 4,
        comment: 'Good work overall. Arrived on time and completed the job as expected. Would recommend.',
        serviceType: 'Plumbing',
        date: '2024-02-18',
        helpful: 8,
      },
    ],
    chats: [
      {
        id: '1',
        participants: [
          {
            id: '1',
            fullName: 'John Doe',
            avatar: 'https://picsum.photos/seed/user1/200/200',
            isOnline: true,
          },
          {
            id: '2',
            fullName: 'Mike Wilson',
            avatar: 'https://picsum.photos/seed/user2/200/200',
            isOnline: false,
            lastSeen: '2024-03-15T14:30:00Z',
          },
        ],
        messages: [
          {
            id: '1',
            senderId: '1',
            content: 'Hi, I need help with electrical wiring',
            type: 'text' as const,
            timestamp: '2024-03-15T09:00:00Z',
            isRead: true,
          },
          {
            id: '2',
            senderId: '2',
            content: 'Hello! I can help you with that. What specific electrical work do you need?',
            type: 'text' as const,
            timestamp: '2024-03-15T09:05:00Z',
            isRead: true,
          },
        ],
        lastMessage: 'Hello! I can help you with that. What specific electrical work do you need?',
        lastMessageTime: '2024-03-15T09:05:00Z',
        unreadCount: 0,
      },
    ],
  };

  const toggleMockMode = () => {
    setIsMockMode(!isMockMode);
  };

  const contextValue: MockDataContextType = {
    isMockMode,
    toggleMockMode,
    mockData,
    apiService: MockApiService,
    currentUser,
    setCurrentUser,
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
          <View style={[styles.modalContent, { backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: primaryTextColor }]}>
              Mock Data Settings
            </Text>
            
            <Text style={[styles.modalText, { color: primaryTextColor }]}>
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

            {/* Quick Login Options */}
            <View style={styles.quickLoginSection}>
              <Text style={[styles.sectionTitle, { color: primaryTextColor }]}>
                Quick Login (Mock Mode Only)
              </Text>
              
              {mockData.users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.userButton,
                    { backgroundColor: primaryColor + '20', borderColor: primaryColor },
                  ]}
                  onPress={() => {
                    setCurrentUser(user);
                    setShowModal(false);
                  }}
                >
                  <Text style={[styles.userButtonText, { color: primaryColor }]}>
                    {user.fullName} ({user.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: primaryColor }]}
              onPress={() => setShowModal(false)}
            >

  export default MockDataProvider;
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
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
  quickLoginSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  userButtonText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default MockDataProvider;
