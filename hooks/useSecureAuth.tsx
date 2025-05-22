// hooks/useSecureAuth.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

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

  return {
    saveAuthData,
    getAuthData,
    deleteAuthData,
  };
};
