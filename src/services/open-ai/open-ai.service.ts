import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  constructor(private configService: ConfigService) {}

  //   private readonly logger = new Logger(OpenAIService.name);
  private readonly openai = new OpenAI({
    apiKey: this.configService.get('OPENAI_API_KEY'),
  });

  async teste(prompt: string) {
    console.log(this.configService.get('OPENAI_API_KEY'));
    console.log(prompt);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: 'Write a haiku about recursion in programming.',
        },
      ],
    });

    return completion;
  }
}
