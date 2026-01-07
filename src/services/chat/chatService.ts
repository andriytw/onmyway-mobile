/**
 * Chat Service
 * Чат (мок → WebSocket/Socket.io)
 */

import { SERVICES_CONFIG } from '../../config/services.config';
import { Message } from '../../types';

export interface ChatService {
  connect(rideId: string): Promise<void>;
  disconnect(): void;
  sendMessage(rideId: string, text: string): Promise<void>;
  onMessage(callback: (message: Message) => void): void;
  getMessages(rideId: string): Promise<Message[]>;
}

// Мокована реалізація
class MockChatService implements ChatService {
  private messageCallbacks: ((message: Message) => void)[] = [];
  private messages: Map<string, Message[]> = new Map();

  async connect(rideId: string): Promise<void> {
    // В моках просто ініціалізуємо порожній список повідомлень
    if (!this.messages.has(rideId)) {
      this.messages.set(rideId, []);
    }
  }

  disconnect(): void {
    this.messageCallbacks = [];
  }

  async sendMessage(rideId: string, text: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const message: Message = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    const messages = this.messages.get(rideId) || [];
    messages.push(message);
    this.messages.set(rideId, messages);

    // Симуляція відповіді водія
    setTimeout(() => {
      const driverMessage: Message = {
        id: Date.now() + 1,
        sender: 'driver',
        text: 'Зрозумів, буду скоро!',
        timestamp: new Date(),
      };

      const updatedMessages = this.messages.get(rideId) || [];
      updatedMessages.push(driverMessage);
      this.messages.set(rideId, updatedMessages);

      // Викликаємо callback
      this.messageCallbacks.forEach(cb => cb(driverMessage));
    }, 1500);
  }

  onMessage(callback: (message: Message) => void): void {
    this.messageCallbacks.push(callback);
  }

  async getMessages(rideId: string): Promise<Message[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.messages.get(rideId) || [];
  }
}

// Реальна реалізація (WebSocket)
class WebSocketChatService implements ChatService {
  private ws: WebSocket | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];
  private currentRideId: string | null = null;

  async connect(rideId: string): Promise<void> {
    this.currentRideId = rideId;
    const wsUrl = `${SERVICES_CONFIG.WS_URL}/chat/${rideId}`;
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl) as any; // React Native WebSocket type compatibility

      if (this.ws) {
        this.ws.onopen = () => {
          resolve();
        };

        this.ws.onerror = (error) => {
          reject(error);
        };

        this.ws.onmessage = (event) => {
          const message: Message = JSON.parse(event.data);
          this.messageCallbacks.forEach(cb => cb(message));
        };
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageCallbacks = [];
    this.currentRideId = null;
  }

  async sendMessage(rideId: string, text: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      rideId,
      text,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
  }

  onMessage(callback: (message: Message) => void): void {
    this.messageCallbacks.push(callback);
  }

  async getMessages(rideId: string): Promise<Message[]> {
    // TODO: Завантажити історію повідомлень через REST API
    return [];
  }
}

export const chatService: ChatService = SERVICES_CONFIG.USE_WEBSOCKET
  ? new WebSocketChatService()
  : new MockChatService();

