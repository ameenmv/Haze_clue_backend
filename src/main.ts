import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global API prefix (/api/*) ─────────────────────────────
  app.setGlobalPrefix('api');

  // ── CORS for Nuxt dev server ───────────────────────────────
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // ── Port from env ──────────────────────────────────────────
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);

  await app.listen(port);
  console.log(`🚀 Haze Clue API running on http://localhost:${port}/api`);
}
bootstrap();
