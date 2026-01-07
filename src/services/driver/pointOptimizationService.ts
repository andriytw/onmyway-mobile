/**
 * Point Optimization Service
 * Оптимізація маршруту по точках з обмеженнями (pickup перед dropoff)
 */

import { RouteStop, RoutePoint, PassengerParcelInput } from '../../types/driver.types';

export interface PointOptimizationService {
  optimizeRouteByPoints(
    origin: string,
    destination: string,
    passengersParcels: PassengerParcelInput[]
  ): RouteStop[];
  
  calculateRouteDistance(points: RoutePoint[]): number;
  
  validateRouteConstraints(route: RoutePoint[]): boolean;
}

class PointOptimizationServiceImpl implements PointOptimizationService {
  /**
   * Оптимізує маршрут по точках з обмеженнями
   * Використовує комбінацію жадібного алгоритму та 2-opt
   */
  optimizeRouteByPoints(
    origin: string,
    destination: string,
    passengersParcels: PassengerParcelInput[]
  ): RouteStop[] {
    // 1. Збираємо всі точки
    const allPoints = this.collectAllPoints(origin, destination, passengersParcels);
    
    // 2. Створюємо початковий маршрут (жадібний алгоритм)
    let optimizedRoute = this.greedyOptimization(allPoints);
    
    // 3. Покращуємо через 2-opt
    optimizedRoute = this.twoOptOptimization(optimizedRoute);
    
    // 4. Конвертуємо в RouteStop[]
    return this.convertToRouteStops(optimizedRoute, passengersParcels);
  }

  /**
   * Збирає всі точки з origin, destination та pickup/dropoff
   */
  private collectAllPoints(
    origin: string,
    destination: string,
    passengersParcels: PassengerParcelInput[]
  ): RoutePoint[] {
    const points: RoutePoint[] = [
      {
        id: 'origin',
        address: origin,
        type: 'origin',
        coordinates: { x: 0, y: 0 }, // буде замінено на реальні координати
      },
    ];

    // Додаємо pickup та dropoff для кожного пасажира/посилки
    passengersParcels.forEach((pp) => {
      points.push({
        id: `pickup-${pp.id}`,
        address: pp.pickup,
        type: 'pickup',
        passengerParcelId: pp.id,
        passengerParcelType: pp.type,
        coordinates: { x: 0, y: 0 },
      });
      
      points.push({
        id: `dropoff-${pp.id}`,
        address: pp.dropoff,
        type: 'dropoff',
        passengerParcelId: pp.id,
        passengerParcelType: pp.type,
        coordinates: { x: 0, y: 0 },
      });
    });

    points.push({
      id: 'destination',
      address: destination,
      type: 'destination',
      coordinates: { x: 0, y: 0 },
    });

    return points;
  }

  /**
   * Жадібний алгоритм оптимізації
   */
  private greedyOptimization(points: RoutePoint[]): RoutePoint[] {
    const origin = points.find(p => p.type === 'origin')!;
    const destination = points.find(p => p.type === 'destination')!;
    const remaining = points.filter(p => p.type !== 'origin' && p.type !== 'destination');
    
    const route: RoutePoint[] = [origin];
    const visited = new Set<string>([origin.id]);
    const pickedUp = new Set<string>(); // які пасажири/посилки вже забрані
    
    let current = origin;
    
    // Додаємо точки поки не залишиться тільки destination
    while (route.length < points.length - 1) {
      let bestNext: RoutePoint | null = null;
      let minDistance = Infinity;
      
      for (const point of remaining) {
        if (visited.has(point.id)) continue;
        
        // Перевірка обмежень: dropoff можна тільки після pickup
        if (point.type === 'dropoff' && point.passengerParcelId) {
          if (!pickedUp.has(point.passengerParcelId)) {
            continue; // ще не забрали, пропускаємо
          }
        }
        
        const distance = this.calculateDistance(
          current.coordinates!,
          point.coordinates!
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          bestNext = point;
        }
      }
      
      if (bestNext) {
        route.push(bestNext);
        visited.add(bestNext.id);
        
        if (bestNext.type === 'pickup' && bestNext.passengerParcelId) {
          pickedUp.add(bestNext.passengerParcelId);
        }
        
        current = bestNext;
      } else {
        // Якщо не знайшли доступну точку, додаємо destination
        break;
      }
    }
    
    // Додаємо destination в кінець
    route.push(destination);
    
    return route;
  }

  /**
   * 2-opt оптимізація для покращення маршруту
   */
  private twoOptOptimization(route: RoutePoint[]): RoutePoint[] {
    if (route.length <= 3) return route; // origin, destination, + максимум 1 точка
    
    let improved = true;
    let bestRoute = [...route];
    let bestDistance = this.calculateRouteDistance(bestRoute);
    let iterations = 0;
    const maxIterations = 10; // обмежуємо кількість ітерацій
    
    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      
      for (let i = 1; i < bestRoute.length - 2; i++) {
        for (let j = i + 1; j < bestRoute.length - 1; j++) {
          // Пробуємо обернути сегмент між i та j
          const newRoute = this.reverseSegment(bestRoute, i, j);
          
          // Перевіряємо обмеження
          if (!this.validateRouteConstraints(newRoute)) {
            continue;
          }
          
          const newDistance = this.calculateRouteDistance(newRoute);
          
          if (newDistance < bestDistance) {
            bestRoute = newRoute;
            bestDistance = newDistance;
            improved = true;
            break; // починаємо знову після покращення
          }
        }
        if (improved) break;
      }
    }
    
    return bestRoute;
  }

  /**
   * Обертає сегмент маршруту між індексами
   */
  private reverseSegment(route: RoutePoint[], i: number, j: number): RoutePoint[] {
    const newRoute = [...route];
    const segment = newRoute.slice(i, j + 1).reverse();
    newRoute.splice(i, j - i + 1, ...segment);
    return newRoute;
  }

  /**
   * Перевіряє обмеження маршруту
   */
  validateRouteConstraints(route: RoutePoint[]): boolean {
    if (route.length === 0) return false;
    
    // Origin має бути першим
    if (route[0].type !== 'origin') return false;
    
    // Destination має бути останнім
    if (route[route.length - 1].type !== 'destination') return false;
    
    // Для кожного пасажира/посилки: pickup має бути перед dropoff
    const pickupIndices = new Map<string, number>();
    const dropoffIndices = new Map<string, number>();
    
    route.forEach((point, index) => {
      if (point.type === 'pickup' && point.passengerParcelId) {
        pickupIndices.set(point.passengerParcelId, index);
      }
      if (point.type === 'dropoff' && point.passengerParcelId) {
        dropoffIndices.set(point.passengerParcelId, index);
      }
    });
    
    for (const [id, pickupIndex] of pickupIndices.entries()) {
      const dropoffIndex = dropoffIndices.get(id);
      if (dropoffIndex !== undefined && dropoffIndex <= pickupIndex) {
        return false; // dropoff перед pickup
      }
    }
    
    return true;
  }

  /**
   * Рахує загальну відстань маршруту
   */
  calculateRouteDistance(points: RoutePoint[]): number {
    if (points.length < 2) return 0;
    
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += this.calculateDistance(
        points[i].coordinates!,
        points[i + 1].coordinates!
      );
    }
    return total;
  }

  /**
   * Конвертує RoutePoint[] в RouteStop[]
   */
  private convertToRouteStops(
    route: RoutePoint[],
    passengersParcels: PassengerParcelInput[]
  ): RouteStop[] {
    const stops: RouteStop[] = [];
    const ppMap = new Map(passengersParcels.map(pp => [pp.id, pp]));
    
    // Проходимо по маршруту і створюємо RouteStop для кожної пари pickup-dropoff
    // або для проміжних сегментів між origin/destination та pickup/dropoff
    let currentPickup: RoutePoint | null = null;
    
    for (let i = 0; i < route.length - 1; i++) {
      const current = route[i];
      const next = route[i + 1];
      
      // Якщо поточна точка - pickup, зберігаємо її
      if (current.type === 'pickup' && current.passengerParcelId) {
        currentPickup = current;
      }
      
      // Якщо наступна точка - dropoff того ж пасажира, створюємо RouteStop
      if (
        currentPickup &&
        next.type === 'dropoff' &&
        next.passengerParcelId === currentPickup.passengerParcelId
      ) {
        const pp = ppMap.get(currentPickup.passengerParcelId!);
        if (pp) {
          stops.push({
            id: `stop-${pp.id}-${Date.now()}`,
            type: pp.type,
            order: stops.length,
            pickup: {
              x: currentPickup.coordinates?.x || 0,
              y: currentPickup.coordinates?.y || 0,
              address: currentPickup.address,
            },
            dropoff: {
              x: next.coordinates?.x || 0,
              y: next.coordinates?.y || 0,
              address: next.address,
            },
            passenger: pp.passenger ? {
              id: pp.id,
              name: pp.passenger.name,
              phone: pp.passenger.phone || '',
              rating: 5,
            } : undefined,
            parcel: pp.parcel ? {
              id: pp.id,
              ...pp.parcel,
            } : undefined,
            status: 'pending',
            price: pp.price,
          });
        }
        currentPickup = null;
      } else if (
        (current.type === 'origin' || current.type === 'destination' || current.type === 'dropoff') &&
        (next.type === 'origin' || next.type === 'destination' || next.type === 'pickup')
      ) {
        // Проміжні сегменти (між origin та першим pickup, між dropoff та наступним pickup, між останнім dropoff та destination)
        stops.push({
          id: `segment-${i}-${Date.now()}`,
          type: 'passenger',
          order: stops.length,
          pickup: {
            x: current.coordinates?.x || 0,
            y: current.coordinates?.y || 0,
            address: current.address,
          },
          dropoff: {
            x: next.coordinates?.x || 0,
            y: next.coordinates?.y || 0,
            address: next.address,
          },
          status: 'pending',
        });
      }
    }
    
    return stops;
  }

  /**
   * Рахує відстань між двома точками
   */
  private calculateDistance(
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }
}

export const pointOptimizationService: PointOptimizationService =
  new PointOptimizationServiceImpl();

