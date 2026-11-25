import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDatabase, type DatabaseHandle } from '../../db/index.js';
import { ControlService } from '../control.service.js';
import { DeviceService } from '../device.service.js';
import { HubEventBus } from '../event-bus.js';

describe('ControlService & AI Physical Safety Guardrail', () => {
  let handle: DatabaseHandle;
  let bus: HubEventBus;
  let deviceService: DeviceService;
  let published: Array<{ topic: string; payload: string }>;
  let controlService: ControlService;

  beforeEach(() => {
    handle = createDatabase(':memory:');
    bus = new HubEventBus();
    deviceService = new DeviceService(handle.db, bus);
    published = [];
    controlService = new ControlService(deviceService, vi.fn(async (topic, payload) => {
      published.push({ topic, payload });
    }));
  });

  afterEach(() => {
    handle.close();
  });

  it('blocks AI control on readonly device and records audit log', async () => {
    const dev = deviceService.createDevice({
      deviceKey: 'relay_safe',
      name: '主电源继电器',
      description: '总闸',
      protocol: 'mqtt',
      aiPolicy: 'readonly',
    });
    deviceService.ensureCapability(dev.id, {
      key: 'power',
      name: '总电源开关',
      type: 'boolean',
      access: 'rw',
      aiAllowed: true,
    });

    const aiRes = await controlService.executeControl({
      actor: 'ai',
      deviceIdOrKey: 'relay_safe',
      key: 'power',
      value: false,
    });
    expect(aiRes.ok).toBe(false);
    expect(aiRes.status).toBe('denied');
    expect(published).toHaveLength(0);

    // 人类控制不受 AI readonly 限制
    const humanRes = await controlService.executeControl({
      actor: 'human',
      deviceIdOrKey: 'relay_safe',
      key: 'power',
      value: false,
    });
    expect(humanRes.ok).toBe(true);
    expect(published).toHaveLength(1);
    expect(published[0]).toEqual({
      topic: 'iothub/relay_safe/command',
      payload: '{"power":false}',
    });

    const logs = deviceService.listAuditLogs(10);
    expect(logs).toHaveLength(2);
    expect(logs[0]?.actor).toBe('human');
    expect(logs[0]?.status).toBe('allowed');
    expect(logs[1]?.actor).toBe('ai');
    expect(logs[1]?.status).toBe('denied');
  });

  it('allows AI control when aiPolicy=allow and aiAllowed=true, and pauses on confirm', async () => {
    const dev = deviceService.createDevice({
      deviceKey: 'fan_01',
      name: '排风扇',
      description: '实验室排风',
      protocol: 'mqtt',
      aiPolicy: 'allow',
    });
    deviceService.ensureCapability(dev.id, {
      key: 'relay1',
      name: '风扇开关',
      type: 'boolean',
      access: 'rw',
      aiAllowed: true,
    });

    const ok = await controlService.executeControl({
      actor: 'ai',
      deviceIdOrKey: 'fan_01',
      key: 'relay1',
      value: true,
    });
    expect(ok.ok).toBe(true);
    expect(ok.status).toBe('allowed');
    expect(published).toHaveLength(1);

    // 切换为 confirm 策略后拦截
    deviceService.updateDevice(dev.id, { aiPolicy: 'confirm' });
    const pending = await controlService.executeControl({
      actor: 'ai',
      deviceIdOrKey: 'fan_01',
      key: 'relay1',
      value: false,
    });
    expect(pending.ok).toBe(false);
    expect(pending.status).toBe('pending');
    expect(published).toHaveLength(1);
  });
});
