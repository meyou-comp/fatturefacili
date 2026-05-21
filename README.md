# 🇮🇹 FatturazioneIT

Software SaaS di fatturazione italiana completo, API-first e full-stack.

## Stack

| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Fastify 5, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7, BullMQ |
| Storage | S3-compatible (MinIO in dev) |

## Quick Start

### Prerequisiti
- Node.js 22+
- pnpm 9+
- Docker & Docker Compose

### Setup

```bash
# 1. Clona e installa
pnpm install

# 2. Copia env
cp .env.example .env

# 3. Avvia servizi infra
docker compose -f docker/docker-compose.yml up -d

# 4. Genera Prisma client e push schema
pnpm db:generate
pnpm db:push

# 5. Seed dati demo
pnpm db:seed

# 6. Avvia in dev
pnpm dev
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **API Docs:** http://localhost:3001/docs
- **MinIO Console:** http://localhost:9001

## Struttura Monorepo

```
apps/
  web/     → Frontend Next.js
  api/     → Backend Fastify
packages/
  shared/  → Tipi, enums, validazioni Zod condivise
  db/      → Schema Prisma + migrations
docker/    → Docker Compose + Dockerfiles
```

## Licenza

Proprietario — Tutti i diritti riservati.
