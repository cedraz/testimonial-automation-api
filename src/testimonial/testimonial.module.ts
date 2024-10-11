import { Module } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { LandingPageService } from 'src/landing-page/landing-page.service';
import { TestimonialConfigService } from 'src/testimonial-config/testimonial-config.service';
import { AuthModule } from 'src/auth/auth.module';
import { ApiKeyService } from 'src/api-key/api-key.service';
import { GoogleGeminiService } from 'src/services/google-gemini/google-gemini.service';

@Module({
  controllers: [TestimonialController],
  providers: [
    TestimonialService,
    PrismaService,
    LandingPageService,
    TestimonialConfigService,
    GoogleGeminiService,
    ApiKeyService,
  ],
  imports: [StripeModule, AuthModule],
})
export class TestimonialModule {}
