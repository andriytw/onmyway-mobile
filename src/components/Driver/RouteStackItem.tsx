/**
 * RouteStackItem
 * React Native version - Individual route item component
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import {
  Swipeable,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Package, Plus, Minus } from 'lucide-react-native';
import { RoutePointDisplay } from '../../types/driver.types';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../styles/designTokens';
import { useDriver } from '../../contexts/DriverContext';

interface RouteStackItemProps {
  point: RoutePointDisplay;
  index: number;
  onTap?: () => void;
  isDragging?: boolean;
  onDrag?: () => void; // Функція для початку drag (з DraggableFlatList)
  totalItems?: number;
}

const RouteStackItem: React.FC<RouteStackItemProps> = ({
  point,
  index,
  onTap,
  isDragging = false,
  onDrag,
  totalItems = 0,
}) => {
  const { removeStop, currentRoute } = useDriver();
  
  // Отримуємо оригінальний RouteStop для доступу до повних даних
  const routeStop = currentRoute.find(stop => stop.id === point.stopId);
  const [showModal, setShowModal] = useState(false);
  
  // Refs для swipe-to-delete
  const swipeableRef = useRef<Swipeable>(null);

  // Логіка іконок: всі чорні з чорними рамками без заливки фону
  const getActionIcon = () => {
    const blackColor = COLORS.slate[900]; // Чорний колір для всіх іконок
    
    // Старт маршруту
    if (point.action === 'start') {
      return { type: 'material', name: 'map-marker', color: blackColor, size: 28 };
    }
    
    // Фініш маршруту
    if (point.action === 'finish') {
      return { type: 'material', name: 'map-marker-check', color: blackColor, size: 28 };
    }
    
    // Забрати пасажира
    if (point.action === 'pickup_passenger') {
      return { type: 'material', name: 'account-plus-outline', color: blackColor, size: 24 };
    }
    
    // Висадити пасажира
    if (point.action === 'dropoff_passenger') {
      return { type: 'material', name: 'account-minus-outline', color: blackColor, size: 24 };
    }
    
    // Забрати посилку - комбінована іконка Package + Plus
    if (point.action === 'pickup_parcel') {
      return { type: 'combined', base: 'package', overlay: 'plus', color: blackColor, size: 24 };
    }
    
    // Віддати посилку - комбінована іконка Package + Minus
    if (point.action === 'dropoff_parcel') {
      return { type: 'combined', base: 'package', overlay: 'minus', color: blackColor, size: 24 };
    }
    
    return { type: 'material', name: 'map-marker', color: blackColor, size: 24 };
  };


  const icon = getActionIcon();

  // Обробник видалення
  const handleDelete = () => {
    if (point.stopId) {
      removeStop(point.stopId);
    }
    swipeableRef.current?.close();
  };

  // Рендер правої дії (червона кнопка видалення)
  const renderRightAction = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.8, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.deleteButtonContent,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Icon name="delete" size={24} color="#ffffff" />
          <Text style={styles.deleteButtonText}>Видалити</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightAction}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
      enabled={!isDragging && point.status !== 'delivered'}
    >
      <TouchableOpacity
        style={[
          styles.container,
          point.status === 'delivered' && styles.containerDelivered,
          isDragging && styles.containerDragging,
        ]}
        activeOpacity={0.95}
        onLongPress={onDrag} // Довге натискання для початку drag
        onPress={() => {
          if (!isDragging) {
            setShowModal(true);
          }
        }}
        disabled={isDragging || point.status === 'delivered'}
      >
        <View style={styles.content}>
          {/* Іконка перетягування (зліва, тільки якщо можна перетягувати) */}
          {point.status !== 'delivered' && onDrag && (
            <TouchableOpacity
              onPressIn={onDrag}
              style={styles.dragHandle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="drag-vertical" size={20} color={COLORS.slate[400]} />
            </TouchableOpacity>
          )}

          {/* Іконка зліва - чорна з чорною рамкою, без заливки фону */}
          <View style={styles.iconContainer}>
            {icon.type === 'combined' ? (
              // Комбінована іконка для посилок (Plus/Minus + Package)
              <View style={styles.combinedIcon}>
                {icon.overlay === 'plus' ? (
                  <Plus size={14} color={icon.color} strokeWidth={2.5} />
                ) : (
                  <Minus size={14} color={icon.color} strokeWidth={2.5} />
                )}
                <View style={styles.packageIcon}>
                  <Package size={24} color={icon.color} strokeWidth={2} />
                </View>
              </View>
            ) : (
              // MaterialCommunityIcons для інших типів
              <Icon name={icon.name} size={icon.size} color={icon.color} />
            )}
          </View>

          {/* Адреса по центру */}
          <View style={styles.textContainer}>
            <Text style={styles.address} numberOfLines={1}>{point.address}</Text>
          </View>

          {/* Час та кілометраж справа */}
          <View style={styles.rightContainer}>
            <Text style={styles.eta}>{point.eta} хв</Text>
            <Text style={styles.distance}>{point.distance} км</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Модальне вікно з деталями */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {point.action === 'start'
                  ? 'Старт маршруту'
                  : point.action === 'finish'
                  ? 'Фініш маршруту'
                  : point.action === 'pickup_passenger'
                  ? 'Забрати пасажира'
                  : point.action === 'dropoff_passenger'
                  ? 'Віддати пасажира'
                  : point.action === 'pickup_parcel'
                  ? 'Забрати посилку'
                  : point.action === 'dropoff_parcel'
                  ? 'Віддати посилку'
                  : 'Зупинка маршруту'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalClose}
              >
                <Icon name="close" size={20} color={COLORS.slate[500]} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Адреса */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Адреса</Text>
                <Text style={styles.modalValue}>{point.address}</Text>
              </View>

              {/* Для пасажира (тільки якщо не старт/фініш) */}
              {point.passenger && point.action !== 'start' && point.action !== 'finish' && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Ім'я</Text>
                    <Text style={styles.modalValue}>{point.passenger.name}</Text>
                  </View>
                  {point.passenger.phone && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Телефон</Text>
                      <Text style={styles.modalValue}>{point.passenger.phone}</Text>
                    </View>
                  )}
                  {point.passenger.rating && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Рейтинг</Text>
                      <View style={styles.ratingRow}>
                        <Text style={styles.ratingEmoji}>⭐</Text>
                        <Text style={styles.modalValue}>{point.passenger.rating}</Text>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* Для посилки (тільки якщо не старт/фініш) */}
              {point.parcel && point.action !== 'start' && point.action !== 'finish' && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>
                      {(point.action === 'pickup_parcel' || point.action === 'start') ? 'Відправник' : 'Отримувач'}
                    </Text>
                    {/* TODO: Додати дані відправника/отримувача до RouteStop.parcel або RoutePointDisplay */}
                    <Text style={styles.modalValue}>Дані відсутні</Text>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Розмір</Text>
                    <Text style={styles.modalValue}>{point.parcel.size}</Text>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Вага</Text>
                    <Text style={styles.modalValue}>{point.parcel.weight} кг</Text>
                  </View>
                </>
              )}

              {/* Час та відстань */}
              <View style={styles.modalSection}>
                <View style={styles.modalRow}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalLabel}>Час</Text>
                    <Text style={styles.modalValue}>{point.eta} хв</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalLabel}>Відстань</Text>
                    <Text style={styles.modalValue}>{point.distance} км</Text>
                  </View>
                </View>
              </View>

              {/* Кнопки чату та подзвонити (тільки якщо не старт/фініш) */}
              {(point.passenger || point.parcel) && point.action !== 'start' && point.action !== 'finish' && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => {
                      // TODO: Відкрити чат
                      console.log('Open chat');
                      setShowModal(false);
                    }}
                  >
                    <Icon name="message-text" size={20} color={COLORS.blue[600]} />
                    <Text style={styles.modalActionText}>Чат</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => {
                      const phone = point.passenger?.phone || 'Номер відсутній';
                      if (phone && phone !== 'Номер відсутній') {
                        Linking.openURL(`tel:${phone}`);
                      }
                      setShowModal(false);
                    }}
                  >
                    <Icon name="phone" size={20} color={COLORS.green[600]} />
                    <Text style={styles.modalActionText}>Подзвонити</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden', // Обмежуємо overflow для запобігання виходу за межі
    ...SHADOWS.sm,
  },
  containerDelivered: {
    opacity: 0.6,
    borderColor: COLORS.slate[200],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate[900], // Чорна рамка
    backgroundColor: 'transparent', // Прозорий фон
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  combinedIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  packageIcon: {
    marginLeft: -2, // Коробка зсунута на 3px вліво від попереднього положення (1px - 3px = -2px)
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  address: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.slate[900],
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  eta: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.slate[900],
  },
  distance: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.slate[500],
  },
  containerDragging: {
    elevation: 8,
    zIndex: 1000,
    borderColor: COLORS.blue[500],
    borderWidth: 2,
    opacity: 0.8,
    overflow: 'hidden', // Обмежуємо overflow під час drag
  },
  dragHandle: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // iOS-style delete button
  deleteButton: {
    backgroundColor: COLORS.red[600],
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 24,
    marginBottom: 8,
  },
  deleteButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.slate[900],
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.slate[900],
  },
  modalRow: {
    flexDirection: 'row',
    gap: 16,
  },
  modalStatItem: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingEmoji: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    backgroundColor: COLORS.slate[50],
    gap: 8,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate[900],
  },
});

export default RouteStackItem;


