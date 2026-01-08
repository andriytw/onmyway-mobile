/**
 * DriverApp Screen
 * Placeholder UI but DriverProvider exists and all state variables from workflow contract
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDriver } from '../../contexts/DriverContext';
import DriverMapView from '../../components/Driver/DriverMapView';
import DriverBottomSheet from '../../components/Driver/DriverBottomSheet';
import DateFilter from '../../components/Driver/DateFilter';
import { useNavigation } from '@react-navigation/native';

const DriverAppContent: React.FC = () => {
  const navigation = useNavigation();
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

      {/* Date Filter */}
      <DateFilter />

      {/* Menu button to open drawer */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => (navigation as any).openDrawer()}
        activeOpacity={0.7}
      >
        <Icon name="menu" size={20} color="#0f172a" />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <DriverBottomSheet />
    </View>
  );
};

// DriverApp no longer needs DriverProvider wrapper
// It's now provided by DriverDrawerNavigator
const DriverApp: React.FC = () => {
  return <DriverAppContent />;
};

export default DriverApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
  },
});

