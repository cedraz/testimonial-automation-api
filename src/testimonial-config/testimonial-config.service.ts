import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTestimonialConfigDto } from './dto/create-testimonial-config.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { TestimonialConfigPaginationDto } from './dto/testimonial-config-pagination.dto';
import { PaginationResultDto } from 'src/common/entities/pagination-result.entity';
import { TestimonialConfig } from './entities/testimonial-config.entity';
import { UpdateTestimonialConfigDto } from './dto/update-testimonial-config.dto';

@Injectable()
export class TestimonialConfigService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(
    createTestimonialConfigDto: CreateTestimonialConfigDto,
    admin_id: string,
  ) {
    const testimonialConfigCount = await this.count(admin_id);

    if (
      testimonialConfigCount >=
      this.configService.get('TESTIMONIAL_CONFIGS_QUOTA')
    ) {
      throw new ConflictException(
        ErrorMessagesHelper.TESTIMONIAL_CONFIG_LIMIT_REACHED,
      );
    }

    return this.prismaService.testimonialConfig.create({
      data: {
        ...createTestimonialConfigDto,
        admin_id,
      },
    });
  }

  findById(testimonial_config_id: string) {
    return this.prismaService.testimonialConfig.findUnique({
      where: {
        id: testimonial_config_id,
      },
    });
  }

  async findAll(
    pagination: TestimonialConfigPaginationDto,
    admin_id: string,
  ): Promise<PaginationResultDto<TestimonialConfig>> {
    const results = await this.prismaService.testimonialConfig.findMany({
      where: {
        AND: pagination.where(),
        admin_id,
      },
    });

    const total = await this.prismaService.testimonialConfig.count({
      where: {
        admin_id,
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

  count(admin_id: string) {
    return this.prismaService.testimonialConfig.count({
      where: {
        admin_id,
      },
    });
  }

  update(
    testimonial_config_id: string,
    updateTestimonialConfigDto: UpdateTestimonialConfigDto,
  ) {
    return this.prismaService.testimonialConfig.update({
      where: {
        id: testimonial_config_id,
      },
      data: updateTestimonialConfigDto,
    });
  }

  delete(testimonial_config_id: string) {
    return this.prismaService.testimonialConfig.delete({
      where: {
        id: testimonial_config_id,
      },
    });
  }

  deleteMany(testimonial_configs_id_list: Array<string>) {
    return this.prismaService.testimonialConfig.deleteMany({
      where: {
        id: {
          in: testimonial_configs_id_list,
        },
      },
    });
  }
}
