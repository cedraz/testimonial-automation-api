import { ApiKey as PrismaApiKey } from '@prisma/client';

export class ApiKey implements PrismaApiKey {
  id: string;
  key: string;
  created_at: Date;
  updated_at: Date;
  admin_id: string;
}
