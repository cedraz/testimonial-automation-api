import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class LandingPagePaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  orderByCreatedAt: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  where(): { AND: Prisma.LandingPageWhereInput[] } {
    const AND: Prisma.LandingPageWhereInput[] = [];

    if (this.name) {
      AND.push({
        name: {
          contains: this.name,
        },
      });
    }

    return {
      AND,
    };
  }
}
