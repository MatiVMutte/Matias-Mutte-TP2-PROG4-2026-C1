import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from '../backend/src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const server = express();
let isReady = false;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: false,
  });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  await app.init();
  isReady = true;
}

const ready = bootstrap();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ready;
  server(req as any, res as any);
}
