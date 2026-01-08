/**
 * Auth Context
 * Контекст для аутентифікації та перемикання ролей
 * Adapted for React Native with secure storage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/auth.types';
import { authService } from '../services/auth/authService';
import { secureStorage } from '../services/storage/secureStorage';
import { SERVICES_CONFIG } from '../config/services.config';
import { SupabaseAuthService } from '../services/supabase/authAdapter';
import { AuthApiError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; phone: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Завантажуємо користувача при ініціалізації
  useEffect(() => {
    const loadUser = async () => {
      // Timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Load user timeout - forcing isLoading to false');
        setIsLoading(false);
        setUser(null);
      }, 5000); // 5 second timeout

      try {
        console.log('Loading user...', { useSupabase: SERVICES_CONFIG.USE_SUPABASE });
        
        // For Supabase: restore session using getSession()
        if (SERVICES_CONFIG.USE_SUPABASE) {
          try {
            const supabaseAuth = new SupabaseAuthService();
            // Add timeout to restoreSession
            const restorePromise = supabaseAuth.restoreSession();
            const timeoutPromise = new Promise<User | null>((resolve) => {
              setTimeout(() => resolve(null), 3000);
            });
            
            const restoredUser = await Promise.race([restorePromise, timeoutPromise]);
            console.log('Restored user:', restoredUser ? 'YES' : 'NO');
            if (restoredUser) {
              setUser(restoredUser);
              clearTimeout(timeoutId);
              setIsLoading(false);
              return;
            }
          } catch (supabaseError) {
            // Handle deleted user / invalid session gracefully
            // This is NOT a fatal error - just clear user and go to login
            if (supabaseError instanceof AuthApiError || 
                (supabaseError instanceof Error && supabaseError.message.includes('Not authenticated'))) {
              // User deleted or invalid session - this is normal
              console.log('Session invalid or user deleted - clearing session');
            } else {
              console.error('Supabase restore error:', supabaseError);
            }
            // Clear session if it exists
            try {
              if (SERVICES_CONFIG.USE_SUPABASE) {
                const supabaseAuth = new SupabaseAuthService();
                await supabaseAuth.logout();
              }
            } catch (logoutError) {
              // Ignore logout errors
            }
            // Continue to set user as null
          }
        }

        // For non-Supabase: check legacy token
        const token = await secureStorage.getItem('auth_token');
        if (token) {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Not authenticated is normal - just clear user
            // Don't log as error if it's just "Not authenticated"
            if (error instanceof Error && error.message !== 'Not authenticated') {
              console.error('Get current user error:', error);
            }
            setUser(null);
            // Clear invalid token
            await secureStorage.removeItem('auth_token');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Load user error:', error);
        // Користувач не авторизований - це нормально для MVP
        setUser(null);
      } finally {
        clearTimeout(timeoutId);
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Subscribe to Supabase auth state changes (only if using Supabase)
  useEffect(() => {
    if (!SERVICES_CONFIG.USE_SUPABASE) return;

    const supabaseAuth = new SupabaseAuthService();
    const unsubscribe = supabaseAuth.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Login attempt:', { email, useSupabase: SERVICES_CONFIG.USE_SUPABASE });
      const response = await authService.login({ email, password });
      console.log('Login success:', { user: response.user, hasRole: !!response.user.role });
      setUser(response.user);
      // Зберігаємо token в secure storage (only for non-Supabase)
      // Supabase stores session automatically via auth.storage
      if (!SERVICES_CONFIG.USE_SUPABASE) {
        await secureStorage.setItem('auth_token', response.token);
      }
      console.log('User set in context, should trigger navigation');
    } catch (error) {
      // Check if it's an invalid credentials error (user deleted or wrong password)
      const isInvalidCredentials = 
        error instanceof AuthApiError ||
        (error instanceof Error && (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('Invalid credentials') ||
          error.message.includes('Email not confirmed')
        ));
      
      if (isInvalidCredentials) {
        // This is expected - user deleted or wrong credentials
        // Don't log as error, just throw with clear message
        const errorMessage = error instanceof Error ? error.message : 'Invalid login credentials';
        console.log('Login failed - invalid credentials:', errorMessage);
        throw new Error('INVALID_CREDENTIALS');
      } else {
        console.error('Login error:', error);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; phone: string; firstName: string; lastName: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      console.log('Register response:', { user: response.user, hasToken: !!response.token });
      setUser(response.user);
      // Зберігаємо token в secure storage (only for non-Supabase)
      // Supabase stores session automatically via auth.storage
      if (!SERVICES_CONFIG.USE_SUPABASE) {
        await secureStorage.setItem('auth_token', response.token);
      }
      console.log('User set in context:', response.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      await secureStorage.removeItem('auth_token');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      const updatedUser = await authService.switchRole(newRole);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
    } catch (error) {
      // Якщо не вдалося оновити, виходимо
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    switchRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



