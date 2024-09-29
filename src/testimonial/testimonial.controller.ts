import { Controller, Get } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('testimonial')
@Controller('testimonial')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Get('teste-ai')
  async teste() {
    return this.testimonialService.testeAI();
  }
}
