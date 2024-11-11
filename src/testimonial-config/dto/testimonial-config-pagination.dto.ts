import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, TestimonialFormat } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class TestimonialConfigPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  orderByCreatedAt: boolean;

  @ApiPropertyOptional({
    enum: TestimonialFormat,
    enumName: 'TestimonialFormat',
  })
  @IsOptional()
  @IsEnum(TestimonialFormat)
  format?: TestimonialFormat;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  title_char_limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  message_char_limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  expiration_limit?: number;

  where(): { AND: Prisma.TestimonialConfigWhereInput[] } {
    const AND: Prisma.TestimonialConfigWhereInput[] = [];

    if (this.format) {
      AND.push({
        format: this.format,
      });
    }

    if (this.expiration_limit) {
      AND.push({
        expiration_limit: this.expiration_limit,
      });
    }

    if (this.title_char_limit) {
      AND.push({
        title_char_limit: this.title_char_limit,
      });
    }

    if (this.message_char_limit) {
      AND.push({
        message_char_limit: this.message_char_limit,
      });
    }

    const filteredAND = AND.filter((condition) => condition !== undefined);

    return {
      AND: filteredAND,
    };
  }
}
