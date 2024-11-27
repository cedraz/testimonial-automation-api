import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { VerificationRequestModule } from './verification-request/verification-request.module';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StripeModule } from './stripe/stripe.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { LandingPageModule } from './landing-page/landing-page.module';
import { TestimonialConfigModule } from './testimonial-config/testimonial-config.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { DomainGuard } from './auth/guards/domain.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      envFilePath: ['.env', '.env.staging'],
    }),
    JwtModule.register({
      global: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    VerificationRequestModule,
    AuthModule,
    AdminModule,
    StripeModule,
    ApiKeyModule,
    LandingPageModule,
    TestimonialConfigModule,
    TestimonialModule,
    PrismaModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [DomainGuard, JwtAuthGuard],
  exports: [DomainGuard, JwtAuthGuard],
})
export class AppModule {}
