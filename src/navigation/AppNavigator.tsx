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
import RegisterScreen from '../screens/Auth/RegisterScreen';
import RoleSelectionScreen from '../screens/Auth/RoleSelectionScreen';
import PassengerSenderApp from '../screens/PassengerSender/PassengerSenderApp';
import DriverDrawerNavigator from './DriverDrawerNavigator';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  RoleSelection: undefined;
  PassengerSender: undefined;
  Driver: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const [showRegister, setShowRegister] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('AppNavigator state:', { 
      hasUser: !!user, 
      role, 
      isAuthenticated, 
      isLoading 
    });
  }, [user, role, isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          showRegister ? (
            <Stack.Screen name="Register">
              {() => <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Login">
              {() => <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />}
            </Stack.Screen>
          )
        ) : !role ? (
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        ) : role === UserRole.DRIVER ? (
          <Stack.Screen name="Driver" component={DriverDrawerNavigator} />
        ) : (
          <Stack.Screen name="PassengerSender" component={PassengerSenderApp} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;



