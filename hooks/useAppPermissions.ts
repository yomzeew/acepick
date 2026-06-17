import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

export const useAppPermissions = () => {
  useEffect(() => {
    const requestAllPermissions = async () => {
      try {
        // 1. Notification permissions
        const { status: notifStatus } = await Notifications.getPermissionsAsync();
        if (notifStatus !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }

        // 2. Location (foreground) permissions
        const { status: locStatus } = await Location.getForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          await Location.requestForegroundPermissionsAsync();
        }

        // 3. Media library permissions
        const { status: mediaStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (mediaStatus !== 'granted') {
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        }

        // 4. Microphone permissions (for calls & recording)
        const { status: micStatus } = await Audio.getPermissionsAsync();
        if (micStatus !== 'granted') {
          await Audio.requestPermissionsAsync();
        }

        // 5. Camera permissions (for video calls & image capture)
        const { status: camStatus } = await ImagePicker.getCameraPermissionsAsync();
        if (camStatus !== 'granted') {
          await ImagePicker.requestCameraPermissionsAsync();
        }
      } catch (error) {
        console.warn('Error requesting permissions on launch:', error);
      }
    };

    requestAllPermissions();
  }, []);
};
