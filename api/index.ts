import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../backend/src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const server = express();
let initError: Error | null = null;

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn'],
    });
    app.setGlobalPrefix('api');
    app.enableCors({ origin: true, credentials: true });
    await app.init();
  } catch (err) {
    initError = err as Error;
    console.error('NestJS init failed:', err);
  }
}

const ready = bootstrap();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ready;
  if (initError) {
    (res as any).status(500).json({ error: 'Initialization failed', message: initError.message });
    return;
  }
  server(req as any, res as any);
}
