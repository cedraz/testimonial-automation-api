import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { Testimonial } from './entities/testimonial.entity';
import { TestimonialPaginationDto } from './dto/testimonial.pagination.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CompleteTestimonialDto } from './dto/complete-testimonial.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { DeleteManyTestimonialsDto } from './dto/delete-many-testimonials.dto';
import { PrismaBatchPayload } from 'src/common/entities/prisma-batch-payload.entity';

@ApiTags('testimonial')
@Controller('testimonial')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new testimonial link' })
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
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Complete a testimonial' })
  @ApiOkResponse({
    type: Testimonial,
  })
  completeTestimonial(
    @Body() completeTestimonialDto: CompleteTestimonialDto,
    @Param('testimonial_id') testimonial_id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.testimonialService.completeTestimonial(
      testimonial_id,
      completeTestimonialDto,
      file,
    );
  }

  @Put(':testimonial_id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update a testimonial' })
  @ApiOkResponse({
    type: Testimonial,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  update(
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @Param('testimonial_id') testimonial_id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.testimonialService.update({
      updateTestimonialDto,
      testimonial_id,
      file,
    });
  }

  @Get(':testimonial_id')
  @ApiOperation({ summary: 'Find a testimonial by id' })
  @ApiOkResponse({
    type: Testimonial,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  findById(@Param('testimonial_id') testimonial_id: string) {
    return this.testimonialService.findById(testimonial_id);
  }

  @Get()
  @ApiOperation({ summary: 'Find all testimonials' })
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
  @ApiOperation({ summary: 'Find testimonials by landing page id' })
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

  // @Delete(':testimonial_id')
  // @ApiOperation({ summary: 'Delete a testimonial' })
  // @ApiOkResponse({
  //   type: Testimonial,
  // })
  // @ApiBearerAuth()
  // @UseGuards(AdminGuard)
  // delete(@Param('testimonial_id') testimonial_id: string) {
  //   return this.testimonialService.delete(testimonial_id);
  // }

  @Delete()
  @ApiOperation({ summary: 'Delete may testimonials' })
  @ApiOkResponse({
    type: PrismaBatchPayload,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  deleteMany(@Body() deleteManyTestimonialsDto: DeleteManyTestimonialsDto) {
    return this.testimonialService.deleteMany(
      deleteManyTestimonialsDto.testimonials_id_list,
    );
  }
}
