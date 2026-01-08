/**
 * Driver Status Service
 * Handles driver online/offline status persistence
 */

import { SERVICES_CONFIG } from '../../config/services.config';
import { supabaseClient } from '../supabase/client';

/**
 * Sets driver online status in Supabase
 * Uses upsert to create or update driver_status row
 */
export const setDriverOnlineStatus = async (isOnline: boolean): Promise<void> => {
  if (!SERVICES_CONFIG.USE_SUPABASE) {
    // No-op if Supabase is not enabled
    return;
  }

  try {
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    // Upsert driver_status row
    const { error } = await supabaseClient
      .from('driver_status')
      .upsert(
        {
          driver_id: user.id,
          is_online: isOnline,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'driver_id',
        }
      );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Failed to set driver online status:', error);
    throw error;
  }
};


