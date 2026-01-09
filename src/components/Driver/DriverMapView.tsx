/**
 * DriverMapView Component
 * Apple Maps integration for Driver App (via react-native-maps)
 */

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Platform, PermissionsAndroid } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useDriver } from '../../contexts/DriverContext';
import { RouteStop } from '../../types/driver.types';

const DriverMapView: React.FC = () => {
  const {
    currentRoute,
    availablePassengers,
    previewRoute,
    selectedDate,
    isInRoute,
    isOnline,
    setMapCenterCallback,
  } = useDriver();

  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Method to center map on user location
  const centerOnUserLocation = useCallback((lat: number, lng: number) => {
    if (mapRef.current && mapReady) {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000 // Animation duration in ms
      );
    }
  }, [mapReady]);

  // Register center callback on mount
  useEffect(() => {
    setMapCenterCallback(centerOnUserLocation);
    return () => {
      setMapCenterCallback(null);
    };
  }, [centerOnUserLocation, setMapCenterCallback]);

  // Convert RouteStop to coordinates array for route line (react-native-maps format)
  const routeCoordinates = useMemo<Array<{ latitude: number; longitude: number }>>(() => {
    if (currentRoute.length === 0) return [];

    const coords: Array<{ latitude: number; longitude: number }> = [];
    
    currentRoute.forEach((stop) => {
      if (stop.pickup.lat && stop.pickup.lng) {
        coords.push({ latitude: stop.pickup.lat, longitude: stop.pickup.lng });
      }
      if (stop.dropoff.lat && stop.dropoff.lng) {
        coords.push({ latitude: stop.dropoff.lat, longitude: stop.dropoff.lng });
      }
    });

    return coords;
  }, [currentRoute]);

  // Preview route coordinates
  const previewRouteCoordinates = useMemo<Array<{ latitude: number; longitude: number }>>(() => {
    if (!previewRoute || previewRoute.length === 0) return [];

    const coords: Array<{ latitude: number; longitude: number }> = [];
    
    previewRoute.forEach((stop) => {
      if (stop.pickup.lat && stop.pickup.lng) {
        coords.push({ latitude: stop.pickup.lat, longitude: stop.pickup.lng });
      }
      if (stop.dropoff.lat && stop.dropoff.lng) {
        coords.push({ latitude: stop.dropoff.lat, longitude: stop.dropoff.lng });
      }
    });

    return coords;
  }, [previewRoute]);

  // Get user's current location on mount
  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((granted) => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.error('Error getting location:', error);
              // Fallback to Kyiv
              setUserLocation({ latitude: 50.4501, longitude: 30.5234 });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          // Fallback to Kyiv if permission denied
          setUserLocation({ latitude: 50.4501, longitude: 30.5234 });
        }
      });
    } else {
      // iOS
      Geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Kyiv
          setUserLocation({ latitude: 50.4501, longitude: 30.5234 });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, []);

  // Calculate initial region (user location, route bounds, or Kyiv center)
  const initialRegion = useMemo<Region>(() => {
    if (routeCoordinates.length > 0) {
      const lats = routeCoordinates.map(c => c.latitude);
      const lngs = routeCoordinates.map(c => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const latDelta = (maxLat - minLat) * 1.5 || 0.05;
      const lngDelta = (maxLng - minLng) * 1.5 || 0.05;

      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(latDelta, 0.05),
        longitudeDelta: Math.max(lngDelta, 0.05),
      };
    }
    // Use user location if available, otherwise Kyiv center
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // Default: Kyiv center
    return {
      latitude: 50.4501,
      longitude: 30.5234,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [routeCoordinates, userLocation]);

  // Filter available passengers by selected date
  const filteredPassengers = useMemo(() => {
    return availablePassengers.filter((passenger) => {
      if (selectedDate && passenger.request?.date) {
        return passenger.request.date === selectedDate;
      }
      return true;
    });
  }, [availablePassengers, selectedDate]);

  // Fit map to route when route changes
  useEffect(() => {
    if (routeCoordinates.length > 0 && mapRef.current && mapReady) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  }, [routeCoordinates, mapReady]);

  // Center map on user location when map is ready and no route exists
  useEffect(() => {
    if (userLocation && mapRef.current && mapReady && routeCoordinates.length === 0) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [userLocation, mapReady, routeCoordinates.length]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={() => {
          setMapReady(true);
          console.log('✅ Map ready (Apple Maps on iOS)');
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        // Apple Maps on iOS by default (no provider prop needed)
      >
        {/* Main Route Line */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2563eb"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Preview Route Line (dashed) */}
        {previewRouteCoordinates.length > 1 && (
          <Polyline
            coordinates={previewRouteCoordinates}
            strokeColor="#f59e0b"
            strokeWidth={4}
            lineDashPattern={[2, 2]}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Route Stop Markers */}
        {currentRoute.map((stop, index) => (
          <React.Fragment key={`${stop.id}-pickup-${index}`}>
            {stop.pickup.lat && stop.pickup.lng && (
              <Marker
                coordinate={{ 
                  latitude: stop.pickup.lat, 
                  longitude: stop.pickup.lng 
                }}
                identifier={`pickup-${stop.id}`}
              >
                <View style={styles.pickupMarker}>
                  <Text style={styles.markerText}>{stop.order + 1}</Text>
                </View>
              </Marker>
            )}
            {stop.dropoff.lat && stop.dropoff.lng && (
              <Marker
                coordinate={{ 
                  latitude: stop.dropoff.lat, 
                  longitude: stop.dropoff.lng 
                }}
                identifier={`dropoff-${stop.id}`}
              >
                <View style={styles.dropoffMarker}>
                  <Text style={styles.markerText}>{stop.order + 1}</Text>
                </View>
              </Marker>
            )}
          </React.Fragment>
        ))}

        {/* Available Passengers/Parcels Markers */}
        {filteredPassengers.map((passenger) => (
          <React.Fragment key={`request-${passenger.request?.id}`}>
            {passenger.request?.pickup?.lat && passenger.request?.pickup?.lng && (
              <Marker
                coordinate={{
                  latitude: passenger.request.pickup.lat,
                  longitude: passenger.request.pickup.lng,
                }}
                identifier={`request-${passenger.request.id}`}
              >
                <View style={styles.requestMarker}>
                  <Text style={styles.deviationText}>
                    +{passenger.distanceDeviation.toFixed(1)}км
                  </Text>
                  <Text style={styles.deviationText}>
                    +{passenger.timeDeviation}хв
                  </Text>
                </View>
              </Marker>
            )}
          </React.Fragment>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  pickupMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  dropoffMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  requestMarker: {
    minWidth: 60,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  markerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  deviationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default DriverMapView;
