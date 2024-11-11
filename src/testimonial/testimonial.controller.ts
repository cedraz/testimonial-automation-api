import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { Testimonial } from './entities/testimonial.entity';
import { TestimonialPaginationDto } from './dto/testimonial.pagination.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CompleteTestimonialDto } from './dto/complete-testimonial.dto';

@ApiTags('testimonial')
@Controller('testimonial')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Post()
  @ApiOkResponse({
    type: Testimonial,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createTestimonialLink(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @Request() req,
  ) {
    return this.testimonialService.createTestimonialLink(
      req.user.id,
      createTestimonialDto,
    );
  }

  @Post('complete/:testimonial_id')
  @ApiOkResponse({
    type: Testimonial,
  })
  completeTestimonial(
    @Body() completeTestimonialDto: CompleteTestimonialDto,
    @Param('testimonial_id') testimonial_id: string,
  ) {
    return this.testimonialService.completeTestimonial(
      testimonial_id,
      completeTestimonialDto,
    );
  }

  @Get(':testimonial_id')
  @ApiOkResponse({
    type: Testimonial,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  findById(@Param('testimonial_id') testimonial_id: string) {
    return this.testimonialService.findById(testimonial_id);
  }

  @Get()
  @ApiOkResponse({
    type: Testimonial,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  findAll(@Query() pagination: TestimonialPaginationDto, @Request() req) {
    return this.testimonialService.findAll(pagination, req.user.id);
  }

  @Get('landing-page/:landing_page_id')
  @ApiOkResponse({
    type: Testimonial,
    isArray: true,
  })
  @UseGuards(ApiKeyGuard)
  findByLandingPageId(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('api_key') api_key: string,
    @Param('landing_page_id') landing_page_id: string,
    @Query() pagination: TestimonialPaginationDto,
  ) {
    return this.testimonialService.findByLandingPageId(
      landing_page_id,
      pagination,
    );
  }
}
