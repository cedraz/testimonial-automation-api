import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteManyTestimonialConfigsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  testimonial_configs_id_list: Array<string>;
}
