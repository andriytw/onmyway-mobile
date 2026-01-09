/**
 * RouteStack
 * React Native version - Route stack component with smooth drag & drop
 * Using react-native-draggable-flatlist for smooth animations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  OpacityDecorator,
} from 'react-native-draggable-flatlist';
import { useDriver } from '../../contexts/DriverContext';
import RouteStackItem from './RouteStackItem';
import {
  convertRouteStopsToPoints,
} from '../../services/driver/routeDisplayUtils';
import { RoutePointDisplay } from '../../types/driver.types';

const RouteStack: React.FC = () => {
  const {
    currentRoute,
    reorderRoute,
  } = useDriver();

  const [points, setPoints] = useState<RoutePointDisplay[]>([]);

  // Convert RouteStop[] to RoutePointDisplay[]
  useEffect(() => {
    if (currentRoute.length > 0) {
      const convertedPoints = convertRouteStopsToPoints(currentRoute);
      // Сортуємо за order
      const sorted = [...convertedPoints].sort((a, b) => a.order - b.order);
      setPoints(sorted);
    } else {
      setPoints([]);
    }
  }, [currentRoute]);

  // Обробка переміщення під час drag (для плавності оновлення)
  const handleDragBegin = useCallback(() => {
    // Можна додати haptic feedback або візуальну індикацію
  }, []);

  // Обробка завершення drag з автоматичним reorder
  const handleDragEnd = useCallback(async ({ data, from, to }: { data: RoutePointDisplay[]; from: number; to: number }) => {
    if (from === to) {
      return; // Нічого не змінилося
    }

    // Зберігаємо оригінальний порядок для відкатування при помилці
    const originalPoints = [...points];
    
    // Оновлюємо локальний стан для плавної анімації
    setPoints(data);

    try {
      // Конвертуємо індекси точок в індекси stop (використовуємо оригінальний порядок)
      const fromPoint = originalPoints[from];
      const toPoint = originalPoints[to];
      
      if (!fromPoint || !toPoint) {
        // Відкатуємо зміни
        setPoints(originalPoints);
        return;
      }
      
      const fromStopIndex = currentRoute.findIndex(s => s.id === fromPoint.stopId);
      const toStopIndex = currentRoute.findIndex(s => s.id === toPoint.stopId);
      
      if (fromStopIndex === -1 || toStopIndex === -1 || fromStopIndex === toStopIndex) {
        // Відкатуємо зміни, якщо не вдалося знайти stop
        setPoints(originalPoints);
        return;
      }
      
      // Викликаємо reorderRoute з DriverContext (індекси stop, не точки)
      await reorderRoute(fromStopIndex, toStopIndex);
      
      // Після успішного reorder, оновлюємо точки з актуального маршруту
      // useEffect з currentRoute автоматично оновить точки
    } catch (error) {
      console.error('Failed to reorder route:', error);
      // Відкатуємо зміни при помилці
      setPoints(originalPoints);
    }
  }, [points, currentRoute, reorderRoute]);

  // Render item для DraggableFlatList
  const renderItem = useCallback(({ item, index, drag, isActive }: RenderItemParams<RoutePointDisplay>) => {
    return (
      <OpacityDecorator activeOpacity={0.7}>
        <View 
          style={{ 
            overflow: 'hidden', 
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <RouteStackItem
            point={item}
            index={index}
            onTap={() => {}}
            isDragging={isActive}
            onDrag={drag}
            totalItems={points.length}
          />
        </View>
      </OpacityDecorator>
    );
  }, [points.length]);

  const keyExtractor = useCallback((item: RoutePointDisplay) => item.id, []);

  if (currentRoute.length === 0 || points.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} clipsToBounds={true}>
      <DraggableFlatList
        data={points}
        onDragBegin={handleDragBegin}
        onDragEnd={handleDragEnd}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        activationDistance={10}
        autoscrollThreshold={50}
        autoscrollSpeed={100}
        containerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    clipsToBounds: true,
  },
  list: {
    paddingBottom: 8,
  },
  listContainer: {
    overflow: 'hidden',
    clipsToBounds: true,
  },
});

export default RouteStack;


