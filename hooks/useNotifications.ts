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

  // Set up notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && !fcmToken) {
      // Register for push notifications
      registerForPushNotificationsAsync().then(async (token) => {
        console.log('🔔 Push token registered:', token);
        if (token) {
          dispatch(setFcmToken(token));
        }
      });
    }
  }, [isAuthenticated, fcmToken, dispatch]);

  // Save token to backend when we have both token and auth token
  useEffect(() => {
    if (isAuthenticated && fcmToken && authToken) {
      SaveTokenFunction(fcmToken)
        .then(() => {
          console.log('✅ Push token saved to backend');
        })
        .catch((err) => {
          console.error('❌ Failed to save push token:', err);
        });
    }
  }, [isAuthenticated, fcmToken, authToken]);

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
