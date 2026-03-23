import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';
import { Notification, NotificationsState, FetchNotificationsParams, NotificationResponse } from '../../types/notificationTypes';

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  hasMore: true,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: FetchNotificationsParams = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.fetchNotifications(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      return count;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotificationAsync = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

export const deleteAllNotificationsAsync = createAsyncThunk(
  'notifications/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.deleteAllNotifications();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete all notifications');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.page = 1;
      state.totalPages = 1;
      state.hasMore = true;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification to the beginning of the list
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<{ id: number; updates: Partial<Notification> }>) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        const notification = state.notifications[index];
        const wasUnread = !notification.read;
        const isNowUnread = !updates.read;
        
        state.notifications[index] = { ...notification, ...updates };
        
        // Update unread count if read status changed
        if (wasUnread && isNowUnread) {
          state.unreadCount += 1;
        } else if (wasUnread && !isNowUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<NotificationResponse>) => {
        state.isLoading = false;
        const { notifications, total, unreadCount, page, totalPages } = action.payload;
        
        if (page === 1) {
          // First page - replace notifications
          state.notifications = notifications;
        } else {
          // Additional pages - append notifications
        }
        state.page = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark all as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      });

    // Delete notification
    builder
      .addCase(deleteNotificationAsync.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const index = state.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      })
      .addCase(deleteNotificationAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete all notifications
    builder
      .addCase(deleteAllNotificationsAsync.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.page = 1;
        state.hasMore = true;
      })
      .addCase(deleteAllNotificationsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetNotifications, addNotification, updateNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
