import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    const pushTokenResponse = await Notifications.getExpoPushTokenAsync();
    token = pushTokenResponse.data;
    console.log('Expo Push Token:', token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export function setupNotificationListeners() {
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
      console.log('Notification Received:', notification);
      // Handle foreground notification
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response: Notifications.NotificationResponse) => {
      console.log('Notification Response:', response);
      // Handle user tap on notification
    }
  );

  return { notificationListener, responseListener };
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Send immediately
  });
}
