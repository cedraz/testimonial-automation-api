import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GoogleGeminiService {
  constructor(private configService: ConfigService) {}

  async evaluateTestimonial(testimonial: string) {
    console.log(this.configService.get('GOOGLE_API_KEY'));
    console.log(testimonial);
    const genAI = new GoogleGenerativeAI(
      this.configService.get('GOOGLE_API_KEY'),
    );
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const promptMessage = `Baseado no texto a seguir que se trata de um depoimento de um 
    cliente sobre um produto, me diga se o depoimento é positivo ou negativo, eu quero o formato da resposta com apenas 1 texto que se trata de um boleano
    true caso seja positivo e false caso seja negativo: ${testimonial}`;

    const result = await model.generateContent(promptMessage);

    console.log(result.response.text());

    return result.response.text() === 'true';
  }
}
