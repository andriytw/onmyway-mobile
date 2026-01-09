/**
 * DriverSidebar
 * React Native drawer content component for Driver mode
 * Full version with all menu sections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import {
  Calendar,
  Clock,
  Wallet,
  CreditCard,
  Car,
  FileText,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriver } from '../../contexts/DriverContext';
import { useAuth } from '../../contexts/AuthContext';
import DriverCalendarView from './DriverCalendarView';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../styles/designTokens';

type LucideIcon = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

type MenuItem = { id: string; Icon: LucideIcon; label: string; route?: string };

const STROKE = 1.5;
const ICON_DEFAULT = COLORS.slate[600]; // slate-600
const ICON_ACTIVE = COLORS.blue[600];  // blue-600

interface DriverSidebarProps {
  navigation: any; // Drawer navigation prop
}

const DriverSidebar: React.FC<DriverSidebarProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isOnline, setOnline, driverProfile } = useDriver();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Get active route from navigation state
  const navigationState = navigation?.getState?.();
  const activeRoute = navigationState?.routes?.[navigationState?.index]?.name;

  // Моя робота
  const workItems: Array<MenuItem> = [
    { id: 'history', Icon: Clock, label: 'Історія замовлень', route: 'History' },
    { id: 'earnings', Icon: Wallet, label: 'Заробіток', route: 'Earnings' },
    { id: 'payouts', Icon: CreditCard, label: 'Баланс / Виплати', route: 'Payouts' },
  ];

  // Авто та документи
  const vehicleItems: Array<MenuItem> = [
    { id: 'vehicle', Icon: Car, label: 'Моє авто', route: 'Vehicle' },
    { id: 'documents', Icon: FileText, label: 'Документи', route: 'Documents' },
  ];

  // Комунікація і безпека
  const communicationItems: Array<MenuItem> = [
    { id: 'notifications', Icon: Bell, label: 'Сповіщення', route: 'Notifications' },
    { id: 'support', Icon: HelpCircle, label: 'Підтримка / SOS', route: 'Support' },
  ];

  // Налаштування
  const settingsItems: Array<MenuItem> = [
    { id: 'settings', Icon: Settings, label: 'Налаштування', route: 'Settings' },
  ];

  const handleToggleOnline = async (value: boolean) => {
    try {
      await setOnline(value);
    } catch (error) {
      console.error('Toggle online error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation?.closeDrawer();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSectionPress = (sectionId: string) => {
    if (sectionId === 'calendar') {
      setActiveSection('calendar');
    } else {
      // Navigate to screens
      const screenMap: Record<string, string> = {
        history: 'History',
        earnings: 'Earnings',
        payouts: 'Payouts',
        vehicle: 'Vehicle',
        documents: 'Documents',
        notifications: 'Notifications',
        support: 'Support',
        settings: 'Settings',
      };
      
      const screenName = screenMap[sectionId];
      if (screenName && navigation) {
        (navigation as any).navigate(screenName);
        navigation.closeDrawer();
      }
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header with Profile */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 44) }]}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Driver' }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {driverProfile?.name || 'Водій'}
              </Text>
              <View style={styles.ratingContainer}>
                <Star size={12} color="#fbbf24" fill="#fbbf24" strokeWidth={STROKE} />
                <Text style={styles.rating}>
                  {driverProfile?.rating?.toFixed(1) || '4.9'}
                </Text>
              </View>
              {driverProfile?.vehicle && (
                <Text style={styles.vehicleText}>
                  {driverProfile.vehicle.model}
                </Text>
              )}
            </View>
          </View>

          {/* Online/Offline Toggle */}
          <View style={styles.availabilityRow}>
            <View style={styles.availabilityLeft}>
              <View
                style={[
                  styles.statusDot,
                  !isOnline && styles.statusDotOffline,
                ]}
              />
              <Text style={styles.availabilityText}>
                {isOnline ? 'ОНЛАЙН' : 'ОФЛАЙН'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={(v) => handleToggleOnline(v)}
              trackColor={{ false: '#CBD5E1', true: '#34D399' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#CBD5E1"
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContent}>
          {/* Calendar */}
          {(() => {
            const isCalendarActive = activeSection === 'calendar';
            return (
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  isCalendarActive && styles.menuItemActive,
                ]}
                onPress={() => handleSectionPress('calendar')}
                activeOpacity={0.85}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      styles.iconContainerBlue,
                      isCalendarActive && styles.iconContainerActive,
                    ]}
                  >
                    <Calendar
                      size={18}
                      color={isCalendarActive ? ICON_ACTIVE : ICON_ACTIVE}
                      strokeWidth={STROKE}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.menuItemLabel,
                        isCalendarActive && styles.menuItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      Календар
                    </Text>
                    <Text style={styles.menuItemSubtext}>Заплановані поїздки</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={COLORS.slate[300]} strokeWidth={STROKE} />
              </TouchableOpacity>
            );
          })()}

          {/* Моя робота */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Моя робота</Text>
            {workItems.map((item) => {
              const IconComp = item.Icon;
              const isActive = activeRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleSectionPress(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.menuItemLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        isActive && styles.iconContainerActive,
                      ]}
                    >
                      <IconComp
                        size={18}
                        color={isActive ? ICON_ACTIVE : ICON_DEFAULT}
                        strokeWidth={STROKE}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuItemLabel,
                        isActive && styles.menuItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.slate[300]} strokeWidth={STROKE} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Авто та документи */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Авто та документи</Text>
            {vehicleItems.map((item) => {
              const IconComp = item.Icon;
              const isActive = activeRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleSectionPress(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.menuItemLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        isActive && styles.iconContainerActive,
                      ]}
                    >
                      <IconComp
                        size={18}
                        color={isActive ? ICON_ACTIVE : ICON_DEFAULT}
                        strokeWidth={STROKE}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuItemLabel,
                        isActive && styles.menuItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.slate[300]} strokeWidth={STROKE} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Комунікація і безпека */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Комунікація і безпека</Text>
            {communicationItems.map((item) => {
              const IconComp = item.Icon;
              const isActive = activeRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleSectionPress(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.menuItemLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        isActive && styles.iconContainerActive,
                      ]}
                    >
                      <IconComp
                        size={18}
                        color={isActive ? ICON_ACTIVE : ICON_DEFAULT}
                        strokeWidth={STROKE}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuItemLabel,
                        isActive && styles.menuItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.slate[300]} strokeWidth={STROKE} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Налаштування */}
          <View style={styles.section}>
            {settingsItems.map((item) => {
              const IconComp = item.Icon;
              const isActive = activeRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleSectionPress(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.menuItemLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        isActive && styles.iconContainerActive,
                      ]}
                    >
                      <IconComp
                        size={18}
                        color={isActive ? ICON_ACTIVE : ICON_DEFAULT}
                        strokeWidth={STROKE}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuItemLabel,
                        isActive && styles.menuItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.slate[300]} strokeWidth={STROKE} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonLogout]}
          onPress={handleLogout}
          activeOpacity={0.95}
        >
          <LogOut size={14} color={COLORS.red[600]} strokeWidth={STROKE} />
          <Text style={[styles.footerButtonText, styles.footerButtonTextLogout]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={activeSection === 'calendar'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveSection(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Календар</Text>
              <TouchableOpacity
                onPress={() => setActiveSection(null)}
                style={styles.modalCloseButton}
              >
                <X size={20} color={COLORS.slate[500]} strokeWidth={STROKE} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <DriverCalendarView />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    // paddingTop will be set dynamically via inline style using safe-area insets
    paddingHorizontal: 20,
    paddingBottom: 10, // 14 → 10px (~29% reduction)
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // 10 → 6px (40% reduction)
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    marginBottom: 2, // 4 → 2px (50% reduction)
    letterSpacing: TYPOGRAPHY.trackingTight(18), // tracking-tight for headings >20px
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2, // 4 → 2px (50% reduction)
  },
  rating: {
    fontSize: 11,
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
    marginLeft: 4,
  },
  vehicleText: {
    fontSize: 10,
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  availabilityRow: {
    marginTop: 10,
    height: 44, // iOS touch target
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(2, 6, 23, 0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#34D399', // online dot (emerald-400)
  },
  statusDotOffline: {
    backgroundColor: '#94A3B8', // offline dot (slate-400)
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44, // Ensure touch target >= 44px
    backgroundColor: '#0f172a',
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    gap: 8,
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  toggleButtonOnline: {
    backgroundColor: '#16a34a',
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748b',
  },
  toggleDotOnline: {
    backgroundColor: '#ffffff',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600', // font-semibold
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  menuContent: {
    paddingTop: 6, // 10 → 6px (40% reduction)
    paddingHorizontal: 12,
    paddingBottom: 10, // 14 → 10px (~29% reduction)
  },
  section: {
    marginBottom: 8, // 12 → 8px (~33% reduction)
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 14, // Add top margin for section separation
    marginBottom: 6, // Keep readable
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50, // Set height for touch target (48-52 target, touch >= 44px)
    paddingVertical: 10, // 12 → 10px (~17% reduction)
    paddingHorizontal: 10, // Add horizontal padding
    borderRadius: 24, // rounded-2xl (Linear/Vercel style)
    marginBottom: 4, // 6 → 4px (~33% reduction)
  },
  menuItemActive: {
    backgroundColor: COLORS.blue[50], // Active background
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 38, // 44 → 38px (~14% reduction)
    height: 38, // 44 → 38px (~14% reduction)
    borderRadius: 12, // 16 → 12px (25% reduction)
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Add margin right
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  iconContainerBlue: {
    borderColor: ICON_ACTIVE,
  },
  iconContainerActive: {
    borderColor: ICON_ACTIVE,
    backgroundColor: COLORS.blue[50],
  },
  menuItemLabel: {
    fontSize: 14, // 16 → 14px (text-sm)
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
  },
  menuItemTextActive: {
    color: ICON_ACTIVE,
  },
  menuItemSubtext: {
    fontSize: 9,
    fontWeight: '500', // font-medium (Linear/Vercel style for UI text)
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4, // Compact spacing (50% reduction)
  },
  footer: {
    padding: 10, // 14 → 10px (~29% reduction)
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8, // 10 → 8px (20% reduction)
    minHeight: 44, // 40 → 44px (ensure touch target)
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    gap: 12,
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  footerButtonLogout: {
    borderWidth: 0, // Remove border
    backgroundColor: '#ffffff',
    paddingVertical: 6, // Smaller padding
    paddingHorizontal: 8, // Smaller horizontal padding
    minHeight: 36, // Smaller height
    gap: 6, // Smaller gap between icon and text
  },
  footerButtonText: {
    fontSize: 14, // 15 → 14px (text-sm)
    fontWeight: '600', // font-semibold
    color: COLORS.blue[600], // text-blue-600
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footerButtonTextLogout: {
    color: '#dc2626',
    fontSize: 12, // Smaller text
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40, // rounded-t-[2.5rem] = 40px (Linear/Vercel style)
    borderTopRightRadius: 40,
    maxHeight: '90%',
    flex: 1,
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12, // 16 → 12px (25% reduction)
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '500', // font-medium
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
  },
});

export default DriverSidebar;
