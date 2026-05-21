import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = parseInt(process.env.API_PORT || '3001', 10);
const HOST = process.env.API_HOST || '0.0.0.0';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`
╔══════════════════════════════════════════════════╗
║       🇮🇹  FatturazioneIT API Server  🇮🇹         ║
╠══════════════════════════════════════════════════╣
║  Server:   http://${HOST}:${PORT}                  ║
║  Docs:     http://${HOST}:${PORT}/docs              ║
║  Health:   http://${HOST}:${PORT}/health             ║
╚══════════════════════════════════════════════════╝
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
