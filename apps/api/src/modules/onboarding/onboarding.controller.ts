import { Controller, Post, Body } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { StripeService } from '../../integrations/stripe/stripe.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('check-cnpj')
  async checkCnpj(@Body() body: { cnpj: string }) {
    return this.onboardingService.checkCnpj(body.cnpj);
  }

  @Post('create-intent')
  async createIntent() {
    return this.stripeService.createSetupIntent();
  }
}
