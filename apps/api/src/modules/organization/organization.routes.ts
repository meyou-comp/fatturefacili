import type { FastifyInstance } from 'fastify';

const notImplemented = {
  501: {
    type: 'object' as const,
    properties: { error: { type: 'string' as const } },
  },
};

export async function organizationRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      description: 'Dati organizzazione corrente',
      tags: ['Organization'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.put('/', {
    schema: {
      description: 'Modifica dati organizzazione',
      tags: ['Organization'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.get('/users', {
    schema: {
      description: "Lista utenti dell'organizzazione",
      tags: ['Organization'],
      response: {
        200: {
          type: 'object' as const,
          properties: {
            data: { type: 'array' as const, items: { type: 'object' as const } },
            total: { type: 'integer' as const },
          },
        },
      },
    },
  }, async () => {
    return { data: [], total: 0 };
  });

  app.post('/users/invite', {
    schema: {
      description: "Invita utente nell'organizzazione",
      tags: ['Organization'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });
}
