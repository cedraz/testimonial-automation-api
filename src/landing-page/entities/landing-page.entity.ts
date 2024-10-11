import { LandingPage as PrismaLandingPage } from '@prisma/client';

export class LandingPage implements PrismaLandingPage {
  id: string;
  name: string;
  link: string;
  created_at: Date;
  updated_at: Date;
  admin_id: string;
  testimonial_config_id: string;
}
