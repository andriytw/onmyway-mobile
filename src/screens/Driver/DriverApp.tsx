/**
 * DriverApp Screen
 * Placeholder UI but DriverProvider exists and all state variables from workflow contract
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DriverProvider } from '../../contexts/DriverContext';
import { useDriver } from '../../contexts/DriverContext';
import DriverMapView from '../../components/Driver/DriverMapView';

const DriverAppContent: React.FC = () => {
  // Access all DriverContext state (from workflow contract)
  const {
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
  } = useDriver();

  return (
    <View style={styles.container}>
      {/* Full-screen map container - ready for Mapbox */}
      <DriverMapView />

      {/* Placeholder info overlay - positioned absolutely */}
      <View style={styles.overlay}>
        <View style={styles.infoCard}>
          <Text style={styles.title}>Driver App</Text>
          <Text style={styles.subtitle}>Placeholder - DriverProvider active</Text>
          <Text style={styles.stateText}>isOnline: {isOnline.toString()}</Text>
          <Text style={styles.stateText}>currentRoute.length: {currentRoute.length}</Text>
          <Text style={styles.stateText}>activeRequests.length: {activeRequests.length}</Text>
          <Text style={styles.stateText}>isInRoute: {isInRoute.toString()}</Text>
          <Text style={styles.stateText}>availablePassengers: {availablePassengers.length}</Text>
        </View>
      </View>
    </View>
  );
};

const DriverApp: React.FC = () => {
  return (
    <DriverProvider>
      <DriverAppContent />
    </DriverProvider>
  );
};

export default DriverApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    maxHeight: 300,
  },
  infoCard: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  stateText: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
  },
});

