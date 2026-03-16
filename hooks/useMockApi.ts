import { useState, useEffect, useCallback } from 'react';
import MockDataService, { MockUser, MockJob, MockDelivery, MockReview, MockChat, mockUsers, mockJobs, mockDeliveries, mockReviews, mockChats } from '../services/mockDataService';

interface MockApiState {
  isServerDown: boolean;
  useMockData: boolean;
  lastServerCheck: Date | null;
}

// Hook to detect server status and switch to mock data
export const useMockApi = () => {
  const [state, setState] = useState<MockApiState>({
    isServerDown: false,
    useMockData: false,
    lastServerCheck: null,
  });

  const checkServerStatus = useCallback(async () => {
    try {
      // Try to ping the server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setState(prev => ({
          ...prev,
          isServerDown: false,
          useMockData: false,
          lastServerCheck: new Date(),
        }));
        return true;
      }
    } catch (error) {
      // Server is down, switch to mock data
      setState(prev => ({
        ...prev,
        isServerDown: true,
        useMockData: true,
        lastServerCheck: new Date(),
      }));
      return false;
    }
  }, []);

  // Check server status on mount and periodically
  useEffect(() => {
    checkServerStatus();
    
    const interval = setInterval(() => {
      checkServerStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkServerStatus]);

  const forceMockMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isServerDown: true,
      useMockData: true,
      lastServerCheck: new Date(),
    }));
  }, []);

  const disableMockMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isServerDown: false,
      useMockData: false,
      lastServerCheck: new Date(),
    }));
  }, []);

  return {
    ...state,
    checkServerStatus,
    forceMockMode,
    disableMockMode,
  };
};

// Mock data hook
export const useMockDataValues = () => {
  return {
    users: mockUsers || [],
    jobs: mockJobs || [],
    deliveries: mockDeliveries || [],
    reviews: mockReviews || [],
    chats: mockChats || [],
    service: MockDataService,
  };
};

// Mock API wrapper for existing services
export const createMockApiWrapper = (originalService: any) => {
  return new Proxy(originalService, {
    get(target, prop) {
      const originalMethod = target[prop];
      
      if (typeof originalMethod === 'function') {
        return async (...args: any[]) => {
          try {
            // Try original service first
            return await originalMethod.apply(target, args);
          } catch (error) {
            // If original service fails, use mock data
            console.log('Server error, using mock data:', error);
            
            // Map method names to mock service methods
            const mockMethodMap: Record<string, keyof typeof MockDataService> = {
              'login': 'login',
              'register': 'register',
              'getJobs': 'getJobs',
              'getJobById': 'getJobById',
              'createJob': 'createJob',
              'getDeliveries': 'getDeliveries',
              'getReviews': 'getReviews',
              'createReview': 'createReview',
              'getChats': 'getChats',
              'sendMessage': 'sendMessage',
              'getWallet': 'getWallet',
              'fundWallet': 'fundWallet',
              'updateProfile': 'updateProfile',
              'getNotifications': 'getNotifications',
              'searchProfessionals': 'searchProfessionals',
            };
            
            const mockMethodName = mockMethodMap[prop as string];
            if (mockMethodName) {
              const mockMethod = MockDataService[mockMethodName];
              if (typeof mockMethod === 'function') {
                return await (mockMethod as any).apply(MockDataService, args);
              }
            }
            
            // If no mock method found, throw the original error
            throw error;
          }
        };
      }
      
      return originalMethod;
    },
  });
};

export default useMockApi;
