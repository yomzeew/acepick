import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  try {
    let token: string | undefined;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return undefined;
      }

      const pushTokenResponse = await Notifications.getExpoPushTokenAsync();
      token = pushTokenResponse.data;
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
    throw new Error('Failed to send local notification');
  }
}
