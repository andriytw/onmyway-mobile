/**
 * Secure Storage Adapter for React Native
 * Replaces localStorage with react-native-keychain
 */

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (key === TOKEN_KEY) {
      // Store auth token securely in Keychain
      await Keychain.setGenericPassword(key, value);
    } else {
      // For other keys, use AsyncStorage (less sensitive)
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (key === TOKEN_KEY) {
      const credentials = await Keychain.getGenericPassword();
      return credentials ? credentials.password : null;
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (key === TOKEN_KEY) {
      await Keychain.resetGenericPassword();
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};



