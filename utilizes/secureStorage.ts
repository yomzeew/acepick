// src/utils/secureStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Storage } from 'redux-persist';

const encodeKey = (key: string) =>
  key.replace(/[^a-zA-Z0-9.\-_]/g, '_');

const secureStorage: Storage = {
  async setItem(key, value) {
    const safeKey = encodeKey(key);
    await AsyncStorage.setItem(safeKey, value);
    return value;
  },

  async getItem(key) {
    const safeKey = encodeKey(key);
    return await AsyncStorage.getItem(safeKey);
  },

  async removeItem(key) {
    const safeKey = encodeKey(key);
    await AsyncStorage.removeItem(safeKey);
  },
};

export default secureStorage;
