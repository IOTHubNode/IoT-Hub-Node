import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDatabase, type DatabaseHandle } from '../../db/index.js';
import { DeviceService } from '../device.service.js';
import { HubEventBus } from '../event-bus.js';

describe('DeviceService', () => {
  let handle: DatabaseHandle;
  let bus: HubEventBus;
  let service: DeviceService;

  beforeEach(() => {
    handle = createDatabase(':memory:');
    bus = new HubEventBus();
    service = new DeviceService(handle.db, bus);
  });

  afterEach(() => {
    handle.close();
  });

  it('auto-infers capabilities on telemetry ingest (Schema-on-Write) and computes stats', () => {
    const dev = service.createDevice({
      deviceKey: 'env_01',
      name: '实验室环境节点',
      description: '温湿度采集',
      protocol: 'mqtt',
      aiPolicy: 'readonly',
    });

    const r1 = service.ingestTelemetry('env_01', { temp: 24.5, humi: 55, ok: true }, 1000);
    expect(r1?.acceptedKeys).toEqual(['temp', 'humi', 'ok']);

    service.ingestTelemetry('env_01', { temp: 26.5, humi: 60 }, 2000);

    const updated = service.getDeviceById(dev.id)!;
    expect(updated.status).toBe('online');
    expect(updated.capabilities.map((c) => c.key).sort()).toEqual(['humi', 'ok', 'temp']);
    expect(updated.capabilities.find((c) => c.key === 'ok')?.type).toBe('boolean');

    const stats = service.queryTelemetry(dev.id, 'temp')!;
    expect(stats.count).toBe(2);
    expect(stats.min).toBe(24.5);
    expect(stats.max).toBe(26.5);
    expect(stats.avg).toBe(25.5);
    expect(stats.latest).toBe(26.5);
  });

  it('auto-discovers ESP32_RelayModule via Home Assistant MQTT Discovery and renders command templates', () => {
    const haConfig = {
      name: 'IHE-RM-04-继电器-1',
      unique_id: 'ihe_rm_04_01_relay_1',
      device: {
        name: 'IHE-RM-04',
        model: 'IHE-RM-04',
        manufacturer: '若甫科技有限公司',
        identifiers: ['ihe_rm_04_01'],
      },
      state_topic: 'home/device/IHE-RM-04-01/state',
      command_topic: 'home/device/IHE-RM-04-01/set',
      payload_on: 1,
      payload_off: 0,
      value_template: '{{ value_json.relay1 }}',
      command_template: '{ "relay1": {{ value }} }',
    };

    const discovered = service.handleHaDiscovery(
      'homeassistant/switch/ihe_rm_04_01_relay_1/config',
      JSON.stringify(haConfig),
    );
    expect(discovered).not.toBeNull();
    expect(discovered?.deviceKey).toBe('ihe_rm_04_01');
    expect(discovered?.protocol).toBe('ha_discovery');
    expect(discovered?.capabilities).toHaveLength(1);

    const relayCap = discovered!.capabilities[0]!;
    expect(relayCap.key).toBe('relay1');
    expect(relayCap.access).toBe('rw');
    expect(relayCap.type).toBe('boolean');

    // 状态主题上报解析
    const affected = service.ingestByStateTopic(
      'home/device/IHE-RM-04-01/state',
      JSON.stringify({ relay1: 1, relay2: 0 }),
      5000,
    );
    expect(affected).toBe(1);
    const refreshed = service.getDeviceByKey('ihe_rm_04_01')!;
    expect(refreshed.capabilities[0]?.lastValue).toBe('true');

    // 下行命令模板渲染
    const cmd = service.buildCommandPayload(refreshed, refreshed.capabilities[0]!, false);
    expect(cmd.topic).toBe('home/device/IHE-RM-04-01/set');
    expect(cmd.payload).toBe('{ "relay1": 0 }');
  });
});
