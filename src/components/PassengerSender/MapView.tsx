/**
 * MapView Component (Placeholder)
 * Phase 1: Simple placeholder View
 * Phase 2: Will wrap modules/mapbox/MapboxMap.tsx
 * 
 * Props interface matches workflow contract exactly
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Driver } from '../../types';

interface MapViewProps {
  zoom: number;
  setZoom: (z: number) => void;
  isConfirmed: boolean;
  driverProgress: number;
  isInCar: boolean;
  tripProgress: number;
  selectedDriver: Driver | null;
  isSearching: boolean;
  showDrivers: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  zoom,
  setZoom,
  isConfirmed,
  driverProgress,
  isInCar,
  tripProgress,
  selectedDriver,
  isSearching,
  showDrivers,
}) => {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.placeholder}>
        <Text style={styles.title}>Map Placeholder</Text>
        <Text style={styles.subtitle}>Phase 2 will add Mapbox</Text>
        <View style={styles.info}>
          <Text style={styles.infoText}>Zoom: {zoom.toFixed(2)}</Text>
          <Text style={styles.infoText}>Confirmed: {isConfirmed.toString()}</Text>
          <Text style={styles.infoText}>Driver Progress: {(driverProgress * 100).toFixed(0)}%</Text>
          <Text style={styles.infoText}>Trip Progress: {(tripProgress * 100).toFixed(0)}%</Text>
          <Text style={styles.infoText}>In Car: {isInCar.toString()}</Text>
          <Text style={styles.infoText}>Searching: {isSearching.toString()}</Text>
          <Text style={styles.infoText}>Show Drivers: {showDrivers.toString()}</Text>
          {selectedDriver && (
            <Text style={styles.infoText}>Driver: {selectedDriver.name}</Text>
          )}
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

export default MapView;

