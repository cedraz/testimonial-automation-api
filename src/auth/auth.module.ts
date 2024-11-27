import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleOAuthGuard } from './guards/google.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { VerificationRequestModule } from 'src/verification-request/verification-request.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JobsModule } from 'src/jobs/jobs.module';
import { AdminModule } from 'src/admin/admin.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { DomainGuard } from './guards/domain.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    GoogleOAuthGuard,
    JwtStrategy,
    DomainGuard,
    JwtAuthGuard,
    AdminGuard,
  ],
  imports: [
    PassportModule,
    VerificationRequestModule,
    MailerModule,
    forwardRef(() => StripeModule),
    AdminModule,
    JobsModule,
  ],
  exports: [DomainGuard, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
