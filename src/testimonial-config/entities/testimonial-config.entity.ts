import {
  TestimonialConfig as PrismaTestimonialConfig,
  TestimonialFormat,
} from '@prisma/client';

export class TestimonialConfig implements PrismaTestimonialConfig {
  id: string;
  name: string;
  format: TestimonialFormat;
  title_char_limit: number;
  message_char_limit: number;
  expiration_limit: number;
  created_at: Date;
  updated_at: Date;
  admin_id: string;
}
