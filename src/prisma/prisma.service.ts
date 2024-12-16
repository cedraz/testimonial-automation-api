import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public client: PrismaClient;

  constructor() {
    super({
      log: ['warn', 'error'],
    });

    this.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            // P2025 é o código de erro para "Record to delete does not exist."
            throw new NotFoundException(
              `Record not found in table ${params.model}`,
            );
          }
          if (error.code === 'P2002') {
            // P2002 é o código de erro para "Unique constraint failed on the {constraint}"
            throw new ConflictException(
              `Unique constraint on the ${params.model}`,
            );
          }
        }
        throw error;
      }
    });
  }

  onModuleInit() {
    return this.$connect();
  }

  onModuleDestroy() {
    return this.$disconnect();
  }
}
