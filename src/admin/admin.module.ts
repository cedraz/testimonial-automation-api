import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { VerificationRequestModule } from 'src/verification-request/verification-request.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DomainGuard } from 'src/auth/guards/domain.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Module({
  controllers: [AdminController],
  providers: [AdminService, JwtAuthGuard, DomainGuard, AdminGuard],
  exports: [AdminService],
  imports: [
    forwardRef(() => StripeModule),
    forwardRef(() => VerificationRequestModule),
    JobsModule,
  ],
})
export class AdminModule {}
