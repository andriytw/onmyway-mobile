/**
 * Services Configuration
 * Конфігурація для перемикання між моками та реальними API
 * Adapted for React Native with react-native-config
 */

import Config from 'react-native-config';

// Debug: Log raw config values
console.log('Raw Config values:', {
  USE_SUPABASE: Config.USE_SUPABASE,
  SUPABASE_URL: Config.SUPABASE_URL,
  SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY ? `${Config.SUPABASE_ANON_KEY.substring(0, 30)}...` : 'UNDEFINED',
});

export const SERVICES_CONFIG = {
  // Supabase Configuration
  USE_SUPABASE: Config.USE_SUPABASE === 'true' || false,
  SUPABASE_URL: Config.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY || '',
  
  // Використовувати моки замість реальних API
  USE_MOCK_API: Config.USE_MOCK_API === 'true' || !Config.API_URL,
  
  // API URL
  API_URL: Config.API_URL || 'http://localhost:3001/api',
  
  // Mapbox (Phase 2 ready)
  MAPBOX_PUBLIC_TOKEN: Config.MAPBOX_PUBLIC_TOKEN || '',
  USE_MAPBOX: Config.USE_MAPBOX === 'true',
  
  // Mapbox API endpoints (Phase 2)
  MAPBOX_DIRECTIONS_API: 'https://api.mapbox.com/directions/v5',
  MAPBOX_GEOCODING_API: 'https://api.mapbox.com/geocoding/v5',
  
  // Firebase (для push notifications)
  FIREBASE_KEY: Config.FIREBASE_KEY || '',
  USE_FIREBASE: Config.USE_FIREBASE === 'true',
  
  // Stripe (для платежів)
  STRIPE_KEY: Config.STRIPE_KEY || '',
  USE_STRIPE: Config.USE_STRIPE === 'true',
  
  // WebSocket
  WS_URL: Config.WS_URL || 'ws://localhost:3001',
  USE_WEBSOCKET: Config.USE_WEBSOCKET === 'true',
} as const;



