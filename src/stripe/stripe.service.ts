import Stripe from 'stripe';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateStripeMobileCheckoutDto } from './dto/create-stripe-mobile-checkout.dto';
import { CreateStripeCustomerDto } from './dto/create-stripe-customer.dto';
import { CreateStripeSCheckoutSessionDto } from './dto/create-stripe-checkout-session.dto';
import * as dayjs from 'dayjs';
import { HandleStripeWebhookDto } from './dto/handle-stripe-webhook.dto';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class StripeService {
  private readonly stripeApiKey: string;
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => AdminService)) private adminService: AdminService,
  ) {
    this.stripeApiKey = this.configService.get('STRIPE_API_KEY');
    this.stripe = new Stripe(this.stripeApiKey, {
      apiVersion: '2024-06-20',
    });
  }

  async getCustomerByEmail(email: string) {
    const customers = await this.stripe.customers.list({
      email,
    });

    const customer = customers.data[0];

    if (!customer) {
      return null;
    }

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer.id,
    });

    return {
      ...customer,
      subscriptions,
    };
  }

  async createCustomer(
    createStripeCustomerDto: CreateStripeCustomerDto,
  ): Promise<
    Stripe.Customer & {
      subscription_id: string;
      price_id: string;
      subscription_status: string;
    }
  > {
    const customer = await this.getCustomerByEmail(
      createStripeCustomerDto.email,
    );

    if (customer) {
      return {
        ...customer,
        subscription_id: customer.subscriptions.data[0].id,
        price_id: customer.subscriptions.data[0].items.data[0].price.id,
        subscription_status: customer.subscriptions.data[0].status,
      };
    }

    const createdCustomer = await this.stripe.customers.create({
      email: createStripeCustomerDto.email,
      name: createStripeCustomerDto.name,
    });

    const free_price_id = this.configService.get(`STRIPE_FREE_PRICE_ID`);

    const subscription = await this.stripe.subscriptions.create({
      customer: createdCustomer.id,
      items: [{ price: free_price_id }],
    });

    return {
      ...createdCustomer,
      subscription_id: subscription.id,
      price_id: free_price_id,
      subscription_status: subscription.status,
    };
  }

  async createCheckoutSession(
    createStripeSCheckoutSessionDto: CreateStripeSCheckoutSessionDto,
  ) {
    const subscription = await this.stripe.subscriptionItems.list({
      subscription: createStripeSCheckoutSessionDto.stripe_subscription_id,
      limit: 1,
    });

    console.log(subscription);

    const isPremium =
      subscription.data[0].price.id ===
      this.configService.get('STRIPE_PREMIUM_PRICE_ID');

    if (isPremium) {
      throw new ConflictException('Plan is already premium.');
    }

    await this.stripe.subscriptions.update(
      createStripeSCheckoutSessionDto.stripe_subscription_id,
      {
        items: [
          {
            id: subscription.data[0].id,
            price: this.configService.get('STRIPE_PREMIUM_PRICE_ID'),
          },
        ],
        billing_cycle_anchor: 'now', // Define o início do ciclo de faturamento para agora
        proration_behavior: 'none', // Não cobrar imediatamente
      },
    );

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: this.configService.get('STRIPE_PREMIUM_PRICE_ID'),
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: createStripeSCheckoutSessionDto.stripe_customer_id,
      success_url: `${this.configService.get('FRONTEND_URL')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/dashboard`,
    });

    return {
      url: session.url,
    };
  }

  async createMobileCheckout(
    createStripeMobileCheckoutDto: CreateStripeMobileCheckoutDto,
  ) {
    const admin = await this.adminService.findById(
      createStripeMobileCheckoutDto.admin_id,
    );

    const customer = await this.createCustomer({
      email: createStripeMobileCheckoutDto.email,
      name: admin.name,
    });

    const ephemeralKey = await this.stripe.ephemeralKeys.create({
      customer: customer.id,
    });

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: createStripeMobileCheckoutDto.amount,
      currency: createStripeMobileCheckoutDto.currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Desabilita redirecionamentos automáticos
      },
      description: createStripeMobileCheckoutDto.description,
      receipt_email: createStripeMobileCheckoutDto.email,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      checkout_data: {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        email: createStripeMobileCheckoutDto.email,
        customer_id: customer.id,
      },
    };
  }

  async getAdminsCurrentPlan(admin_id: string) {
    const admin = await this.adminService.findById(admin_id);

    const subscription = await this.stripe.subscriptions.retrieve(
      admin.stripe_subscription_id,
    );

    const endDate = new Date(subscription.current_period_end * 1000);

    const daysRemaining = dayjs(endDate).diff(dayjs(), 'days');

    const freePlan = this.configService.get('STRIPE_FREE_PRICE_ID');

    return {
      plan: admin.stripe_price_id === freePlan ? 'FREE' : 'PREMIUM',
      daysRemaining,
      endDate,
    };
  }

  async handleWebhook(handleStripeWebhookDto: HandleStripeWebhookDto) {
    const { signature, rawBody } = handleStripeWebhookDto;

    const stripeEvent = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET'),
    );

    switch (stripeEvent.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionProcess({
          object: stripeEvent.data.object as Stripe.Subscription,
        });
        break;
      default:
        return;
    }
  }

  async handleSubscriptionProcess(event: { object: Stripe.Subscription }) {
    const stripe_customer_id = event.object.customer as string;
    const stripe_subscription_id = event.object.id as string;
    const stripe_subscription_status = event.object.status;
    const stripe_price_id = event.object.items.data[0].price.id;

    const adminExists = await this.adminService.findAdminByStripeInfo({
      stripe_customer_id,
      stripe_subscription_id,
    });

    // REFATORAR ESSE ERRO
    if (!adminExists) {
      throw new Error('admin of stripeCustomerId not found');
    }

    await this.adminService.updateProfile(adminExists.id, {
      stripe_price_id,
      stripe_subscription_id,
      stripe_subscription_status,
    });
  }

  async cancelAndSwitchToFreePlan(admin_id: string) {
    const admin = await this.adminService.findById(admin_id);

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    const subscriptions = await this.stripe.subscriptions.list({
      customer: admin.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    const currentSubscription = subscriptions.data[0];

    if (!currentSubscription) {
      throw new ConflictException('No active subscription found.');
    }

    const premiumPriceId = this.configService.get<string>(
      'STRIPE_PREMIUM_PRICE_ID',
    );
    const freePriceId = this.configService.get<string>('STRIPE_FREE_PRICE_ID');

    const isPremium = currentSubscription.items.data.some(
      (item) => item.price.id === premiumPriceId,
    );

    if (!isPremium) {
      throw new ConflictException('Current subscription is not premium.');
    }

    if (currentSubscription.cancel_at_period_end) {
      throw new ConflictException(
        'Subscription is already set to cancel at the end of the period.',
      );
    }

    await this.stripe.subscriptions.update(currentSubscription.id, {
      cancel_at_period_end: true,
    });
    const newSubscription = await this.stripe.subscriptions.create({
      customer: admin.stripe_customer_id,
      items: [{ price: freePriceId }],
      billing_cycle_anchor: currentSubscription.current_period_end,
      proration_behavior: 'none',
    });

    return {
      oldSubscriptionId: currentSubscription.id,
      newSubscriptionId: newSubscription.id,
      status: newSubscription.status,
    };
  }
}
