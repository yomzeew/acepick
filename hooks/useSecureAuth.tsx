// hooks/useSecureAuth.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';
const REMEMBER_EMAIL_KEY = 'rememberEmail';
const REMEMBER_PASSWORD_KEY = 'rememberPassword';
const REMEMBER_ME_KEY = 'rememberMe';
const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';

// Lazy-load LocalAuthentication so the app doesn't crash in Expo Go
// (ExpoLocalAuthentication is a custom native module absent from the Go client)
let LA: typeof import('expo-local-authentication') | null = null;
try {
  LA = require('expo-local-authentication');
} catch {
  // Running in Expo Go or native module not yet linked — biometrics unavailable
  LA = null;
}

export const useSecureAuth = () => {
  const saveAuthData = async (user: any, token: string) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  };

  const getAuthData = async () => {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (userData && token) {
      return { user: JSON.parse(userData), token };
    }
    return null;
  };

  const deleteAuthData = async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  const saveRememberedCredentials = async (email: string, password: string, remember: boolean) => {
    if (remember) {
      await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email);
      await AsyncStorage.setItem(REMEMBER_PASSWORD_KEY, password);
      await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
      await AsyncStorage.removeItem(REMEMBER_PASSWORD_KEY);
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    }
  };

  const getRememberedCredentials = async () => {
    const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    if (rememberMe === 'true') {
      const email = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
      const password = await AsyncStorage.getItem(REMEMBER_PASSWORD_KEY);
      return { email: email || '', password: password || '', rememberMe: true };
    }
    return { email: '', password: '', rememberMe: false };
  };

  // ── Biometric helpers ────────────────────────────────────────────────────────
  // All helpers return safe no-op values when the native module is unavailable.

  /** Returns true if the device hardware supports biometrics AND at least one is enrolled */
  const isBiometricAvailable = async (): Promise<boolean> => {
    if (!LA) return false;
    try {
      const compatible = await LA.hasHardwareAsync();
      if (!compatible) return false;
      const enrolled = await LA.isEnrolledAsync();
      return enrolled;
    } catch {
      return false;
    }
  };

  /** Which biometric type is available (fingerprint / face / iris) */
  const getBiometricType = async (): Promise<'fingerprint' | 'face' | 'iris' | null> => {
    if (!LA) return null;
    try {
      const types = await LA.supportedAuthenticationTypesAsync();
      if (types.includes(LA.AuthenticationType.FACIAL_RECOGNITION)) return 'face';
      if (types.includes(LA.AuthenticationType.FINGERPRINT)) return 'fingerprint';
      if (types.includes(LA.AuthenticationType.IRIS)) return 'iris';
      return null;
    } catch {
      return null;
    }
  };

  /** Prompt the OS biometric dialog. Returns true if the user authenticated. */
  const authenticateWithBiometrics = async (promptMessage?: string): Promise<boolean> => {
    if (!LA) return false;
    try {
      const result = await LA.authenticateAsync({
        promptMessage: promptMessage ?? 'Sign in to Acepick',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch {
      return false;
    }
  };

  /** Whether the user has opted-in to biometric login */
  const isBiometricEnabled = async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  };

  const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
    try {
      if (enabled) {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      } else {
        await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      }
    } catch {
      // ignore
    }
  };

  return {
    saveAuthData,
    getAuthData,
    deleteAuthData,
    saveRememberedCredentials,
    getRememberedCredentials,
    isBiometricAvailable,
    getBiometricType,
    authenticateWithBiometrics,
    isBiometricEnabled,
    setBiometricEnabled,
  };
};
