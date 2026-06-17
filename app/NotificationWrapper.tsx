import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { RootState } from '../redux/store';
import {
  registerForPushNotificationsAsync,
  getCallDataFromNotification,
} from '../services/notificationServices';
import { SaveTokenFunction } from '../services/userService';
import { setFcmToken } from '../redux/slices/authSlice';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification?.request?.content?.data;
    const isCall = data?.type === 'call';
    return {
      shouldPlaySound: !isCall, // Call sounds are handled by WebRTC ringtone
      shouldSetBadge: false,
      shouldShowBanner: !isCall, // Don't show banner for calls — handled by IncomingCallModal
      shouldShowList: !isCall, // Don't show call notifications in list — we handle them in-app
    };
  },
});

export const NotificationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const fcmToken = useSelector((state: RootState) => state.auth.user?.fcmToken);
  const authToken = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();

  // Centralized notification tap/action handler
  const handleNotificationNavigation = (response: Notifications.NotificationResponse) => {
    const actionId = response.actionIdentifier;
    const data = response.notification.request.content.data;

    // ── Call action buttons ──
    const callData = getCallDataFromNotification(response);
    console.log('📞 Call notification data:', { callData, actionId, data });
    if (callData) {
      // REJECT action — dismiss without opening the app
      if (actionId === 'REJECT') {
        console.log('📵 Call rejected via notification action');
        return;
      }
      // PICK_UP action or default tap — navigate to call screen
      const route = callData.callType === 'video'
        ? `/(Authenticated)/(chatcallmessage)/videocall/${callData.callerId}`
        : `/(Authenticated)/(chatcallmessage)/callchat/${callData.callerId}`;
      console.log('📞 Navigating to call route:', { route, callType: callData.callType, callerId: callData.callerId });
      setTimeout(() => router.push(route as any), 500);
      return;
    }

    // ── Job action buttons ──
    if (data?.type === 'JOB' || data?.type === 'job' || data?.type === 'JOB_CREATED' || data?.type === 'JOB_RESPONSE') {
      // VIEW_JOB action or default tap
      setTimeout(() => router.push('/(Authenticated)/(jobs)/notificationLayout' as any), 500);
      return;
    }

    // ── Order action buttons ──
    if (data?.type === 'ORDER' || data?.type === 'order' || data?.type === 'DELIVERY' || data?.type === 'delivery') {
      // VIEW_ORDER action or default tap
      setTimeout(() => router.push('/(Authenticated)/(dashboard)/marketlayout' as any), 500);
      return;
    }

    // Payment notifications — navigate to home (wallet is accessible from there)
    if (data?.type === 'PAYMENT' || data?.type === 'payment') {
      setTimeout(() => router.push('/(Authenticated)/(dashboard)/homelayout' as any), 500);
      return;
    }

    // Chat notifications — navigate to chat with the sender
    if (data?.type === 'chat' && data?.senderId) {
      const route = `/mainchat/${JSON.stringify({ userId: data.senderId })}`;
      setTimeout(() => router.push(route as any), 500);
      return;
    }
  };

  // Always re-register push token on every login (token can change between sessions)
  useEffect(() => {
    if (isAuthenticated && authToken) {
      console.log('Starting push token registration...');
      registerForPushNotificationsAsync().then(async (token) => {
        console.log('Push token registered:', token);
        if (token) {
          dispatch(setFcmToken(token));
          SaveTokenFunction(token)
            .then(() => console.log('Push token saved to backend'))
            .catch((err) => console.error('Failed to save push token:', err));
        } else {
          console.warn('Push token registration returned null - this is expected on simulator');
        }
      }).catch((err) => {
        console.error('Push token registration failed:', err);
        console.warn('This is normal when running on simulator or without Firebase configuration');
      });
    }
  }, [isAuthenticated, authToken]);

  // Set up notification listeners when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Foreground: when a notification arrives while the app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📩 Notification received (foreground):', notification.request.content.title);
        // Call notifications are handled by the socket-based IncomingCallModal
        // so we don't need to do anything extra here for foreground calls
      }
    );

    // Response: when user taps a notification (background / killed → app opens)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response.notification.request.content.title);
        handleNotificationNavigation(response);
      }
    );

    // Check if the app was opened from a killed state by a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        setTimeout(() => handleNotificationNavigation(response), 1000);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, router]);

  return <>{children}</>;
};

export default NotificationWrapper;
