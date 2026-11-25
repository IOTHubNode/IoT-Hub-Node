import fs from 'node:fs';
import path from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createMcpRoute } from './mcp/mcp.server.js';
import { createAuthRoutes } from './routes/auth.route.js';
import { createDeviceRoutes } from './routes/device.route.js';
import type { AuthService } from './services/auth.service.js';
import type { ControlService } from './services/control.service.js';
import type { DeviceService } from './services/device.service.js';
import type { VirtualSimulatorService } from './services/simulator.service.js';

export function createApp(deps: {
  authService: AuthService;
  deviceService: DeviceService;
  controlService: ControlService;
  simulatorService: VirtualSimulatorService;
  mqttPort: number;
  webDistDir?: string;
}): Hono {
  const { authService, deviceService, controlService, simulatorService, mqttPort, webDistDir } =
    deps;

  const app = new Hono();

  app.use('/api/*', cors());
  app.use('/mcp', cors());

  app.get('/api/health', (c) => {
    return c.json({
      ok: true,
      name: 'IoT-Hub-Node',
      version: '0.1.0',
      initialized: authService.isInitialized(),
      mqttPort,
      ts: Date.now(),
    });
  });

  app.route('/api/auth', createAuthRoutes(authService));
  app.route(
    '/api',
    createDeviceRoutes({
      authService,
      deviceService,
      controlService,
      simulatorService,
    }),
  );
  app.route(
    '/mcp',
    createMcpRoute({
      authService,
      deviceService,
      controlService,
    }),
  );

  // 生产模式单进程静态托管 Vue 控制台产物
  if (webDistDir && fs.existsSync(path.join(webDistDir, 'index.html'))) {
    const relRoot = path.relative(process.cwd(), webDistDir) || '.';
    app.use('/assets/*', serveStatic({ root: relRoot }));
    app.use('/favicon.ico', serveStatic({ root: relRoot }));
    app.get('*', (c) => {
      const html = fs.readFileSync(path.join(webDistDir, 'index.html'), 'utf8');
      return c.html(html);
    });
  }

  return app;
}
