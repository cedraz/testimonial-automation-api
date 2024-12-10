import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Query,
  Request,
  Put,
  Delete,
} from '@nestjs/common';
import { TestimonialConfigService } from './testimonial-config.service';
import { CreateTestimonialConfigDto } from './dto/create-testimonial-config.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TestimonialConfig } from './entities/testimonial-config.entity';
import { TestimonialConfigPaginationDto } from './dto/testimonial-config-pagination.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { UpdateTestimonialConfigDto } from './dto/update-testimonial-config.dto';
import { DeleteManyTestimonialConfigsDto } from './dto/delete-many-testimonial-configs.dto';

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

  @Put(':testimonial_config_id')
  @ApiOkResponse({
    type: TestimonialConfig,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  update(
    @Param('testimonial_config_id') testimonial_config_id: string,
    @Body() updateTestimonialConfigDto: UpdateTestimonialConfigDto,
  ) {
    return this.testimonialConfigService.update(
      testimonial_config_id,
      updateTestimonialConfigDto,
    );
  }

  @Delete(':testimonial_config_id')
  @ApiOkResponse({
    type: TestimonialConfig,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  delete(@Param('testimonial_config_id') testimonial_config_id: string) {
    return this.testimonialConfigService.delete(testimonial_config_id);
  }

  @Delete()
  @ApiOkResponse({
    type: TestimonialConfig,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  deleteMany(
    @Body() deleteManyTestimonialConfigsDto: DeleteManyTestimonialConfigsDto,
  ) {
    return this.testimonialConfigService.deleteMany(
      deleteManyTestimonialConfigsDto.testimonial_configs_id_list,
    );
  }
}
