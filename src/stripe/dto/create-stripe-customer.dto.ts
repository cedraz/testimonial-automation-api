import { IsEmail, IsString } from 'class-validator';

export class CreateStripeCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  name?: string;
}
