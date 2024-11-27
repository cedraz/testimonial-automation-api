import { Module } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ApiKeyModule } from 'src/api-key/api-key.module';
import { LandingPageModule } from 'src/landing-page/landing-page.module';
import { TestimonialConfigModule } from 'src/testimonial-config/testimonial-config.module';
import { GoogleGeminiModule } from 'src/services/google-gemini/google-gemini.module';

@Module({
  controllers: [TestimonialController],
  providers: [TestimonialService],
  imports: [
    StripeModule,
    AuthModule,
    CloudinaryModule,
    ApiKeyModule,
    LandingPageModule,
    TestimonialConfigModule,
    GoogleGeminiModule,
  ],
})
export class TestimonialModule {}
