import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { AdminModule } from 'src/admin/admin.module';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { DomainGuard } from 'src/auth/guards/domain.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Module({
  controllers: [StripeController],
  providers: [StripeService, AdminGuard, DomainGuard, JwtAuthGuard],
  exports: [StripeService],
  imports: [forwardRef(() => AdminModule)],
})
export class StripeModule {}
