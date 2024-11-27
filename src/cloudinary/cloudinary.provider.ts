import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  useFactory: (configService: ConfigService) => {
    const cloudinaryUrl = configService.get<string>('CLOUDINARY_URL');
    const url = new URL(cloudinaryUrl);

    return v2.config({
      cloud_name: url.hostname,
      api_key: url.username,
      api_secret: url.password,
    });
  },
  inject: [ConfigService],
};
