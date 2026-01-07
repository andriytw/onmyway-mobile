/**
 * Parcel Service
 * API для посилок
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { SERVICES_CONFIG } from '../../config/services.config';
import { Parcel } from '../../types';
import { mockData } from '../mock/mockApi';

export interface CreateParcelData {
  title: string;
  size: 'S' | 'M' | 'L' | 'XL';
  weight: string;
  description: string;
  photos: string[];
  from: string;
  to: string;
  receiver: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  date: string;
  time?: string;
}

export interface ParcelOffer {
  driverId: number;
  driverName: string;
  driverImage: string;
  driverRating: number;
  price: string;
  eta: string;
  distance: string;
}

export interface ParcelService {
  createParcel(data: CreateParcelData): Promise<Parcel>;
  getParcels(): Promise<Parcel[]>;
  getParcel(id: string): Promise<Parcel>;
  cancelParcel(id: string): Promise<void>;
  getOffers(parcelId: string): Promise<ParcelOffer[]>;
  acceptOffer(parcelId: string, offerId: string): Promise<void>;
}

// Мокована реалізація
class MockParcelService implements ParcelService {
  private parcels: Parcel[] = [];

  async createParcel(data: CreateParcelData): Promise<Parcel> {
    await mockData.delay();

    const parcel: Parcel = {
      id: `parcel-${Date.now()}`,
      title: data.title,
      size: data.size,
      weight: data.weight,
      description: data.description,
      photos: data.photos,
      from: data.from,
      to: data.to,
      receiver: data.receiver,
      status: 'Prepared',
      date: data.date,
      qrCode: `QR-${Date.now()}`,
    };

    this.parcels.unshift(parcel);
    return parcel;
  }

  async getParcels(): Promise<Parcel[]> {
    await mockData.delay();
    return [...this.parcels];
  }

  async getParcel(id: string): Promise<Parcel> {
    await mockData.delay();
    const parcel = this.parcels.find(p => p.id === id);
    if (!parcel) throw new Error('Parcel not found');
    return parcel;
  }

  async cancelParcel(id: string): Promise<void> {
    await mockData.delay();
    this.parcels = this.parcels.filter(p => p.id !== id);
  }

  async getOffers(parcelId: string): Promise<ParcelOffer[]> {
    await mockData.delay(1000);
    // Симуляція оферів
    return [
      {
        driverId: 1,
        driverName: 'Олександр П.',
        driverImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        driverRating: 4.95,
        price: '€50',
        eta: '8 хв',
        distance: '2.4 км',
      },
      {
        driverId: 2,
        driverName: 'Дмитро К.',
        driverImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry',
        driverRating: 4.88,
        price: '€45',
        eta: '12 хв',
        distance: '3.1 км',
      },
    ];
  }

  async acceptOffer(parcelId: string, offerId: string): Promise<void> {
    await mockData.delay();
    const parcel = this.parcels.find(p => p.id === parcelId);
    if (parcel) {
      parcel.status = 'DriverAssigned';
      parcel.driverId = parseInt(offerId);
    }
  }
}

// Реальна реалізація
class ApiParcelService implements ParcelService {
  async createParcel(data: CreateParcelData): Promise<Parcel> {
    const response = await apiClient.post<Parcel>(API_ENDPOINTS.PARCELS.CREATE, data);
    return response.data;
  }

  async getParcels(): Promise<Parcel[]> {
    const response = await apiClient.get<Parcel[]>(API_ENDPOINTS.PARCELS.LIST);
    return response.data;
  }

  async getParcel(id: string): Promise<Parcel> {
    const response = await apiClient.get<Parcel>(API_ENDPOINTS.PARCELS.DETAIL(id));
    return response.data;
  }

  async cancelParcel(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PARCELS.CANCEL(id));
  }

  async getOffers(parcelId: string): Promise<ParcelOffer[]> {
    const response = await apiClient.get<ParcelOffer[]>(API_ENDPOINTS.PARCELS.OFFERS(parcelId));
    return response.data;
  }

  async acceptOffer(parcelId: string, offerId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PARCELS.ACCEPT_OFFER(parcelId, offerId));
  }
}

export const parcelService: ParcelService = SERVICES_CONFIG.USE_MOCK_API
  ? new MockParcelService()
  : new ApiParcelService();

