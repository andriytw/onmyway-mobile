/**
 * Mock API
 * Моковані API виклики для симуляції backend
 */

import { User, LoginCredentials, RegisterData, AuthResponse, UserRole } from '../../types/auth.types';

// Затримка для симуляції мережевих запитів
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Export mockData for use in services
export const mockData = {
  delay,
};

// Mock user storage
let currentUser: User | null = null;

export const mockApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(500);
    
    const user: User = {
      id: 'user-1',
      email: credentials.email,
      phone: '+380501234567',
      firstName: 'Фелікс',
      lastName: 'О.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      role: null,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    currentUser = user;

    return {
      user,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(500);

    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      role: null,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    currentUser = user;

    return {
      user,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
    };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
  },

  async getCurrentUser(): Promise<User> {
    await delay(200);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    return currentUser;
  },

  async refreshToken(): Promise<{ token: string }> {
    await delay(200);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    return {
      token: 'mock-jwt-token-new',
    };
  },

  async switchRole(role: UserRole): Promise<User> {
    await delay(200);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    currentUser = {
      ...currentUser,
      role,
    };

    return currentUser;
  },

  async updateUser(data: Partial<User>): Promise<User> {
    await delay(200);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    currentUser = {
      ...currentUser,
      ...data,
    };

    return currentUser;
  },
};

