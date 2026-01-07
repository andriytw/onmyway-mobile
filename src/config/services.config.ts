/**
 * Services Configuration
 * Конфігурація для перемикання між моками та реальними API
 * Adapted for React Native
 */

export const SERVICES_CONFIG = {
  // Використовувати моки замість реальних API
  USE_MOCK_API: process.env.USE_MOCK_API === 'true' || !process.env.API_URL,
  
  // API URL
  API_URL: process.env.API_URL || 'http://localhost:3001/api',
  
  // Mapbox (Phase 2 ready)
  MAPBOX_PUBLIC_TOKEN: process.env.MAPBOX_PUBLIC_TOKEN || '',
  USE_MAPBOX: process.env.USE_MAPBOX === 'true',
  
  // Mapbox API endpoints (Phase 2)
  MAPBOX_DIRECTIONS_API: 'https://api.mapbox.com/directions/v5',
  MAPBOX_GEOCODING_API: 'https://api.mapbox.com/geocoding/v5',
  
  // Firebase (для push notifications)
  FIREBASE_KEY: process.env.FIREBASE_KEY || '',
  USE_FIREBASE: process.env.USE_FIREBASE === 'true',
  
  // Stripe (для платежів)
  STRIPE_KEY: process.env.STRIPE_KEY || '',
  USE_STRIPE: process.env.USE_STRIPE === 'true',
  
  // WebSocket
  WS_URL: process.env.WS_URL || 'ws://localhost:3001',
  USE_WEBSOCKET: process.env.USE_WEBSOCKET === 'true',
} as const;



