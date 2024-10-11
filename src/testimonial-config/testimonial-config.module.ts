import { Module } from '@nestjs/common';
import { TestimonialConfigService } from './testimonial-config.service';
import { TestimonialConfigController } from './testimonial-config.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TestimonialConfigController],
  providers: [TestimonialConfigService, PrismaService],
  exports: [TestimonialConfigService],
  imports: [StripeModule, AuthModule],
})
export class TestimonialConfigModule {}
