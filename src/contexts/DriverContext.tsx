/**
 * Driver Context
 * Контекст для стану водія
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { RouteStop, ActiveRequest, DriverProfile, RouteStats, ScheduledRide, CompatiblePassenger, PassengerParcelInput } from '../types/driver.types';
import { driverService } from '../services/driver/driverService';
import { routeService } from '../services/driver/routeService';
import { matchingService } from '../services/driver/matchingService';
import { routeOptimizationService } from '../services/driver/routeOptimizationService';
import { pointOptimizationService } from '../services/driver/pointOptimizationService';
import { convertPointsToRouteStops } from '../services/driver/routeDisplayUtils';
import { RoutePointDisplay } from '../types/driver.types';
import { getDateString } from '../services/mock/mockData';

interface DriverContextType {
  isOnline: boolean;
  currentRoute: RouteStop[];
  activeRequests: ActiveRequest[];
  selectedDate: string;
  routeStats: RouteStats | null;
  driverProfile: DriverProfile | null;
  scheduledRides: ScheduledRide[];
  isLoading: boolean;
  originAddress: string;
  destinationAddress: string;
  passengersParcels: PassengerParcelInput[];
  isInRoute: boolean;
  availablePassengers: CompatiblePassenger[];
  previewRoute: RouteStop[] | null;
  previewDeviation: { distance: number; time: number } | null;
  setOnline: (isOnline: boolean) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setOriginAddress: (address: string) => void;
  setDestinationAddress: (address: string) => void;
  createRoute: (origin: string, destination: string, passengersParcels: PassengerParcelInput[], optimized: boolean) => Promise<void>;
  addPassengerParcel: (pp: PassengerParcelInput) => void;
  removePassengerParcel: (id: string) => void;
  updatePassengerParcel: (id: string, updates: Partial<PassengerParcelInput>) => void;
  addStopToRoute: (request: ActiveRequest) => Promise<void>;
  reorderRoute: (fromIndex: number, toIndex: number) => Promise<void>;
  removeStop: (stopId: string) => void;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => void;
  refreshRequests: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshScheduledRides: () => Promise<void>;
  addPassengerToRoute: (requestId: string) => Promise<void>;
  ignorePassenger: (requestId: string) => void;
  reorderRouteWithPreview: (fromIndex: number, toIndex: number) => void;
  clearPreview: () => void;
  calculateRouteDeviation: (fromIndex: number, toIndex: number) => { distance: number; time: number };
  updateRouteFromPoints: (points: RoutePointDisplay[]) => Promise<void>;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within DriverProvider');
  }
  return context;
};

interface DriverProviderProps {
  children: ReactNode;
}

export const DriverProvider: React.FC<DriverProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RouteStop[]>([]);
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getDateString(0));
  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [scheduledRides, setScheduledRides] = useState<ScheduledRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [passengersParcels, setPassengersParcels] = useState<PassengerParcelInput[]>([]);
  const [ignoredPassengers, setIgnoredPassengers] = useState<Set<string>>(new Set());
  const [previewRoute, setPreviewRoute] = useState<RouteStop[] | null>(null);
  const [previewDeviation, setPreviewDeviation] = useState<{ distance: number; time: number } | null>(null);

  // Визначаємо, чи водій в дорозі (є активний маршрут з більш ніж базовою зупинкою)
  const isInRoute = currentRoute.length > 1 || (currentRoute.length === 1 && currentRoute[0].id !== 'base-route');

  // Завантажуємо профіль при ініціалізації
  useEffect(() => {
    refreshProfile();
    refreshScheduledRides();
  }, []);

  // Оновлюємо заявки при зміні дати, онлайн статусу або маршруту
  useEffect(() => {
    if (isOnline && currentRoute.length > 0) {
      refreshRequests();
      // Оновлюємо заявки кожні 30 секунд
      const interval = setInterval(refreshRequests, 30000);
      return () => clearInterval(interval);
    } else {
      // Якщо немає маршруту, очищаємо заявки
      setActiveRequests([]);
    }
  }, [selectedDate, isOnline, currentRoute]);

  // Перераховуємо статистику при зміні маршруту
  useEffect(() => {
    if (currentRoute.length > 0) {
      const stats = routeService.calculateRouteStats(currentRoute);
      setRouteStats(stats);
    } else {
      setRouteStats(null);
    }
  }, [currentRoute]);

  // Оновлюємо доступних попутників для Live Route
  useEffect(() => {
    if (isInRoute && isOnline && driverProfile && currentRoute.length > 0) {
      const updateAvailablePassengers = async () => {
        try {
          const requests = await driverService.getActiveRequests(selectedDate);
          const compatible = matchingService.findCompatiblePassengers(
            currentRoute,
            requests.filter(r => !ignoredPassengers.has(r.id)),
            driverProfile,
            selectedDate
          );
          // Оновлюємо availablePassengers через setState
          // (буде додано в value)
        } catch (error) {
          console.error('Failed to update available passengers:', error);
        }
      };
      updateAvailablePassengers();
      const interval = setInterval(updateAvailablePassengers, 30000);
      return () => clearInterval(interval);
    }
  }, [isInRoute, isOnline, driverProfile, currentRoute, selectedDate, ignoredPassengers]);

  const setOnline = async (online: boolean) => {
    setIsLoading(true);
    try {
      await driverService.setOnlineStatus(online);
      setIsOnline(online);
      if (online) {
        await refreshRequests();
      } else {
        setActiveRequests([]);
      }
    } catch (error) {
      console.error('Failed to set online status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRequests = async () => {
    // Заявки можуть з'являтися тільки після створення маршруту
    if (!isOnline || currentRoute.length === 0) {
      setActiveRequests([]);
      return;
    }

    try {
      const requests = await driverService.getActiveRequests(selectedDate);
      
      // Фільтруємо через matching service використовуючи поточний маршрут
      if (driverProfile) {
        const matching = matchingService.findMatchingRequests(
          currentRoute,
          requests,
          driverProfile,
          selectedDate
        );
        setActiveRequests(matching);
      } else {
        setActiveRequests(requests);
      }
    } catch (error) {
      console.error('Failed to refresh requests:', error);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await driverService.getProfile();
      setDriverProfile(profile);
      setIsOnline(profile.isOnline);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshScheduledRides = async () => {
    try {
      const rides = await driverService.getScheduledRides();
      setScheduledRides(rides);
    } catch (error) {
      console.error('Failed to refresh scheduled rides:', error);
    }
  };

  const createRoute = useCallback(async (
    origin: string,
    destination: string,
    passengersParcels: PassengerParcelInput[],
    optimized: boolean
  ) => {
    if (!origin.trim() || !destination.trim()) {
      return;
    }

    try {
      let route: RouteStop[] = [];

      if (optimized && passengersParcels.length > 0) {
        // Використовуємо оптимізацію по точках
        route = pointOptimizationService.optimizeRouteByPoints(
          origin,
          destination,
          passengersParcels
        );
      } else if (passengersParcels.length > 0) {
        // По черговості: origin → pickup1 → dropoff1 → pickup2 → dropoff2 → ... → destination
        const allStops: Array<{ address: string; pp?: PassengerParcelInput }> = [
          { address: origin }
        ];
        
        passengersParcels.forEach(pp => {
          allStops.push({ address: pp.pickup, pp });
          allStops.push({ address: pp.dropoff, pp });
        });
        
        allStops.push({ address: destination });

        for (let i = 0; i < allStops.length - 1; i++) {
          const current = allStops[i];
          const next = allStops[i + 1];
          const pp = current.pp || next.pp;
          
          route.push({
            id: `stop-${i}-${Date.now()}`,
            type: pp?.type || 'passenger',
            order: i,
            pickup: { x: 0, y: 0, address: current.address },
            dropoff: { x: 0, y: 0, address: next.address },
            status: 'pending',
            passenger: pp?.passenger ? {
              id: pp.id,
              name: pp.passenger.name,
              phone: pp.passenger.phone || '',
              rating: 5,
            } : undefined,
            parcel: pp?.parcel ? {
              id: pp.id,
              ...pp.parcel,
            } : undefined,
            price: pp?.price,
          });
        }
      } else {
        // Просто origin → destination
        route = [{
          id: `stop-0-${Date.now()}`,
          type: 'passenger',
          order: 0,
          pickup: { x: 0, y: 0, address: origin },
          dropoff: { x: 0, y: 0, address: destination },
          status: 'pending',
        }];
      }

      // Перераховуємо ETA
      const routeWithETA = routeOptimizationService.recalculateETA(route);
      
      setCurrentRoute(routeWithETA);
      await driverService.updateRoute(routeWithETA);
    } catch (error) {
      console.error('Failed to create route:', error);
      throw error;
    }
  }, []);

  const addPassengerParcel = useCallback((pp: PassengerParcelInput) => {
    setPassengersParcels(prev => [...prev, pp]);
  }, []);

  const removePassengerParcel = useCallback((id: string) => {
    setPassengersParcels(prev => prev.filter(p => p.id !== id));
  }, []);

  const updatePassengerParcel = useCallback((id: string, updates: Partial<PassengerParcelInput>) => {
    setPassengersParcels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addStopToRoute = async (request: ActiveRequest) => {
    try {
      // Використовуємо оптимізацію для додавання зупинки
      const optimizedRoute = routeOptimizationService.optimizeRouteWithNewStop(
        currentRoute,
        request
      );

      // Додаємо деталі з заявки до нових зупинок
      const updatedRoute = optimizedRoute.map((stop) => {
        // Знаходимо нову зупинку (яка відповідає request)
        const isNewStop = 
          stop.pickup.address === request.pickup.address &&
          stop.dropoff.address === request.dropoff.address &&
          stop.type === request.type;

        if (isNewStop) {
          return {
            ...stop,
            passenger: request.passenger ? {
              id: request.passenger.id || '',
              name: request.passenger.name,
              phone: '',
              rating: request.passenger.rating,
            } : undefined,
            parcel: request.parcel ? {
              id: request.parcel.id || request.id,
              size: request.parcel.size,
              weight: request.parcel.weight,
            } : undefined,
            price: request.price,
          };
        }
        return stop;
      });

      setCurrentRoute(updatedRoute);
      await driverService.updateRoute(updatedRoute);
      
      // Видаляємо заявку зі списку
      setActiveRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Failed to add stop to route:', error);
      throw error;
    }
  };

  const reorderRoute = async (fromIndex: number, toIndex: number) => {
    try {
      // Очищаємо preview перед застосуванням змін
      clearPreview();
      
      // Валідуємо порядок
      const validation = routeOptimizationService.validateRouteOrder(currentRoute);
      if (!validation.valid) {
        console.warn('Invalid route order:', validation.error);
        return;
      }

      const newRoute = routeService.reorderRoute(currentRoute, fromIndex, toIndex);
      // Перераховуємо ETA
      const routeWithETA = routeOptimizationService.recalculateETA(newRoute);
      setCurrentRoute(routeWithETA);
      await driverService.updateRoute(routeWithETA);
    } catch (error) {
      console.error('Failed to reorder route:', error);
    }
  };

  const removeStop = (stopId: string) => {
    const newRoute = currentRoute.filter(stop => stop.id !== stopId);
    setCurrentRoute(newRoute);
    driverService.updateRoute(newRoute);
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await driverService.acceptRequest(requestId);
      const request = activeRequests.find(r => r.id === requestId);
      if (request) {
        await addStopToRoute(request);
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await driverService.rejectRequest(requestId);
      setActiveRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  // Отримуємо доступних попутників для Live Route
  const getAvailablePassengers = useCallback(async (): Promise<CompatiblePassenger[]> => {
    if (!isInRoute || !isOnline || !driverProfile || currentRoute.length === 0) {
      return [];
    }

    try {
      const requests = await driverService.getActiveRequests(selectedDate);
      const compatible = matchingService.findCompatiblePassengers(
        currentRoute,
        requests.filter(r => !ignoredPassengers.has(r.id)),
        driverProfile,
        selectedDate
      );
      return compatible;
    } catch (error) {
      console.error('Failed to get available passengers:', error);
      return [];
    }
  }, [isInRoute, isOnline, driverProfile, currentRoute, selectedDate, ignoredPassengers]);

  const [availablePassengers, setAvailablePassengers] = useState<CompatiblePassenger[]>([]);

  // Оновлюємо availablePassengers
  useEffect(() => {
    if (isInRoute && isOnline) {
      getAvailablePassengers().then(setAvailablePassengers);
      const interval = setInterval(() => {
        getAvailablePassengers().then(setAvailablePassengers);
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setAvailablePassengers([]);
    }
  }, [isInRoute, isOnline, getAvailablePassengers]);

  // Додає попутника до маршруту з оптимізацією
  const addPassengerToRoute = async (requestId: string) => {
    try {
      const compatible = availablePassengers.find(cp => cp.request.id === requestId);
      if (!compatible) {
        throw new Error('Passenger not found');
      }

      const optimizedRoute = routeOptimizationService.optimizeRouteWithNewStop(
        currentRoute,
        compatible.request
      );

      setCurrentRoute(optimizedRoute);
      await driverService.updateRoute(optimizedRoute);
      
      // Видаляємо зі списку доступних
      setAvailablePassengers(prev => prev.filter(cp => cp.request.id !== requestId));
    } catch (error) {
      console.error('Failed to add passenger to route:', error);
      throw error;
    }
  };

  // Ігнорує попутника (не показувати більше)
  const ignorePassenger = (requestId: string) => {
    setIgnoredPassengers(prev => new Set(prev).add(requestId));
    setAvailablePassengers(prev => prev.filter(cp => cp.request.id !== requestId));
  };

  // Preview маршруту під час drag & drop
  const reorderRouteWithPreview = (fromIndex: number, toIndex: number) => {
    const preview = routeOptimizationService.calculateRoutePreview(currentRoute, fromIndex, toIndex);
    const deviation = routeOptimizationService.calculateDeviationChange(currentRoute, fromIndex, toIndex);
    
    setPreviewRoute(preview);
    setPreviewDeviation(deviation);
  };

  // Очищає preview
  const clearPreview = () => {
    setPreviewRoute(null);
    setPreviewDeviation(null);
  };

  // Розраховує зміну відхилення
  const calculateRouteDeviation = (fromIndex: number, toIndex: number) => {
    return routeOptimizationService.calculateDeviationChange(currentRoute, fromIndex, toIndex);
  };

  // Оновлює маршрут з точок (RoutePointDisplay[])
  const updateRouteFromPoints = useCallback(async (points: RoutePointDisplay[]) => {
    try {
      // Конвертуємо точки назад в RouteStop[]
      const newRoute = convertPointsToRouteStops(points, currentRoute);
      
      // Перераховуємо ETA
      const routeWithETA = routeOptimizationService.recalculateETA(newRoute);
      
      // Оновлюємо маршрут
      setCurrentRoute(routeWithETA);
      await driverService.updateRoute(routeWithETA);
    } catch (error) {
      console.error('Failed to update route from points:', error);
      throw error;
    }
  }, [currentRoute]);

  const value: DriverContextType = {
    isOnline,
    currentRoute,
    activeRequests,
    selectedDate,
    routeStats,
    driverProfile,
    scheduledRides,
    isLoading,
    originAddress,
    destinationAddress,
    passengersParcels,
    isInRoute,
    availablePassengers,
    previewRoute,
    previewDeviation,
    setOnline,
    setSelectedDate,
    setOriginAddress,
    setDestinationAddress,
    createRoute,
    addPassengerParcel,
    removePassengerParcel,
    updatePassengerParcel,
    addStopToRoute,
    reorderRoute,
    removeStop,
    acceptRequest,
    rejectRequest,
    refreshRequests,
    refreshProfile,
    refreshScheduledRides,
    addPassengerToRoute,
    ignorePassenger,
    reorderRouteWithPreview,
    clearPreview,
    calculateRouteDeviation,
    updateRouteFromPoints,
  };

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
};

