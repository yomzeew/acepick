import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../utilizes/endpoints';
import { Notification, FetchNotificationsParams } from '../types/notificationTypes';

const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ: (id: number) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  DELETE: (id: number) => `/notifications/${id}`,
  DELETE_ALL: '/notifications',
};

class NotificationService {
  private async getAuthHeaders() {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchNotifications(params: FetchNotificationsParams = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unreadOnly: 'true' }),
    });

    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.LIST}?${queryParams}`,
        { headers }
      );
      return response.data.data || response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to fetch notifications';
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.UNREAD_COUNT}`,
        { headers }
      );
      return response.data.data?.count || response.data.count || 0;
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to fetch unread count';
    }
  }

  async markAsRead(notificationId: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.post(
        `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.MARK_READ(notificationId)}`,
        {},
        { headers }
      );
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to mark notification as read';
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.post(
        `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.MARK_ALL_READ}`,
        {},
        { headers }
      );
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to mark all notifications as read';
    }
  }

  async deleteNotification(notificationId: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.delete(
        `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.DELETE(notificationId)}`,
        { headers }
      );
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to delete notification';
    }
  }

  async deleteAllNotifications(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.delete(
        `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.DELETE_ALL}`,
        { headers }
      );
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to delete all notifications';
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
