export type NotificationType = 'job' | 'order' | 'payment' | 'chat' | 'call' | 'voice_call' | 'video_call' | 'system' | 'profile';

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  pushSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}
