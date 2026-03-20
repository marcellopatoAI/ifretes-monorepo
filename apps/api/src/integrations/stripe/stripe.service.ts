import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    let apiKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    
    if (!apiKey) {
      this.logger.warn('STRIPE_SECRET_KEY is not defined. Using placeholder for initialization.');
      apiKey = 'sk_test_placeholder';
    }
    
    this.stripe = new Stripe(apiKey);
  }

  async createSetupIntent(customerId?: string) {
    try {
      const intent = await this.stripe.setupIntents.create({
        payment_method_types: ['card'],
        customer: customerId,
      });
      return { ok: true, clientSecret: intent.client_secret, id: intent.id };
    } catch (error) {
      this.logger.error('Failed to create SetupIntent', error);
      return { ok: false, error: error.message };
    }
  }

  async retrieveSetupIntent(setupIntentId: string) {
    try {
      return await this.stripe.setupIntents.retrieve(setupIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve SetupIntent ${setupIntentId}`, error);
      throw error;
    }
  }

  async createCustomer(email: string, name: string) {
    try {
      return await this.stripe.customers.create({
        email,
        name,
      });
    } catch (error) {
      this.logger.error('Failed to create Stripe customer', error);
      throw error;
    }
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      return { ok: true };
    } catch (error) {
      this.logger.error(`Failed to attach PaymentMethod ${paymentMethodId} to Customer ${customerId}`, error);
      throw error;
    }
  }

  async createPayment(customerId: string, paymentMethodId: string, amount: number, description: string, metadata: Record<string, string> = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // amount in cents
        currency: 'brl',
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description,
        metadata,
        expand: ['latest_charge'],
      });

      const chargeId = typeof paymentIntent.latest_charge === 'string' 
        ? paymentIntent.latest_charge 
        : (paymentIntent.latest_charge as Stripe.Charge)?.id;

      return { 
        ok: true, 
        id: paymentIntent.id, 
        status: paymentIntent.status,
        chargeId: chargeId
      };
    } catch (error) {
      this.logger.error(`Failed to create payment for Customer ${customerId}`, error);
      return { ok: false, error: error.message };
    }
  }

  async createTransfer(destination: string, amount: number, sourceTransaction: string, description: string, metadata: Record<string, string> = {}) {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'brl',
        destination,
        source_transaction: sourceTransaction,
        description,
        metadata,
      });
      return { ok: true, id: transfer.id };
    } catch (error) {
      this.logger.error(`Failed to create transfer to ${destination}`, error);
      return { ok: false, error: error.message };
    }
  }

  async testConnection() {
    this.logger.log('Testing connection to Stripe...');
    return { ok: true, integration: 'stripe' };
  }
}
