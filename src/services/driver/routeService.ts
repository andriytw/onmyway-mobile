/**
 * Route Service
 * Логіка для роботи з маршрутами
 * Може залишитись локальною (не потребує backend)
 */

import { RouteStop, RouteStats } from '../../types/driver.types';

export interface RouteService {
  addStopToRoute(route: RouteStop[], request: { pickup: RouteStop['pickup']; dropoff: RouteStop['dropoff']; type: 'passenger' | 'parcel' }): RouteStop[];
  reorderRoute(route: RouteStop[], fromIndex: number, toIndex: number): RouteStop[];
  optimizeRoute(route: RouteStop[]): RouteStop[];
  calculateRouteStats(route: RouteStop[], baseDistance?: number): RouteStats;
}

class RouteServiceImpl implements RouteService {
  /**
   * Додає зупинку в оптимальне місце маршруту
   */
  addStopToRoute(
    route: RouteStop[],
    request: { pickup: RouteStop['pickup']; dropoff: RouteStop['dropoff']; type: 'passenger' | 'parcel' }
  ): RouteStop[] {
    if (route.length === 0) {
      // Якщо маршрут порожній, додаємо як першу зупинку
      return [{
        id: `stop-${Date.now()}`,
        type: request.type,
        order: 0,
        pickup: request.pickup,
        dropoff: request.dropoff,
        status: 'pending',
      }];
    }

    // Знаходимо найкраще місце для вставки
    // Простий алгоритм: вставляємо pickup після найближчої точки маршруту
    let bestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < route.length; i++) {
      const stop = route[i];
      // Відстань від поточної зупинки до pickup
      const distance = this.calculateDistance(
        stop.pickup.x, stop.pickup.y,
        request.pickup.x, request.pickup.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = i + 1;
      }
    }

    // Створюємо нову зупинку
    const newStop: RouteStop = {
      id: `stop-${Date.now()}`,
      type: request.type,
      order: bestIndex,
      pickup: request.pickup,
      dropoff: request.dropoff,
      status: 'pending',
    };

    // Вставляємо в маршрут
    const newRoute = [...route];
    newRoute.splice(bestIndex, 0, newStop);

    // Оновлюємо порядок
    return this.updateOrder(newRoute);
  }

  /**
   * Змінює порядок зупинок
   */
  reorderRoute(route: RouteStop[], fromIndex: number, toIndex: number): RouteStop[] {
    const newRoute = [...route];
    const [removed] = newRoute.splice(fromIndex, 1);
    newRoute.splice(toIndex, 0, removed);
    return this.updateOrder(newRoute);
  }

  /**
   * Оптимізує порядок зупинок (простий алгоритм)
   */
  optimizeRoute(route: RouteStop[]): RouteStop[] {
    if (route.length <= 1) return route;

    // Простий алгоритм: сортуємо по відстані від початку
    const sorted = [...route].sort((a, b) => {
      const distA = Math.sqrt(a.pickup.x ** 2 + a.pickup.y ** 2);
      const distB = Math.sqrt(b.pickup.x ** 2 + b.pickup.y ** 2);
      return distA - distB;
    });

    return this.updateOrder(sorted);
  }

  /**
   * Рахує статистику маршруту
   */
  calculateRouteStats(route: RouteStop[], baseDistance?: number): RouteStats {
    let totalDistance = 0;
    let totalPassengers = 0;
    let totalParcels = 0;
    let totalWeight = 0;

    // Рахуємо відстань між зупинками
    for (let i = 0; i < route.length; i++) {
      const stop = route[i];
      
      if (stop.type === 'passenger') {
        totalPassengers++;
      } else if (stop.type === 'parcel') {
        totalParcels++;
        totalWeight += stop.parcel?.weight || 0;
      }

      // Відстань від pickup до dropoff
      const stopDistance = this.calculateDistance(
        stop.pickup.x, stop.pickup.y,
        stop.dropoff.x, stop.dropoff.y
      );
      totalDistance += stopDistance;

      // Відстань до наступної зупинки
      if (i < route.length - 1) {
        const nextStop = route[i + 1];
        const toNext = this.calculateDistance(
          stop.dropoff.x, stop.dropoff.y,
          nextStop.pickup.x, nextStop.pickup.y
        );
        totalDistance += toNext;
      }
    }

    // Конвертуємо в км (припускаємо що 1 одиниця = 0.1 км)
    totalDistance = totalDistance * 0.1;

    // Орієнтовні витрати на паливо (7.5 л/100км, €1.5/л)
    const estimatedFuel = (totalDistance / 100) * 7.5 * 1.5;

    // Орієнтовний дохід (€0.5/км для пасажирів, €45 за посилку)
    const estimatedEarnings = (totalDistance * 0.5 * totalPassengers) + (totalParcels * 45);

    // Ефективність (порівняно з базовим маршрутом)
    const efficiency = baseDistance && baseDistance > 0
      ? ((estimatedEarnings / totalDistance) / (estimatedEarnings / baseDistance) - 1) * 100
      : 0;

    return {
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalPassengers,
      totalParcels,
      totalWeight: Math.round(totalWeight),
      estimatedFuel: Math.round(estimatedFuel * 10) / 10,
      estimatedEarnings: Math.round(estimatedEarnings * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
      stopsCount: route.length,
      baseDistance,
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
   * Рахує відстань між двома точками
   */
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}

export const routeService: RouteService = new RouteServiceImpl();

