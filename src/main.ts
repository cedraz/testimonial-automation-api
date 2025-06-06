import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { changeErrorMessage } from './utils/errorMessageValidator';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/docs', // Adjust the prefix as needed
  });

  const config = new DocumentBuilder()
    .setTitle('Micro SaaS')
    .setDescription('Micro SaaS Base API docs')
    .setVersion('1.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.6.2/swagger-ui.min.css',
    customCss: `
      .swagger-ui .opblock .opblock-summary-path-description-wrapper {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 0 10px;
        padding: 0 10px;
        width: 100%;
      }
    `,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        // console.log(errors);
        const result = errors.map((error) => {
          let errorMessage: string | null = changeErrorMessage({
            contraintKey: Object.keys(error.constraints)[0],
            property: error.property,
          });

          if (!errorMessage) {
            errorMessage = error.constraints[Object.keys(error.constraints)[0]];
          }

          return {
            property: error.property,
            message: errorMessage,
          };
        });

        return new BadRequestException(result);
      },
      stopAtFirstError: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true); // Permite qualquer origem
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  const configService = app.get(ConfigService);

  const port = configService.get<string>('PORT');

  await app.listen(port || 3000);
  console.log(`
    API runing on http://localhost:${port}
    DOCS runing on http://localhost:${port}/docs
  `);
}
bootstrap();
