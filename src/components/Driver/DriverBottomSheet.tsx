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
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  } = useDriver();

  const [activeTab, setActiveTab] = useState<'route' | 'stats'>('route');
  const [newDestination, setNewDestination] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showAddPassengerParcel, setShowAddPassengerParcel] = useState(false);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
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

  const hasRoute = currentRoute.length > 0;
  const canBuildRoute = originAddress.trim() && destinationAddress.trim();
  const showRoute = hasRoute;
  const showRequests = isOnline && activeRequests.length > 0 && hasRoute;
  const showAddressInput = !hasRoute;

  // Snap points for bottom sheet
  const snapPoints = useMemo(() => {
    if (showRoute || showRequests || canBuildRoute) {
      return ['25%', '50%', '90%'];
    }
    return ['10%', '50%', '90%'];
  }, [showRoute, showRequests, canBuildRoute]);

  const handleAutoLocate = () => {
    setIsLocating(true);
    setTimeout(() => {
      setOriginAddress('Моє місцезнаходження');
      setIsLocating(false);
    }, 1200);
  };

  const handleBuildRoute = () => {
    if (canBuildRoute) {
      setShowRouteOptions(true);
    }
  };

  const handleBuildRouteAsIs = async () => {
    if (canBuildRoute) {
      try {
        await createRoute(originAddress, destinationAddress, passengersParcels, false);
        setShowRouteOptions(false);
      } catch (error) {
        console.error('Failed to create route:', error);
      }
    }
  };

  const handleBuildRouteOptimized = async () => {
    if (canBuildRoute) {
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

    addPassengerParcel(pp);
    setShowAddPassengerParcel(false);
    setNewPassengerParcel({
      type: 'passenger',
      pickup: '',
      dropoff: '',
    });
  };

  const handleAddNewDestination = async () => {
    if (!newDestination.trim() || !hasRoute) return;

    const manualRequest = {
      id: `manual-${Date.now()}`,
      type: 'passenger' as const,
      pickup: currentRoute[currentRoute.length - 1].dropoff,
      dropoff: {
        x: 0,
        y: 0,
        address: newDestination,
      },
      distance: 0,
      timeDeviation: 0,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    try {
      await addStopToRoute(manualRequest);
      setNewDestination('');
    } catch (error) {
      console.error('Failed to add destination:', error);
    }
  };

  const renderContent = () => {
    if (showRoute) {
      return (
        <View style={styles.content}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'route' && styles.tabActive]}
              onPress={() => setActiveTab('route')}
            >
              <Icon name="route" size={16} color={activeTab === 'route' ? '#0f172a' : '#94a3b8'} />
              <Text style={[styles.tabText, activeTab === 'route' && styles.tabTextActive]}>
                Маршрут
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
              onPress={() => setActiveTab('stats')}
            >
              <Icon name="chart-bar" size={16} color={activeTab === 'stats' ? '#0f172a' : '#94a3b8'} />
              <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
                Статистика
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'route' ? (
            <View style={styles.routeContent}>
              <View style={styles.routeHeader}>
                <Text style={styles.routeTitle}>Поточний маршрут</Text>
                {currentRoute.length > 0 && (
                  <Text style={styles.routeCount}>{currentRoute.length} зупинок</Text>
                )}
              </View>
              <RouteStack />

              {/* Add destination manually */}
              <View style={styles.addDestinationSection}>
                <Text style={styles.addDestinationLabel}>Додати адресу вручну</Text>
                <View style={styles.addDestinationInput}>
                  <View style={styles.addDestinationDot} />
                  <TextInput
                    style={styles.addDestinationTextInput}
                    value={newDestination}
                    onChangeText={setNewDestination}
                    placeholder="Додати адресу (телефон, клієнт тощо)..."
                    placeholderTextColor="#cbd5e1"
                  />
                  {newDestination && (
                    <TouchableOpacity
                      onPress={() => setNewDestination('')}
                      style={styles.addDestinationClear}
                    >
                      <Icon name="close" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleAddNewDestination}
                    disabled={!newDestination.trim()}
                    style={[
                      styles.addDestinationButton,
                      !newDestination.trim() && styles.addDestinationButtonDisabled,
                    ]}
                  >
                    <Icon name="plus" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.statsContent}>
              <Text style={styles.statsTitle}>Статистика поточного маршруту</Text>
              <LiveRouteStats />
            </View>
          )}
        </View>
      );
    }

    if (showAddressInput) {
      return (
        <View style={styles.content}>
          <Text style={styles.inputTitle}>Вкажіть маршрут</Text>

          {/* Base Route */}
          <View style={styles.baseRouteSection}>
            <Text style={styles.baseRouteLabel}>Базовий маршрут</Text>
            <View style={styles.addressInput}>
              <View style={styles.addressDotBlue} />
              <TextInput
                style={styles.addressTextInput}
                value={originAddress}
                onChangeText={setOriginAddress}
                placeholder="Звідки їдемо?"
                placeholderTextColor="#cbd5e1"
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
              <View style={styles.addressDotBlack} />
              <TextInput
                style={styles.addressTextInput}
                value={destinationAddress}
                onChangeText={setDestinationAddress}
                placeholder="Куди прямуємо?"
                placeholderTextColor="#cbd5e1"
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

          {/* Passengers / Parcels */}
          <View style={styles.passengersSection}>
            <View style={styles.passengersHeader}>
              <Text style={styles.passengersLabel}>Пасажири / Посилки</Text>
              <TouchableOpacity
                style={styles.passengersAddButton}
                onPress={handleAddPassengerParcelClick}
              >
                <Text style={styles.passengersAddButtonText}>+ Додати</Text>
              </TouchableOpacity>
            </View>

            {passengersParcels.map((pp) => (
              <View key={pp.id} style={styles.passengerCard}>
                <View style={styles.passengerCardHeader}>
                  <Text style={styles.passengerCardType}>
                    {pp.type === 'passenger' ? '👤 Пасажир' : '📦 Посилка'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removePassengerParcel(pp.id)}
                    style={styles.passengerCardRemove}
                  >
                    <Icon name="close" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                <View style={styles.passengerCardInputs}>
                  <View style={styles.passengerCardInput}>
                    <Text style={styles.passengerCardInputLabel}>Забрати</Text>
                    <TextInput
                      style={styles.passengerCardTextInput}
                      value={pp.pickup}
                      onChangeText={(text) => updatePassengerParcel(pp.id, { pickup: text })}
                      placeholder="Адреса забрання"
                      placeholderTextColor="#cbd5e1"
                    />
                  </View>
                  <View style={styles.passengerCardInput}>
                    <Text style={styles.passengerCardInputLabel}>Привезти</Text>
                    <TextInput
                      style={styles.passengerCardTextInput}
                      value={pp.dropoff}
                      onChangeText={(text) => updatePassengerParcel(pp.id, { dropoff: text })}
                      placeholder="Адреса доставки"
                      placeholderTextColor="#cbd5e1"
                    />
                  </View>
                </View>
              </View>
            ))}

            {passengersParcels.length === 0 && (
              <View style={styles.passengersEmpty}>
                <Text style={styles.passengersEmptyText}>
                  Немає додаткових пасажирів або посилок
                </Text>
              </View>
            )}
          </View>

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
                <TextInput
                  style={styles.modalInput}
                  value={newPassengerParcel.pickup}
                  onChangeText={(text) => setNewPassengerParcel({ ...newPassengerParcel, pickup: text })}
                  placeholder="Адреса забрання"
                  placeholderTextColor="#cbd5e1"
                />
              </View>

              {/* Dropoff */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Привезти</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newPassengerParcel.dropoff}
                  onChangeText={(text) => setNewPassengerParcel({ ...newPassengerParcel, dropoff: text })}
                  placeholder="Адреса доставки"
                  placeholderTextColor="#cbd5e1"
                />
              </View>

              {/* Passenger fields */}
              {newPassengerParcel.type === 'passenger' && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Ім'я (опціонально)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={newPassengerParcel.name || ''}
                      onChangeText={(text) => setNewPassengerParcel({ ...newPassengerParcel, name: text })}
                      placeholder="Ім'я пасажира"
                      placeholderTextColor="#cbd5e1"
                    />
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Телефон (опціонально)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={newPassengerParcel.phone || ''}
                      onChangeText={(text) => setNewPassengerParcel({ ...newPassengerParcel, phone: text })}
                      placeholder="Телефон"
                      placeholderTextColor="#cbd5e1"
                      keyboardType="phone-pad"
                    />
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
  // Tabs - точні стилі з веб-версії: bg-slate-50 p-1.5 rounded-[24px] border-slate-100
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate[50], // bg-slate-50
    padding: 6, // p-1.5
    borderRadius: 24, // rounded-[24px]
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    marginBottom: 14, // Compact spacing (~42% reduction)
    gap: 8, // gap-2
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8, // Compact padding (~33% reduction)
    paddingHorizontal: 16, // px-4
    borderRadius: 16, // rounded-2xl
    gap: 8, // gap-2
  },
  tabActive: {
    backgroundColor: '#ffffff', // bg-white
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  tabText: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold (Linear/Vercel style, not font-black)
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(11), // tracking-widest = 1.1px
  },
  tabTextActive: {
    color: COLORS.slate[900], // text-slate-900 (main text)
    fontWeight: '600', // font-semibold
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
  addDestinationSection: {
    paddingTop: 10, // Compact padding (~38% reduction)
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100], // border-slate-100
  },
  addDestinationLabel: {
    fontSize: 10, // text-[10px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
    marginBottom: 8, // Compact spacing (~33% reduction)
  },
  addDestinationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Compact padding (~29% reduction)
    paddingHorizontal: 16, // px-4
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    gap: 12, // Compact spacing (~25% reduction)
    ...SHADOWS.sm, // shadow-sm for depth
  },
  addDestinationDot: {
    width: 10, // w-2.5 = 10px
    height: 10, // h-2.5 = 10px
    borderRadius: 2, // rounded-sm для чорного
    backgroundColor: COLORS.slate[900], // bg-slate-900
    ...SHADOWS.sm, // shadow-sm (subtle shadow)
  },
  addDestinationTextInput: {
    flex: 1,
    fontSize: 16, // text-[16px]
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[900], // text-slate-900 (main text)
  },
  addDestinationClear: {
    padding: 4, // p-1
  },
  addDestinationButton: {
    padding: 10, // p-2.5
    backgroundColor: COLORS.blue[600], // bg-blue-600
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    minHeight: 44, // Touch target (Linear/Vercel style)
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  addDestinationButtonDisabled: {
    backgroundColor: COLORS.slate[200], // bg-slate-200
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
    padding: 12, // Compact padding (~25% reduction)
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 24, // rounded-[24px]
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    gap: 12, // Compact spacing (~25% reduction)
    ...SHADOWS.sm, // shadow-sm for depth
  },
  addressDotBlue: {
    width: 10, // w-2.5
    height: 10, // h-2.5
    borderRadius: 5, // rounded-full для синього
    backgroundColor: COLORS.blue[500], // bg-blue-500
    ...createShadow('lg', COLORS.blue[500]), // shadow-lg shadow-blue-500/40
  },
  addressDotBlack: {
    width: 10, // w-2.5
    height: 10, // h-2.5
    borderRadius: 2, // rounded-sm для чорного
    backgroundColor: COLORS.slate[900], // bg-slate-900
    ...SHADOWS.lg, // shadow-lg shadow-black/20
  },
  addressTextInput: {
    flex: 1,
    fontSize: 16, // text-[16px]
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[900], // text-slate-900 (main text)
  },
  addressClear: {
    padding: 4,
  },
  addressLocate: {
    padding: 6,
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },
  modalClose: {
    padding: 8,
  },
  modalBody: {
    padding: 24,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12, // More whitespace
  },
  modalInput: {
    padding: 16,
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    fontSize: 16,
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[900], // text-slate-900 (main text)
    ...SHADOWS.sm, // shadow-sm for depth
  },
  modalTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTypeButtonActive: {
    backgroundColor: '#2563eb',
  },
  modalTypeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalTypeButtonTextActive: {
    color: '#ffffff',
  },
  modalSizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalSizeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSizeButtonActive: {
    backgroundColor: '#2563eb',
  },
  modalSizeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalSizeButtonTextActive: {
    color: '#ffffff',
  },
  modalSaveButton: {
    paddingVertical: 16,
    backgroundColor: '#2563eb',
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  modalSaveButtonText: {
    fontSize: 12,
    fontWeight: '600', // font-semibold
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
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


