/**
 * App Navigator
 * Main navigation structure following workflow contract
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth.types';

// Screens
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RoleSelectionScreen from '../screens/Auth/RoleSelectionScreen';
import PassengerSenderApp from '../screens/PassengerSender/PassengerSenderApp';
import DriverApp from '../screens/Driver/DriverApp';

export type RootStackParamList = {
  Login: undefined;
  RoleSelection: undefined;
  PassengerSender: undefined;
  Driver: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !role ? (
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        ) : role === UserRole.DRIVER ? (
          <Stack.Screen name="Driver" component={DriverApp} />
        ) : (
          <Stack.Screen name="PassengerSender" component={PassengerSenderApp} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;



