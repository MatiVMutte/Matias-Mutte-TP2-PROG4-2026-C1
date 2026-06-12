import { NestFactory } from '@nestjs/core';
import { AppModule } from '../backend/src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let expressServer: any = null;
let initError: Error | null = null;

const ready = (async () => {
  try {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
    app.setGlobalPrefix('api');
    app.enableCors({ origin: true, credentials: true });
    await app.init();
    expressServer = app.getHttpAdapter().getInstance();
  } catch (err) {
    initError = err as Error;
    console.error('NestJS init failed:', err);
  }
})();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ready;
  if (initError || !expressServer) {
    const msg = initError?.message ?? 'Unknown initialization error';
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Initialization failed', message: msg }));
    return;
  }
  expressServer(req, res);
}
