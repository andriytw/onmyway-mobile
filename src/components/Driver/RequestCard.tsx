/**
 * RequestCard
 * React Native version - Request card component for driver
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ActiveRequest } from '../../types/driver.types';
import { useDriver } from '../../contexts/DriverContext';
import { COLORS, TYPOGRAPHY, SHADOWS, createShadow } from '../../styles/designTokens';

interface RequestCardProps {
  request: ActiveRequest;
}

const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const { acceptRequest, rejectRequest } = useDriver();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {request.type === 'passenger' ? (
          <View style={styles.iconContainerPassenger}>
            <Icon name="account" size={20} color={COLORS.blue[600]} />
          </View>
        ) : (
          <View style={styles.iconContainerParcel}>
            <Icon name="package-variant" size={20} color={COLORS.green[600]} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {request.passenger?.name || `Посилка ${request.parcel?.size}`}
            </Text>
            {request.price && (
              <Text style={styles.price}>{request.price}</Text>
            )}
          </View>

          {request.passenger && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingEmoji}>⭐</Text>
              <Text style={styles.rating}>{request.passenger.rating}</Text>
            </View>
          )}

          {request.parcel && (
            <Text style={styles.parcelInfo}>
              {request.parcel.size} • {request.parcel.weight} кг
            </Text>
          )}
        </View>
      </View>

      <View style={styles.addresses}>
        <View style={styles.addressRow}>
          <Icon name="map-marker" size={12} color={COLORS.blue[500]} />
          <Text style={styles.addressText}>{request.pickup.address}</Text>
        </View>
        <View style={styles.addressRow}>
          <Icon name="map-marker" size={12} color={COLORS.red[600]} />
          <Text style={styles.addressText}>{request.dropoff.address}</Text>
        </View>
      </View>

      <View style={styles.deviation}>
        <Icon name="clock-outline" size={12} color={COLORS.slate[400]} />
        <Text style={styles.deviationText}>
          Відхилення: {request.distance} км, +{request.timeDeviation} хв
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => rejectRequest(request.id)}
          activeOpacity={0.95}
        >
          <Icon name="close" size={16} color="#475569" />
          <Text style={styles.rejectButtonText}>Відхилити</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptRequest(request.id)}
          activeOpacity={0.95}
        >
          <Icon name="check" size={16} color="#ffffff" />
          <Text style={styles.acceptButtonText}>Прийняти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24, // rounded-2xl (Linear/Vercel style)
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    padding: 14, // Compact padding (~30% reduction)
    marginBottom: 10, // Compact spacing (~38% reduction)
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10, // Compact spacing (~38% reduction)
  },
  iconContainerPassenger: {
    width: 56, // w-14
    height: 56, // h-14
    borderRadius: 16, // rounded-2xl
    backgroundColor: COLORS.blue[100], // bg-blue-100
    borderWidth: 1,
    borderColor: COLORS.blue[50], // border-blue-50
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // mr-4
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  iconContainerParcel: {
    width: 56, // w-14
    height: 56, // h-14
    borderRadius: 16, // rounded-2xl
    backgroundColor: COLORS.green[100], // bg-green-100
    borderWidth: 1,
    borderColor: COLORS.green[50], // border-green-50
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // mr-4
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // Compact spacing (50% reduction)
  },
  title: {
    fontSize: 16, // text-[16px]
    fontWeight: '600', // font-semibold (Linear/Vercel style)
    color: COLORS.slate[900], // text-slate-900 (main text)
    lineHeight: 20, // leading-tight (better readability)
    letterSpacing: TYPOGRAPHY.trackingTight(16), // tracking-tight for headings >20px
  },
  price: {
    fontSize: 16, // text-[16px]
    fontWeight: '600', // font-semibold
    color: COLORS.green[600], // text-green-600
    letterSpacing: TYPOGRAPHY.trackingTight(16), // tracking-tight
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // gap-1.5 = 6px, але gap-1 = 4px
    backgroundColor: '#ffffff', // bg-white
    paddingHorizontal: 8, // px-2
    paddingVertical: 4, // py-0.5
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    alignSelf: 'flex-start',
    marginBottom: 4, // Compact spacing (~33% reduction)
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
    fontSize: 11, // text-[11px]
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingTight(11), // tracking-tight = -0.275px
    marginTop: 4, // Compact spacing (~33% reduction)
  },
  addresses: {
    gap: 8, // space-y-2
    marginBottom: 10, // Compact spacing (~38% reduction)
    paddingLeft: 72, // pl-18 = 72px
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8, // gap-2
  },
  addressText: {
    flex: 1,
    fontSize: 12, // text-[12px]
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[900], // text-slate-900 (main text)
    lineHeight: 18, // leading-relaxed
  },
  deviation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    marginBottom: 10, // Compact spacing (~38% reduction)
    paddingLeft: 72, // px-2 в контексті pl-18
  },
  deviationText: {
    fontSize: 10, // text-[10px]
    fontWeight: '500', // font-medium
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.trackingWidest(10), // tracking-widest = 1px
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // Compact padding (~29% reduction)
    minHeight: 40, // Compact touch target (~9% reduction, still accessible)
    backgroundColor: COLORS.slate[50], // bg-slate-50
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    gap: 8, // gap-2
    ...SHADOWS.sm, // shadow-sm for depth
  },
  rejectButtonText: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking02(11), // tracking-[0.2em] = 2.2px
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // Compact padding (~29% reduction)
    minHeight: 40, // Compact touch target (~9% reduction, still accessible)
    backgroundColor: COLORS.green[600], // bg-green-600
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    gap: 8, // gap-2
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  acceptButtonText: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.tracking02(11), // tracking-[0.2em] = 2.2px
  },
});

export default RequestCard;


