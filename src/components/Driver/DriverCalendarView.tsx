/**
 * DriverCalendarView
 * React Native version - Calendar for scheduled rides
 * Simplified version with Day/Week/Month views
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDriver } from '../../contexts/DriverContext';
import { ScheduledRide } from '../../types/driver.types';

type CalendarView = 'day' | 'week' | 'month';

const DriverCalendarView: React.FC = () => {
  const { scheduledRides } = useDriver();
  const [viewMode, setViewMode] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduledRide | null>(null);

  const getDaysInWeek = (date: Date): Date[] => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    const monday = new Date(d.setDate(diff));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      days.push(dayDate);
    }
    return days;
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getEventsForDate = (date: Date): ScheduledRide[] => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledRides.filter(ride => {
      const rideDate = new Date(ride.date).toISOString().split('T')[0];
      return rideDate === dateStr;
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const renderDayView = () => {
    const events = getEventsForDate(selectedDate);
    return (
      <View style={styles.dayView}>
        <Text style={styles.dayTitle}>{formatDate(selectedDate)}</Text>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Немає подій</Text>
          </View>
        ) : (
          <ScrollView style={styles.eventsList}>
            {events.map((ride) => (
              <TouchableOpacity
                key={ride.id}
                style={[
                  styles.eventCard,
                  ride.type === 'passenger' ? styles.eventCardPassenger : styles.eventCardParcel,
                ]}
                onPress={() => setSelectedEvent(ride)}
              >
                <View style={styles.eventCardHeader}>
                  <Icon
                    name={ride.type === 'passenger' ? 'account' : 'package-variant'}
                    size={20}
                    color={ride.type === 'passenger' ? '#3b82f6' : '#16a34a'}
                  />
                  <Text style={styles.eventTime}>{ride.time}</Text>
                </View>
                <Text style={styles.eventAddress}>{ride.pickup.address}</Text>
                <Text style={styles.eventAddress}>{ride.dropoff.address}</Text>
                {ride.price && (
                  <Text style={styles.eventPrice}>{ride.price}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderWeekView = () => {
    const weekDays = getDaysInWeek(selectedDate);
    return (
      <View style={styles.weekView}>
        <View style={styles.weekGrid}>
          {weekDays.map((day, idx) => {
            const events = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <View
                key={idx}
                style={[
                  styles.weekDay,
                  isToday && styles.weekDayToday,
                ]}
              >
                <Text style={[styles.weekDayName, isToday && styles.weekDayNameToday]}>
                  {day.toLocaleDateString('uk-UA', { weekday: 'short' })}
                </Text>
                <Text style={[styles.weekDayNumber, isToday && styles.weekDayNumberToday]}>
                  {day.getDate()}
                </Text>
                <View style={styles.weekEvents}>
                  {events.slice(0, 2).map((ride) => (
                    <TouchableOpacity
                      key={ride.id}
                      style={[
                        styles.weekEventBadge,
                        ride.type === 'passenger' ? styles.weekEventBadgePassenger : styles.weekEventBadgeParcel,
                      ]}
                      onPress={() => setSelectedEvent(ride)}
                    >
                      <Text style={styles.weekEventTime}>{ride.time}</Text>
                    </TouchableOpacity>
                  ))}
                  {events.length > 2 && (
                    <Text style={styles.weekEventMore}>+{events.length - 2}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMonthView = () => {
    const monthDays = getDaysInMonth(selectedDate);
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    return (
      <View style={styles.monthView}>
        <View style={styles.monthHeader}>
          {weekDays.map((day) => (
            <View key={day} style={styles.monthHeaderDay}>
              <Text style={styles.monthHeaderText}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {monthDays.map((day, idx) => {
            const events = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <View
                key={idx}
                style={[
                  styles.monthDay,
                  isToday && styles.monthDayToday,
                ]}
              >
                <Text style={[styles.monthDayNumber, isToday && styles.monthDayNumberToday]}>
                  {day.getDate()}
                </Text>
                <View style={styles.monthEvents}>
                  {events.slice(0, 2).map((ride) => (
                    <View
                      key={ride.id}
                      style={[
                        styles.monthEventDot,
                        ride.type === 'passenger' ? styles.monthEventDotPassenger : styles.monthEventDotParcel,
                      ]}
                    />
                  ))}
                  {events.length > 2 && (
                    <Text style={styles.monthEventMore}>+{events.length - 2}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* View Mode Selector */}
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'day' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('day')}
        >
          <Text style={[styles.viewModeText, viewMode === 'day' && styles.viewModeTextActive]}>
            День
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
            Тиждень
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
            Місяць
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDate('prev')}
        >
          <Icon name="chevron-left" size={20} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={goToToday}
        >
          <Icon name="calendar" size={16} color="#3b82f6" />
          <Text style={styles.todayButtonText}>
            {viewMode === 'day' ? formatDate(selectedDate) :
             viewMode === 'week' ? `Тиждень ${selectedDate.getDate()}` :
             selectedDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDate('next')}
        >
          <Icon name="chevron-right" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </ScrollView>

      {/* Event Detail Modal (placeholder) */}
      {selectedEvent && (
        <View style={styles.eventDetail}>
          <Text style={styles.eventDetailTitle}>Деталі поїздки</Text>
          <Text style={styles.eventDetailText}>
            {selectedEvent.type === 'passenger' ? '👤 Пасажир' : '📦 Посилка'}
          </Text>
          <Text style={styles.eventDetailText}>{selectedEvent.time}</Text>
          <Text style={styles.eventDetailText}>{selectedEvent.pickup.address}</Text>
          <Text style={styles.eventDetailText}>{selectedEvent.dropoff.address}</Text>
          <TouchableOpacity
            style={styles.eventDetailClose}
            onPress={() => setSelectedEvent(null)}
          >
            <Text style={styles.eventDetailCloseText}>Закрити</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  viewModeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  viewModeTextActive: {
    color: '#ffffff',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  dayView: {
    padding: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  eventCardPassenger: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  eventCardParcel: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  eventAddress: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16a34a',
    marginTop: 8,
  },
  weekView: {
    padding: 16,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  weekDay: {
    flex: 1,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 120,
  },
  weekDayToday: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  weekDayName: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  weekDayNameToday: {
    color: '#3b82f6',
  },
  weekDayNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  weekDayNumberToday: {
    color: '#3b82f6',
  },
  weekEvents: {
    gap: 4,
  },
  weekEventBadge: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  weekEventBadgePassenger: {
    backgroundColor: '#dbeafe',
  },
  weekEventBadgeParcel: {
    backgroundColor: '#dcfce7',
  },
  weekEventTime: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0f172a',
  },
  weekEventMore: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94a3b8',
  },
  monthView: {
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  monthHeaderDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  monthHeaderText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  monthDay: {
    width: '13.5%',
    minHeight: 60,
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 4,
  },
  monthDayToday: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  monthDayNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  monthDayNumberToday: {
    color: '#3b82f6',
  },
  monthEvents: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  monthEventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  monthEventDotPassenger: {
    backgroundColor: '#3b82f6',
  },
  monthEventDotParcel: {
    backgroundColor: '#16a34a',
  },
  monthEventMore: {
    fontSize: 7,
    fontWeight: '900',
    color: '#94a3b8',
  },
  eventDetail: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  eventDetailTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },
  eventDetailText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  eventDetailClose: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  eventDetailCloseText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
});

export default DriverCalendarView;


