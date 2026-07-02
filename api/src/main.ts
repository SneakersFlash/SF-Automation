import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Semua endpoint di bawah /api (IA §12.3, MASTER-BRIEF §9)
  app.setGlobalPrefix('api');

  // CORS: web (ai.) memanggil api (ai-api.) lintas origin. Auth via Bearer header.
  app.enableCors({
    origin: (process.env.WEB_ORIGIN ?? 'https://ai.sneakersflash.com').split(','),
  });

  // Strict Validation (SOT rule): DTO + class-validator, tolak field asing
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
}

void bootstrap();
