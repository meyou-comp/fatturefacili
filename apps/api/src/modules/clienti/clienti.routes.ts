import type { FastifyInstance } from 'fastify';

const notImplemented = {
  501: {
    type: 'object' as const,
    properties: { error: { type: 'string' as const } },
  },
};

export async function clientiRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      description: 'Lista clienti con ricerca full-text',
      tags: ['Clienti'],
      querystring: {
        type: 'object' as const,
        properties: {
          search: { type: 'string' as const },
          tipo: { type: 'string' as const },
          page: { type: 'integer' as const, default: 1 },
          limit: { type: 'integer' as const, default: 20 },
        },
      },
      response: {
        200: {
          type: 'object' as const,
          properties: {
            data: { type: 'array' as const, items: { type: 'object' as const } },
            total: { type: 'integer' as const },
            page: { type: 'integer' as const },
            limit: { type: 'integer' as const },
          },
        },
      },
    },
  }, async () => {
    return { data: [], total: 0, page: 1, limit: 20 };
  });

  app.post('/', {
    schema: { description: 'Crea nuovo cliente', tags: ['Clienti'], response: { ...notImplemented } },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.get('/:id', {
    schema: {
      description: 'Dettaglio cliente', tags: ['Clienti'],
      params: { type: 'object' as const, properties: { id: { type: 'string' as const } } },
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.put('/:id', {
    schema: { description: 'Modifica cliente', tags: ['Clienti'], response: { ...notImplemented } },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.delete('/:id', {
    schema: { description: 'Elimina cliente (solo se senza fatture)', tags: ['Clienti'], response: { ...notImplemented } },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });
}
