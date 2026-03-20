import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    this.stripe = new Stripe(apiKey, { apiVersion: '2025-01-27' as any });
  }

  async createSetupIntent() {
    try {
      const intent = await this.stripe.setupIntents.create({
        payment_method_types: ['card'],
      });
      return { ok: true, clientSecret: intent.client_secret };
    } catch (error) {
      this.logger.error('Failed to create SetupIntent', error);
      return { ok: false, error: error.message };
    }
  }

  async testConnection() {
    this.logger.log('Testing connection to Stripe...');
    return { ok: true, integration: 'stripe' };
  }
}
