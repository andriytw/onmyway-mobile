/**
 * DriverBottomSheet
 * React Native version - Bottom sheet for Driver mode
 * Uses @gorhom/bottom-sheet
 * 
 * States:
 * 1. Address input (when no route)
 * 2. Current route (when route exists) - with Route/Stats tabs
 * 3. Available requests (when online + route + requests)
 * 4. Waiting (when online but no requests)
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { mapService } from '../../services/maps/mapService';
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MapPin, Target, Star, UserPlus, Package, Plus } from 'lucide-react-native';
import { useDriver } from '../../contexts/DriverContext';
import { PassengerParcelInput } from '../../types/driver.types';
import RouteStack from './RouteStack';
import LiveRouteStats from './LiveRouteStats';
import RequestCard from './RequestCard';
import { COLORS, TYPOGRAPHY, SHADOWS, createShadow } from '../../styles/designTokens';

const DriverBottomSheet: React.FC = () => {
  const {
    isOnline,
    activeRequests,
    currentRoute,
    routeStats,
    originAddress,
    destinationAddress,
    passengersParcels,
    setOriginAddress,
    setDestinationAddress,
    createRoute,
    addPassengerParcel,
    removePassengerParcel,
    updatePassengerParcel,
    addStopToRoute,
    addressHistory,
    favoriteAddresses,
    toggleFavoriteAddress,
    centerMapOnUserLocation,
  } = useDriver();

  const [activeTab, setActiveTab] = useState<'route' | 'stats'>('route');
  const [isLocating, setIsLocating] = useState(false);
  const [showAddPassengerParcel, setShowAddPassengerParcel] = useState(false);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [pendingPassengerParcel, setPendingPassengerParcel] = useState<PassengerParcelInput | null>(null);
  const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);
  const [newPassengerParcel, setNewPassengerParcel] = useState<{
    type: 'passenger' | 'parcel';
    pickup: string;
    dropoff: string;
    name?: string;
    phone?: string;
    size?: 'S' | 'M' | 'L' | 'XL';
    weight?: number;
  }>({
    type: 'passenger',
    pickup: '',
    dropoff: '',
  });

  const bottomSheetRef = useRef<BottomSheet>(null);
  const swipeScrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Компонент історії адрес
  const AddressHistory: React.FC<{
    onSelectAddress: (address: string) => void;
    activeField: 'origin' | 'destination' | null;
  }> = ({ onSelectAddress, activeField }) => {
    // Об'єднати улюблені та історію (улюблені зверху)
    const sortedAddresses = useMemo(() => {
      const favorites = favoriteAddresses;
      const history = addressHistory.filter(addr => !favorites.includes(addr));
      return [...favorites, ...history];
    }, [favoriteAddresses, addressHistory]);

    if (sortedAddresses.length === 0) {
      return null;
    }

    return (
      <View style={styles.addressHistoryContainer}>
        <ScrollView 
          style={styles.addressHistoryScroll}
          showsVerticalScrollIndicator={false}
        >
          {sortedAddresses.map((address, index) => {
            const isFavorite = favoriteAddresses.includes(address);
            return (
              <TouchableOpacity
                key={`${address}-${index}`}
                style={styles.addressHistoryItem}
                onPress={() => onSelectAddress(address)}
                activeOpacity={0.7}
              >
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavoriteAddress(address);
                  }}
                  activeOpacity={0.7}
                >
                  <Star 
                    size={16} 
                    color={isFavorite ? COLORS.amber[500] : COLORS.slate[400]} 
                    fill={isFavorite ? COLORS.amber[500] : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
                <Text style={styles.addressHistoryText} numberOfLines={1}>{address}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const hasRoute = currentRoute.length > 0;
  const canBuildRoute = originAddress.trim() && destinationAddress.trim();
  const showRoute = hasRoute;
  const showRequests = isOnline && activeRequests.length > 0 && hasRoute;
  const showAddressInput = !hasRoute;

  // Snap points for bottom sheet - завжди напіввисунутий при старті
  const snapPoints = useMemo(() => {
    if (showRoute || showRequests || canBuildRoute) {
      return ['25%', '50%', '90%'];
    }
    // Завжди напіввисунутий (25%) навіть коли немає маршруту
    return ['25%', '50%', '90%'];
  }, [showRoute, showRequests, canBuildRoute]);

  const handleAutoLocate = async () => {
    setIsLocating(true);
    try {
      // Request location permissions
      let permissionGranted = false;
      
      if (Platform.OS === 'ios') {
        const status = await Geolocation.requestAuthorization('whenInUse');
        permissionGranted = status === 'granted';
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Дозвіл на місцезнаходження',
            message: 'OnMyWay потребує доступ до вашої локації для показу карти та маршрутів',
            buttonNeutral: 'Запитати пізніше',
            buttonNegative: 'Відхилити',
            buttonPositive: 'Дозволити',
          }
        );
        permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (!permissionGranted) {
        Alert.alert(
          'Дозвіл на локацію відхилено',
          'Будь ласка, надайте дозвіл на використання локації в налаштуваннях пристрою.',
          [{ text: 'OK' }]
        );
        setIsLocating(false);
        return;
      }

      // Get current location
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocode to get address
            const address = await mapService.reverseGeocode(latitude, longitude);
            
            // Set address in origin field
            setOriginAddress(address || 'Моє місцезнаходження');
            
            // Center map on user location
            centerMapOnUserLocation(latitude, longitude);
            
            setIsLocating(false);
          } catch (geocodeError) {
            console.error('Reverse geocoding error:', geocodeError);
            // Fallback: use "My location" text and center map anyway
            setOriginAddress('Моє місцезнаходження');
            centerMapOnUserLocation(latitude, longitude);
            setIsLocating(false);
          }
        },
        (error) => {
          console.error('Location error:', error);
          Alert.alert(
            'Помилка отримання локації',
            'Не вдалося отримати ваше місцезнаходження. Переконайтеся, що GPS увімкнено.',
            [{ text: 'OK' }]
          );
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('Auto locate error:', error);
      Alert.alert(
        'Помилка',
        'Сталася помилка при отриманні локації. Спробуйте ще раз.',
        [{ text: 'OK' }]
      );
      setIsLocating(false);
    }
  };

  const handleBuildRoute = async () => {
    if (!canBuildRoute) {
      Alert.alert(
        'Помилка',
        'Будь ласка, заповніть поля "Звідки" та "Куди"',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Одразу створюємо простий маршрут без пасажирів
      await createRoute(originAddress, destinationAddress, [], false);
    } catch (error: any) {
      console.error('Failed to create route:', error);
      Alert.alert(
        'Помилка створення маршруту',
        error?.message || 'Не вдалося створити маршрут. Перевірте адреси та спробуйте ще раз.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBuildRouteAsIs = async () => {
    // Якщо є pending пасажир/посилка - додаємо його до маршруту
    if (pendingPassengerParcel) {
      try {
        const allPassengersParcels = [pendingPassengerParcel];
        await createRoute(originAddress, destinationAddress, allPassengersParcels, false);
        setPendingPassengerParcel(null);
        setShowRouteOptions(false);
        setNewPassengerParcel({
          type: 'passenger',
          pickup: '',
          dropoff: '',
        });
      } catch (error) {
        console.error('Failed to create route:', error);
      }
    } else if (canBuildRoute) {
      // Стара логіка (якщо маршрут ще не побудований)
      try {
        await createRoute(originAddress, destinationAddress, passengersParcels, false);
        setShowRouteOptions(false);
      } catch (error) {
        console.error('Failed to create route:', error);
      }
    }
  };

  const handleBuildRouteOptimized = async () => {
    // Якщо є pending пасажир/посилка - додаємо його до маршруту з оптимізацією
    if (pendingPassengerParcel) {
      try {
        const allPassengersParcels = [pendingPassengerParcel];
        await createRoute(originAddress, destinationAddress, allPassengersParcels, true);
        setPendingPassengerParcel(null);
        setShowRouteOptions(false);
        setNewPassengerParcel({
          type: 'passenger',
          pickup: '',
          dropoff: '',
        });
      } catch (error) {
        console.error('Failed to create route:', error);
      }
    } else if (canBuildRoute) {
      // Стара логіка (якщо маршрут ще не побудований)
      try {
        await createRoute(originAddress, destinationAddress, passengersParcels, true);
        setShowRouteOptions(false);
      } catch (error) {
        console.error('Failed to create route:', error);
      }
    }
  };

  const handleAddPassengerParcelClick = () => {
    setNewPassengerParcel({
      type: 'passenger',
      pickup: '',
      dropoff: '',
    });
    setShowAddPassengerParcel(true);
  };

  const handleSavePassengerParcel = () => {
    if (!newPassengerParcel.pickup.trim() || !newPassengerParcel.dropoff.trim()) {
      return;
    }

    const pp: PassengerParcelInput = {
      id: `pp-${Date.now()}`,
      type: newPassengerParcel.type,
      pickup: newPassengerParcel.pickup,
      dropoff: newPassengerParcel.dropoff,
      passenger: newPassengerParcel.type === 'passenger' && newPassengerParcel.name
        ? {
            name: newPassengerParcel.name,
            phone: newPassengerParcel.phone,
          }
        : undefined,
      parcel: newPassengerParcel.type === 'parcel' && newPassengerParcel.size && newPassengerParcel.weight
        ? {
            size: newPassengerParcel.size,
            weight: newPassengerParcel.weight,
          }
        : undefined,
    };

    // Якщо маршрут вже побудований - показуємо модальне вікно вибору типу маршруту
    if (hasRoute) {
      setPendingPassengerParcel(pp);
      setShowAddPassengerParcel(false);
      setShowRouteOptions(true);
    } else {
      // Стара логіка (якщо маршрут ще не побудований - не повинно статися, але на всяк випадок)
      addPassengerParcel(pp);
      setShowAddPassengerParcel(false);
      setNewPassengerParcel({
        type: 'passenger',
        pickup: '',
        dropoff: '',
      });
    }
  };

  // Обробка свайпу для синхронізації activeTab
  const handleScroll = useCallback((event: any) => {
    if (containerWidth === 0) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / containerWidth);
    const newTab = pageIndex === 0 ? 'route' : 'stats';
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [containerWidth, activeTab]);

  // Синхронізація скролу при програмній зміні табу (на випадок, якщо потрібно)
  React.useEffect(() => {
    if (swipeScrollViewRef.current && containerWidth > 0) {
      const pageIndex = activeTab === 'route' ? 0 : 1;
      swipeScrollViewRef.current.scrollTo({
        x: pageIndex * containerWidth,
        animated: true,
      });
    }
  }, [activeTab, containerWidth]);

  const renderContent = () => {
    if (showRoute) {
      return (
        <View 
          style={styles.content}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            if (width > 0) {
              setContainerWidth(width);
            }
          }}
        >
          {/* Swipeable Content - замість кнопок табів */}
          {containerWidth > 0 && (
            <ScrollView
              ref={swipeScrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              scrollEventThrottle={16}
              style={styles.swipeableContainer}
              contentContainerStyle={styles.swipeableContent}
            >
              {/* Сторінка 1: МАРШРУТ */}
              <View style={[styles.swipeablePage, { width: containerWidth }]}>
                <View style={styles.routeContent}>
                  <View style={styles.routeHeader}>
                    <Text style={styles.routeTitle}>Поточний маршрут</Text>
                    <TouchableOpacity
                      style={styles.addPassengerParcelButton}
                      onPress={handleAddPassengerParcelClick}
                    >
                      <UserPlus size={16} color={COLORS.slate[900]} strokeWidth={2} />
                      <Text style={styles.addPassengerParcelSlash}>/</Text>
                      <Plus size={12} color={COLORS.slate[900]} strokeWidth={2.5} />
                      <View style={styles.packageWrapper}>
                        <Package size={16} color={COLORS.slate[900]} strokeWidth={2} />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <RouteStack />
                </View>
              </View>

              {/* Сторінка 2: СТАТИСТИКА */}
              <View style={[styles.swipeablePage, { width: containerWidth }]}>
                <View style={styles.statsContent}>
                  <Text style={styles.statsTitle}>Статистика поточного маршруту</Text>
                  <LiveRouteStats />
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      );
    }

    if (showAddressInput) {
      return (
        <View style={styles.content}>
          <Text style={styles.inputTitle}>Створити основний маршрут</Text>

          {/* Base Route */}
          <View style={styles.baseRouteSection}>
            <View style={styles.addressInput}>
              <MapPin size={16} color={COLORS.blue[600]} strokeWidth={2} />
              <TextInput
                style={styles.addressTextInput}
                value={originAddress}
                onChangeText={setOriginAddress}
                placeholder="Звідки їдемо?"
                placeholderTextColor="#cbd5e1"
                onFocus={() => setActiveField('origin')}
                onBlur={() => setActiveField(null)}
              />
              {originAddress && !isLocating && (
                <TouchableOpacity
                  onPress={() => setOriginAddress('')}
                  style={styles.addressClear}
                >
                  <Icon name="close" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleAutoLocate}
                style={styles.addressLocate}
              >
                <Icon
                  name="crosshairs-gps"
                  size={20}
                  color={isLocating ? '#3b82f6' : '#94a3b8'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.addressInput}>
              <Target size={16} color={COLORS.slate[900]} strokeWidth={2} />
              <TextInput
                style={styles.addressTextInput}
                value={destinationAddress}
                onChangeText={setDestinationAddress}
                placeholder="Куди прямуємо?"
                placeholderTextColor="#cbd5e1"
                onFocus={() => setActiveField('destination')}
                onBlur={() => setActiveField(null)}
              />
              {destinationAddress && (
                <TouchableOpacity
                  onPress={() => setDestinationAddress('')}
                  style={styles.addressClear}
                >
                  <Icon name="close" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Address History */}
          <AddressHistory 
            onSelectAddress={(address) => {
              if (activeField === 'origin') {
                setOriginAddress(address);
              } else if (activeField === 'destination') {
                setDestinationAddress(address);
              } else {
                // Якщо немає активного поля, вставляємо в перше порожнє
                if (!originAddress) {
                  setOriginAddress(address);
                } else if (!destinationAddress) {
                  setDestinationAddress(address);
                } else {
                  // Якщо обидва заповнені, вставляємо в destination
                  setDestinationAddress(address);
                }
              }
            }}
            activeField={activeField}
          />

          {/* Build Route Button */}
          {canBuildRoute && (
            <TouchableOpacity
              style={styles.buildRouteButton}
              onPress={handleBuildRoute}
            >
              <Icon name="navigation" size={20} color="#ffffff" />
              <Text style={styles.buildRouteButtonText}>Побудувати маршрут</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (showRequests) {
      return (
        <View style={styles.content}>
          <View style={styles.requestsHeader}>
            <Text style={styles.requestsTitle}>Доступні заявки</Text>
            <Text style={styles.requestsCount}>{activeRequests.length}</Text>
          </View>
          <ScrollView style={styles.requestsList}>
            {activeRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <View style={styles.waitingState}>
          <Text style={styles.waitingText}>
            {!isOnline
              ? 'Увімкніть онлайн режим'
              : !hasRoute
                ? 'Вкажіть маршрут для пошуку заявок'
                : 'Очікування заявок...'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {renderContent()}
        </BottomSheetView>
      </BottomSheet>

      {/* Add Passenger/Parcel Modal */}
      <Modal
        visible={showAddPassengerParcel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddPassengerParcel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Додати пасажира / посилку</Text>
              <TouchableOpacity
                onPress={() => setShowAddPassengerParcel(false)}
                style={styles.modalClose}
              >
                <Icon name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {/* Type Selection */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Тип</Text>
                <View style={styles.modalTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalTypeButton,
                      newPassengerParcel.type === 'passenger' && styles.modalTypeButtonActive,
                    ]}
                    onPress={() => setNewPassengerParcel({ ...newPassengerParcel, type: 'passenger' })}
                  >
                    <Text
                      style={[
                        styles.modalTypeButtonText,
                        newPassengerParcel.type === 'passenger' && styles.modalTypeButtonTextActive,
                      ]}
                    >
                      👤 Пасажир
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalTypeButton,
                      newPassengerParcel.type === 'parcel' && styles.modalTypeButtonActive,
                    ]}
                    onPress={() => setNewPassengerParcel({ ...newPassengerParcel, type: 'parcel' })}
                  >
                    <Text
                      style={[
                        styles.modalTypeButtonText,
                        newPassengerParcel.type === 'parcel' && styles.modalTypeButtonTextActive,
                      ]}
                    >
                      📦 Посилка
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pickup */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Забрати</Text>
                <View style={styles.modalInputContainer}>
                  <MapPin size={16} color={COLORS.blue[600]} strokeWidth={2} />
                  <TextInput
                    style={styles.modalInput}
                    value={newPassengerParcel.pickup}
                    onChangeText={(text) => setNewPassengerParcel({ ...newPassengerParcel, pickup: text })}
                    placeholder="Адреса забрання"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              </View>

              {/* Dropoff */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Привезти</Text>
                <View style={styles.modalInputContainer}>
                  <Target size={16} color={COLORS.blue[600]} strokeWidth={2} />
                  <TextInput
                    style={styles.modalInput}
                    value={newPassengerParcel.dropoff}
                    onChangeText={(text) => setNewPassengerParcel({ ...newPassengerParcel, dropoff: text })}
                    placeholder="Адреса доставки"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              </View>

              {/* Passenger fields */}
              {newPassengerParcel.type === 'passenger' && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Ім'я (опціонально)</Text>
                    <View style={styles.modalInputContainer}>
                      <TextInput
                        style={styles.modalInput}
                        value={newPassengerParcel.name || ''}
                        onChangeText={(text) => setNewPassengerParcel({ ...newPassengerParcel, name: text })}
                        placeholder="Ім'я пасажира"
                        placeholderTextColor="#cbd5e1"
                      />
                    </View>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Телефон (опціонально)</Text>
                    <View style={styles.modalInputContainer}>
                      <TextInput
                        style={styles.modalInput}
                        value={newPassengerParcel.phone || ''}
                        onChangeText={(text) => setNewPassengerParcel({ ...newPassengerParcel, phone: text })}
                        placeholder="Телефон"
                        placeholderTextColor="#cbd5e1"
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Parcel fields */}
              {newPassengerParcel.type === 'parcel' && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Розмір</Text>
                    <View style={styles.modalSizeButtons}>
                      {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.modalSizeButton,
                            newPassengerParcel.size === size && styles.modalSizeButtonActive,
                          ]}
                          onPress={() => setNewPassengerParcel({ ...newPassengerParcel, size })}
                        >
                          <Text
                            style={[
                              styles.modalSizeButtonText,
                              newPassengerParcel.size === size && styles.modalSizeButtonTextActive,
                            ]}
                          >
                            {size}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Вага (кг)</Text>
                    <View style={styles.modalInputContainer}>
                      <TextInput
                        style={styles.modalInput}
                        value={newPassengerParcel.weight?.toString() || ''}
                        onChangeText={(text) =>
                          setNewPassengerParcel({
                            ...newPassengerParcel,
                            weight: text ? parseFloat(text) : undefined,
                          })
                        }
                        placeholder="Вага"
                        placeholderTextColor="#cbd5e1"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  (!newPassengerParcel.pickup.trim() || !newPassengerParcel.dropoff.trim()) &&
                    styles.modalSaveButtonDisabled,
                ]}
                onPress={handleSavePassengerParcel}
                disabled={!newPassengerParcel.pickup.trim() || !newPassengerParcel.dropoff.trim()}
              >
                <Text style={styles.modalSaveButtonText}>Додати</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Route Options Modal */}
      <Modal
        visible={showRouteOptions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRouteOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Оберіть тип маршруту</Text>
              <TouchableOpacity
                onPress={() => setShowRouteOptions(false)}
                style={styles.modalClose}
              >
                <Icon name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TouchableOpacity
                style={styles.routeOptionButton}
                onPress={handleBuildRouteAsIs}
              >
                <View style={styles.routeOptionIcon}>
                  <Icon name="route" size={28} color="#475569" />
                </View>
                <View style={styles.routeOptionContent}>
                  <Text style={styles.routeOptionTitle}>По черговості</Text>
                  <Text style={styles.routeOptionDescription}>
                    Маршрут буде побудований в тому порядку, як ви вписали адреси
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.routeOptionButton}
                onPress={handleBuildRouteOptimized}
              >
                <View style={[styles.routeOptionIcon, styles.routeOptionIconGreen]}>
                  <Icon name="navigation" size={28} color="#16a34a" />
                </View>
                <View style={styles.routeOptionContent}>
                  <Text style={styles.routeOptionTitle}>Оптимальний маршрут</Text>
                  <Text style={styles.routeOptionDescription}>
                    Система автоматично побудує найкоротший та найшвидший маршрут
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Styles will be added in next part due to length
const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#ffffff', // bg-white (Linear/Vercel style)
    borderTopLeftRadius: 40, // rounded-t-[2.5rem] = 40px (Linear/Vercel style)
    borderTopRightRadius: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200], // border-slate-200
    ...SHADOWS.sm, // shadow-sm for subtle depth (Linear/Vercel style)
  },
  handleIndicator: {
    backgroundColor: COLORS.slate[200], // slate-200 for visibility
    width: 48, // w-12
    height: 4, // h-1 = 4px (Linear/Vercel style)
    borderRadius: 2, // rounded-full
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20, // Compact padding (~30% reduction)
    paddingTop: 12, // Compact padding (~40% reduction)
    paddingBottom: 16, // Compact padding (~33% reduction)
  },
  content: {
    flex: 1,
  },
  // Swipeable Container - замість кнопок табів
  swipeableContainer: {
    flex: 1,
  },
  swipeableContent: {
    flexDirection: 'row',
  },
  swipeablePage: {
    paddingHorizontal: 0, // Без padding для розтягування плиток до країв
  },
  // Route Content
  routeContent: {
    gap: 12, // Compact spacing (~40% reduction)
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // Compact spacing (50% reduction)
  },
  routeTitle: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking025(11), // tracking-[0.25em] = 2.75px
  },
  routeCount: {
    fontSize: 10, // text-[10px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
  },
  // Add Passenger/Parcel Section
  addPassengerParcelSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
  },
  addPassengerParcelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 72, // Збільшено для + перед коробкою
    height: 36,
    backgroundColor: 'transparent', // Прозорий фон
    borderRadius: 8, // Невеликий radius
    borderWidth: 1,
    borderColor: COLORS.slate[900], // Чорна рамка
    gap: 3, // Мінімальний відступ між іконками
    paddingHorizontal: 8,
  },
  addPassengerParcelSlash: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[900], // Чорний колір для слешу
    marginHorizontal: 2,
  },
  packageWrapper: {
    marginLeft: -4, // Зсув коробки на 4px вліво
  },
  // Stats Content
  statsContent: {
    gap: 10, // Compact spacing (~38% reduction)
  },
  statsTitle: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking025(11), // tracking-[0.25em] = 2.75px
    marginBottom: 8, // Compact spacing (~33% reduction)
  },
  // Address Input
  inputTitle: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking025(11), // tracking-[0.25em] = 2.75px
    marginBottom: 12, // Compact spacing (~40% reduction)
    textAlign: 'center', // Center align
  },
  baseRouteSection: {
    gap: 12,
    marginBottom: 10, // Compact spacing (~38% reduction)
  },
  baseRouteLabel: {
    fontSize: 10, // text-[10px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
    marginBottom: 8, // Compact spacing (~33% reduction)
  },
  addressInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Fixed height for compactness
    paddingHorizontal: 12,
    minHeight: 44, // Consistent height for all inputs
    maxHeight: 44, // Prevent expansion
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 24, // rounded-[24px]
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    gap: 12, // Compact spacing (~25% reduction)
    ...SHADOWS.sm, // shadow-sm for depth
  },
  addressTextInput: {
    flex: 1,
    fontSize: 15, // Slightly reduced for compactness (16 * 0.9375)
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[900], // text-slate-900 (main text)
    paddingVertical: 0, // Remove vertical padding for compactness
    height: 24, // Fixed height for text input
  },
  addressClear: {
    padding: 4,
  },
  addressLocate: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
  },
  // Address History
  addressHistoryContainer: {
    marginTop: 12,
    maxHeight: 150,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200],
    paddingTop: 8,
  },
  addressHistoryScroll: {
    maxHeight: 150,
  },
  addressHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: COLORS.slate[50],
  },
  favoriteButton: {
    padding: 4,
    marginRight: 8,
  },
  addressHistoryText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.slate[900],
  },
  // Passengers Section
  passengersSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  passengersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passengersLabel: {
    fontSize: 10, // text-[10px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
  },
  passengersAddButton: {
    paddingVertical: 8, // py-2
    paddingHorizontal: 16, // px-4
    backgroundColor: COLORS.blue[600], // bg-blue-600
    borderRadius: 12, // rounded-xl
    ...SHADOWS.sm, // shadow-sm
  },
  passengersAddButtonText: {
    fontSize: 12,
    fontWeight: '600', // font-semibold
    color: '#ffffff',
  },
  passengerCard: {
    padding: 16, // p-4
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 24, // rounded-[24px]
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    ...SHADOWS.sm, // shadow-sm for depth
  },
  passengerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // mb-3
  },
  passengerCardType: {
    fontSize: 12, // text-xs
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    textTransform: 'uppercase',
  },
  passengerCardRemove: {
    padding: 4, // p-1
  },
  passengerCardInputs: {
    gap: 8, // space-y-2
  },
  passengerCardInput: {
    padding: 12, // p-3
    backgroundColor: '#ffffff', // bg-white
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200
  },
  passengerCardInputLabel: {
    fontSize: 9, // text-[9px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(9), // tracking-widest = 0.9px
    marginBottom: 6, // More whitespace
  },
  passengerCardTextInput: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[900], // text-slate-900
  },
  passengersEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  passengersEmptyText: {
    fontSize: 10,
    fontWeight: '500', // font-medium
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Build Route Button
  buildRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16, // py-4
    backgroundColor: COLORS.slate[900], // bg-slate-900
    borderRadius: 28, // rounded-[28px]
    marginTop: 16, // mt-4
    gap: 12, // gap-3
    ...SHADOWS.xl, // shadow-xl
  },
  buildRouteButtonText: {
    fontSize: 12, // text-[12px]
    fontWeight: '600', // font-semibold
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking02(12), // tracking-[0.2em] = 2.4px
  },
  // Requests
  requestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // mb-4
  },
  requestsTitle: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking025(11), // tracking-[0.25em] = 2.75px
  },
  requestsCount: {
    fontSize: 10, // text-[10px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
  },
  requestsList: {
    gap: 12,
  },
  // Waiting State
  waitingState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 11,
    fontWeight: '500', // font-medium
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 48, // rounded-t-[2rem] = 48px (Uber-like design)
    borderTopRightRadius: 48,
    maxHeight: '80%',
    ...SHADOWS['2xl'], // Large shadow for depth
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16, // Компактний padding
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200], // border-slate-200
  },
  modalTitle: {
    fontSize: 11, // Як routeTitle
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking025(11), // tracking-[0.25em] = 2.75px
  },
  modalClose: {
    padding: 8,
  },
  modalBody: {
    padding: 16, // Компактний padding
  },
  modalSection: {
    marginBottom: 12, // Компактний відступ
  },
  modalLabel: {
    fontSize: 11, // Як routeTitle
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking025(11), // tracking-[0.25em] = 2.75px
    marginBottom: 8, // Компактний відступ
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Як addressInput
    paddingHorizontal: 12, // Як addressInput
    minHeight: 44, // Як addressInput
    maxHeight: 44, // Як addressInput
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 24, // Як addressInput
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200
    gap: 12, // Як addressInput
    ...SHADOWS.sm, // shadow-sm for depth
  },
  modalInput: {
    flex: 1,
    fontSize: 15, // Як addressTextInput
    fontWeight: '500', // font-medium
    color: COLORS.slate[900], // text-slate-900
    paddingVertical: 0, // Remove vertical padding for compactness
    height: 24, // Fixed height for text input
  },
  modalTypeButtons: {
    flexDirection: 'row',
    gap: 8, // Компактний gap
  },
  modalTypeButton: {
    flex: 1,
    height: 36, // Компактна висота
    paddingVertical: 8, // Компактний padding
    paddingHorizontal: 16,
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 12, // rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200
  },
  modalTypeButtonActive: {
    backgroundColor: COLORS.blue[600], // bg-blue-600
    borderColor: COLORS.blue[600],
  },
  modalTypeButtonText: {
    fontSize: 12, // Компактний розмір
    fontWeight: '600', // font-semibold
    color: COLORS.slate[700], // text-slate-700
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking02(12),
  },
  modalTypeButtonTextActive: {
    color: '#ffffff', // text-white
  },
  modalSizeButtons: {
    flexDirection: 'row',
    gap: 8, // Компактний gap
  },
  modalSizeButton: {
    flex: 1,
    height: 36, // Компактна висота (як modalTypeButton)
    paddingVertical: 8, // Компактний padding
    paddingHorizontal: 8,
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 12, // rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200
  },
  modalSizeButtonActive: {
    backgroundColor: COLORS.blue[600], // bg-blue-600
    borderColor: COLORS.blue[600],
  },
  modalSizeButtonText: {
    fontSize: 12, // Компактний розмір
    fontWeight: '600', // font-semibold
    color: COLORS.slate[700], // text-slate-700
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking02(12),
  },
  modalSizeButtonTextActive: {
    color: '#ffffff', // text-white
  },
  modalSaveButton: {
    height: 36, // Компактна висота (як addPassengerParcelButton)
    paddingVertical: 8, // Компактний padding
    paddingHorizontal: 16,
    backgroundColor: COLORS.blue[600], // bg-blue-600
    borderRadius: 8, // Компактний radius
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.blue[600],
  },
  modalSaveButtonDisabled: {
    backgroundColor: COLORS.slate[300], // bg-slate-300
    borderColor: COLORS.slate[300],
  },
  modalSaveButtonText: {
    fontSize: 12, // Компактний розмір
    fontWeight: '600', // font-semibold
    color: '#ffffff', // text-white
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking02(12), // tracking-[0.2em] = 2.4px
  },
  // Route Options
  routeOptionButton: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    marginBottom: 16, // More whitespace
    gap: 16,
    ...SHADOWS.sm, // shadow-sm for depth
  },
  routeOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  routeOptionIconGreen: {
    backgroundColor: '#dcfce7',
  },
  routeOptionContent: {
    flex: 1,
  },
  routeOptionTitle: {
    fontSize: 18,
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    marginBottom: 8, // More whitespace
    letterSpacing: TYPOGRAPHY.trackingTight(18), // tracking-tight for headings >20px
  },
  routeOptionDescription: {
    fontSize: 14,
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[500], // text-slate-500 (secondary text)
  },
});

export default DriverBottomSheet;


