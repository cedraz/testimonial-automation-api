import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { Admin } from './entities/admin.entity';
import { Prisma, VerificationType } from '@prisma/client';
import { AdminPaginationDto } from './dto/admin.pagination.dto';
import { PaginationResultDto } from 'src/common/entities/pagination-result.entity';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { EventTypeNames } from 'src/helpers/event-type-names.helper';
import { IngestEventQueueService } from 'src/jobs/queues/ingest-event-queue.service';
import { VerificationRequestService } from 'src/verification-request/verification-request.service';
import { CreateProviderDto } from 'src/auth/dto/create-provider.dto';
import { FindAdminByStripeInfoDto } from './dto/find-admin-by-stripe-info.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    private prismaService: PrismaService,
    private verificationRequestService: VerificationRequestService,
    private ingestEventQueueService: IngestEventQueueService,
    private configService: ConfigService,
  ) {}

  findByEmail(email: string) {
    return this.prismaService.admin.findUnique({
      where: {
        email,
      },
    });
  }

  findById(id: string) {
    return this.prismaService.admin.findUnique({
      where: {
        id,
      },
      select: {
        created_at: true,
        email: true,
        id: true,
        name: true,
        updated_at: true,
        email_verified_at: true,
        stripe_customer_id: true,
        stripe_subscription_id: true,
        stripe_price_id: true,
        stripe_subscription_status: true,
        company_name: true,
        image: true,
        providers: true,
        landing_page: true,
      },
    });
  }

  async create(createAdminDto: CreateAdminDto) {
    const adminExists = await this.findByEmail(createAdminDto.email);

    if (adminExists) {
      throw new ConflictException('Admin with same email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(createAdminDto.password, salt);

    const admin = await this.prismaService.admin.create({
      data: {
        password_hash,
        email: createAdminDto.email,
        name: createAdminDto.name,
        company_name: createAdminDto.company_name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
        company_name: true,
        image: true,
      },
    });

    await this.verificationRequestService.createVerificationRequest({
      createVerificationRequestDto: {
        identifier: admin.email,
        type: VerificationType.EMAIL_VERIFICATION,
      },
      expiresIn: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    });

    await this.ingestEventQueueService.execute({
      date: new Date(),
      email: admin.email,
      event_type: EventTypeNames.ADMIN_CREATED,
      id: admin.id,
      name: admin.name,
    });

    return admin;
  }

  updateProviders(admin_id: string, createProviderDto: CreateProviderDto) {
    return this.prismaService.admin.update({
      where: {
        id: admin_id,
      },
      data: {
        providers: {
          create: createProviderDto,
        },
      },
    });
  }

  async recoverPassword({ email, password }) {
    const admin = await this.findByEmail(email);

    if (!admin) {
      throw new NotFoundException(ErrorMessagesHelper.ADMIN_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await this.prismaService.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        password_hash,
      },
    });
  }

  async findAll(
    adminPaginationDto: AdminPaginationDto,
  ): Promise<PaginationResultDto<Admin>> {
    const AND: Prisma.AdminWhereInput[] = [];

    if (adminPaginationDto.name) {
      AND.push({
        OR: [
          {
            name: {
              contains: adminPaginationDto.name,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const admins = await this.prismaService.admin.findMany({
      where: { AND },
      orderBy: [
        {
          created_at: adminPaginationDto.orderByCreatedAt ? 'desc' : undefined,
        },
        { name: 'asc' },
      ],
      skip: 6,
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
        image: true,
        email_verified_at: true,
        company_name: true,
        stripe_customer_id: true,
        stripe_subscription_id: true,
        stripe_price_id: true,
        stripe_subscription_status: true,
      },
    });

    return {
      init: 6,
      limit: 6,
      total: admins.length,
      results: admins,
    };
  }

  async delete(id: string) {
    await this.prismaService.admin.delete({
      where: {
        id,
      },
    });
  }

  async updateProfile(id: string, data: UpdateAdminDto) {
    const admin = await this.prismaService.admin.findUnique({
      where: {
        id,
      },
    });

    if (!admin) {
      throw new NotFoundException(ErrorMessagesHelper.ADMIN_NOT_FOUND);
    }

    return this.prismaService.admin.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }

  async findAdminByStripeInfo({
    stripe_customer_id,
    stripe_subscription_id,
  }: FindAdminByStripeInfoDto) {
    return await this.prismaService.admin.findFirst({
      where: {
        OR: [
          {
            stripe_subscription_id,
          },
          {
            stripe_customer_id,
          },
        ],
      },
      select: {
        id: true,
      },
    });
  }

  async getAdminQuota(admin_id: string) {
    const admin = await this.findById(admin_id);

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    const landingPagesIds = admin.landing_page.map((landing_page) => {
      return landing_page.id;
    });

    const totalTestimonials = landingPagesIds.reduce(
      async (acumulator, landing_page_id) => {
        const countTestimonials = await this.prismaService.testimonial.count({
          where: {
            landing_page_id,
          },
        });

        return (await acumulator) + countTestimonials;
      },
      Promise.resolve(0),
    );

    const totalTestimonialConfigs =
      await this.prismaService.testimonialConfig.count({
        where: {
          admin_id: admin.id,
        },
      });

    const freePriceId = this.configService.get('STRIPE_FREE_PRICE_ID');

    if (admin.stripe_price_id === freePriceId) {
      return {
        totalLandingPages: landingPagesIds.length,
        totalTestimonialConfigs,
        totalTestimonials,
        landingPagesQuota: this.configService.get(
          'FREE_PLAN_LANDING_PAGES_QUOTA',
        ),
        testimonialsQuota: this.configService.get(
          'FREE_PLAN_TESTIMONIALS_QUOTA',
        ),
        testimonialConfigsQuota: this.configService.get(
          'TESTIMONIAL_CONFIGS_QUOTA',
        ),
      };
    }

    return {
      totalLandingPages: landingPagesIds.length,
      totalTestimonialConfigs,
      totalTestimonials,
      landingPagesQuota: this.configService.get(
        'PREMIUM_PLAN_LANDING_PAGES_QUOTA',
      ),
      testimonialsQuota: this.configService.get(
        'PREMIUM_PLAN_TESTIMONIALS_QUOTA',
      ),
      testimonialConfigsQuota: this.configService.get(
        'TESTIMONIAL_CONFIGS_QUOTA',
      ),
    };
  }
}
