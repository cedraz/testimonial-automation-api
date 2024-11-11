import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DomainGuard } from './domain.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs'; // Para conversão de Observable para Promise

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly domainGuard: DomainGuard,
    private readonly jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const domainCheck = this.domainGuard.canActivate(context);

    if (domainCheck) {
      const jwtCheck = await this.jwtAuthGuard.canActivate(context);

      if (jwtCheck instanceof Observable) {
        return await firstValueFrom(jwtCheck);
      }

      return jwtCheck;
    }

    return false;
  }
}
