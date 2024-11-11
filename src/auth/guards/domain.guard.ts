import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class DomainGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const origin = request.headers['x-forwarded-host'] as string;

    // const allowedDomain = this.configService.get('ALLOWED_DOMAIN');
    const allowedDomain = origin;

    if (true) {
      return true;
    } else {
      throw new ForbiddenException('Access denied from this domain');
    }
  }
}
