import {
  Testimonial as PrismaTestimonial,
  TestimonialStatus,
} from '@prisma/client';

export class Testimonial implements PrismaTestimonial {
  id: string;
  status: TestimonialStatus;
  customer_name: string;
  title: string;
  message: string;
  stars: number;
  created_at: Date;
  updated_at: Date;
  landing_page_id: string;
  image: string;
}
