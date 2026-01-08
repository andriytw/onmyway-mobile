/**
 * LiveRouteStats
 * React Native version - Live route statistics component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDriver } from '../../contexts/DriverContext';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../styles/designTokens';

const LiveRouteStats: React.FC = () => {
  const { routeStats } = useDriver();

  if (!routeStats) {
    return null;
  }

  const stats = [
    {
      icon: 'account-group',
      label: 'Пасажири',
      value: routeStats.totalPassengers.toString(),
      color: 'blue',
    },
    {
      icon: 'package-variant',
      label: 'Посилки',
      value: routeStats.totalParcels.toString(),
      color: 'green',
    },
    {
      icon: 'weight-kilogram',
      label: 'Вага',
      value: `${routeStats.totalWeight} кг`,
      color: 'amber',
    },
    {
      icon: 'map-marker',
      label: 'Зупинки',
      value: routeStats.stopsCount.toString(),
      color: 'purple',
    },
    {
      icon: 'fuel',
      label: 'Паливо',
      value: `€${routeStats.estimatedFuel.toFixed(2)}`,
      color: 'red',
    },
    {
      icon: 'currency-eur',
      label: 'Дохід',
      value: `€${routeStats.estimatedEarnings.toFixed(2)}`,
      color: 'green',
    },
  ];

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: COLORS.blue[100], icon: COLORS.blue[600] };
      case 'green':
        return { bg: COLORS.green[100], icon: COLORS.green[600] };
      case 'amber':
        return { bg: COLORS.amber[100], icon: COLORS.amber[500] };
      case 'purple':
        return { bg: COLORS.purple[100], icon: COLORS.purple[600] };
      case 'red':
        return { bg: COLORS.red[100], icon: COLORS.red[600] };
      default:
        return { bg: COLORS.slate[50], icon: COLORS.slate[500] };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Статистика маршруту</Text>
        {routeStats.efficiency !== 0 && (
          <View style={styles.efficiency}>
            <Icon name="trending-up" size={12} color={COLORS.green[600]} />
            <Text style={styles.efficiencyText}>
              {routeStats.efficiency > 0 ? '+' : ''}{routeStats.efficiency.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.grid}>
        {stats.map((stat, index) => {
          const colors = getColorStyles(stat.color);
          return (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.bg }]}>
                <Icon name={stat.icon} size={20} color={colors.icon} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {routeStats.baseDistance && (
        <View style={styles.baseRoute}>
          <Text style={styles.baseRouteText}>
            Базовий маршрут: {routeStats.baseDistance} км
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14, // Compact padding (~30% reduction)
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 24, // rounded-2xl (Linear/Vercel style)
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    ...SHADOWS.sm, // shadow-sm
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Compact spacing (~38% reduction)
  },
  title: {
    fontSize: 10, // text-[10px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingEm(0.2, 10), // tracking-[0.2em] = 2px
  },
  efficiency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // gap-1
  },
  efficiencyText: {
    fontSize: 10, // text-[10px]
    fontWeight: '600', // font-semibold
    color: COLORS.green[600], // text-green-600
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Compact spacing (~33% reduction)
  },
  statCard: {
    width: '47%',
    padding: 14, // Compact padding (~30% reduction)
    backgroundColor: '#ffffff', // bg-white
    borderRadius: 24, // rounded-2xl (Linear/Vercel style)
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    ...SHADOWS.sm, // shadow-sm
  },
  statIconContainer: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 12, // rounded-xl
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6, // Compact spacing (~25% reduction)
  },
  statValue: {
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    lineHeight: 24, // leading-tight (better readability)
    marginBottom: 4, // Compact spacing (~33% reduction)
    letterSpacing: TYPOGRAPHY.trackingTight(20), // tracking-tight for headings >20px
  },
  statLabel: {
    fontSize: 8, // text-[8px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(8), // tracking-widest = 0.8px
    marginTop: 4, // Compact spacing (~33% reduction)
  },
  baseRoute: {
    marginTop: 12, // Compact spacing (~40% reduction)
    paddingTop: 12, // Compact spacing (~40% reduction)
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    alignItems: 'center',
  },
  baseRouteText: {
    fontSize: 10, // text-[10px]
    fontWeight: '500', // font-medium
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
    textAlign: 'center',
  },
});

export default LiveRouteStats;


