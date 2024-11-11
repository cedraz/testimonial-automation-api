import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, TestimonialStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class TestimonialPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  orderByCreatedAt: boolean;

  @ApiPropertyOptional({
    enum: TestimonialStatus,
    enumName: 'TestimonialStatus',
  })
  @IsOptional()
  @IsEnum(TestimonialStatus)
  status?: TestimonialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  customer_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  stars?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  landing_page_id?: string;

  where(): { AND: Prisma.TestimonialWhereInput[] } {
    const AND: Prisma.TestimonialWhereInput[] = [];

    if (this.status) {
      AND.push({
        status: this.status,
      });
    }

    if (this.customer_name) {
      AND.push({
        customer_name: {
          contains: this.customer_name,
        },
      });
    }

    if (this.stars) {
      AND.push({
        stars: this.stars,
      });
    }

    if (this.landing_page_id) {
      AND.push({
        landing_page_id: this.landing_page_id,
      });
    }

    const filteredAND = AND.filter((condition) => condition !== undefined);

    return {
      AND: filteredAND,
    };
  }
}
