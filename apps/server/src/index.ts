import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { loadConfig } from './config.js';
import { createDatabase } from './db/index.js';
import { createAuthRoutes } from './routes/auth.route.js';
import { AuthService } from './services/auth.service.js';

const config = loadConfig();
const dbHandle = createDatabase(config.dbPath);
const authService = new AuthService(dbHandle.db, config.jwtSecret);

const app = new Hono();

app.use('/api/*', cors());

app.get('/api/health', (c) => {
  return c.json({
    ok: true,
    name: 'IoT-Hub-Node',
    version: '0.1.0',
    initialized: authService.isInitialized(),
    ts: Date.now(),
  });
});

app.route('/api/auth', createAuthRoutes(authService));

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[IoT-Hub-Node] Server listening on http://localhost:${info.port}`);
  console.log(`[IoT-Hub-Node] SQLite WAL ready at ${config.dbPath}`);
});
