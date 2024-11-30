import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class DeleteManyLandingPagesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  landing_pages_id_list: string[];
}
