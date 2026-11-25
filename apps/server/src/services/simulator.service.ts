import type { DeviceService } from './device.service.js';

export class VirtualSimulatorService {
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private envState = { temp: 24.5, humi: 55.0, lux: 320, air_quality: 42 };
  private relayState: Record<string, boolean> = {
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false,
  };

  constructor(private readonly deviceService: DeviceService) {}

  isRunning(): boolean {
    return this.running;
  }

  start(): { running: boolean; devices: string[] } {
    if (this.running) {
      return { running: true, devices: ['virtual_env_01', 'virtual_relay_01'] };
    }

    this.ensureVirtualDevices();
    this.running = true;

    // 立即推送一帧初始数据
    this.tick();
    this.deviceService.ingestTelemetry('virtual_relay_01', this.relayState);

    this.timer = setInterval(() => {
      this.tick();
    }, 3000);

    return { running: true, devices: ['virtual_env_01', 'virtual_relay_01'] };
  }

  stop(): { running: boolean } {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    this.deviceService.setDeviceStatus('virtual_env_01', 'offline');
    this.deviceService.setDeviceStatus('virtual_relay_01', 'offline');
    return { running: false };
  }

  handleCommand(deviceKey: string, key: string, value: number | boolean | string): void {
    if (deviceKey !== 'virtual_relay_01' || !(key in this.relayState)) return;
    const boolVal =
      typeof value === 'boolean'
        ? value
        : value === 1 || value === '1' || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'on';
    this.relayState[key] = boolVal;
    this.deviceService.ingestTelemetry('virtual_relay_01', { [key]: boolVal });
  }

  private tick(): void {
    const fanBoost = this.relayState.relay1 ? -0.35 : 0.08;
    this.envState = {
      temp: Number(
        Math.max(18, Math.min(38, this.envState.temp + fanBoost + (Math.random() - 0.48) * 0.4)).toFixed(2),
      ),
      humi: Number(
        Math.max(30, Math.min(85, this.envState.humi + (Math.random() - 0.5) * 1.2)).toFixed(1),
      ),
      lux: Math.round(Math.max(50, Math.min(1200, this.envState.lux + (Math.random() - 0.5) * 30))),
      air_quality: Math.round(
        Math.max(15, Math.min(200, this.envState.air_quality + (Math.random() - 0.5) * 6)),
      ),
    };
    this.deviceService.ingestTelemetry('virtual_env_01', this.envState);
  }

  private ensureVirtualDevices(): void {
    let env = this.deviceService.getDeviceByKey('virtual_env_01');
    if (!env) {
      env = this.deviceService.createDevice({
        deviceKey: 'virtual_env_01',
        name: '实验室环境节点 (模拟)',
        description: '模拟 ESP32_EnvNode：采集温度、湿度、光照与空气质量',
        protocol: 'virtual',
        aiPolicy: 'readonly',
      });
    }
    this.deviceService.ensureCapability(env.id, {
      key: 'temp',
      name: '环境温度',
      description: '实验室当前环境温度',
      type: 'number',
      unit: '°C',
      access: 'ro',
    });
    this.deviceService.ensureCapability(env.id, {
      key: 'humi',
      name: '相对湿度',
      description: '实验室当前空气湿度',
      type: 'number',
      unit: '%',
      access: 'ro',
    });
    this.deviceService.ensureCapability(env.id, {
      key: 'lux',
      name: '光照强度',
      description: 'BH1750 环境光照度',
      type: 'number',
      unit: 'lx',
      access: 'ro',
    });
    this.deviceService.ensureCapability(env.id, {
      key: 'air_quality',
      name: '空气质量指数',
      description: 'MQ-135 综合气体指数',
      type: 'number',
      unit: 'ppm',
      access: 'ro',
    });

    let relay = this.deviceService.getDeviceByKey('virtual_relay_01');
    if (!relay) {
      relay = this.deviceService.createDevice({
        deviceKey: 'virtual_relay_01',
        name: '四路继电器 IHE-RM-04 (模拟)',
        description: '模拟 ESP32_RelayModule：1号排风扇、2号补光灯、3号水泵、4号备用插座',
        protocol: 'virtual',
        aiPolicy: 'allow',
      });
    }
    const relayNames: Record<string, string> = {
      relay1: '1号继电器（排风扇）',
      relay2: '2号继电器（补光灯）',
      relay3: '3号继电器（灌溉水泵）',
      relay4: '4号继电器（备用插座）',
    };
    for (const [k, label] of Object.entries(relayNames)) {
      this.deviceService.ensureCapability(relay.id, {
        key: k,
        name: label,
        description: label,
        type: 'boolean',
        access: 'rw',
        aiAllowed: true,
      });
    }
  }
}
