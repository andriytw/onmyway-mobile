/**
 * RouteStackItem
 * React Native version - Individual route item component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RoutePointDisplay } from '../../types/driver.types';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../styles/designTokens';

interface RouteStackItemProps {
  point: RoutePointDisplay;
  index: number;
  isExpanded: boolean;
  onTap: () => void;
}

const RouteStackItem: React.FC<RouteStackItemProps> = ({
  point,
  index,
  isExpanded,
  onTap,
}) => {
  const getActionIcon = () => {
    switch (point.action) {
      case 'pickup_passenger':
        return { name: 'account-plus', color: COLORS.blue[600] };
      case 'dropoff_passenger':
        return { name: 'account-minus', color: COLORS.blue[600] };
      case 'pickup_parcel':
        return { name: 'package-variant', color: COLORS.green[600] };
      case 'dropoff_parcel':
        return { name: 'package-variant-closed', color: COLORS.green[600] };
      default:
        return { name: 'map-marker', color: COLORS.slate[500] };
    }
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        point.status === 'delivered' && styles.containerDelivered,
      ]}
      onPress={onTap}
      activeOpacity={0.95}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Icon name={icon.name} size={20} color={icon.color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.actionLabel}>{point.actionLabel}</Text>
          <Text style={styles.address}>{point.address}</Text>

          {point.passenger && (
            <View style={styles.passengerInfo}>
              <Text style={styles.passengerName}>{point.passenger.name}</Text>
              {point.passenger.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingEmoji}>⭐</Text>
                  <Text style={styles.rating}>{point.passenger.rating}</Text>
                </View>
              )}
            </View>
          )}

          {point.parcel && (
            <Text style={styles.parcelInfo}>
              {point.parcel.size} • {point.parcel.weight} кг
            </Text>
          )}

          {isExpanded && (
            <View style={styles.expandedContent}>
              {point.passenger?.phone && (
                <Text style={styles.expandedText}>📞 {point.passenger.phone}</Text>
              )}
              {point.price && (
                <Text style={styles.expandedPrice}>{point.price}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.rightContainer}>
          <Text style={styles.eta}>{point.eta} хв</Text>
          <Text style={styles.distance}>{point.distance} км</Text>
          <View style={styles.statusContainer}>
            {point.status === 'delivered' && (
              <Icon name="check-circle" size={16} color={COLORS.green[500]} />
            )}
            {point.status === 'picked_up' && (
              <Icon name="clock-outline" size={16} color={COLORS.blue[500]} />
            )}
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.slate[400]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24, // rounded-2xl (Linear/Vercel style)
    borderWidth: 1, // border (Linear/Vercel style)
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    padding: 14, // Compact padding (~30% reduction)
    marginBottom: 8, // Compact spacing (~33% reduction)
    ...SHADOWS.sm, // shadow-sm for subtle depth
  },
  containerDelivered: {
    opacity: 0.6,
    borderColor: COLORS.slate[200], // border-slate-200
  },
  content: {
    flexDirection: 'row',
    gap: 12, // gap-3
  },
  iconContainer: {
    width: 48, // w-12
    height: 48, // h-12
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  actionLabel: {
    fontSize: 10, // text-[10px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
    marginBottom: 4, // Compact spacing (50% reduction)
  },
  address: {
    fontSize: 16, // text-[16px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    marginBottom: 8, // Compact spacing (~33% reduction)
    lineHeight: 20, // leading-tight
    letterSpacing: TYPOGRAPHY.trackingTight(16), // tracking-tight for headings >20px
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    marginBottom: 2, // Compact spacing (50% reduction)
  },
  passengerName: {
    fontSize: 14, // text-[14px]
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[900], // text-slate-900 (main text)
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // gap-1
    backgroundColor: '#ffffff', // bg-white
    paddingHorizontal: 8, // px-2
    paddingVertical: 4, // py-0.5
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    ...SHADOWS.sm, // shadow-sm
  },
  ratingEmoji: {
    fontSize: 10, // text-[10px]
  },
  rating: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
  },
  parcelInfo: {
    fontSize: 12, // text-[12px]
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    marginBottom: 4, // Compact spacing (~33% reduction)
  },
  expandedContent: {
    marginTop: 10, // Compact spacing (~38% reduction)
    paddingTop: 10, // Compact spacing (~38% reduction)
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    gap: 8, // Compact spacing (~33% reduction)
  },
  expandedText: {
    fontSize: 12, // text-[12px]
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[900], // text-slate-900 (main text)
  },
  expandedPrice: {
    fontSize: 14, // text-[14px]
    fontWeight: '600', // font-semibold
    color: COLORS.green[600], // text-green-600
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 70, // min-w-[70px]
  },
  eta: {
    fontSize: 16, // text-[16px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    lineHeight: 20, // leading-tight (better readability)
    letterSpacing: TYPOGRAPHY.trackingTight(16), // tracking-tight for headings >20px
  },
  distance: {
    fontSize: 12, // text-[12px]
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    marginTop: 4, // Compact spacing (~33% reduction)
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    marginTop: 4, // Compact spacing (50% reduction)
  },
});

export default RouteStackItem;


