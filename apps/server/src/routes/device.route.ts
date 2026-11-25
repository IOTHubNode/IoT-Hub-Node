import { zValidator } from '@hono/zod-validator';
import {
  ControlDeviceSchema,
  CreateDeviceSchema,
  UpdateCapabilitySchema,
  UpdateDeviceSchema,
} from '@iothub/shared';
import { Hono } from 'hono';
import { createAuthMiddleware, type AuthVariables } from '../middleware/auth.middleware.js';
import type { AuthService } from '../services/auth.service.js';
import type { ControlService } from '../services/control.service.js';
import type { DeviceService } from '../services/device.service.js';
import type { VirtualSimulatorService } from '../services/simulator.service.js';

export function createDeviceRoutes(deps: {
  authService: AuthService;
  deviceService: DeviceService;
  controlService: ControlService;
  simulatorService: VirtualSimulatorService;
}) {
  const { authService, deviceService, controlService, simulatorService } = deps;
  const router = new Hono<{ Variables: AuthVariables }>();
  const requireAuth = createAuthMiddleware(authService);

  // 设备极简 HTTP 上报接口：POST /api/ingest/:deviceKey
  router.post('/ingest/:deviceKey', async (c) => {
    const deviceKey = c.req.param('deviceKey');
    const device = deviceService.getDeviceByKey(deviceKey);
    if (!device) {
      return c.json({ error: `设备不存在: ${deviceKey}` }, 404);
    }

    const headerAuth = c.req.header('Authorization');
    const bearer = headerAuth?.startsWith('Bearer ') ? headerAuth.slice(7).trim() : '';
    const token = bearer || c.req.header('X-Device-Token') || c.req.query('token') || '';
    if (token && token !== device.token) {
      return c.json({ error: '设备 Token 校验失败' }, 401);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: '请求体必须为有效 JSON 对象' }, 400);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return c.json({ error: '上报数据必须为 JSON 对象' }, 400);
    }

    const result = deviceService.ingestTelemetry(deviceKey, body as Record<string, unknown>);
    return c.json({ ok: true, ...result });
  });

  // 以下接口需要管理员登录态或 API Token
  router.get('/devices', requireAuth, (c) => {
    return c.json({ devices: deviceService.listDevices() });
  });

  router.post('/devices', requireAuth, zValidator('json', CreateDeviceSchema), (c) => {
    const input = c.req.valid('json');
    try {
      const device = deviceService.createDevice(input);
      return c.json({ device }, 201);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : '创建设备失败' }, 409);
    }
  });

  router.get('/devices/:id', requireAuth, (c) => {
    const id = Number(c.req.param('id'));
    const device = deviceService.getDeviceById(id);
    if (!device) return c.json({ error: '设备不存在' }, 404);
    return c.json({ device });
  });

  router.patch('/devices/:id', requireAuth, zValidator('json', UpdateDeviceSchema), (c) => {
    const id = Number(c.req.param('id'));
    const device = deviceService.updateDevice(id, c.req.valid('json'));
    if (!device) return c.json({ error: '设备不存在' }, 404);
    return c.json({ device });
  });

  router.delete('/devices/:id', requireAuth, (c) => {
    const id = Number(c.req.param('id'));
    const ok = deviceService.deleteDevice(id);
    if (!ok) return c.json({ error: '设备不存在' }, 404);
    return c.json({ ok: true });
  });

  router.patch(
    '/devices/:id/capabilities/:key',
    requireAuth,
    zValidator('json', UpdateCapabilitySchema),
    (c) => {
      const id = Number(c.req.param('id'));
      const key = c.req.param('key');
      const capability = deviceService.updateCapability(id, key, c.req.valid('json'));
      if (!capability) return c.json({ error: '能力字段不存在' }, 404);
      return c.json({ capability });
    },
  );

  router.get('/devices/:id/telemetry/:key', requireAuth, (c) => {
    const id = Number(c.req.param('id'));
    const key = c.req.param('key');
    const from = c.req.query('from') ? Number(c.req.query('from')) : undefined;
    const to = c.req.query('to') ? Number(c.req.query('to')) : undefined;
    const maxPoints = c.req.query('maxPoints') ? Number(c.req.query('maxPoints')) : 200;

    const result = deviceService.queryTelemetry(id, key, { from, to, maxPoints });
    if (!result) return c.json({ error: '设备不存在' }, 404);
    return c.json(result);
  });

  router.post(
    '/devices/:id/control',
    requireAuth,
    zValidator('json', ControlDeviceSchema),
    async (c) => {
      const id = Number(c.req.param('id'));
      const { key, value } = c.req.valid('json');
      const res = await controlService.executeControl({
        actor: 'human',
        deviceIdOrKey: id,
        key,
        value,
      });
      return c.json(res, res.ok ? 200 : 400);
    },
  );

  router.get('/audit-logs', requireAuth, (c) => {
    const limit = Math.min(200, Math.max(1, Number(c.req.query('limit') ?? 50)));
    return c.json({ logs: deviceService.listAuditLogs(limit) });
  });

  router.get('/simulator/status', requireAuth, (c) => {
    return c.json({ running: simulatorService.isRunning() });
  });

  router.post('/simulator/start', requireAuth, (c) => {
    return c.json(simulatorService.start());
  });

  router.post('/simulator/stop', requireAuth, (c) => {
    return c.json(simulatorService.stop());
  });

  return router;
}
