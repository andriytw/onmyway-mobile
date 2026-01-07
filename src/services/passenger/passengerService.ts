/**
 * Passenger Service
 * API для пасажира
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { SERVICES_CONFIG } from '../../config/services.config';
import { Driver } from '../../types';
import { mockData } from '../mock/mockApi';
import { MOCK_DRIVERS } from '../mock/mockData';

export interface RideRequest {
  origin: string;
  destination: string;
  date: string;
  time?: string;
  passengers?: number;
  luggage?: { type: string; count: number }[];
}

export interface PassengerService {
  searchDrivers(request: RideRequest): Promise<Driver[]>;
  createRide(request: RideRequest): Promise<{ rideId: string }>;
  cancelRide(rideId: string): Promise<void>;
  getRideStatus(rideId: string): Promise<{ status: string; driver?: Driver }>;
}

// Мокована реалізація
class MockPassengerService implements PassengerService {
  async searchDrivers(request: RideRequest): Promise<Driver[]> {
    await mockData.delay(2000);
    return [...MOCK_DRIVERS];
  }

  async createRide(request: RideRequest): Promise<{ rideId: string }> {
    await mockData.delay();
    return { rideId: `ride-${Date.now()}` };
  }

  async cancelRide(rideId: string): Promise<void> {
    await mockData.delay();
  }

  async getRideStatus(rideId: string): Promise<{ status: string; driver?: Driver }> {
    await mockData.delay();
    return {
      status: 'driver_assigned',
      driver: MOCK_DRIVERS[0],
    };
  }
}

// Реальна реалізація
class ApiPassengerService implements PassengerService {
  async searchDrivers(request: RideRequest): Promise<Driver[]> {
    const response = await apiClient.post<Driver[]>(
      API_ENDPOINTS.PASSENGER.CREATE_RIDE,
      request
    );
    return response.data;
  }

  async createRide(request: RideRequest): Promise<{ rideId: string }> {
    const response = await apiClient.post<{ rideId: string }>(
      API_ENDPOINTS.PASSENGER.CREATE_RIDE,
      request
    );
    return response.data;
  }

  async cancelRide(rideId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PASSENGER.CANCEL_RIDE(rideId));
  }

  async getRideStatus(rideId: string): Promise<{ status: string; driver?: Driver }> {
    const response = await apiClient.get<{ status: string; driver?: Driver }>(
      API_ENDPOINTS.PASSENGER.RIDE_STATUS(rideId)
    );
    return response.data;
  }
}

export const passengerService: PassengerService = SERVICES_CONFIG.USE_MOCK_API
  ? new MockPassengerService()
  : new ApiPassengerService();

