/**
 * Login Screen
 * Exact workflow: email/password form → calls login() → onSuccess callback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface LoginScreenProps {
  onSwitchToRegister?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeletedUser, setIsDeletedUser] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Будь ласка, заповніть всі поля');
      setIsDeletedUser(false);
      return;
    }

    setError(null);
    setIsDeletedUser(false);
    setIsLoading(true);

    try {
      console.log('LoginScreen: Attempting login...');
      await login(email, password);
      console.log('LoginScreen: Login successful, waiting for navigation...');
      // Navigation will automatically handle transition to RoleSelection
      // because AuthContext state change triggers AppNavigator re-render
    } catch (err) {
      console.error('LoginScreen: Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Помилка входу';
      
      // Check if it's invalid credentials (deleted user or wrong password)
      if (errorMessage === 'INVALID_CREDENTIALS' || 
          errorMessage.includes('Invalid login credentials') ||
          errorMessage.includes('Invalid credentials')) {
        setIsDeletedUser(true);
        setError('❌ Цей акаунт не існує або був видалений.\nБудь ласка, зареєструйтесь знову.');
      } else {
        setIsDeletedUser(false);
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setIsDeletedUser(false);
    setPassword('');
  };

  const handleRegister = () => {
    setError(null);
    setIsDeletedUser(false);
    if (onSwitchToRegister) {
      onSwitchToRegister();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>OnMyWay</Text>
        <Text style={styles.subtitle}>Вхід в систему</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            editable={!isLoading}
            placeholderTextColor="#94a3b8"
          />

          {error && (
            <View style={[styles.errorContainer, isDeletedUser && styles.errorContainerDeleted]}>
              <Text style={styles.errorText}>{error}</Text>
              {isDeletedUser && (
                <View style={styles.errorActions}>
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    <Text style={styles.registerButtonText}>Зареєструватися</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tryAgainButton}
                    onPress={handleTryAgain}
                    disabled={isLoading}
                  >
                    <Text style={styles.tryAgainButtonText}>Спробувати ще раз</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Увійти</Text>
            )}
          </TouchableOpacity>

          {onSwitchToRegister && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={onSwitchToRegister}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>Немає акаунту? Зареєструватися</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    borderRadius: 16,
    padding: 16,
  },
  errorContainerDeleted: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tryAgainButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  tryAgainButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  linkButton: {
    padding: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;



