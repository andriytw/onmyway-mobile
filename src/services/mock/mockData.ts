/**
 * Mock Data
 * Всі мокові дані для розробки
 */

import { ActiveRequest, RouteStop, DriverProfile, ScheduledRide, BlacklistItem, EmergencyAlert, CommunityChatMessage, Partner } from '../../types/driver.types';
import { Parcel } from '../../types';
import { Driver } from '../../types';

// Mock Drivers (для пасажирської сторони)
export const MOCK_DRIVERS: Driver[] = [
  { 
    id: 1, 
    name: "Олександр П.", 
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", 
    car: "VW Golf VII • AA 7788 BB", 
    tripsCount: 1422, 
    experience: 8, 
    rating: 4.95,
    matchScore: 98,
    pickupPoints: [{x: -300, y: 500}, {x: 0, y: 300}, {x: 120, y: 400}], 
    svgPickupPath: "M -300 500 L 0 300 L 120 400", 
    tripPoints: [{x: 120, y: 400}, {x: 120, y: 300}, {x: 420, y: 300}, {x: 420, y: 0}] 
  },
  { 
    id: 2, 
    name: "Дмитро К.", 
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry", 
    car: "Skoda Octavia • AA 1234 CC", 
    tripsCount: 850, 
    experience: 5, 
    rating: 4.88,
    matchScore: 92,
    pickupPoints: [{x: 100, y: 600}, {x: 120, y: 400}], 
    svgPickupPath: "M 100 600 L 120 400", 
    tripPoints: [{x: 120, y: 400}, {x: 120, y: 300}, {x: 420, y: 300}, {x: 420, y: 0}] 
  },
  { 
    id: 3, 
    name: "Сергій М.", 
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey", 
    car: "Toyota Camry • AA 9900 OO", 
    tripsCount: 2100, 
    experience: 12, 
    rating: 4.98,
    matchScore: 95,
    pickupPoints: [{x: -400, y: 200}, {x: 120, y: 400}], 
    svgPickupPath: "M -400 200 L 120 400", 
    tripPoints: [{x: 120, y: 400}, {x: 120, y: 300}, {x: 420, y: 300}, {x: 420, y: 0}] 
  }
];

// Mock Active Requests для водія
export const getMockActiveRequests = (date: string): ActiveRequest[] => {
  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  
  return [
    {
      id: 'req-1',
      type: 'passenger' as const,
      pickup: { x: 150, y: 450, address: 'вул. Хрещатик, 1' },
      dropoff: { x: 400, y: 100, address: 'вул. Банкова, 5' },
      distance: 8.5,
      timeDeviation: 12,
      passenger: {
        id: 'p-1',
        name: 'Марія К.',
        rating: 4.9,
      },
      date,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req-2',
      type: 'parcel' as const,
      pickup: { x: 200, y: 500, address: 'вул. Львівська, 10' },
      dropoff: { x: 450, y: 150, address: 'вул. Шевченка, 20' },
      distance: 12.3,
      timeDeviation: 18,
      price: '€45',
      parcel: {
        id: 'parcel-1',
        size: 'M' as const,
        weight: 15,
        description: 'Документи',
      },
      date,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req-3',
      type: 'passenger' as const,
      pickup: { x: 100, y: 400, address: 'вул. Незалежності, 15' },
      dropoff: { x: 380, y: 80, address: 'вул. Грушевського, 8' },
      distance: 6.2,
      timeDeviation: 9,
      passenger: {
        id: 'p-2',
        name: 'Олексій В.',
        rating: 5.0,
      },
      date,
      createdAt: new Date().toISOString(),
    },
  ].filter(req => isToday || Math.random() > 0.5); // Для майбутніх дат менше заявок
};

// Mock Driver Profile
export const MOCK_DRIVER_PROFILE: DriverProfile = {
  id: 'driver-1',
  name: 'Олександр П.',
  rating: 4.95,
  status: 'Pro',
  lifetimeStats: {
    totalKm: 124680,
    totalPassengers: 1284,
    totalWeight: 18420,
    totalHours: 1920,
  },
  vehicle: {
    model: 'VW Golf VII',
    number: 'AA 7788 BB',
    capacity: 5,
    maxWeight: 500,
    fuelConsumption: 7.5,
    supportedSizes: ['S', 'M', 'L', 'XL'],
  },
  pricePerKm: 0.5,
  isOnline: false,
};

// Mock Scheduled Rides
export const getMockScheduledRides = (): ScheduledRide[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: 'scheduled-1',
      type: 'passenger',
      date: tomorrow.toISOString().split('T')[0],
      time: '09:00',
      pickup: { address: 'Київ, вул. Хрещатик, 1' },
      dropoff: { address: 'Київ, вул. Банкова, 5' },
      status: 'scheduled',
      price: '€25',
    },
    {
      id: 'scheduled-2',
      type: 'parcel',
      date: tomorrow.toISOString().split('T')[0],
      time: '14:30',
      pickup: { address: 'Київ, вул. Львівська, 10' },
      dropoff: { address: 'Київ, вул. Шевченка, 20' },
      status: 'scheduled',
      price: '€45',
    },
  ];
};

// Mock Blacklist
export const MOCK_BLACKLIST: BlacklistItem[] = [
  {
    id: 'block-1',
    userId: 'user-1',
    userName: 'Іван П.',
    role: 'passenger',
    reason: 'Неповага',
    blockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Emergency Alerts
export const getMockEmergencyAlerts = (): EmergencyAlert[] => {
  return [
    {
      id: 'alert-1',
      type: 'breakdown',
      location: { lat: 50.4501, lng: 30.5234, address: 'A2, км 134' },
      message: 'Потрібна каністра бензину',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      radius: 10,
    },
  ];
};

// Mock Community Chat Messages
export const getMockCommunityChatMessages = (): CommunityChatMessage[] => {
  return [
    {
      id: 'msg-1',
      driverId: 'driver-2',
      driverName: 'Дмитро К.',
      message: 'Хлопці, де тут нормальний сервіс на А2?',
      type: 'general',
      locationEnabled: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      driverId: 'driver-3',
      driverName: 'Сергій М.',
      message: 'Поламався, потрібна каністра бензину',
      type: 'help',
      locationEnabled: true,
      location: { lat: 50.4501, lng: 30.5234 },
      locationExpiresAt: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
  ];
};

// Mock Partners
export const getMockPartners = (): Partner[] => {
  return [
    {
      id: 'partner-1',
      name: 'OKKO',
      category: 'gas_station',
      location: { lat: 50.4501, lng: 30.5234, address: 'A2, км 120' },
      benefit: '–6 ct/л пального для On My Way',
      rating: 4.8,
      distance: 1.2,
    },
    {
      id: 'partner-2',
      name: 'McDonald\'s',
      category: 'restaurant',
      location: { lat: 50.4510, lng: 30.5240, address: 'A2, км 125' },
      benefit: 'Безкоштовна кава',
      rating: 4.5,
      distance: 2.5,
    },
  ];
};

// Helper для генерації дат
export const getDateString = (daysOffset: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

