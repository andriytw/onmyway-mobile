/**
 * Route Display Utils
 * Утиліти для конвертації RouteStop[] ↔ RoutePointDisplay[]
 */

import { RouteStop, RoutePointDisplay } from '../../types/driver.types';

// Константи для розрахунку
const AVERAGE_SPEED_KMH = 60; // км/год
const PICKUP_TIME_MINUTES = 3; // хвилини на pickup
const DROPOFF_TIME_MINUTES = 2; // хвилини на dropoff

/**
 * Рахує відстань між двома точками (спрощений варіант)
 */
function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Конвертує RouteStop[] в RoutePointDisplay[]
 * Кожен RouteStop стає двома точками: pickup та dropoff
 */
export function convertRouteStopsToPoints(route: RouteStop[]): RoutePointDisplay[] {
  const points: RoutePointDisplay[] = [];
  let cumulativeDistance = 0; // км
  let cumulativeTime = 0; // хвилини

  route.forEach((stop, index) => {
    // Відстань від попередньої точки до pickup
    let distanceToPickup = 0;
    if (index > 0) {
      const prevStop = route[index - 1];
      distanceToPickup = calculateDistance(prevStop.dropoff, stop.pickup);
      cumulativeDistance += distanceToPickup * 0.1; // конвертуємо в км (1 одиниця = 0.1 км)
      cumulativeTime += (distanceToPickup * 0.1 / AVERAGE_SPEED_KMH) * 60; // хвилини
    }

    // Визначаємо чи це перша точка (старт) або остання точка (фініш)
    const isFirstStop = index === 0;
    const isLastStop = index === route.length - 1;

    // Pickup точка - якщо це перший stop, то це старт маршруту
    const pickupPoint: RoutePointDisplay = {
      id: `pickup-${stop.id}`,
      address: stop.pickup.address,
      action: isFirstStop ? 'start' : (stop.type === 'passenger' ? 'pickup_passenger' : 'pickup_parcel'),
      actionLabel: isFirstStop ? 'Старт маршруту' : (stop.type === 'passenger' ? 'Забрати пасажира' : 'Забрати посилку'),
      stopId: stop.id,
      order: index * 2,
      passenger: stop.passenger,
      parcel: stop.parcel,
      status: stop.status === 'picked_up' || stop.status === 'delivered' 
        ? 'picked_up' 
        : 'pending',
      eta: Math.round(cumulativeTime),
      distance: Math.round(cumulativeDistance * 10) / 10,
      price: stop.price,
      coordinates: stop.pickup,
    };
    points.push(pickupPoint);

    // Час на pickup операцію (для старту не додаємо час)
    if (!isFirstStop) {
      cumulativeTime += PICKUP_TIME_MINUTES;
    }

    // Відстань від pickup до dropoff
    const distancePickupToDropoff = calculateDistance(stop.pickup, stop.dropoff);
    cumulativeDistance += distancePickupToDropoff * 0.1; // конвертуємо в км
    cumulativeTime += (distancePickupToDropoff * 0.1 / AVERAGE_SPEED_KMH) * 60; // хвилини

    // Dropoff точка - якщо це останній stop, то це фініш маршруту
    const dropoffPoint: RoutePointDisplay = {
      id: `dropoff-${stop.id}`,
      address: stop.dropoff.address,
      action: isLastStop ? 'finish' : (stop.type === 'passenger' ? 'dropoff_passenger' : 'dropoff_parcel'),
      actionLabel: isLastStop ? 'Фініш маршруту' : (stop.type === 'passenger' ? 'Висадити пасажира' : 'Віддати посилку'),
      stopId: stop.id,
      order: index * 2 + 1,
      passenger: stop.passenger,
      parcel: stop.parcel,
      status: stop.status === 'delivered' ? 'delivered' : 'pending',
      eta: Math.round(cumulativeTime),
      distance: Math.round(cumulativeDistance * 10) / 10,
      price: stop.price,
      coordinates: stop.dropoff,
    };
    points.push(dropoffPoint);

    // Час на dropoff операцію (для фінішу не додаємо час)
    if (!isLastStop) {
      cumulativeTime += DROPOFF_TIME_MINUTES;
    }
  });

  return points;
}

/**
 * Конвертує RoutePointDisplay[] назад в RouteStop[]
 * Групує точки по stopId та створює RouteStop з pickup та dropoff
 */
export function convertPointsToRouteStops(
  points: RoutePointDisplay[],
  originalRoute: RouteStop[]
): RouteStop[] {
  // Створюємо мапу оригінальних RouteStop для збереження даних
  const originalMap = new Map(originalRoute.map(s => [s.id, s]));
  
  // Групуємо точки по stopId
  const stopMap = new Map<string, { pickup?: RoutePointDisplay; dropoff?: RoutePointDisplay }>();
  
  points.forEach(point => {
    if (!stopMap.has(point.stopId)) {
      stopMap.set(point.stopId, {});
    }
    const stop = stopMap.get(point.stopId)!;
    if (point.action.includes('pickup')) {
      stop.pickup = point;
    } else {
      stop.dropoff = point;
    }
  });
  
  // Сортуємо точки по order для визначення порядку
  const sortedPoints = [...points].sort((a, b) => a.order - b.order);
  
  // Створюємо новий маршрут
  const newRoute: RouteStop[] = [];
  const processedStops = new Set<string>();
  
  // Проходимо по відсортованим точкам і створюємо RouteStop
  sortedPoints.forEach(point => {
    if (processedStops.has(point.stopId)) return;
    
    const originalStop = originalMap.get(point.stopId);
    if (!originalStop) return;
    
    const stopData = stopMap.get(point.stopId);
    if (!stopData || !stopData.pickup || !stopData.dropoff) return;
    
    // Створюємо новий RouteStop з оновленими координатами
    newRoute.push({
      ...originalStop,
      pickup: stopData.pickup.coordinates,
      dropoff: stopData.dropoff.coordinates,
      order: newRoute.length,
    });
    
    processedStops.add(point.stopId);
  });
  
  return newRoute;
}

