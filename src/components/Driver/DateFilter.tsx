/**
 * DateFilter
 * React Native version - Compact pill-style date filter component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDriver } from '../../contexts/DriverContext';
import { getDateString } from '../../services/mock/mockData';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../styles/designTokens';

const DateFilter: React.FC = () => {
  const { selectedDate, setSelectedDate } = useDriver();
  const insets = useSafeAreaInsets();

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

  const handlePress = (event: any) => {
    const { locationX, target } = event.nativeEvent;
    const containerWidth = target?.offsetWidth || 0;
    
    if (containerWidth === 0) {
      // Fallback: tap center goes to today
      goToToday();
      return;
    }

    const tapPosition = locationX / containerWidth;
    
    if (tapPosition < 0.33) {
      // Left third - previous day
      goToPreviousDay();
    } else if (tapPosition > 0.67) {
      // Right third - next day
      goToNextDay();
    } else {
      // Center third - go to today
      goToToday();
    }
  };

  return (
    <View 
      style={[
        styles.container,
        { top: insets.top + 8 } // 8px below Dynamic Island
      ]}
    >
      <TouchableOpacity
        style={styles.pill}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Icon name="calendar" size={14} color={COLORS.blue[600]} />
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 80,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 28, // Very compact height
    paddingHorizontal: 12, // Horizontal padding
    paddingVertical: 6, // Vertical padding
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // White with slight transparency
    borderRadius: 14, // Pill shape (half of height)
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    gap: 6, // Gap between icon and text
    ...SHADOWS.sm,
    minWidth: 100, // Minimum width for tap zones
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate[900],
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking02(11),
  },
});

export default DateFilter;


