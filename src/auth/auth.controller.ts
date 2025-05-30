import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GoogleOAuthGuard } from './guards/google.guard';
import { Request as ExpressRequest, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { TokenEntity } from './entities/token.entity';
import { DomainGuard } from './guards/domain.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/signin')
  @ApiOperation({ summary: 'Inicia autenticação com o google.' })
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    return { message: 'Autenticação com o google bem sucedida' };
  }

  @Get('google/redirect')
  @ApiResponse({
    headers: {
      'Set-Cookie': {
        description: 'Refresh token',
        schema: {
          type: 'string',
        },
      },
    },
  })
  @UseGuards(GoogleOAuthGuard)
  handleRedirect(
    @Request()
    req: ExpressRequest & {
      user: { access_token: string; refresh_token: string };
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = req.user;

    const queryParams = new URLSearchParams();

    queryParams.append('access_token', access_token);
    queryParams.append('refresh_token', refresh_token);

    const redirectUrl = `http://localhost:3000/dashboard?${queryParams}`;
    return res.redirect(redirectUrl);
  }

  @ApiOperation({
    summary: 'login',
  })
  @Post('login')
  @ApiOkResponse({
    type: TokenEntity,
  })
  adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('refresh')
  @ApiOperation({
    summary: 'Refresh token',
  })
  @ApiOkResponse({
    type: TokenEntity,
  })
  @ApiBearerAuth()
  @UseGuards(DomainGuard)
  adminRefresh(@Request() req: ExpressRequest) {
    return this.authService.refreshAccessToken(req.cookies['refresh_token']);
  }
}
