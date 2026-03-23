import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    console.log('🔐 Requesting notification permissions...');
    
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('📋 Permission request result:', status);
    
    if (status === 'granted') {
      console.log('✅ Notification permissions granted');
      return true;
    } else {
      console.warn('❌ Notification permissions denied');
      return false;
    }
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
}

export async function checkNotificationPermissions(): Promise<string> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    console.log('📋 Current notification permission status:', status);
    return status;
  } catch (error) {
    console.error('❌ Error checking notification permissions:', error);
    return 'undetermined';
  }
}

export async function registerNotificationCategories() {
  try {
    await Notifications.setNotificationCategoryAsync('INCOMING_CALL', [
      { identifier: 'PICK_UP', buttonTitle: 'Pick Up', options: { opensAppToForeground: true } },
      { identifier: 'REJECT', buttonTitle: 'Reject', options: { opensAppToForeground: false, isDestructive: true } },
    ]);
    await Notifications.setNotificationCategoryAsync('NEW_JOB', [
      { identifier: 'VIEW_JOB', buttonTitle: 'View', options: { opensAppToForeground: true } },
    ]);
    await Notifications.setNotificationCategoryAsync('NEW_ORDER', [
      { identifier: 'VIEW_ORDER', buttonTitle: 'View', options: { opensAppToForeground: true } },
    ]);
    console.log('✅ Notification categories registered');
  } catch (error) {
    console.error('❌ Error registering notification categories:', error);
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  try {
    let token: string | undefined;

    console.log('🔔 Starting push notification registration...');

    // Set up Android notification channels
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      // High-priority channel for incoming calls
      await Notifications.setNotificationChannelAsync('calls', {
        name: 'Incoming Calls',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500, 200, 500],
        lightColor: '#22C55E',
        sound: 'ringtone.mp3',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
      console.log('✅ Android notification channels set up');
    }

    // Register notification categories with action buttons
    await registerNotificationCategories();

    // Check if running on physical device
    // if (!Device.isDevice) {
    //   console.warn('⚠️ Must use physical device for Push Notifications');
    //   console.warn('⚠️ Running in simulator - push notifications will not work');
    //   return undefined;
    // }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log('📋 Current notification permission status:', existingStatus);

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      console.log('🔐 Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('📋 Permission request result:', status);
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Failed to get push token for push notification!');
      console.warn('❌ Permission status:', finalStatus);
      return undefined;
    }

    console.log('✅ Notification permissions granted');

    // Get Expo push token with projectId
    const pushTokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: 'a326550b-b6a8-4184-acd5-8cc999a18c4a',
    });
    token = pushTokenResponse.data;

    console.log('🎯 Push token obtained successfully:', token);
    return token;
  } catch (error: any) {
    console.error('❌ Error registering for push notifications:', error?.message || error);
    if (error?.message?.includes('FirebaseApp') || error?.message?.includes('Firebase')) {
      console.warn('⚠️ Firebase not configured — rebuild with EAS to include google-services.json');
    }
    return undefined;
  }
}

export function setupNotificationListeners() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        // Handle foreground notification
        console.log('Notification Received:', notification);
      }
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        // Handle user tap on notification
        console.log('Notification Response:', response);
      }
    );

    return { notificationListener, responseListener };
  } catch (error) {
    console.error('Error setting up notification listeners:', error);
    return { notificationListener: null, responseListener: null };
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> {
  try {
    const isCall = data?.type === 'call';
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        ...(Platform.OS === 'android' && isCall ? { channelId: 'calls' } : {}),
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
    throw new Error('Failed to send local notification');
  }
}

/**
 * Check if a notification is a call notification based on its data payload.
 */
export function isCallNotification(notification: Notifications.Notification): boolean {
  return notification?.request?.content?.data?.type === 'call';
}

/**
 * Extract call data from a notification.
 */
export function getCallDataFromNotification(notification: Notifications.Notification | Notifications.NotificationResponse) {
  const data = 'notification' in notification
    ? notification.notification.request.content.data
    : notification.request.content.data;
  if (data?.type !== 'call') return null;
  return {
    callType: data.callType as 'voice' | 'video',
    callerId: data.callerId as string,
    callerName: data.callerName as string,
    roomName: data.roomName as string | undefined,
  };
}
