import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { RootState } from '../redux/store';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../services/notificationServices';
import { SaveTokenFunction } from '../services/userService';
import { setFcmToken } from '../redux/slices/authSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const fcmToken = useSelector((state: RootState) => state.auth.user?.fcmToken);
  const authToken = useSelector((state: RootState) => state.auth.token);

  // Always re-register push token on every login (token can change between sessions)
  useEffect(() => {
    if (isAuthenticated && authToken) {
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          console.log('Push token registered successfully:', token);
          dispatch(setFcmToken(token));
          SaveTokenFunction(token)
            .then(() => console.log('Push token saved to backend'))
            .catch((err) => console.error('Failed to save push token:', err));
        } else {
          console.warn('Push token registration failed - app will continue without push notifications');
          // Don't block the user experience if push notifications fail
          // The app will still work, just without push notifications
        }
      }).catch((err) => {
        console.error('Push notification registration error:', err);
        // Gracefully handle push notification failures
      });
    }
  }, [isAuthenticated, authToken]);

  // Set up notification listeners when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const { notificationListener: notifListener, responseListener: respListener } =
        setupNotificationListeners();

      notificationListener.current = notifListener;
      responseListener.current = respListener;

      return () => {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      };
    }
  }, [isAuthenticated]);

  return {
    isSupported: true,
  };
};
