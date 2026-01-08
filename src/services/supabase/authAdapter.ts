/**
 * Supabase Auth Adapter
 * Implements AuthService interface using Supabase
 * Uses Supabase's built-in session management (no manual storage)
 */

import { supabaseClient } from './client';
import { User, LoginCredentials, RegisterData, AuthResponse, UserRole } from '../../types/auth.types';
import { AuthApiError } from '@supabase/supabase-js';

export class SupabaseAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.user || !data.session) {
      throw new Error('Login failed');
    }

    // Session is automatically stored via auth.storage (customStorage)
    // NO manual storage needed!

    const user = await this.mapSupabaseUserToUser(data.user);
    
    return {
      user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const { data: authData, error } = await supabaseClient.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    if (!authData.user) {
      throw new Error('Registration failed: user not created');
    }

    // If email confirmation is enabled, session might be null
    // In that case, we still return user but without session
    // User will need to confirm email and then login
    
    // Wait a bit for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = await this.mapSupabaseUserToUser(authData.user);
    
    // If session exists, store it automatically via auth.storage
    if (authData.session) {
      return {
        user,
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      };
    } else {
      // Email confirmation required - return user without session
      // User will need to confirm email first
      return {
        user,
        token: '', // Empty token - user needs to confirm email
        refreshToken: '',
      };
    }
  }

  async logout(): Promise<void> {
    // This clears session from auth.storage automatically
    await supabaseClient.auth.signOut();
  }

  async getCurrentUser(): Promise<User> {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
      throw new Error('Not authenticated');
    }

    return await this.mapSupabaseUserToUser(user);
  }

  async switchRole(role: UserRole): Promise<User> {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabaseClient
      .from('profiles')
      .update({ role })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return await this.mapSupabaseUserToUser(user);
  }

  // Restore session using Supabase's built-in method
  async restoreSession(): Promise<User | null> {
    try {
      // Use Supabase's getSession() - it reads from auth.storage automatically
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        // Handle AuthApiError gracefully (user deleted or invalid session)
        if (error instanceof AuthApiError) {
          console.log('Session invalid (user deleted or expired)');
        } else {
          console.log('getSession error:', error.message);
        }
        // Clear invalid session
        try {
          await supabaseClient.auth.signOut();
        } catch (signOutError) {
          // Ignore signOut errors
        }
        return null;
      }
      
      if (!session) {
        console.log('No session found');
        return null;
      }

      // Get user from session
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !user) {
        // Handle AuthApiError gracefully
        if (userError instanceof AuthApiError) {
          console.log('User not found (deleted or invalid)');
        } else {
          console.log('getUser error:', userError?.message || 'No user');
        }
        // Clear invalid session
        try {
          await supabaseClient.auth.signOut();
        } catch (signOutError) {
          // Ignore signOut errors
        }
        return null;
      }

      // Try to get profile - if it doesn't exist, user was deleted
      try {
        const userWithProfile = await this.mapSupabaseUserToUser(user);
        return userWithProfile;
      } catch (profileError) {
        console.log('Profile not found or error:', profileError);
        // If profile doesn't exist, clear session (user was deleted from DB)
        try {
          await supabaseClient.auth.signOut();
        } catch (signOutError) {
          // Ignore signOut errors
        }
        return null;
      }
    } catch (error) {
      // Handle all errors gracefully - this is NOT a fatal error
      if (error instanceof AuthApiError) {
        console.log('Session restore failed (user deleted or invalid)');
      } else {
        console.error('restoreSession error:', error);
      }
      // Clear session on any error
      try {
        await supabaseClient.auth.signOut();
      } catch (signOutError) {
        // Ignore signOut errors
      }
      return null;
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.mapSupabaseUserToUser(session.user);
        callback(user);
      } else {
        callback(null);
      }
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }

  private async mapSupabaseUserToUser(supabaseUser: any): Promise<User> {
    // Fetch profile data (minimal - only email + role for Phase 2.1)
    // Profile might not exist yet if trigger hasn't run, so handle gracefully
    let profile = null;
    try {
      // Add timeout to prevent hanging
      const profilePromise = supabaseClient
        .from('profiles')
        .select('email, role')
        .eq('id', supabaseUser.id)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 2000);
      });

      const { data } = await Promise.race([profilePromise, timeoutPromise]) as any;
      profile = data;
    } catch (error) {
      // Profile might not exist yet or timeout - that's OK, we'll use user email
      console.log('Profile not found or timeout, using user email:', error instanceof Error ? error.message : 'Unknown error');
    }

    return {
      id: supabaseUser.id,
      email: profile?.email || supabaseUser.email!,
      phone: '', // Not in Phase 2.1
      firstName: '', // Not in Phase 2.1
      lastName: '', // Not in Phase 2.1
      avatar: undefined, // Not in Phase 2.1
      role: profile?.role ? (profile.role as UserRole) : null,
      isVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: supabaseUser.created_at,
    };
  }
}

