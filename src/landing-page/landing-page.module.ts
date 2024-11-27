import { Module } from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { LandingPageController } from './landing-page.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { TestimonialConfigModule } from 'src/testimonial-config/testimonial-config.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [LandingPageController],
  providers: [LandingPageService],
  exports: [LandingPageService],
  imports: [StripeModule, StripeModule, TestimonialConfigModule, AuthModule],
})
export class LandingPageModule {}
