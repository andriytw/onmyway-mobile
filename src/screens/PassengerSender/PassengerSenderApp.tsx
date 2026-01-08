/**
 * PassengerSenderApp Screen
 * Placeholder UI but ALL state variables from workflow contract exist
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { TransportMode } from '../../types';
import { UserRole } from '../../types/auth.types';
import MapView from '../../components/PassengerSender/MapView';

const PassengerSenderApp: React.FC = () => {
  const { switchRole, isLoading: authLoading } = useAuth();

  const handleSwitchToDriver = async () => {
    try {
      await switchRole(UserRole.DRIVER);
    } catch (error) {
      Alert.alert(
        'Помилка',
        'Не вдалося переключитися на роль водія. Спробуйте ще раз.',
        [{ text: 'OK' }]
      );
      console.error('Switch role error:', error);
    }
  };

  // ALL state variables from workflow contract (PassengerSenderApp.tsx lines 38-64)
  const [activeMode, setActiveMode] = useState<TransportMode>(TransportMode.CITY);
  const [isSearching, setIsSearching] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [profileContext, setProfileContext] = useState<'booking' | 'viewing'>('viewing');
  const [cabinetInitialTab, setCabinetInitialTab] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isInCar, setIsInCar] = useState(false);
  const [isHandingOver, setIsHandingOver] = useState(false);
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [driverProgress, setDriverProgress] = useState(0);
  const [tripProgress, setTripProgress] = useState(0);
  const [zoom, setZoom] = useState(0.8);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  const [showCreateParcel, setShowCreateParcel] = useState(false);
  const [trackingParcelId, setTrackingParcelId] = useState<string | null>(null);
  const [openInQRMode, setOpenInQRMode] = useState(false);

  return (
    <View style={styles.container}>
      {/* Full-screen map container - ready for Mapbox */}
      <MapView
        zoom={zoom}
        setZoom={setZoom}
        isConfirmed={isConfirmed}
        driverProgress={driverProgress}
        isInCar={isInCar}
        tripProgress={tripProgress}
        selectedDriver={selectedDriver}
        isSearching={isSearching}
        showDrivers={showDrivers}
      />

      {/* Placeholder info overlay - positioned absolutely */}
      <View style={styles.overlay}>
        <View style={styles.infoCard}>
          <Text style={styles.title}>Passenger/Sender App</Text>
          <Text style={styles.subtitle}>Placeholder - All states initialized</Text>
          <Text style={styles.stateText}>activeMode: {activeMode}</Text>
          <Text style={styles.stateText}>isSearching: {isSearching.toString()}</Text>
          <Text style={styles.stateText}>isConfirmed: {isConfirmed.toString()}</Text>
          <Text style={styles.stateText}>driverProgress: {driverProgress.toFixed(2)}</Text>
        </View>
      </View>

      {/* Button to switch to Driver mode */}
      <TouchableOpacity
        style={styles.switchRoleButton}
        onPress={handleSwitchToDriver}
        disabled={authLoading}
        activeOpacity={0.7}
      >
        <Icon name="car" size={20} color="#16a34a" />
        <Text style={styles.switchRoleButtonText}>Перейти на сторону водія</Text>
      </TouchableOpacity>
    </View>
  );
};

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
  switchRoleButton: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#16a34a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  switchRoleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PassengerSenderApp;

