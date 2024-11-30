import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LandingPage } from './entities/landing-page.entity';
import { LandingPagePaginationDto } from './dto/landing-page.pagination.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { DeleteManyLandingPagesDto } from './dto/delete-many-landing-pages.dto';
import { PrismaBatchPayload } from 'src/common/entities/prisma-batch-payload.entity';

@ApiTags('landing-page')
@Controller('landing-page')
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  @Post()
  @ApiOkResponse({
    type: LandingPage,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  create(@Body() createLandingPageDto: CreateLandingPageDto, @Request() req) {
    return this.landingPageService.create(createLandingPageDto, req.user.id);
  }

  @Get(':landing_page_id')
  @ApiOkResponse({
    type: LandingPage,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  findById(@Param('landing_page_id') landing_page_id: string) {
    return this.landingPageService.findById(landing_page_id);
  }

  @Get()
  @ApiOkResponse({
    type: LandingPage,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  findAdminLandingPages(
    @Query() pagination: LandingPagePaginationDto,
    @Request() req,
  ) {
    return this.landingPageService.findAdminLandingPages(
      pagination,
      req.user.id,
    );
  }

  @Delete(':landing_page_id')
  @ApiOkResponse({
    type: LandingPage,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  deleteById(@Param('landing_page_id') landing_page_id: string) {
    return this.landingPageService.delete(landing_page_id);
  }

  @Delete()
  @ApiOkResponse({
    type: PrismaBatchPayload,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  deleteMany(
    @Body() deleteManyLandingPagesDto: DeleteManyLandingPagesDto,
    @Request() req,
  ) {
    return this.landingPageService.deleteMany({
      deleteManyLandingPagesDto,
      admin_id: req.user.id,
    });
  }
}
