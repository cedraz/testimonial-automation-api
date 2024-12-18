import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({
    default: 0,
    maxLength: 100,
    minimum: 0,
  })
  @IsNumber()
  @Type(() => Number)
  init: number;

  @ApiProperty({
    default: 10,
    maximum: 100,
    minimum: 1,
  })
  @IsNumber()
  @Type(() => Number)
  limit: number;
}
