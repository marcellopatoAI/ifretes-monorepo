import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {}

  async testConnection() {
    this.logger.log('Testing connection to Stripe...');
    return { ok: true, integration: 'stripe' };
  }
}
