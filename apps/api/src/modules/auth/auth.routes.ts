import type { FastifyInstance } from 'fastify';

const notImplemented = {
  501: {
    type: 'object' as const,
    properties: { error: { type: 'string' as const } },
  },
};

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', {
    schema: {
      description: 'Registrazione nuovo utente',
      tags: ['Auth'],
      body: {
        type: 'object' as const,
        required: ['email', 'password', 'nome', 'cognome'],
        properties: {
          email: { type: 'string' as const, format: 'email' },
          password: { type: 'string' as const, minLength: 8 },
          nome: { type: 'string' as const },
          cognome: { type: 'string' as const },
        },
      },
      response: {
        201: {
          type: 'object' as const,
          properties: {
            id: { type: 'string' as const },
            email: { type: 'string' as const },
            nome: { type: 'string' as const },
            cognome: { type: 'string' as const },
          },
        },
        ...notImplemented,
      },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.post('/login', {
    schema: {
      description: 'Login utente',
      tags: ['Auth'],
      body: {
        type: 'object' as const,
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' as const, format: 'email' },
          password: { type: 'string' as const },
        },
      },
      response: {
        200: {
          type: 'object' as const,
          properties: {
            accessToken: { type: 'string' as const },
            refreshToken: { type: 'string' as const },
          },
        },
        ...notImplemented,
      },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.post('/refresh', {
    schema: {
      description: 'Refresh access token',
      tags: ['Auth'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });
}
