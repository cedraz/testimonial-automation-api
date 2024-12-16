import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from 'src/admin/admin.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private adminService: AdminService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  findProviderByProviderIdAndAccountId(
    providerId: string,
    providerAccountId: string,
  ) {
    return this.prismaService.provider.findUnique({
      where: {
        provider_id_provider_account_id: {
          provider_id: providerId,
          provider_account_id: providerAccountId,
        },
      },
    });
  }

  async validateAdminOutsideProvider(createAuthDto: CreateAuthDto) {
    const admin = await this.adminService.findByEmail(createAuthDto.email);

    let accessTokenPayload = {
      sub: admin.id,
      expiresIn: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    };

    let refreshTokenPayload = {
      sub: admin.id,
      expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    };

    if (!admin) {
      const newadmin = await this.adminService.create({
        email: createAuthDto.email,
        name: createAuthDto.name,
        password: '',
      });

      await this.prismaService.provider.create({
        data: {
          provider_id: createAuthDto.provider_id,
          provider_account_id: createAuthDto.provider_account_id,
          admin_id: newadmin.id,
        },
      });

      accessTokenPayload = {
        sub: newadmin.id,
        expiresIn: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      };

      refreshTokenPayload = {
        sub: newadmin.id,
        expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      };

      return {
        access_token: await this.jwtService.signAsync(accessTokenPayload, {
          expiresIn: '2h',
          secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        }),
        refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
          expiresIn: '7d',
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        }),
      };
    }

    const providerExists = await this.findProviderByProviderIdAndAccountId(
      createAuthDto.provider_id,
      createAuthDto.provider_account_id,
    );

    if (!providerExists) {
      await this.adminService.updateProviders(admin.id, {
        provider_account_id: createAuthDto.provider_account_id,
        provider_id: createAuthDto.provider_id,
        access_token: createAuthDto.access_token,
        access_token_expires: createAuthDto.access_token_expires,
        refresh_token: createAuthDto.refresh_token,
      });
    }

    return {
      access_token: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }),
    };
  }

  async login(loginDto: LoginDto) {
    const admin = await this.adminService.findByEmail(loginDto.email);

    if (!admin) {
      throw new NotFoundException(ErrorMessagesHelper.ADMIN_NOT_FOUND);
    }

    if (!admin.email_verified_at) {
      throw new UnauthorizedException(ErrorMessagesHelper.EMAIL_NOT_VERIFIED);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS);
    }

    const accessTokenExpiresIn = new Date(
      new Date().getTime() + 2 * 60 * 60 * 1000,
    );
    const refreshTokenExpiresIn = new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    const accessTokenPayload = {
      sub: admin.id,
      email: admin.email,
      expiresIn: accessTokenExpiresIn, // 2 hours
    };

    const refreshTokenPayload = {
      sub: admin.id,
      expiresIn: refreshTokenExpiresIn, // 7 days
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...adminWithoutPassword } = admin;

    return {
      access_token: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }),
      access_token_expires_in: accessTokenExpiresIn, // 2 hours
      refresh_token_expires_in: refreshTokenExpiresIn, // 7 days
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });

    const admin = await this.adminService.findById(payload.sub);

    if (!admin) {
      throw new NotFoundException(ErrorMessagesHelper.ADMIN_NOT_FOUND);
    }

    const access_token_expires_in = new Date(
      new Date().getTime() + 2 * 60 * 60 * 1000,
    ); // 2 Hours

    const refresh_token_expires_in = new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
    ); // 7 Days

    const accessTokenPayload = {
      sub: admin.id,
      email: admin.email,
      expiresIn: access_token_expires_in,
    };

    const refreshTokenPayload = {
      sub: admin.id,
      expiresIn: refresh_token_expires_in,
    };

    return {
      access_token: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      }),
      refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }),
      access_token_expires_in,
      refresh_token_expires_in,
    };
  }
}
