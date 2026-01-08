/**
 * Auth Service
 * Сервіс для аутентифікації
 * Routes to Supabase, Mock API, or REST API based on configuration
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { SERVICES_CONFIG } from '../../config/services.config';
import { mockApi } from '../mock/mockApi';
import { User, LoginCredentials, RegisterData, AuthResponse, UserRole } from '../../types/auth.types';
import { SupabaseAuthService } from '../supabase/authAdapter';
import { supabaseClient } from '../supabase/client';

// Create singleton instance of SupabaseAuthService
let supabaseAuthService: SupabaseAuthService | null = null;

const getSupabaseAuthService = (): SupabaseAuthService => {
  if (!supabaseAuthService) {
    supabaseAuthService = new SupabaseAuthService();
  }
  return supabaseAuthService;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (SERVICES_CONFIG.USE_SUPABASE) {
      return getSupabaseAuthService().login(credentials);
    }
    if (SERVICES_CONFIG.USE_MOCK_API) {
      return mockApi.login(credentials);
    }
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    if (SERVICES_CONFIG.USE_SUPABASE) {
      return getSupabaseAuthService().register(data);
    }
    if (SERVICES_CONFIG.USE_MOCK_API) {
      return mockApi.register(data);
    }
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  async logout(): Promise<void> {
    if (SERVICES_CONFIG.USE_SUPABASE) {
      return getSupabaseAuthService().logout();
    }
    if (SERVICES_CONFIG.USE_MOCK_API) {
      return mockApi.logout();
    }
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async getCurrentUser(): Promise<User> {
    if (SERVICES_CONFIG.USE_SUPABASE) {
      return getSupabaseAuthService().getCurrentUser();
    }
    if (SERVICES_CONFIG.USE_MOCK_API) {
      return mockApi.getCurrentUser();
    }
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  async switchRole(role: UserRole): Promise<User> {
    if (SERVICES_CONFIG.USE_SUPABASE) {
      return getSupabaseAuthService().switchRole(role);
    }
    if (SERVICES_CONFIG.USE_MOCK_API) {
      return mockApi.switchRole(role);
    }
    const response = await apiClient.patch<User>(API_ENDPOINTS.AUTH.ME, { role });
    return response.data;
  },

  async updateUser(data: Partial<User>): Promise<User> {
    if (SERVICES_CONFIG.USE_SUPABASE) {
      // Supabase doesn't have updateUser in authAdapter for Phase 2.1
      // Fall back to API or mock
      if (SERVICES_CONFIG.USE_MOCK_API) {
        return mockApi.updateUser(data);
      }
      const response = await apiClient.patch<User>(API_ENDPOINTS.AUTH.ME, data);
      return response.data;
    }
    if (SERVICES_CONFIG.USE_MOCK_API) {
      return mockApi.updateUser(data);
    }
    const response = await apiClient.patch<User>(API_ENDPOINTS.AUTH.ME, data);
    return response.data;
  },

  async refreshToken(): Promise<{ token: string }> {
    if (SERVICES_CONFIG.USE_SUPABASE) {
      // Supabase handles token refresh automatically
      // Return current session token
      const { data: { session } } = await supabaseClient.auth.getSession();
      return { token: session?.access_token || '' };
    }
    if (SERVICES_CONFIG.USE_MOCK_API) {
      return mockApi.refreshToken();
    }
    const response = await apiClient.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH);
    return response.data;
  },
};

