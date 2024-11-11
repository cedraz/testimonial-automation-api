import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { TestimonialConfigService } from './testimonial-config.service';
import { CreateTestimonialConfigDto } from './dto/create-testimonial-config.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TestimonialConfig } from './entities/testimonial-config.entity';
import { TestimonialConfigPaginationDto } from './dto/testimonial-config-pagination.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('testimonial-config')
@Controller('testimonial-config')
export class TestimonialConfigController {
  constructor(
    private readonly testimonialConfigService: TestimonialConfigService,
  ) {}

  @Post()
  @ApiOkResponse({
    type: TestimonialConfig,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  create(
    @Body() createTestimonialConfigDto: CreateTestimonialConfigDto,
    @Request() req,
  ) {
    return this.testimonialConfigService.create(
      createTestimonialConfigDto,
      req.user.id,
    );
  }

  @Get(':testimonial_config_id')
  @ApiOkResponse({
    type: TestimonialConfig,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  findById(@Param('testimonial_config_id') testimonial_config_id: string) {
    return this.testimonialConfigService.findById(testimonial_config_id);
  }

  @Get('')
  @ApiOkResponse({
    type: TestimonialConfig,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  findAll(@Query() pagination: TestimonialConfigPaginationDto, @Request() req) {
    return this.testimonialConfigService.findAll(pagination, req.user.id);
  }
}
