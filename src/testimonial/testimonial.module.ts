import { Module } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { LandingPageService } from 'src/landing-page/landing-page.service';
import { TestimonialConfigService } from 'src/testimonial-config/testimonial-config.service';
import { OpenAIService } from 'src/services/open-ai/open-ai.service';

@Module({
  controllers: [TestimonialController],
  providers: [
    TestimonialService,
    PrismaService,
    LandingPageService,
    TestimonialConfigService,
    OpenAIService,
  ],
  imports: [StripeModule],
})
export class TestimonialModule {}
