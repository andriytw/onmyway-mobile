/**
 * DateFilter
 * React Native version - Date filter component for map
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDriver } from '../../contexts/DriverContext';
import { getDateString } from '../../services/mock/mockData';
import { COLORS, TYPOGRAPHY, SHADOWS, createShadow } from '../../styles/designTokens';

const DateFilter: React.FC = () => {
  const { selectedDate, setSelectedDate } = useDriver();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === getDateString(0)) {
      return 'Сьогодні';
    } else if (dateString === getDateString(1)) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const goToPreviousDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(getDateString(0));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={goToPreviousDay}
        activeOpacity={0.95}
      >
        <Icon name="chevron-left" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.todayButton}
        onPress={goToToday}
        activeOpacity={0.95}
      >
        <Icon name="calendar" size={16} color="#3b82f6" />
        <Text style={styles.todayButtonText}>{formatDate(selectedDate)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={goToNextDay}
        activeOpacity={0.95}
      >
        <Icon name="chevron-right" size={18} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80, // top-20 = 80px
    left: '50%',
    transform: [{ translateX: -150 }], // -translate-x-1/2 (приблизно)
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // bg-white/95
    // backdrop-blur-md можна зробити через BlurView з expo-blur
    borderRadius: 24, // rounded-2xl (Linear/Vercel style)
    padding: 6, // p-1.5
    gap: 8, // gap-2
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
    zIndex: 80,
  },
  button: {
    padding: 10, // p-2.5
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    minHeight: 44, // Touch target (Linear/Vercel style)
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Compact padding (~17% reduction)
    paddingHorizontal: 20, // px-5
    minHeight: 40, // Compact touch target (~9% reduction, if applicable)
    backgroundColor: COLORS.blue[600], // bg-blue-600
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    gap: 8, // gap-2
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  todayButtonText: {
    fontSize: 12, // text-[12px]
    fontWeight: '600', // font-semibold
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking02(12), // tracking-[0.2em] = 2.4px
  },
});

export default DateFilter;


