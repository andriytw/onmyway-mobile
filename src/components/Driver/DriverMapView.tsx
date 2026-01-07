/**
 * DriverMapView Component (Placeholder)
 * Phase 1: Simple placeholder View reading from DriverContext
 * Phase 2: Will integrate modules/mapbox/ with currentRoute, availablePassengers
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDriver } from '../../contexts/DriverContext';

const DriverMapView: React.FC = () => {
  const {
    currentRoute,
    availablePassengers,
    previewRoute,
    isInRoute,
    isOnline,
  } = useDriver();

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.placeholder}>
        <Text style={styles.title}>Driver Map Placeholder</Text>
        <Text style={styles.subtitle}>Phase 2 will add Mapbox</Text>
        <View style={styles.info}>
          <Text style={styles.infoText}>Online: {isOnline.toString()}</Text>
          <Text style={styles.infoText}>In Route: {isInRoute.toString()}</Text>
          <Text style={styles.infoText}>Route Stops: {currentRoute.length}</Text>
          <Text style={styles.infoText}>Available Passengers: {availablePassengers.length}</Text>
          <Text style={styles.infoText}>Preview Route: {previewRoute ? 'Yes' : 'No'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  info: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
});

export default DriverMapView;



