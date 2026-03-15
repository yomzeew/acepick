// hooks/useSecureAuth.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';
const REMEMBER_EMAIL_KEY = 'rememberEmail';
const REMEMBER_PASSWORD_KEY = 'rememberPassword';
const REMEMBER_ME_KEY = 'rememberMe';

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

  return {
    saveAuthData,
    getAuthData,
    deleteAuthData,
    saveRememberedCredentials,
    getRememberedCredentials,
  };
};
 