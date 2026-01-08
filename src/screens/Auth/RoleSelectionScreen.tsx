/**
 * Role Selection Screen
 * Exact workflow: displays two roles → calls switchRole() on selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { UserRole } from '../../types/auth.types';
import { useAuth } from '../../contexts/AuthContext';

const RoleSelectionScreen: React.FC = () => {
  const { switchRole, role: currentRole, isLoading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const roles = [
    {
      id: UserRole.PASSENGER_SENDER,
      title: 'Пасажир / Відправник',
      description: 'Шукаю поїздку або відправляю посилку',
      color: '#2563eb',
      emoji: '👤',
    },
    {
      id: UserRole.DRIVER,
      title: 'Водій',
      description: 'Надаю послуги перевезення',
      color: '#16a34a',
      emoji: '🚗',
    },
  ];

  const handleSelectRole = async (selectedRole: UserRole) => {
    if (!user) {
      setError('Користувач не авторизований. Будь ласка, увійдіть знову.');
      return;
    }

    setError(null);
    try {
      await switchRole(selectedRole);
      // Navigation will automatically handle transition
      // because AuthContext state change triggers AppNavigator re-render
    } catch (error) {
      console.error('Role selection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Помилка вибору ролі';
      setError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Оберіть ваш режим</Text>
        <Text style={styles.subtitle}>
          Ви можете змінити режим в будь-який час
        </Text>

        <View style={styles.rolesContainer}>
          {roles.map((role) => {
            const isSelected = currentRole === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  isSelected && { borderColor: role.color, borderWidth: 2 },
                ]}
                onPress={() => handleSelectRole(role.id)}
                disabled={isLoading}
              >
                <View style={styles.roleContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${role.color}15` },
                    ]}
                  >
                    <Text style={styles.iconText}>{role.emoji}</Text>
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        )}

        <Text style={styles.footerText}>
          Ви можете мати обидві ролі одночасно
        </Text>
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
    fontSize: 28,
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
  rolesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 24,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;



