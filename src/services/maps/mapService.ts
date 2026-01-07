/**
 * Map Service
 * Геокодування та робота з картами (мок → Mapbox/Google)
 */

import { SERVICES_CONFIG } from '../../config/services.config';

export interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
}

export interface MapService {
  geocode(address: string): Promise<GeocodeResult>;
  reverseGeocode(lat: number, lng: number): Promise<string>;
  calculateRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<{ distance: number; duration: number }>;
}

// Мокована реалізація
class MockMapService implements MapService {
  async geocode(address: string): Promise<GeocodeResult> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Простий мок - повертає фіксовані координати
    return {
      address,
      lat: 50.4501 + (Math.random() - 0.5) * 0.1,
      lng: 30.5234 + (Math.random() - 0.5) * 0.1,
    };
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return `Адреса за координатами ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{ distance: number; duration: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Простий розрахунок відстані
    const distance = this.calculateDistance(origin, destination);
    const duration = Math.round((distance / 60) * 60); // припускаємо 60 км/год
    
    return {
      distance: Math.round(distance * 10) / 10,
      duration,
    };
  }

  private calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): number {
    // Формула гаверсинус для розрахунку відстані
    const R = 6371; // Радіус Землі в км
    const dLat = this.toRad(destination.lat - origin.lat);
    const dLon = this.toRad(destination.lng - origin.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(origin.lat)) *
        Math.cos(this.toRad(destination.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Реальна реалізація (Mapbox)
class MapboxMapService implements MapService {
  private token: string;

  constructor() {
    this.token = SERVICES_CONFIG.MAPBOX_PUBLIC_TOKEN;
    if (!this.token) {
      console.warn('Mapbox token not configured');
    }
  }

  async geocode(address: string): Promise<GeocodeResult> {
    if (!this.token) {
      // Fallback на мок
      return new MockMapService().geocode(address);
    }

    // TODO: Інтегрувати Mapbox Geocoding API
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.token}`
    );
    const data: any = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        address: feature.place_name,
        lat: feature.center[1],
        lng: feature.center[0],
      };
    }

    throw new Error('Address not found');
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (!this.token) {
      return new MockMapService().reverseGeocode(lat, lng);
    }

    // TODO: Інтегрувати Mapbox Reverse Geocoding
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.token}`
    );
    const data: any = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }

    return `Координати: ${lat}, ${lng}`;
  }

  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{ distance: number; duration: number }> {
    if (!this.token) {
      return new MockMapService().calculateRoute(origin, destination);
    }

    // TODO: Інтегрувати Mapbox Directions API
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${this.token}`
    );
    const data: any = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance / 1000, // конвертуємо в км
        duration: Math.round(route.duration / 60), // конвертуємо в хвилини
      };
    }

    throw new Error('Route calculation failed');
  }
}

export const mapService: MapService = SERVICES_CONFIG.USE_MAPBOX && SERVICES_CONFIG.MAPBOX_PUBLIC_TOKEN
  ? new MapboxMapService()
  : new MockMapService();

