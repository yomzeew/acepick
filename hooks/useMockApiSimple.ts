import { useState, useEffect, useCallback } from 'react';
import MockDataService, { MockUser, MockJob, MockDelivery, MockReview, MockChat } from '../services/mockDataService';

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

// Mock API service that replaces real API calls
export class MockApiService {
  // Authentication
  static async login(email: string, password: string) {
    return await MockDataService.login(email, password);
  }

  static async register(userData: any) {
    return await MockDataService.register(userData);
  }

  // Jobs
  static async getJobs(filters?: any) {
    return await MockDataService.getJobs(filters);
  }

  static async getJobById(id: string) {
    return await MockDataService.getJobById(id);
  }

  static async createJob(jobData: any) {
    return await MockDataService.createJob(jobData);
  }

  // Deliveries
  static async getDeliveries(status?: string) {
    return await MockDataService.getDeliveries(status);
  }

  static async getDeliveryById(id: string) {
    return await MockDataService.getDeliveryById(id);
  }

  // Reviews
  static async getReviews(userId?: string) {
    return await MockDataService.getReviews(userId);
  }

  static async createReview(reviewData: any) {
    return await MockDataService.createReview(reviewData);
  }

  // Chat
  static async getChats(userId: string) {
    return await MockDataService.getChats(userId);
  }

  static async getChatById(chatId: string) {
    return await MockDataService.getChatById(chatId);
  }

  static async sendMessage(chatId: string, message: any) {
    return await MockDataService.sendMessage(chatId, message);
  }

  // Wallet
  static async getWallet(userId: string) {
    return await MockDataService.getWallet(userId);
  }

  static async fundWallet(userId: string, amount: number) {
    return await MockDataService.fundWallet(userId, amount);
  }

  // Profile
  static async updateProfile(userId: string, profileData: any) {
    return await MockDataService.updateProfile(userId, profileData);
  }

  // Notifications
  static async getNotifications(userId: string) {
    return await MockDataService.getNotifications(userId);
  }

  // Search
  static async searchProfessionals(query: string, category?: string) {
    return await MockDataService.searchProfessionals(query, category);
  }

  // FAQ
  static async getFAQs() {
    return await MockDataService.getFAQs();
  }

  // Legal Documents
  static async getLegalDocuments() {
    return await MockDataService.getLegalDocuments();
  }

  // Additional mock methods for existing services
  static async getAllJobs(token: string, query?: string) {
    return await MockDataService.getJobs();
  }

  static async riderOrdersFn(status?: string) {
    return await MockDataService.getDeliveries(status);
  }

  static async ratingGiveFn(data: any) {
    return await MockDataService.createReview(data);
  }

  static async SaveTokenFunction(fcmToken: string) {
    return { success: true, message: 'Token saved successfully' };
  }

  static async uploadFile(file: any) {
    return { success: true, url: 'https://picsum.photos/seed/upload/400/300' };
  }

  static async getArtisanListFn(token: string, query: string) {
    const professionals = await MockDataService.searchProfessionals(query || '');
    return { success: true, data: professionals.data };
  }
}

// Hook to provide mock API service
export const useMockApiService = () => {
  const { isServerDown, useMockData } = useMockApi();
  
  return {
    isServerDown,
    useMockData,
    apiService: useMockData ? MockApiService : null,
  };
};

export default useMockApi;
