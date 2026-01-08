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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDriver } from '../../contexts/DriverContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth.types';
import DriverCalendarView from './DriverCalendarView';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../styles/designTokens';

interface DriverSidebarProps {
  navigation: any; // Drawer navigation prop
}

const DriverSidebar: React.FC<DriverSidebarProps> = ({ navigation }) => {
  const { isOnline, setOnline, driverProfile } = useDriver();
  const { logout, switchRole } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Моя робота
  const workItems = [
    { id: 'history', icon: 'history', label: 'Історія замовлень' },
    { id: 'earnings', icon: 'wallet', label: 'Заробіток' },
    { id: 'payouts', icon: 'credit-card', label: 'Баланс / Виплати' },
  ];

  // Авто та документи
  const vehicleItems = [
    { id: 'vehicle', icon: 'car', label: 'Моє авто' },
    { id: 'documents', icon: 'file-document', label: 'Документи' },
  ];

  // Комунікація і безпека
  const communicationItems = [
    { id: 'notifications', icon: 'bell', label: 'Сповіщення' },
    { id: 'support', icon: 'help-circle', label: 'Підтримка / SOS' },
  ];

  // Налаштування
  const settingsItems = [
    { id: 'settings', icon: 'cog', label: 'Налаштування' },
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

  const handleSwitchRole = async () => {
    try {
      await switchRole(UserRole.PASSENGER_SENDER);
      navigation?.closeDrawer();
    } catch (error) {
      console.error('Switch role error:', error);
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
        <View style={styles.header}>
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
                <Icon name="star" size={12} color="#fbbf24" />
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
          <TouchableOpacity
            style={[styles.toggleButton, isOnline && styles.toggleButtonOnline]}
          onPress={() => handleToggleOnline(!isOnline)}
          activeOpacity={0.95}
          >
            <View style={[styles.toggleDot, isOnline && styles.toggleDotOnline]} />
            <Text style={styles.toggleText}>
              {isOnline ? 'Онлайн' : 'Офлайн'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContent}>
          {/* Calendar */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleSectionPress('calendar')}
            activeOpacity={0.95}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, styles.iconContainerBlue]}>
                <Icon name="calendar" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.menuItemLabel}>Календар</Text>
                <Text style={styles.menuItemSubtext}>Заплановані поїздки</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={18} color="#e2e8f0" />
          </TouchableOpacity>

          {/* Моя робота */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Моя робота</Text>
            {workItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleSectionPress(item.id)}
                activeOpacity={0.95}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={20} color="#94a3b8" />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#e2e8f0" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Авто та документи */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Авто та документи</Text>
            {vehicleItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleSectionPress(item.id)}
                activeOpacity={0.95}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={20} color="#94a3b8" />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#e2e8f0" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Комунікація і безпека */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Комунікація і безпека</Text>
            {communicationItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleSectionPress(item.id)}
                activeOpacity={0.95}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={20} color="#94a3b8" />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#e2e8f0" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Налаштування */}
          <View style={styles.section}>
            {settingsItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleSectionPress(item.id)}
                activeOpacity={0.95}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={20} color="#94a3b8" />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#e2e8f0" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleSwitchRole}
          activeOpacity={0.95}
        >
          <Icon name="swap-horizontal" size={16} color="#2563eb" />
          <Text style={styles.footerButtonText}>Перемкнутися на пасажира</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonLogout]}
          onPress={handleLogout}
          activeOpacity={0.95}
        >
          <Icon name="logout" size={16} color="#dc2626" />
          <Text style={[styles.footerButtonText, styles.footerButtonTextLogout]}>
            Вийти з системи
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
                <Icon name="close" size={20} color="#64748b" />
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
    paddingTop: 50, // Compact padding (~17% reduction)
    paddingHorizontal: 20,
    paddingBottom: 14, // Compact padding (~30% reduction)
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Compact spacing (~38% reduction)
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
    marginBottom: 4, // Compact spacing (50% reduction)
    letterSpacing: TYPOGRAPHY.trackingTight(18), // tracking-tight for headings >20px
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // Compact spacing (~33% reduction)
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
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // Compact padding (~29% reduction)
    paddingHorizontal: 16,
    minHeight: 40, // Compact touch target (~9% reduction)
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
    paddingTop: 10, // Compact padding (~38% reduction)
    paddingHorizontal: 12,
    paddingBottom: 14, // Compact padding (~30% reduction)
  },
  section: {
    marginBottom: 12, // Compact spacing (~33% reduction from 18px)
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600', // font-semibold
    color: COLORS.slate[500], // text-slate-500 (secondary text)
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6, // Compact spacing (~40% reduction from 10px)
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12, // Compact padding (~25% reduction)
    paddingHorizontal: 16,
    borderRadius: 24, // rounded-2xl (Linear/Vercel style)
    marginBottom: 6, // Compact spacing (~25% reduction)
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44, // w-11 h-11 (Linear/Vercel style - touch target)
    height: 44,
    borderRadius: 16, // rounded-2xl
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  iconContainerBlue: {
    borderColor: '#3b82f6',
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '600', // font-semibold
    color: COLORS.slate[900], // text-slate-900 (main text)
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
    padding: 14, // Compact padding (~30% reduction)
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // Compact padding (~29% reduction)
    minHeight: 40, // Compact touch target (~9% reduction)
    borderRadius: 12, // rounded-xl (Linear/Vercel style)
    borderWidth: 1,
    borderColor: COLORS.slate[200], // border-slate-200 (Linear/Vercel style)
    gap: 12,
    ...SHADOWS.sm, // shadow-sm (Linear/Vercel style - subtle)
  },
  footerButtonLogout: {
    borderColor: COLORS.red[200], // border-red-200 (Linear/Vercel style)
    backgroundColor: '#ffffff',
  },
  footerButtonText: {
    fontSize: 11,
    fontWeight: '600', // font-semibold
    color: COLORS.blue[600], // text-blue-600
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footerButtonTextLogout: {
    color: '#dc2626',
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
    padding: 16, // Compact padding (~33% reduction)
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
