import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { TestimonialConfigService } from 'src/testimonial-config/testimonial-config.service';
import { ConfigService } from '@nestjs/config';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { PaginationResultDto } from 'src/common/entities/pagination-result.entity';
import { LandingPage } from './entities/landing-page.entity';
import { LandingPagePaginationDto } from './dto/landing-page.pagination.dto';
import { DeleteManyLandingPagesDto } from './dto/delete-many-landing-pages.dto';

@Injectable()
export class LandingPageService {
  constructor(
    private testimonialConfigService: TestimonialConfigService,
    private configService: ConfigService,
    private prismaService: PrismaService,
    private StripeService: StripeService,
  ) {}

  async create(createLandingPageDto: CreateLandingPageDto, admin_id: string) {
    const adminPlan = await this.StripeService.getAdminsCurrentPlan(admin_id);

    const landingPageQuota = this.configService.get(
      `${adminPlan.plan}_PLAN_LANDING_PAGES_QUOTA`,
    );

    const landingPageCount = await this.count(admin_id);

    if (landingPageCount >= landingPageQuota) {
      throw new ConflictException(
        ErrorMessagesHelper.LANDING_PAGE_LIMIT_REACHED,
      );
    }

    const testimonialConfig = await this.testimonialConfigService.findById(
      createLandingPageDto.testimonial_config_id,
    );

    if (!testimonialConfig) {
      throw new NotFoundException(
        ErrorMessagesHelper.TESTIMONIAL_CONFIG_NOT_FOUND,
      );
    }

    return this.prismaService.landingPage.create({
      data: {
        name: createLandingPageDto.name,
        link: createLandingPageDto.link,
        admin: {
          connect: {
            id: admin_id,
          },
        },
        testimonial_config: {
          connect: {
            id: testimonialConfig.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        link: true,
        testimonial_config: true,
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            stripe_price_id: true,
          },
        },
      },
    });
  }

  async count(admin_id: string) {
    return this.prismaService.landingPage.count({
      where: {
        admin_id,
      },
    });
  }

  findById(landing_page_id: string) {
    return this.prismaService.landingPage.findUnique({
      where: {
        id: landing_page_id,
      },
      include: {
        testimonial_config: true,
      },
    });
  }

  async findAdminLandingPages(
    pagination: LandingPagePaginationDto,
    admin_id: string,
  ): Promise<PaginationResultDto<LandingPage>> {
    const results: LandingPage[] =
      await this.prismaService.landingPage.findMany({
        where: {
          AND: pagination.where(),
          admin_id,
        },
      });

    const total = await this.prismaService.landingPage.count({
      where: {
        AND: pagination.where(),
        admin_id,
      },
    });

    return {
      results,
      total,
      limit: pagination.limit,
      init: pagination.init,
    };
  }

  delete(landing_page_id: string) {
    return this.prismaService.landingPage.delete({
      where: {
        id: landing_page_id,
      },
    });
  }

  deleteMany({
    deleteManyLandingPagesDto,
    admin_id,
  }: {
    deleteManyLandingPagesDto: DeleteManyLandingPagesDto;
    admin_id: string;
  }) {
    return this.prismaService.landingPage.deleteMany({
      where: {
        admin_id,
        id: {
          in: deleteManyLandingPagesDto.landing_pages_id_list,
        },
      },
    });
  }
}
