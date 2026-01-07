/**
 * HTTP API Client
 * Абстракція для HTTP запитів
 * Підтримує моки та реальні API виклики
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    // For React Native: use localhost for iOS, 10.0.2.2 for Android emulator
    const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;
    // Note: For Android emulator, use 'http://10.0.2.2:3001/api' instead of localhost
    const defaultURL = isDev 
      ? 'http://localhost:3001/api'  // iOS Simulator (Android: use 10.0.2.2)
      : 'https://your-api.com/api';  // Production
    
    this.baseURL = (process.env.API_URL as string) || defaultURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data: unknown = await response.json();

      if (!response.ok) {
        const errorData = data as { message?: string; errors?: Record<string, string[]> };
        throw {
          message: errorData.message || 'Request failed',
          status: response.status,
          errors: errorData.errors,
        } as ApiError;
      }

      return {
        data: data as T,
        status: response.status,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

