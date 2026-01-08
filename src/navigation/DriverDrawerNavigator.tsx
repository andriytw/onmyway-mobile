/**
 * DriverDrawerNavigator
 * Wraps DriverApp in a Drawer Navigator with sidebar
 */

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DriverProvider } from '../contexts/DriverContext';
import DriverApp from '../screens/Driver/DriverApp';
import DriverSidebar from '../components/Driver/DriverSidebar';
import DriverHistoryScreen from '../screens/Driver/DriverHistoryScreen';
import DriverEarningsScreen from '../screens/Driver/DriverEarningsScreen';
import DriverPayoutsScreen from '../screens/Driver/DriverPayoutsScreen';
import DriverVehicleScreen from '../screens/Driver/DriverVehicleScreen';
import DriverDocumentsScreen from '../screens/Driver/DriverDocumentsScreen';
import DriverNotificationsScreen from '../screens/Driver/DriverNotificationsScreen';
import DriverSupportScreen from '../screens/Driver/DriverSupportScreen';
import DriverSettingsScreen from '../screens/Driver/DriverSettingsScreen';

export type DriverDrawerParamList = {
  DriverMain: undefined;
  History: undefined;
  Earnings: undefined;
  Payouts: undefined;
  Vehicle: undefined;
  Documents: undefined;
  Notifications: undefined;
  Support: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DriverDrawerParamList>();

const DriverDrawerNavigator: React.FC = () => {
  try {
    return (
      <DriverProvider>
        <Drawer.Navigator
          drawerContent={(props) => <DriverSidebar {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: 'front',
            drawerStyle: {
              width: 300,
            },
            overlayColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Drawer.Screen name="DriverMain" component={DriverApp} />
          <Drawer.Screen name="History" component={DriverHistoryScreen} />
          <Drawer.Screen name="Earnings" component={DriverEarningsScreen} />
          <Drawer.Screen name="Payouts" component={DriverPayoutsScreen} />
          <Drawer.Screen name="Vehicle" component={DriverVehicleScreen} />
          <Drawer.Screen name="Documents" component={DriverDocumentsScreen} />
          <Drawer.Screen name="Notifications" component={DriverNotificationsScreen} />
          <Drawer.Screen name="Support" component={DriverSupportScreen} />
          <Drawer.Screen name="Settings" component={DriverSettingsScreen} />
        </Drawer.Navigator>
      </DriverProvider>
    );
  } catch (error) {
    console.error('DriverDrawerNavigator error:', error);
    // Fallback: render DriverApp without drawer if drawer fails
    return (
      <DriverProvider>
        <DriverApp />
      </DriverProvider>
    );
  }
};

export default DriverDrawerNavigator;

