/**
 * Matching Service
 * Розумний матчинг заявок для водія
 * Може залишитись локальною (логіка на клієнті)
 */

import { ActiveRequest, RouteStop, DriverProfile, CompatiblePassenger } from '../../types/driver.types';

export interface MatchingService {
  findMatchingRequests(
    route: RouteStop[],
    allRequests: ActiveRequest[],
    driverProfile: DriverProfile,
    date: string
  ): ActiveRequest[];
  findCompatiblePassengers(
    route: RouteStop[],
    allRequests: ActiveRequest[],
    driverProfile: DriverProfile,
    date: string
  ): CompatiblePassenger[];
  calculateDeviation(route: RouteStop[], request: ActiveRequest): { distance: number; time: number };
  isRequestValid(route: RouteStop[], request: ActiveRequest, driverProfile: DriverProfile): boolean;
}

class MatchingServiceImpl implements MatchingService {
  // Константи для матчингу
  private readonly MAX_DISTANCE_DEVIATION = 20; // км
  private readonly MAX_TIME_DEVIATION = 30; // хв
  private readonly MIN_DIRECTION_MATCH = 0.7; // 70% співпадіння напрямку
  
  // Константи для Live Route (коли водій вже в дорозі)
  private readonly LIVE_ROUTE_MAX_DISTANCE_DEVIATION = 50; // км
  private readonly LIVE_ROUTE_MAX_TIME_DEVIATION = 60; // хв
  private readonly LIVE_ROUTE_MIN_DIRECTION_MATCH = 0.7; // 70% співпадіння напрямку

  /**
   * Знаходить заявки, що підходять до маршруту
   */
  findMatchingRequests(
    route: RouteStop[],
    allRequests: ActiveRequest[],
    driverProfile: DriverProfile,
    date: string
  ): ActiveRequest[] {
    // Фільтруємо по даті
    const requestsForDate = allRequests.filter(req => req.date === date);

    // Якщо маршрут порожній, показуємо всі заявки
    if (route.length === 0) {
      return requestsForDate.filter(req => this.isRequestValid(route, req, driverProfile));
    }

    // Для кожної заявки рахуємо відхилення
    const matchingRequests = requestsForDate
      .map(request => {
        const deviation = this.calculateDeviation(route, request);
        return { request, deviation };
      })
      .filter(({ request, deviation }) => {
        // Перевіряємо чи заявка валідна
        if (!this.isRequestValid(route, request, driverProfile)) {
          return false;
        }

        // Перевіряємо відхилення
        return deviation.distance <= this.MAX_DISTANCE_DEVIATION &&
               deviation.time <= this.MAX_TIME_DEVIATION;
      })
      .sort((a, b) => {
        // Сортуємо по відхиленню (менше = краще)
        const scoreA = a.deviation.distance + (a.deviation.time / 2);
        const scoreB = b.deviation.distance + (b.deviation.time / 2);
        return scoreA - scoreB;
      })
      .map(({ request }) => request);

    return matchingRequests;
  }

  /**
   * Знаходить сумісних попутників для Live Route (коли водій вже в дорозі)
   * Повертає CompatiblePassenger з детальною інформацією про відхилення
   */
  findCompatiblePassengers(
    route: RouteStop[],
    allRequests: ActiveRequest[],
    driverProfile: DriverProfile,
    date: string
  ): CompatiblePassenger[] {
    if (route.length === 0) {
      return [];
    }

    // Фільтруємо по даті
    const requestsForDate = allRequests.filter(req => req.date === date);

    // Для кожної заявки рахуємо відхилення та співпадіння напрямку
    const compatiblePassengers = requestsForDate
      .map(request => {
        const deviation = this.calculateDeviation(route, request);
        const routeDirection = this.calculateDirection(route);
        const requestDirection = this.calculateRequestDirection(request);
        const routeMatch = this.calculateDirectionMatch(routeDirection, requestDirection) * 100; // у відсотках

        return {
          request,
          deviation,
          routeMatch,
        };
      })
      .filter(({ request, deviation, routeMatch }) => {
        // Перевіряємо чи заявка валідна
        if (!this.isRequestValid(route, request, driverProfile)) {
          return false;
        }

        // Перевіряємо відхилення для Live Route (більш м'які критерії)
        if (deviation.distance > this.LIVE_ROUTE_MAX_DISTANCE_DEVIATION) {
          return false;
        }
        if (deviation.time > this.LIVE_ROUTE_MAX_TIME_DEVIATION) {
          return false;
        }

        // Перевіряємо співпадіння напрямку
        if (routeMatch < this.LIVE_ROUTE_MIN_DIRECTION_MATCH * 100) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Сортуємо по відхиленню (менше = краще)
        const scoreA = a.deviation.distance + (a.deviation.time / 2);
        const scoreB = b.deviation.distance + (b.deviation.time / 2);
        return scoreA - scoreB;
      })
      .map(({ request, deviation, routeMatch }) => ({
        request,
        distanceDeviation: deviation.distance,
        timeDeviation: deviation.time,
        routeMatch: Math.round(routeMatch),
      }));

    return compatiblePassengers;
  }

  /**
   * Рахує відхилення заявки від маршруту
   */
  calculateDeviation(route: RouteStop[], request: ActiveRequest): { distance: number; time: number } {
    if (route.length === 0) {
      return { distance: 0, time: 0 };
    }

    // Знаходимо найближчу точку маршруту до pickup
    let minDistanceToPickup = Infinity;
    let minDistanceToDropoff = Infinity;

    for (const stop of route) {
      const distToPickup = this.calculateDistance(
        stop.pickup.x, stop.pickup.y,
        request.pickup.x, request.pickup.y
      );
      const distToDropoff = this.calculateDistance(
        stop.dropoff.x, stop.dropoff.y,
        request.dropoff.x, request.dropoff.y
      );

      minDistanceToPickup = Math.min(minDistanceToPickup, distToPickup);
      minDistanceToDropoff = Math.min(minDistanceToDropoff, distToDropoff);
    }

    // Конвертуємо в км (1 одиниця = 0.1 км)
    const distanceKm = (minDistanceToPickup + minDistanceToDropoff) * 0.1;

    // Орієнтовний час (припускаємо 60 км/год)
    const timeMinutes = (distanceKm / 60) * 60;

    return {
      distance: Math.round(distanceKm * 10) / 10,
      time: Math.round(timeMinutes),
    };
  }

  /**
   * Перевіряє чи заявка валідна для водія
   */
  isRequestValid(route: RouteStop[], request: ActiveRequest, driverProfile: DriverProfile): boolean {
    // Перевірка для посилок: розмір авто
    if (request.type === 'parcel' && request.parcel) {
      if (!driverProfile.vehicle.supportedSizes.includes(request.parcel.size)) {
        return false;
      }

      // Перевірка ваги
      const currentWeight = route
        .filter(s => s.type === 'parcel' && s.status !== 'delivered')
        .reduce((sum, s) => sum + (s.parcel?.weight || 0), 0);

      if (currentWeight + request.parcel.weight > driverProfile.vehicle.maxWeight) {
        return false;
      }
    }

    // Перевірка для пасажирів: місткість авто
    if (request.type === 'passenger') {
      const currentPassengers = route
        .filter(s => s.type === 'passenger' && s.status !== 'delivered')
        .length;

      if (currentPassengers >= driverProfile.vehicle.capacity) {
        return false;
      }
    }

    // Перевірка напрямку (простий алгоритм)
    if (route.length > 0) {
      const routeDirection = this.calculateDirection(route);
      const requestDirection = this.calculateRequestDirection(request);
      const directionMatch = this.calculateDirectionMatch(routeDirection, requestDirection);

      if (directionMatch < this.MIN_DIRECTION_MATCH) {
        return false;
      }
    }

    return true;
  }

  /**
   * Рахує напрямок маршруту
   */
  private calculateDirection(route: RouteStop[]): { x: number; y: number } {
    if (route.length === 0) return { x: 0, y: 0 };

    const first = route[0].pickup;
    const last = route[route.length - 1].dropoff;

    return {
      x: last.x - first.x,
      y: last.y - first.y,
    };
  }

  /**
   * Рахує напрямок заявки
   */
  private calculateRequestDirection(request: ActiveRequest): { x: number; y: number } {
    return {
      x: request.dropoff.x - request.pickup.x,
      y: request.dropoff.y - request.pickup.y,
    };
  }

  /**
   * Рахує співпадіння напрямків (0-1)
   */
  private calculateDirectionMatch(
    dir1: { x: number; y: number },
    dir2: { x: number; y: number }
  ): number {
    const dot = dir1.x * dir2.x + dir1.y * dir2.y;
    const mag1 = Math.sqrt(dir1.x ** 2 + dir1.y ** 2);
    const mag2 = Math.sqrt(dir2.x ** 2 + dir2.y ** 2);

    if (mag1 === 0 || mag2 === 0) return 0;

    const cos = dot / (mag1 * mag2);
    // Конвертуємо з -1..1 в 0..1
    return (cos + 1) / 2;
  }

  /**
   * Рахує відстань між двома точками
   */
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}

export const matchingService: MatchingService = new MatchingServiceImpl();

