/**
 * Notification Service
 * Push notifications (мок → Firebase/OneSignal)
 */

import { SERVICES_CONFIG } from '../../config/services.config';
import { AppNotification } from '../../types';

export interface NotificationService {
  initialize(): Promise<void>;
  requestPermission(): Promise<boolean>;
  sendNotification(title: string, body: string, data?: unknown): Promise<void>;
  getToken(): Promise<string | null>;
}

// Мокована реалізація
class MockNotificationService implements NotificationService {
  async initialize(): Promise<void> {
    // В моках нічого не робимо
  }

  async requestPermission(): Promise<boolean> {
    return true; // Завжди дозволено в моках
  }

  async sendNotification(title: string, body: string, data?: unknown): Promise<void> {
    // В моках просто логуємо
    console.log('Notification:', title, body, data);
  }

  async getToken(): Promise<string | null> {
    return 'mock-notification-token';
  }
}

// Реальна реалізація (Firebase)
class FirebaseNotificationService implements NotificationService {
  async initialize(): Promise<void> {
    // Ініціалізація Firebase
    // TODO: Інтегрувати Firebase Cloud Messaging
  }

  async requestPermission(): Promise<boolean> {
    // Запит дозволу на notifications
    // TODO: Реалізувати через Firebase
    return false;
  }

  async sendNotification(title: string, body: string, data?: unknown): Promise<void> {
    // Відправка через Firebase
    // TODO: Реалізувати через Firebase Admin SDK
  }

  async getToken(): Promise<string | null> {
    // Отримання FCM token
    // TODO: Реалізувати через Firebase
    return null;
  }
}

export const notificationService: NotificationService = SERVICES_CONFIG.USE_MOCK_API
  ? new MockNotificationService()
  : new FirebaseNotificationService();

