/**
 * useMapbox Hook
 * Custom hook for Mapbox map operations
 */

import { useRef, useCallback } from 'react';
import { MapView, Camera } from '@rnmapbox/maps';

export interface MapboxOperations {
  addMarker: (id: string, coordinates: [number, number], options?: any) => void;
  removeMarker: (id: string) => void;
  drawRoute: (coordinates: [number, number][]) => void;
  updateRoute: (coordinates: [number, number][]) => void;
  centerMap: (coordinates: [number, number], zoom?: number) => void;
  fitBounds: (coordinates: [number, number][]) => void;
}

export const useMapbox = (
  mapRef: React.RefObject<MapView>,
  cameraRef: React.RefObject<Camera>
): MapboxOperations => {
  const markersRef = useRef<Map<string, any>>(new Map());
  const routeSourceRef = useRef<string | null>(null);

  const addMarker = useCallback(
    (id: string, coordinates: [number, number], options?: any) => {
      markersRef.current.set(id, { coordinates, ...options });
    },
    []
  );

  const removeMarker = useCallback((id: string) => {
    markersRef.current.delete(id);
  }, []);

  const drawRoute = useCallback((coordinates: [number, number][]) => {
    if (coordinates.length < 2) return;
    routeSourceRef.current = 'route';
    // Route will be drawn via ShapeSource in component
  }, []);

  const updateRoute = useCallback((coordinates: [number, number][]) => {
    if (coordinates.length < 2) return;
    // Route update will be handled by ShapeSource re-render
  }, []);

  const centerMap = useCallback(
    (coordinates: [number, number], zoom: number = 12) => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: coordinates,
          zoomLevel: zoom,
          animationDuration: 300,
        });
      }
    },
    [cameraRef]
  );

  const fitBounds = useCallback((coordinates: [number, number][]) => {
    if (coordinates.length === 0 || !cameraRef.current) return;

    const lngs = coordinates.map((c) => c[0]);
    const lats = coordinates.map((c) => c[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const center: [number, number] = [
      (minLng + maxLng) / 2,
      (minLat + maxLat) / 2,
    ];

    // Calculate zoom level based on bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    const zoom = maxDiff > 0.1 ? 10 : maxDiff > 0.05 ? 11 : 12;

    cameraRef.current.setCamera({
      centerCoordinate: center,
      zoomLevel: zoom,
      animationDuration: 500,
    });
  }, [cameraRef]);

  return {
    addMarker,
    removeMarker,
    drawRoute,
    updateRoute,
    centerMap,
    fitBounds,
  };
};
