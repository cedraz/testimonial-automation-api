import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteManyTestimonialsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  testimonials_id_list: string[];
}
