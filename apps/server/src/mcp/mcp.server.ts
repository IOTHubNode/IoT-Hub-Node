import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { Hono } from 'hono';
import { z } from 'zod';
import { createAuthMiddleware, type AuthVariables } from '../middleware/auth.middleware.js';
import type { AuthService } from '../services/auth.service.js';
import type { ControlService } from '../services/control.service.js';
import type { DeviceService } from '../services/device.service.js';

export function buildMcpServer(deps: {
  deviceService: DeviceService;
  controlService: ControlService;
}): McpServer {
  const { deviceService, controlService } = deps;
  const server = new McpServer({
    name: 'iot-hub-node',
    version: '0.1.0',
  });

  server.tool(
    'list_devices',
    '列出 IoT-Hub-Node 平台上的所有物理/虚拟设备、在线状态、中文语义描述、AI 安全策略及能力列表',
    {},
    async () => {
      const devices = deviceService.listDevices().map((d) => ({
        deviceKey: d.deviceKey,
        name: d.name,
        description: d.description,
        status: d.status,
        protocol: d.protocol,
        aiPolicy: d.aiPolicy,
        lastSeenAt: d.lastSeenAt,
        capabilities: d.capabilities.map((c) => ({
          key: c.key,
          name: c.name,
          description: c.description,
          type: c.type,
          unit: c.unit,
          access: c.access,
          aiAllowed: c.aiAllowed,
          lastValue: c.lastValue ? safeJsonParse(c.lastValue) : null,
        })),
      }));
      return {
        content: [{ type: 'text', text: JSON.stringify(devices, null, 2) }],
      };
    },
  );

  server.tool(
    'get_device_state',
    '获取指定设备的最新实时属性值与在线状态',
    {
      deviceKey: z.string().min(1).describe('设备唯一标识 deviceKey'),
    },
    async ({ deviceKey }) => {
      const device = deviceService.getDeviceByKey(deviceKey);
      if (!device) {
        return {
          isError: true,
          content: [{ type: 'text', text: `未找到设备: ${deviceKey}` }],
        };
      }
      const state = {
        deviceKey: device.deviceKey,
        name: device.name,
        status: device.status,
        aiPolicy: device.aiPolicy,
        lastSeenAt: device.lastSeenAt,
        values: Object.fromEntries(
          device.capabilities.map((c) => [
            c.key,
            {
              name: c.name,
              value: c.lastValue ? safeJsonParse(c.lastValue) : null,
              unit: c.unit,
              access: c.access,
              updatedAt: c.lastUpdatedAt,
            },
          ]),
        ),
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(state, null, 2) }],
      };
    },
  );

  server.tool(
    'query_telemetry',
    '查询指定设备某属性在时间范围内的聚合统计（均值、最大、最小、最新值）与降采样趋势点',
    {
      deviceKey: z.string().min(1).describe('设备唯一标识 deviceKey'),
      key: z.string().min(1).describe('属性键名，如 temp、humi'),
      minutes: z.number().min(1).max(43200).default(60).describe('查询最近多少分钟的数据，默认 60 分钟'),
      maxPoints: z.number().min(5).max(100).default(30).describe('返回的最大趋势采样点数，默认 30'),
    },
    async ({ deviceKey, key, minutes, maxPoints }) => {
      const device = deviceService.getDeviceByKey(deviceKey);
      if (!device) {
        return {
          isError: true,
          content: [{ type: 'text', text: `未找到设备: ${deviceKey}` }],
        };
      }
      const now = Date.now();
      const result = deviceService.queryTelemetry(device.id, key, {
        from: now - minutes * 60 * 1000,
        to: now,
        maxPoints,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'control_device',
    '向支持写操作 (rw) 的设备能力下发控制指令（受物理世界安全护栏策略保护并记录审计日志）',
    {
      deviceKey: z.string().min(1).describe('设备唯一标识 deviceKey'),
      key: z.string().min(1).describe('可控能力键名，如 relay1'),
      value: z.union([z.boolean(), z.number(), z.string()]).describe('目标控制值'),
    },
    async ({ deviceKey, key, value }) => {
      const res = await controlService.executeControl({
        actor: 'ai',
        deviceIdOrKey: deviceKey,
        key,
        value,
      });
      return {
        isError: !res.ok,
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    },
  );

  return server;
}

export function createMcpRoute(deps: {
  authService: AuthService;
  deviceService: DeviceService;
  controlService: ControlService;
}) {
  const router = new Hono<{ Variables: AuthVariables }>();
  const requireAuth = createAuthMiddleware(deps.authService);

  router.all('/', requireAuth, async (c) => {
    const server = buildMcpServer({
      deviceService: deps.deviceService,
      controlService: deps.controlService,
    });
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    try {
      return await transport.handleRequest(c.req.raw);
    } finally {
      await server.close();
    }
  });

  return router;
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
