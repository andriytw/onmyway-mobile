/**
 * Payment Service
 * Платежі (мок → Stripe)
 */

import { SERVICES_CONFIG } from '../../config/services.config';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
}

export interface PaymentService {
  createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<void>;
  getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent>;
  withdraw(amount: number): Promise<{ transactionId: string }>;
}

// Мокована реалізація
class MockPaymentService implements PaymentService {
  async createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: `pi_mock_${Date.now()}`,
      amount,
      currency,
      status: 'pending',
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      id: paymentIntentId,
      amount: 0,
      currency: 'EUR',
      status: 'succeeded',
    };
  }

  async withdraw(amount: number): Promise<{ transactionId: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { transactionId: `tx_mock_${Date.now()}` };
  }
}

// Реальна реалізація (Stripe)
class StripePaymentService implements PaymentService {
  async createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent> {
    // TODO: Інтегрувати Stripe
    throw new Error('Stripe integration not implemented');
  }

  async confirmPayment(paymentIntentId: string): Promise<void> {
    // TODO: Інтегрувати Stripe
    throw new Error('Stripe integration not implemented');
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    // TODO: Інтегрувати Stripe
    throw new Error('Stripe integration not implemented');
  }

  async withdraw(amount: number): Promise<{ transactionId: string }> {
    // TODO: Інтегрувати Stripe
    throw new Error('Stripe integration not implemented');
  }
}

export const paymentService: PaymentService = SERVICES_CONFIG.USE_MOCK_API
  ? new MockPaymentService()
  : new StripePaymentService();

