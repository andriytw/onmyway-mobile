/**
 * Types for Driver App
 */

export enum DriverStatus {
  IDLE = 'idle',
  INCOMING_REQUEST = 'incoming_request',
  RIDE_ACCEPTED = 'ride_accepted',
  DRIVER_ON_THE_WAY = 'driver_on_the_way',
  DRIVER_ARRIVED = 'driver_arrived',
  RIDE_IN_PROGRESS = 'ride_in_progress',
  RIDE_COMPLETED = 'ride_completed',
}

export interface RouteStop {
  id: string;
  type: 'passenger' | 'parcel';
  order: number;
  pickup: { x: number; y: number; address: string; lat?: number; lng?: number };
  dropoff: { x: number; y: number; address: string; lat?: number; lng?: number };
  passenger?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  parcel?: {
    id: string;
    size: 'S' | 'M' | 'L' | 'XL';
    weight: number;
    description?: string;
  };
  status: 'pending' | 'picked_up' | 'delivered';
  eta?: number; // хвилини до зупинки
  date?: string; // для майбутніх поїздок
  price?: string; // ціна для цієї зупинки
}

export interface ActiveRequest {
  id: string;
  type: 'passenger' | 'parcel';
  pickup: { x: number; y: number; address: string; lat?: number; lng?: number };
  dropoff: { x: number; y: number; address: string; lat?: number; lng?: number };
  distance: number; // км відхилення
  timeDeviation: number; // хв відхилення
  price?: string; // для посилок - офер
  passenger?: {
    id: string;
    name: string;
    rating: number;
  };
  parcel?: {
    id: string;
    size: 'S' | 'M' | 'L' | 'XL';
    weight: number;
    description?: string;
  };
  date: string; // дата поїздки
  createdAt: string;
}

export interface RouteStats {
  totalDistance: number; // км
  totalPassengers: number;
  totalParcels: number;
  totalWeight: number; // кг
  estimatedFuel: number; // €
  estimatedEarnings: number; // €
  efficiency: number; // % порівняно з базовим маршрутом
  stopsCount: number;
  baseDistance?: number; // км базового маршруту без попутників
}

export interface DriverProfile {
  id: string;
  name: string;
  rating: number;
  status: 'Starter' | 'Experienced' | 'Pro' | 'Elite';
  lifetimeStats: {
    totalKm: number;
    totalPassengers: number;
    totalWeight: number;
    totalHours: number;
  };
  vehicle: {
    model: string;
    number: string;
    capacity: number; // кількість місць
    maxWeight: number; // кг
    fuelConsumption: number; // л/100км
    supportedSizes: ('S' | 'M' | 'L' | 'XL')[];
  };
  pricePerKm: number; // €/км для пасажирів
  isOnline: boolean;
}

export interface DriverEarnings {
  today: number;
  week: number;
  month: number;
  total: number;
  pending: number; // в дорозі
  available: number; // доступно до виплати
}

export interface ScheduledRide {
  id: string;
  type: 'passenger' | 'parcel';
  date: string;
  time: string;
  pickup: { address: string; lat?: number; lng?: number };
  dropoff: { address: string; lat?: number; lng?: number };
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  price?: string;
}

export interface BlacklistItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'passenger' | 'sender' | 'driver';
  reason?: string;
  blockedAt: string;
}

export interface EmergencyAlert {
  id: string;
  type: 'accident' | 'police' | 'breakdown' | 'danger' | 'other';
  location: { lat: number; lng: number; address?: string };
  message?: string;
  createdAt: string;
  expiresAt: string;
  radius: number; // км
}

export interface CommunityChatMessage {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar?: string;
  message: string;
  type: 'general' | 'help';
  locationEnabled: boolean;
  location?: { lat: number; lng: number };
  locationExpiresAt?: string;
  createdAt: string;
}

export interface RewardLevel {
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  benefits: {
    priority: boolean;
    commissionDiscount: number; // %
    fasterPayout: boolean;
  };
}

export interface Partner {
  id: string;
  name: string;
  category: 'gas_station' | 'restaurant' | 'hotel' | 'service' | 'parking';
  location: { lat: number; lng: number; address: string };
  benefit: string; // опис переваги
  rating?: number;
  distance?: number; // км від маршруту
}

export interface CompatiblePassenger {
  request: ActiveRequest;
  distanceDeviation: number; // км відхилення
  timeDeviation: number; // хв відхилення
  routeMatch: number; // % співпадіння напрямку (0-100)
}

/**
 * Структура для зберігання пасажирів/посилок перед оптимізацією
 */
export interface PassengerParcelInput {
  id: string;
  type: 'passenger' | 'parcel';
  pickup: string; // адреса
  dropoff: string; // адреса
  passenger?: {
    name: string;
    phone?: string;
  };
  parcel?: {
    size: 'S' | 'M' | 'L' | 'XL';
    weight: number;
    description?: string;
  };
  price?: string;
}

/**
 * Точка маршруту для оптимізації
 */
export interface RoutePoint {
  id: string;
  address: string;
  type: 'origin' | 'destination' | 'pickup' | 'dropoff';
  passengerParcelId?: string; // для зв'язку pickup → dropoff
  passengerParcelType?: 'passenger' | 'parcel';
  coordinates?: { x: number; y: number; lat?: number; lng?: number };
}

/**
 * Точка маршруту для відображення (одна адреса на плитку)
 */
export interface RoutePointDisplay {
  id: string; // "pickup-{stopId}" або "dropoff-{stopId}"
  address: string;
  action: 'start' | 'finish' | 'pickup_passenger' | 'dropoff_passenger' | 'pickup_parcel' | 'dropoff_parcel';
  actionLabel: string; // "Старт маршруту", "Фініш маршруту", "Забрати пасажира", "Висадити пасажира" тощо
  stopId: string; // ID оригінального RouteStop
  order: number; // порядок в маршруті (0, 1, 2, 3...)
  passenger?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  parcel?: {
    id: string;
    size: 'S' | 'M' | 'L' | 'XL';
    weight: number;
  };
  status: 'pending' | 'picked_up' | 'delivered';
  eta: number; // хвилини до цієї точки (кумулятивне, враховує всі попередні зупинки)
  distance: number; // км до цієї точки (кумулятивне, враховує всі попередні зупинки)
  price?: string;
  coordinates: { x: number; y: number; address: string };
}

