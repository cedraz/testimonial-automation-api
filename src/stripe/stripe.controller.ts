import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  RawBodyRequest,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateStripeSCheckoutSessionDto } from './dto/create-stripe-checkout-session.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // @Post()
  // createStripeMobileCheckout(
  //   @Body() createStripeMobileCheckout: CreateStripeMobileCheckoutDto,
  // ) {
  //   return this.stripeService.createMobileCheckout(createStripeMobileCheckout);
  // }

  @Post('checkout-session')
  createCheckoutSession(
    @Body() createStripeSCheckoutSessionDto: CreateStripeSCheckoutSessionDto,
  ) {
    return this.stripeService.createCheckoutSession(
      createStripeSCheckoutSessionDto,
    );
  }

  @Get('/plan/:admin_id')
  getAdminsCurrentPlan(@Param('admin_id') admin_id: string) {
    return this.stripeService.getAdminsCurrentPlan(admin_id);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.stripeService.handleWebhook({
      signature,
      rawBody: request.rawBody,
    });
  }

  @Patch('/cancel-subscription')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  cancelAndSwitchToFreePlan(@Request() req) {
    return this.stripeService.cancelAndSwitchToFreePlan(req.user.id);
  }
}
