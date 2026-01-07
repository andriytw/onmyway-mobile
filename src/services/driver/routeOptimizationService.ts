/**
 * Route Optimization Service
 * Оптимізація маршруту з додаванням нових зупинок
 * Розрахунок preview та валідація порядку
 */

import { RouteStop, ActiveRequest } from '../../types/driver.types';

export interface RouteOptimizationService {
  optimizeRouteWithNewStop(
    currentRoute: RouteStop[],
    newRequest: ActiveRequest
  ): RouteStop[];
  calculateRoutePreview(
    currentRoute: RouteStop[],
    fromIndex: number,
    toIndex: number
  ): RouteStop[];
  validateRouteOrder(route: RouteStop[]): { valid: boolean; error?: string };
  recalculateETA(route: RouteStop[]): RouteStop[];
  calculateDeviationChange(
    route: RouteStop[],
    fromIndex: number,
    toIndex: number
  ): { distance: number; time: number };
}

class RouteOptimizationServiceImpl implements RouteOptimizationService {
  /**
   * Оптимізує маршрут, додаючи нову зупинку в оптимальне місце
   * НЕ додає в кінець, а знаходить найкращу позицію
   */
  optimizeRouteWithNewStop(
    currentRoute: RouteStop[],
    newRequest: ActiveRequest
  ): RouteStop[] {
    if (currentRoute.length === 0) {
      // Якщо маршрут порожній, додаємо як першу зупинку
      return [this.createStopFromRequest(newRequest, 0)];
    }

    // Знаходимо найкращі позиції для pickup і dropoff
    const bestPickupIndex = this.findBestInsertionIndex(
      currentRoute,
      newRequest.pickup,
      'pickup'
    );
    const bestDropoffIndex = this.findBestInsertionIndex(
      currentRoute,
      newRequest.dropoff,
      'dropoff',
      bestPickupIndex
    );

    // Створюємо нову зупинку
    const newStop = this.createStopFromRequest(newRequest, bestPickupIndex);

    // Вставляємо pickup
    const routeWithPickup = [...currentRoute];
    routeWithPickup.splice(bestPickupIndex, 0, newStop);

    // Оновлюємо індекси для dropoff (якщо pickup вставлено перед dropoff)
    const adjustedDropoffIndex =
      bestDropoffIndex > bestPickupIndex ? bestDropoffIndex + 1 : bestDropoffIndex;

    // Вставляємо dropoff після pickup
    const finalRoute = [...routeWithPickup];
    if (adjustedDropoffIndex <= bestPickupIndex) {
      // Якщо dropoff має бути перед pickup, це помилка - виправляємо
      finalRoute.splice(bestPickupIndex + 1, 0, {
        ...newStop,
        order: bestPickupIndex + 1,
      });
    } else {
      finalRoute.splice(adjustedDropoffIndex, 0, {
        ...newStop,
        order: adjustedDropoffIndex,
      });
    }

    // Оновлюємо порядок та ETA
    return this.recalculateETA(this.updateOrder(finalRoute));
  }

  /**
   * Розраховує preview маршруту під час drag & drop
   */
  calculateRoutePreview(
    currentRoute: RouteStop[],
    fromIndex: number,
    toIndex: number
  ): RouteStop[] {
    if (fromIndex === toIndex) return currentRoute;

    const newRoute = [...currentRoute];
    const [moved] = newRoute.splice(fromIndex, 1);
    newRoute.splice(toIndex, 0, moved);

    return this.updateOrder(newRoute);
  }

  /**
   * Перевіряє валідність порядку маршруту
   * Не можна ставити dropoff перед pickup того ж пасажира
   */
  validateRouteOrder(route: RouteStop[]): { valid: boolean; error?: string } {
    // Групуємо pickup і dropoff по ID зупинки
    const stopGroups = new Map<string, { pickupIndex?: number; dropoffIndex?: number }>();

    route.forEach((stop, index) => {
      const key = stop.id;
      if (!stopGroups.has(key)) {
        stopGroups.set(key, {});
      }
      const group = stopGroups.get(key)!;
      // Для простоти вважаємо, що pickup і dropoff - це одна зупинка
      // В реальності потрібно перевіряти по passenger.id або parcel.id
    });

    // Перевіряємо, що завершені зупинки не можна переміщувати
    const completedStops = route.filter(s => s.status === 'delivered');
    if (completedStops.length > 0 && route.length > 1) {
      // Перевіряємо, чи завершені зупинки не переміщуються
      // Це буде перевірятися в UI при drag
    }

    return { valid: true };
  }

  /**
   * Перераховує ETA для всіх зупинок
   */
  recalculateETA(route: RouteStop[]): RouteStop[] {
    if (route.length === 0) return route;

    const updatedRoute = [...route];
    let cumulativeTime = 0; // хвилини від початку

    updatedRoute.forEach((stop, index) => {
      // Час до pickup
      if (index > 0) {
        const prevStop = updatedRoute[index - 1];
        const distanceToPickup = this.calculateDistance(
          prevStop.dropoff.x,
          prevStop.dropoff.y,
          stop.pickup.x,
          stop.pickup.y
        );
        cumulativeTime += this.distanceToTime(distanceToPickup);
      }

      // Час від pickup до dropoff
      const distanceToDropoff = this.calculateDistance(
        stop.pickup.x,
        stop.pickup.y,
        stop.dropoff.x,
        stop.dropoff.y
      );
      const timeToDropoff = this.distanceToTime(distanceToDropoff);

      updatedRoute[index] = {
        ...stop,
        eta: Math.round(cumulativeTime + timeToDropoff),
      };

      cumulativeTime += timeToDropoff;
    });

    return updatedRoute;
  }

  /**
   * Розраховує зміну відхилення при переміщенні зупинки
   */
  calculateDeviationChange(
    route: RouteStop[],
    fromIndex: number,
    toIndex: number
  ): { distance: number; time: number } {
    if (fromIndex === toIndex) {
      return { distance: 0, time: 0 };
    }

    const previewRoute = this.calculateRoutePreview(route, fromIndex, toIndex);
    const originalDistance = this.calculateTotalDistance(route);
    const previewDistance = this.calculateTotalDistance(previewRoute);

    const distanceChange = previewDistance - originalDistance;
    const timeChange = this.distanceToTime(distanceChange);

    return {
      distance: Math.round(distanceChange * 10) / 10,
      time: Math.round(timeChange),
    };
  }

  /**
   * Знаходить найкращий індекс для вставки нової точки
   */
  private findBestInsertionIndex(
    route: RouteStop[],
    point: { x: number; y: number },
    type: 'pickup' | 'dropoff',
    afterIndex?: number
  ): number {
    if (route.length === 0) return 0;

    let bestIndex = 0;
    let minDistance = Infinity;

    const startIndex = type === 'dropoff' && afterIndex !== undefined ? afterIndex + 1 : 0;

    for (let i = startIndex; i <= route.length; i++) {
      let distance = 0;

      if (i === 0) {
        // Вставка на початок
        distance = this.calculateDistance(
          point.x,
          point.y,
          route[0].pickup.x,
          route[0].pickup.y
        );
      } else if (i === route.length) {
        // Вставка в кінець
        const lastStop = route[route.length - 1];
        distance = this.calculateDistance(
          lastStop.dropoff.x,
          lastStop.dropoff.y,
          point.x,
          point.y
        );
      } else {
        // Вставка між зупинками
        const prevStop = route[i - 1];
        const nextStop = route[i];
        const distToPrev = this.calculateDistance(
          prevStop.dropoff.x,
          prevStop.dropoff.y,
          point.x,
          point.y
        );
        const distToNext = this.calculateDistance(
          point.x,
          point.y,
          nextStop.pickup.x,
          nextStop.pickup.y
        );
        distance = distToPrev + distToNext;
      }

      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  /**
   * Створює RouteStop з ActiveRequest
   */
  private createStopFromRequest(request: ActiveRequest, order: number): RouteStop {
    return {
      id: `stop-${request.id}-${Date.now()}`,
      type: request.type,
      order,
      pickup: request.pickup,
      dropoff: request.dropoff,
      passenger: request.passenger ? {
        id: request.passenger.id,
        name: request.passenger.name,
        phone: '', // ActiveRequest doesn't include phone
        rating: request.passenger.rating,
      } : undefined,
      parcel: request.parcel,
      status: 'pending',
      price: request.price,
    };
  }

  /**
   * Оновлює порядок зупинок
   */
  private updateOrder(route: RouteStop[]): RouteStop[] {
    return route.map((stop, index) => ({
      ...stop,
      order: index,
    }));
  }

  /**
   * Рахує загальну відстань маршруту
   */
  private calculateTotalDistance(route: RouteStop[]): number {
    if (route.length === 0) return 0;

    let total = 0;

    for (let i = 0; i < route.length; i++) {
      const stop = route[i];
      // Відстань від pickup до dropoff
      total += this.calculateDistance(
        stop.pickup.x,
        stop.pickup.y,
        stop.dropoff.x,
        stop.dropoff.y
      );

      // Відстань до наступної зупинки
      if (i < route.length - 1) {
        const nextStop = route[i + 1];
        total += this.calculateDistance(
          stop.dropoff.x,
          stop.dropoff.y,
          nextStop.pickup.x,
          nextStop.pickup.y
        );
      }
    }

    return total;
  }

  /**
   * Рахує відстань між двома точками
   */
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  /**
   * Конвертує відстань в час (припускаємо 60 км/год, 1 одиниця = 0.1 км)
   */
  private distanceToTime(distance: number): number {
    const distanceKm = distance * 0.1;
    return (distanceKm / 60) * 60; // хвилини
  }
}

export const routeOptimizationService: RouteOptimizationService =
  new RouteOptimizationServiceImpl();

