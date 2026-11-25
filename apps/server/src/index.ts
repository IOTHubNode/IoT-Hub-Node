import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/api/*', cors());

app.get('/api/health', (c) => {
  return c.json({
    ok: true,
    name: 'IoT-Hub-Node',
    version: '0.1.0',
    ts: Date.now(),
  });
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[IoT-Hub-Node] Server listening on http://localhost:${info.port}`);
});
