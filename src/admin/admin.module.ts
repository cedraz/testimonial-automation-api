import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { VerificationRequestModule } from 'src/verification-request/verification-request.module';
import { VerificationRequestService } from 'src/verification-request/verification-request.service';
import { DomainGuard } from 'src/auth/guards/domain.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    VerificationRequestService,
    DomainGuard,
    JwtAuthGuard,
  ],
  exports: [AdminService, DomainGuard, JwtAuthGuard],
  imports: [
    forwardRef(() => StripeModule),
    forwardRef(() => VerificationRequestModule),
    JobsModule,
  ],
})
export class AdminModule {}
