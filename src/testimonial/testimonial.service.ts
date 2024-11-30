import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { CompleteTestimonialDto } from './dto/complete-testimonial.dto';
import { LandingPageService } from 'src/landing-page/landing-page.service';
import { TestimonialPaginationDto } from './dto/testimonial.pagination.dto';
import { PaginationResultDto } from 'src/common/entities/pagination-result.entity';
import { Testimonial } from './entities/testimonial.entity';
import { GoogleGeminiService } from 'src/services/google-gemini/google-gemini.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialService {
  constructor(
    private configService: ConfigService,
    private stripeService: StripeService,
    private prismaService: PrismaService,
    private landingPageService: LandingPageService,
    private googleGeminiService: GoogleGeminiService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createTestimonialLink(
    admin_id: string,
    createTestimonialDto: CreateTestimonialDto,
  ) {
    const adminPlan = await this.stripeService.getAdminsCurrentPlan(admin_id);

    const testimonialQuota = this.configService.get(
      `${adminPlan.plan}_PLAN_TESTIMONIAL_QUOTA`,
    );

    const testimonialCount = await this.count(
      createTestimonialDto.landing_page_id,
    );

    if (testimonialCount >= testimonialQuota) {
      throw new ConflictException(
        ErrorMessagesHelper.TESTIMONIAL_LIMIT_REACHED,
      );
    }

    return this.prismaService.testimonial.create({
      data: {
        landing_page: {
          connect: {
            id: createTestimonialDto.landing_page_id,
          },
        },
        status: 'PENDING',
      },
    });
  }

  async completeTestimonial(
    testimonial_id: string,
    completeTestimonialDto: CompleteTestimonialDto,
    file?: Express.Multer.File,
  ) {
    const testimonial = await this.findById(testimonial_id);

    if (!testimonial)
      throw new NotFoundException(ErrorMessagesHelper.TESTIMONIAL_NOT_FOUND);

    const { testimonial_config } = await this.landingPageService.findById(
      testimonial.landing_page_id,
    );

    if (!testimonial_config)
      throw new NotFoundException(
        ErrorMessagesHelper.TESTIMONIAL_CONFIG_NOT_FOUND,
      );

    const testimonialConfigExpirationLimit = new Date(
      new Date(testimonial.created_at).getTime() +
        testimonial_config.expiration_limit * 24 * 60 * 60 * 1000, // convert days to milliseconds
    );

    if (testimonialConfigExpirationLimit < new Date())
      throw new ConflictException(ErrorMessagesHelper.TESTIMONIAL_EXPIRED);

    if (
      completeTestimonialDto.message.length >
      testimonial_config.message_char_limit
    )
      throw new BadRequestException(
        ErrorMessagesHelper.MESSAGE_CHAR_LIMIT_EXCEEDED,
      );

    if (
      completeTestimonialDto.title.length > testimonial_config.title_char_limit
    )
      throw new BadRequestException(
        ErrorMessagesHelper.TITLE_CHAR_LIMIT_EXCEEDED,
      );

    const adminPlan = await this.stripeService.getAdminsCurrentPlan(
      testimonial.landing_page.admin_id,
    );

    const testimonialQuota = this.configService.get(
      `${adminPlan.plan}_PLAN_TESTIMONIALS_QUOTA`,
    );

    const testimonialCount = await this.count(testimonial.landing_page_id);

    if (testimonialCount >= testimonialQuota) {
      throw new ConflictException(
        ErrorMessagesHelper.TESTIMONIAL_LIMIT_REACHED,
      );
    }

    let status: 'APPROVED' | 'REJECTED' = 'APPROVED';

    if (adminPlan.plan === 'PREMIUM') {
      const isPositiveFeedback =
        await this.googleGeminiService.evaluateTestimonial(testimonial.message);

      status = isPositiveFeedback ? 'APPROVED' : 'REJECTED';
    }

    let image: string;

    if (file) {
      try {
        const cloudinaryResponse =
          await this.cloudinaryService.uploadImage(file);

        image = cloudinaryResponse.secure_url;
      } catch (error) {
        image = '';
      }
    }

    return this.prismaService.testimonial.update({
      where: {
        id: testimonial_id,
      },
      data: {
        status,
        customer_name: completeTestimonialDto.customer_name,
        message: completeTestimonialDto.message,
        stars: completeTestimonialDto.stars,
        title: completeTestimonialDto.title,
        image,
      },
    });
  }

  async count(landing_page_id: string) {
    return this.prismaService.testimonial.count({
      where: {
        landing_page_id,
      },
    });
  }

  async findById(testimonial_id: string) {
    return this.prismaService.testimonial.findUnique({
      where: {
        id: testimonial_id,
      },
      include: {
        landing_page: {
          select: {
            admin_id: true,
          },
        },
      },
    });
  }

  async findAll(
    pagination: TestimonialPaginationDto,
    admin_id: string,
  ): Promise<PaginationResultDto<Testimonial>> {
    const results: Testimonial[] =
      await this.prismaService.testimonial.findMany({
        where: {
          landing_page: {
            admin_id,
          },
          AND: pagination.where(),
        },
      });

    const total = await this.prismaService.testimonial.count({
      where: {
        landing_page: {
          admin_id,
        },
        AND: pagination.where(),
      },
    });

    return {
      results,
      total,
      limit: pagination.limit,
      init: pagination.init,
    };
  }

  async findByLandingPageId(
    landing_page_id: string,
    pagination: TestimonialPaginationDto,
  ) {
    const results: Testimonial[] =
      await this.prismaService.testimonial.findMany({
        where: {
          landing_page_id,
          AND: pagination.where(),
        },
      });

    const total = await this.prismaService.testimonial.count({
      where: {
        landing_page_id,
        AND: pagination.where(),
      },
    });

    return {
      results,
      total,
      limit: pagination.limit,
      init: pagination.init,
    };
  }

  async delete(testimonial_id: string) {
    return this.prismaService.testimonial.delete({
      where: {
        id: testimonial_id,
      },
    });
  }

  async deleteMany(testimonials_id_list: Array<string>) {
    return this.prismaService.testimonial.deleteMany({
      where: {
        id: {
          in: testimonials_id_list,
        },
      },
    });
  }

  async update({
    testimonial_id,
    updateTestimonialDto,
    file,
  }: {
    testimonial_id: string;
    updateTestimonialDto: UpdateTestimonialDto;
    file?: Express.Multer.File;
  }) {
    let image: string;

    if (file) {
      try {
        const cloudinaryResponse =
          await this.cloudinaryService.uploadImage(file);

        image = cloudinaryResponse.secure_url;
      } catch (error) {
        image = '';
      }
    }

    return this.prismaService.testimonial.update({
      where: {
        id: testimonial_id,
      },
      data: {
        ...updateTestimonialDto,
        image,
      },
    });
  }
}
