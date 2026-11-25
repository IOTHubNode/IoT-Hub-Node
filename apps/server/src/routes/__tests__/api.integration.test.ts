import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { createDatabase, type DatabaseHandle } from '../../db/index.js';
import { AuthService } from '../../services/auth.service.js';
import { ControlService } from '../../services/control.service.js';
import { DeviceService } from '../../services/device.service.js';
import { HubEventBus } from '../../services/event-bus.js';
import { VirtualSimulatorService } from '../../services/simulator.service.js';

describe('HTTP API & Virtual Simulator Integration', () => {
  let handle: DatabaseHandle;
  let app: ReturnType<typeof createApp>;
  let simulator: VirtualSimulatorService;

  beforeEach(() => {
    handle = createDatabase(':memory:');
    const bus = new HubEventBus();
    const authService = new AuthService(handle.db, 'api-test-secret');
    const deviceService = new DeviceService(handle.db, bus);
    const controlService = new ControlService(deviceService, vi.fn(async () => {}));
    simulator = new VirtualSimulatorService(deviceService);
    controlService.registerVirtualHandler((dk, k, v) => simulator.handleCommand(dk, k, v));

    app = createApp({
      authService,
      deviceService,
      controlService,
      simulatorService: simulator,
      mqttPort: 1883,
    });
  });

  afterEach(() => {
    simulator.stop();
    handle.close();
  });

  it('completes setup -> HTTP ingest -> simulator control -> audit log flow', async () => {
    // 1. 初始化管理员
    const setupRes = await app.request('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    });
    expect(setupRes.status).toBe(201);
    const { token } = (await setupRes.json()) as { token: string };
    const authHeader = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. 创建设备并极简 HTTP JSON 上报
    const createRes = await app.request('/api/devices', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ deviceKey: 'http_node_1', name: 'HTTP 节点' }),
    });
    expect(createRes.status).toBe(201);
    const { device } = (await createRes.json()) as { device: { id: number; token: string } };

    const ingestRes = await app.request('/api/ingest/http_node_1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${device.token}`,
      },
      body: JSON.stringify({ voltage: 3.85, temp: 28.4 }),
    });
    expect(ingestRes.status).toBe(200);

    const telRes = await app.request(`/api/devices/${device.id}/telemetry/temp`, {
      headers: authHeader,
    });
    const telJson = (await telRes.json()) as { latest: number; count: number };
    expect(telJson.count).toBe(1);
    expect(telJson.latest).toBe(28.4);

    // 3. 启动虚拟设备并控制虚拟四路继电器
    const startRes = await app.request('/api/simulator/start', {
      method: 'POST',
      headers: authHeader,
    });
    expect(startRes.status).toBe(200);

    const listRes = await app.request('/api/devices', { headers: authHeader });
    const { devices } = (await listRes.json()) as {
      devices: Array<{ id: number; deviceKey: string }>;
    };
    const relay = devices.find((d) => d.deviceKey === 'virtual_relay_01');
    expect(relay).toBeDefined();

    const ctrlRes = await app.request(`/api/devices/${relay!.id}/control`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ key: 'relay1', value: true }),
    });
    expect(ctrlRes.status).toBe(200);

    const auditRes = await app.request('/api/audit-logs', { headers: authHeader });
    const { logs } = (await auditRes.json()) as { logs: Array<{ action: string; status: string }> };
    expect(logs[0]?.action).toBe('control:relay1');
    expect(logs[0]?.status).toBe('allowed');
  });
});
