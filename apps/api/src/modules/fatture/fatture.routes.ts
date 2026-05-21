import type { FastifyInstance } from 'fastify';

const notImplemented = {
  501: {
    type: 'object' as const,
    properties: { error: { type: 'string' as const } },
  },
};

export async function fattureRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      description: 'Lista fatture con filtri (stato, data, cliente, tipo)',
      tags: ['Fatture'],
      querystring: {
        type: 'object' as const,
        properties: {
          stato: { type: 'string' as const },
          dal: { type: 'string' as const, format: 'date' },
          al: { type: 'string' as const, format: 'date' },
          clienteId: { type: 'string' as const },
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
    schema: {
      description: 'Crea nuova fattura',
      tags: ['Fatture'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.get('/:id', {
    schema: {
      description: 'Dettaglio fattura',
      tags: ['Fatture'],
      params: {
        type: 'object' as const,
        properties: { id: { type: 'string' as const } },
      },
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.post('/:id/emetti', {
    schema: {
      description: 'Emetti fattura (passa da BOZZA a EMESSA)',
      tags: ['Fatture'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.post('/:id/invia-sdi', {
    schema: {
      description: 'Invia fattura a SDI tramite intermediario',
      tags: ['Fatture'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.get('/:id/pdf', {
    schema: {
      description: 'Scarica PDF fattura',
      tags: ['Fatture'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });

  app.get('/:id/xml', {
    schema: {
      description: 'Scarica XML FatturaPA',
      tags: ['Fatture'],
      response: { ...notImplemented },
    },
  }, async (_request, reply) => {
    return reply.status(501).send({ error: 'Non ancora implementato' });
  });
}
