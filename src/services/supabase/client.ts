/**
 * Supabase Client
 * Initializes Supabase client with secure storage adapter
 */

import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { secureStorage } from '../storage/secureStorage';
import { SERVICES_CONFIG } from '../../config/services.config';

// Debug: Log config values (remove in production)
console.log('Supabase Config:', {
  url: SERVICES_CONFIG.SUPABASE_URL ? `${SERVICES_CONFIG.SUPABASE_URL.substring(0, 20)}...` : 'EMPTY',
  key: SERVICES_CONFIG.SUPABASE_ANON_KEY ? `${SERVICES_CONFIG.SUPABASE_ANON_KEY.substring(0, 20)}...` : 'EMPTY',
  useSupabase: SERVICES_CONFIG.USE_SUPABASE,
});

// Validate config
if (!SERVICES_CONFIG.SUPABASE_URL || !SERVICES_CONFIG.SUPABASE_ANON_KEY) {
  console.error('❌ Supabase config is missing! Check .env file and react-native-config setup.');
}

// Custom storage adapter using secureStorage
// Supabase will use this for ALL auth storage (no manual storage needed)
const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    // Supabase uses keys like 'supabase.auth.token'
    // Map to secureStorage with prefix
    return await secureStorage.getItem(`supabase_${key}`);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await secureStorage.setItem(`supabase_${key}`, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await secureStorage.removeItem(`supabase_${key}`);
  },
};

export const supabaseClient = createClient(
  SERVICES_CONFIG.SUPABASE_URL,
  SERVICES_CONFIG.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

