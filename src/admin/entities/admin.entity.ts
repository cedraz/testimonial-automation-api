import { IsDate, IsEmail, IsString, IsUUID } from 'class-validator';

export class Admin {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;

  @IsString()
  image: string;

  @IsDate()
  email_verified_at: Date;

  @IsString()
  company_name: string;

  @IsString()
  stripe_customer_id: string;

  @IsString()
  stripe_subscription_id: string;

  @IsString()
  stripe_price_id: string;

  @IsString()
  stripe_subscription_status: string;
}
