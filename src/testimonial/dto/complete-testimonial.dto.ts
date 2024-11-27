import { Transform } from 'class-transformer';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CompleteTestimonialDto {
  @IsString()
  customer_name: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Max(5)
  @Min(1)
  stars: number;
}
