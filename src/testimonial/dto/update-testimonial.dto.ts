import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CompleteTestimonialDto } from './complete-testimonial.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TestimonialStatus } from '@prisma/client';

export class UpdateTestimonialDto extends PartialType(CompleteTestimonialDto) {
  @ApiPropertyOptional({
    enum: TestimonialStatus,
    enumName: 'TestimonialStatus',
  })
  @IsOptional()
  @IsEnum(TestimonialStatus)
  status?: TestimonialStatus;
}
