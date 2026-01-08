/**
 * Secure Storage Adapter for React Native
 * Replaces localStorage with react-native-keychain
 * Supports both legacy auth_token and Supabase keys
 * 
 * Security: All sensitive keys (auth_token, supabase_*) are stored in Keychain
 * Non-sensitive app keys are stored in AsyncStorage
 */

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const SUPABASE_PREFIX = 'supabase_';

// Check if key should be stored in Keychain (most secure)
const isKeychainKey = (key: string): boolean => {
  return key === TOKEN_KEY || key.startsWith(SUPABASE_PREFIX);
};

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (isKeychainKey(key)) {
      // Store sensitive keys securely in Keychain
      if (key === TOKEN_KEY) {
        // Legacy auth_token: use generic password
        await Keychain.setGenericPassword(key, value);
      } else {
        // Supabase keys: use generic password with service identifier
        // This allows multiple Supabase keys to be stored separately
        await Keychain.setGenericPassword(key, value, { service: key });
      }
    } else {
      // For non-sensitive keys, use AsyncStorage
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (isKeychainKey(key)) {
      if (key === TOKEN_KEY) {
        // Legacy auth_token: use generic password
        const credentials = await Keychain.getGenericPassword();
        return credentials ? credentials.password : null;
      } else {
        // Supabase keys: retrieve using generic password with service
        const credentials = await Keychain.getGenericPassword({ service: key });
        return credentials ? credentials.password : null;
      }
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isKeychainKey(key)) {
      if (key === TOKEN_KEY) {
        // Legacy auth_token: reset generic password
        await Keychain.resetGenericPassword();
      } else {
        // Supabase keys: reset using service identifier
        await Keychain.resetGenericPassword({ service: key });
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};



