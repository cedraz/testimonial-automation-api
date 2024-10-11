import { Module } from '@nestjs/common';
import { GoogleGeminiService } from './google-gemini.service';

@Module({
  providers: [GoogleGeminiService],
  exports: [GoogleGeminiService],
})
export class GoogleGeminiModule {}
