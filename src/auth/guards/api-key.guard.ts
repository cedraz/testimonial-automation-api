import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService } from 'src/api-key/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const queryParams = request.query;

    const apikey = queryParams.apikey as string;

    const apiKeyExists = await this.apiKeyService.findByKey(apikey);

    if (apiKeyExists) {
      return true;
    }

    return false;
  }
}
