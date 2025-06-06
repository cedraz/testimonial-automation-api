import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAdminDto } from './dto/create-admin.dto';
import { PasswordRecoveryAuthGuard } from 'src/auth/guards/password-recovery.guard';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { Admin } from './entities/admin.entity';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new admin',
  })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  // @Get()
  // @ApiOperation({
  //   summary: 'Ger all admins',
  // })
  // @ApiBearerAuth()
  // @UseGuards(AdminGuard)
  // @UsePipes(new ValidationPipe({ transform: true }))
  // findAll(@Query() pagination: AdminPaginationDto) {
  //   return this.adminService.findAll(pagination);
  // }

  // @Get(':id')
  // @ApiOperation({
  //   summary: 'Search for an admin by ID',
  // })
  // @ApiBearerAuth()
  // @UseGuards(AdminGuard)
  // findById(@Param('id') id: string) {
  //   return this.adminService.findById(id);
  // }

  @Post('recover-password')
  @ApiOperation({
    summary: 'Recover password',
  })
  @UseGuards(PasswordRecoveryAuthGuard)
  @ApiBearerAuth()
  recoverPassword(@Body() password: string, @Request() req) {
    return this.adminService.recoverPassword({
      email: req.user.email,
      password: password,
    });
  }

  @Get('profile')
  @ApiOkResponse({
    type: Admin,
  })
  @ApiOperation({
    summary: 'Get logged admin profile',
  })
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return this.adminService.findById(req.user.id);
  }

  @Delete('profile')
  @ApiOperation({
    summary: 'Delete logged admin profile',
  })
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  deleteProfile(@Request() req) {
    return this.adminService.delete(req.user.id);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update logged admin profile',
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  updateProfile(@Body() updateAdminDto: UpdateAdminDto, @Request() req) {
    return this.adminService.updateProfile(req.user.id, updateAdminDto);
  }
}
