/**
 * MapboxMap Component
 * Reusable Mapbox map component for React Native
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Mapbox, { MapView, Camera } from '@rnmapbox/maps';
import { SERVICES_CONFIG } from '../../config/services.config';

export interface MapboxMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  onRegionChange?: (region: { center: [number, number]; zoom: number }) => void;
  onMapReady?: () => void;
  style?: any;
  children?: React.ReactNode;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  center = [30.5234, 50.4501], // Default: Kyiv
  zoom = 12,
  onRegionChange,
  onMapReady,
  style,
  children,
}) => {
  const cameraRef = useRef<Camera>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize Mapbox token
  useEffect(() => {
    try {
      const token = SERVICES_CONFIG.MAPBOX_PUBLIC_TOKEN;
      if (token && token.trim() !== '') {
        Mapbox.setAccessToken(token);
        setInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize Mapbox in MapboxMap:', error);
    }
  }, []);

  useEffect(() => {
    if (cameraRef.current && center) {
      cameraRef.current.setCamera({
        centerCoordinate: center,
        zoomLevel: zoom,
        animationDuration: 300,
      });
    }
  }, [center, zoom]);

  const handleRegionDidChange = (feature: any) => {
    if (onRegionChange && feature?.properties?.center) {
      onRegionChange({
        center: feature.properties.center,
        zoom: feature.properties.zoom || zoom,
      });
    }
  };

  if (!SERVICES_CONFIG.MAPBOX_PUBLIC_TOKEN || !initialized) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          {/* Error will be handled by parent */}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onDidFinishLoadingMap={onMapReady}
        onRegionDidChange={handleRegionDidChange}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: center,
            zoomLevel: zoom,
          }}
        />
        {children}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
});

export default MapboxMap;
