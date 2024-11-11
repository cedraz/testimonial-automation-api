import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class AdminPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  orderByCreatedAt: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  where(): { AND: Prisma.AdminWhereInput[] } {
    const AND: Prisma.AdminWhereInput[] = [];

    if (this.name) {
      AND.push({
        name: {
          contains: this.name,
        },
      });
    }

    const filteredAND = AND.filter((condition) => condition !== undefined);

    return {
      AND: filteredAND,
    };
  }
}
