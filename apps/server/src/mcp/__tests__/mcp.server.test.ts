import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { createDatabase, type DatabaseHandle } from '../../db/index.js';
import { AuthService } from '../../services/auth.service.js';
import { ControlService } from '../../services/control.service.js';
import { DeviceService } from '../../services/device.service.js';
import { HubEventBus } from '../../services/event-bus.js';
import { VirtualSimulatorService } from '../../services/simulator.service.js';

describe('Native MCP Server (/mcp)', () => {
  let handle: DatabaseHandle;
  let apiKey: string;
  let app: ReturnType<typeof createApp>;
  let deviceService: DeviceService;

  beforeEach(() => {
    handle = createDatabase(':memory:');
    const bus = new HubEventBus();
    const authService = new AuthService(handle.db, 'mcp-test-secret');
    deviceService = new DeviceService(handle.db, bus);
    const controlService = new ControlService(deviceService, vi.fn(async () => {}));
    const simulatorService = new VirtualSimulatorService(deviceService);

    apiKey = authService.setupAdmin('admin', 'password123').user.apiKey;
    app = createApp({
      authService,
      deviceService,
      controlService,
      simulatorService,
      mqttPort: 1883,
    });
  });

  afterEach(() => {
    handle.close();
  });

  async function mcpCall(method: string, params: Record<string, unknown> = {}, id = 1) {
    return app.request('/mcp', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    });
  }

  it('rejects unauthenticated requests to /mcp', async () => {
    const res = await app.request('/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    expect(res.status).toBe(401);
  });

  it('lists tools and enforces guardrails on control_device', async () => {
    const dev = deviceService.createDevice({
      deviceKey: 'relay_mcp',
      name: '实验室继电器',
      description: '控制排风与灯光',
      protocol: 'mqtt',
      aiPolicy: 'readonly',
    });
    deviceService.ensureCapability(dev.id, {
      key: 'relay1',
      name: '排风扇',
      type: 'boolean',
      access: 'rw',
      aiAllowed: true,
    });

    const listRes = await mcpCall('tools/list');
    expect(listRes.status).toBe(200);
    const listJson = (await listRes.json()) as { result: { tools: Array<{ name: string }> } };
    const names = listJson.result.tools.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining(['list_devices', 'get_device_state', 'query_telemetry', 'control_device']),
    );

    // readonly 设备应被安全护栏拦截
    const deniedRes = await mcpCall('tools/call', {
      name: 'control_device',
      arguments: { deviceKey: 'relay_mcp', key: 'relay1', value: true },
    });
    const deniedJson = (await deniedRes.json()) as { result: { isError?: boolean } };
    expect(deniedJson.result.isError).toBe(true);

    // 切换为 allow 后放行
    deviceService.updateDevice(dev.id, { aiPolicy: 'allow' });
    const allowRes = await mcpCall('tools/call', {
      name: 'control_device',
      arguments: { deviceKey: 'relay_mcp', key: 'relay1', value: true },
    });
    const allowJson = (await allowRes.json()) as { result: { isError?: boolean } };
    expect(allowJson.result.isError).toBe(false);
    expect(deviceService.listAuditLogs(10)).toHaveLength(2);
  });
});
