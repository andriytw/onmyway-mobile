/**
 * Driver Service
 * API для водія
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { SERVICES_CONFIG } from '../../config/services.config';
import { ActiveRequest, DriverProfile, RouteStop, DriverEarnings, ScheduledRide, BlacklistItem } from '../../types/driver.types';
import { getMockActiveRequests, MOCK_DRIVER_PROFILE, getMockScheduledRides, MOCK_BLACKLIST } from '../mock/mockData';
import { mockData } from '../mock/mockApi';

export interface DriverService {
  getProfile(): Promise<DriverProfile>;
  updateProfile(profile: Partial<DriverProfile>): Promise<DriverProfile>;
  setOnlineStatus(isOnline: boolean): Promise<void>;
  getActiveRequests(date: string): Promise<ActiveRequest[]>;
  acceptRequest(requestId: string): Promise<void>;
  rejectRequest(requestId: string): Promise<void>;
  updateRoute(route: RouteStop[]): Promise<void>;
  getEarnings(): Promise<DriverEarnings>;
  getScheduledRides(): Promise<ScheduledRide[]>;
  getBlacklist(): Promise<BlacklistItem[]>;
  addToBlacklist(userId: string, reason?: string): Promise<void>;
  removeFromBlacklist(userId: string): Promise<void>;
}

// Мокована реалізація
class MockDriverService implements DriverService {
  private profile: DriverProfile = MOCK_DRIVER_PROFILE;
  private route: RouteStop[] = [];

  async getProfile(): Promise<DriverProfile> {
    await mockData.delay();
    return { ...this.profile };
  }

  async updateProfile(updates: Partial<DriverProfile>): Promise<DriverProfile> {
    await mockData.delay();
    this.profile = { ...this.profile, ...updates };
    return { ...this.profile };
  }

  async setOnlineStatus(isOnline: boolean): Promise<void> {
    await mockData.delay();
    this.profile.isOnline = isOnline;
  }

  async getActiveRequests(date: string): Promise<ActiveRequest[]> {
    await mockData.delay(500);
    return getMockActiveRequests(date);
  }

  async acceptRequest(requestId: string): Promise<void> {
    await mockData.delay();
    // В реальності тут буде логіка додавання в маршрут
  }

  async rejectRequest(requestId: string): Promise<void> {
    await mockData.delay();
  }

  async updateRoute(route: RouteStop[]): Promise<void> {
    await mockData.delay();
    this.route = route;
  }

  async getEarnings(): Promise<DriverEarnings> {
    await mockData.delay();
    return {
      today: 125.50,
      week: 850.00,
      month: 3200.00,
      total: 12500.00,
      pending: 45.00,
      available: 1200.00,
    };
  }

  async getScheduledRides(): Promise<ScheduledRide[]> {
    await mockData.delay();
    return getMockScheduledRides();
  }

  async getBlacklist(): Promise<BlacklistItem[]> {
    await mockData.delay();
    return [...MOCK_BLACKLIST];
  }

  async addToBlacklist(userId: string, reason?: string): Promise<void> {
    await mockData.delay();
    // В реальності додасть в чорний список
  }

  async removeFromBlacklist(userId: string): Promise<void> {
    await mockData.delay();
    // В реальності видалить з чорного списку
  }
}

// Реальна реалізація (для production)
class ApiDriverService implements DriverService {
  async getProfile(): Promise<DriverProfile> {
    const response = await apiClient.get<DriverProfile>(API_ENDPOINTS.DRIVER.PROFILE);
    return response.data;
  }

  async updateProfile(updates: Partial<DriverProfile>): Promise<DriverProfile> {
    const response = await apiClient.patch<DriverProfile>(
      API_ENDPOINTS.DRIVER.UPDATE_PROFILE,
      updates
    );
    return response.data;
  }

  async setOnlineStatus(isOnline: boolean): Promise<void> {
    await apiClient.post(API_ENDPOINTS.DRIVER.STATUS, { isOnline });
  }

  async getActiveRequests(date: string): Promise<ActiveRequest[]> {
    const response = await apiClient.get<ActiveRequest[]>(
      `${API_ENDPOINTS.DRIVER.REQUESTS}?date=${date}`
    );
    return response.data;
  }

  async acceptRequest(requestId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.DRIVER.ACCEPT_REQUEST(requestId));
  }

  async rejectRequest(requestId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.DRIVER.REJECT_REQUEST(requestId));
  }

  async updateRoute(route: RouteStop[]): Promise<void> {
    await apiClient.put(API_ENDPOINTS.DRIVER.UPDATE_ROUTE, { route });
  }

  async getEarnings(): Promise<DriverEarnings> {
    const response = await apiClient.get<DriverEarnings>(API_ENDPOINTS.DRIVER.EARNINGS);
    return response.data;
  }

  async getScheduledRides(): Promise<ScheduledRide[]> {
    const response = await apiClient.get<ScheduledRide[]>(API_ENDPOINTS.DRIVER.CALENDAR);
    return response.data;
  }

  async getBlacklist(): Promise<BlacklistItem[]> {
    const response = await apiClient.get<BlacklistItem[]>(API_ENDPOINTS.DRIVER.BLACKLIST);
    return response.data;
  }

  async addToBlacklist(userId: string, reason?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.DRIVER.BLACKLIST, { userId, reason });
  }

  async removeFromBlacklist(userId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.DRIVER.BLACKLIST}/${userId}`);
  }
}

// Експорт
export const driverService: DriverService = SERVICES_CONFIG.USE_MOCK_API
  ? new MockDriverService()
  : new ApiDriverService();

