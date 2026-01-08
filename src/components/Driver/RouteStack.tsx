/**
 * RouteStack
 * React Native version - Route stack component with expand/collapse
 * Simplified version without drag & drop (can be added later)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDriver } from '../../contexts/DriverContext';
import RouteStackItem from './RouteStackItem';
import {
  convertRouteStopsToPoints,
} from '../../services/driver/routeDisplayUtils';
import { RoutePointDisplay } from '../../types/driver.types';

const RouteStack: React.FC = () => {
  const {
    currentRoute,
    routeStats,
  } = useDriver();

  const [points, setPoints] = useState<RoutePointDisplay[]>([]);
  const [expandedPointId, setExpandedPointId] = useState<string | null>(null);

  // Convert RouteStop[] to RoutePointDisplay[]
  useEffect(() => {
    if (currentRoute.length > 0) {
      const convertedPoints = convertRouteStopsToPoints(currentRoute);
      setPoints(convertedPoints);
    } else {
      setPoints([]);
    }
  }, [currentRoute]);

  const handleTap = (pointId: string) => {
    setExpandedPointId(expandedPointId === pointId ? null : pointId);
  };

  if (currentRoute.length === 0 || points.length === 0) {
    return null;
  }

  // Sort points by order
  const sortedPoints = [...points].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Маршрут</Text>
        {routeStats && (
          <Text style={styles.stats}>
            {sortedPoints.length} точок • {routeStats.totalDistance} км
          </Text>
        )}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sortedPoints.map((point, index) => (
          <View key={point.id}>
            <RouteStackItem
              point={point}
              index={index}
              isExpanded={expandedPointId === point.id}
              onTap={() => handleTap(point.id)}
            />
            {index < sortedPoints.length - 1 && (
              <View style={styles.arrow}>
                <Icon name="chevron-down" size={16} color="#cbd5e1" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '900',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },
  stats: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: {
    maxHeight: 400,
  },
  arrow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default RouteStack;


