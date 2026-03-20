import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { StripeService } from '../../integrations/stripe/stripe.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, StripeService],
})
export class OnboardingModule {}
