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

  // Оновити логіку іконок з урахуванням першої/останньої точки
  const getActionIcon = () => {
    const isFirst = index === 0;
    const isLast = index === totalItems - 1;
    
    // Старт маршруту (перша точка, pickup)
    if (isFirst && point.action.includes('pickup')) {
      return { name: 'map-pin', color: COLORS.blue[600] };
    }
    
    // Фініш маршруту (остання точка, dropoff)
    if (isLast && point.action.includes('dropoff')) {
      return { name: 'flag', color: COLORS.green[600] };
    }
    
    // Забрати пасажира
    if (point.action === 'pickup_passenger') {
      return { name: 'account-plus', color: COLORS.blue[600] };
    }
    
    // Віддати пасажира
    if (point.action === 'dropoff_passenger') {
      return { name: 'account-minus', color: COLORS.green[600] };
    }
    
    // Забрати посилку
    if (point.action === 'pickup_parcel') {
      return { name: 'package-variant', color: COLORS.amber[600] };
    }
    
    // Віддати посилку
    if (point.action === 'dropoff_parcel') {
      return { name: 'package-check', color: COLORS.green[600] };
    }
    
    return { name: 'map-marker', color: COLORS.slate[500] };
  };

  const getActionColor = () => {
    switch (point.action) {
      case 'pickup_passenger':
      case 'dropoff_passenger':
        return { bg: COLORS.blue[100], border: COLORS.blue[200] };
      case 'pickup_parcel':
      case 'dropoff_parcel':
        return { bg: COLORS.green[100], border: COLORS.green[200] };
      default:
        return { bg: COLORS.slate[50], border: COLORS.slate[200] };
    }
  };

  const icon = getActionIcon();
  const colors = getActionColor();

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

          {/* Іконка зліва */}
          <View style={[styles.iconContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Icon name={icon.name} size={24} color={icon.color} />
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
                {index === 0 && point.action.includes('pickup')
                  ? 'Старт маршруту'
                  : index === totalItems - 1 && point.action.includes('dropoff')
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

              {/* Для пасажира */}
              {point.passenger && (
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

              {/* Для посилки - потрібно визначити відправника/отримувача */}
              {point.parcel && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>
                      {point.action.includes('pickup') ? 'Відправник' : 'Отримувач'}
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

              {/* Кнопки чату та подзвонити */}
              {(point.passenger || point.parcel) && (
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
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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


