import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService } from 'src/api-key/api-key.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const queryParams = request.query;

    const apikey = queryParams.api_key as string;

    if (!apikey) {
      throw new ForbiddenException(ErrorMessagesHelper.API_KEY_REQUIRED);
    }

    const apiKeyExists = await this.apiKeyService.findByKey(apikey);

    if (apiKeyExists) {
      return true;
    }

    throw new ForbiddenException(ErrorMessagesHelper.INVALID_API_KEY);
  }
}
