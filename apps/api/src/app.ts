import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';

// Module routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { fattureRoutes } from './modules/fatture/fatture.routes.js';
import { clientiRoutes } from './modules/clienti/clienti.routes.js';
import { organizationRoutes } from './modules/organization/organization.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // ─── CORS ──────────────────────────────────────────────
  await app.register(cors, {
    origin: process.env.API_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // ─── Rate Limiting ─────────────────────────────────────
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ─── Swagger / OpenAPI ─────────────────────────────────
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'FatturazioneIT API',
        description:
          'API REST per la fatturazione italiana. Supporta FatturaPA, SDI, regime forfettario, asilo nido, comunicazioni 730 e tutti gli adempimenti fiscali italiani.',
        version: '1.0.0',
        contact: { email: 'api@fatturazioneit.it' },
      },
      servers: [
        { url: 'http://localhost:3001', description: 'Sviluppo locale' },
      ],
      tags: [
        { name: 'Auth', description: 'Autenticazione e registrazione' },
        { name: 'Fatture', description: 'Gestione fatture e documenti fiscali' },
        { name: 'Clienti', description: 'Anagrafica clienti' },
        { name: 'Organization', description: 'Impostazioni organizzazione' },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // ─── Health Check ──────────────────────────────────────
  app.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['System'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // ─── API Routes ────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(fattureRoutes, { prefix: '/api/v1/fatture' });
  await app.register(clientiRoutes, { prefix: '/api/v1/clienti' });
  await app.register(organizationRoutes, { prefix: '/api/v1/organization' });

  return app;
}
