import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './exeption/exeption-handler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors();

  const localUrl = 'http://localhost:3000';

  // Swagger config for v1
  const configV1 = new DocumentBuilder()
    .setTitle('MASOYINBO API')
    .setDescription('MASOYINBO API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(localUrl);

  const documentV1 = SwaggerModule.createDocument(app, configV1.build());
  SwaggerModule.setup('api/docs', app, documentV1);

  await app.listen(configService.get<number>('PORT') || 3000);
}

bootstrap();
