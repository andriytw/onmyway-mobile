/**
 * Services Configuration
 * Конфігурація для перемикання між моками та реальними API
 * Adapted for React Native with react-native-config
 */

import Config from 'react-native-config';

// Debug: Log raw config values
// #region agent log
const mapboxTokenRaw = Config.MAPBOX_PUBLIC_TOKEN;
const mapboxTokenLength = mapboxTokenRaw?.length || 0;
const useMapboxRaw = Config.USE_MAPBOX;
fetch('http://127.0.0.1:7244/ingest/ff7bf454-fc01-4563-9534-5b30e051357c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'services.config.ts:11',message:'Config module loaded',data:{hasMapboxToken:!!mapboxTokenRaw,tokenLength:mapboxTokenLength,useMapboxRaw:useMapboxRaw,useMapboxType:typeof useMapboxRaw},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4',runId:'run1'})}).catch(()=>{});
// #endregion
console.log('Raw Config values:', {
  USE_SUPABASE: Config.USE_SUPABASE,
  SUPABASE_URL: Config.SUPABASE_URL,
  SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY ? `${Config.SUPABASE_ANON_KEY.substring(0, 30)}...` : 'UNDEFINED',
  MAPBOX_PUBLIC_TOKEN: mapboxTokenRaw ? `${mapboxTokenRaw.substring(0, 30)}...` : 'UNDEFINED',
  USE_MAPBOX: useMapboxRaw,
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
  MAPBOX_PUBLIC_TOKEN: (() => {
    // #region agent log
    const token = Config.MAPBOX_PUBLIC_TOKEN || '';
    const finalToken = token;
    fetch('http://127.0.0.1:7244/ingest/ff7bf454-fc01-4563-9534-5b30e051357c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'services.config.ts:31',message:'MAPBOX_PUBLIC_TOKEN computed',data:{rawLength:mapboxTokenRaw?.length||0,finalLength:finalToken.length,isEmpty:!finalToken},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4',runId:'run1'})}).catch(()=>{});
    // #endregion
    return finalToken;
  })(),
  USE_MAPBOX: (() => {
    // #region agent log
    const useMapbox = Config.USE_MAPBOX === 'true';
    fetch('http://127.0.0.1:7244/ingest/ff7bf454-fc01-4563-9534-5b30e051357c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'services.config.ts:32',message:'USE_MAPBOX computed',data:{rawValue:useMapboxRaw,finalValue:useMapbox,isTrue:useMapbox},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4',runId:'run1'})}).catch(()=>{});
    // #endregion
    return useMapbox;
  })(),
  
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



