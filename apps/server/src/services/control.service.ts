import type { AuditActor, DeviceDTO } from '@iothub/shared';
import type { DeviceService } from './device.service.js';

export interface ControlExecutionResult {
  ok: boolean;
  status: 'allowed' | 'denied' | 'pending' | 'error';
  message: string;
  topic?: string;
  payload?: string;
}

export type CommandPublisher = (topic: string, payload: string) => Promise<void>;
export type VirtualCommandHandler = (
  deviceKey: string,
  key: string,
  value: number | boolean | string,
) => void;

export class ControlService {
  private virtualHandler: VirtualCommandHandler | null = null;

  constructor(
    private readonly deviceService: DeviceService,
    private readonly publishCommand: CommandPublisher,
  ) {}

  registerVirtualHandler(handler: VirtualCommandHandler): void {
    this.virtualHandler = handler;
  }

  async executeControl(params: {
    actor: AuditActor;
    deviceIdOrKey: number | string;
    key: string;
    value: number | boolean | string;
  }): Promise<ControlExecutionResult> {
    const { actor, deviceIdOrKey, key, value } = params;
    const device: DeviceDTO | null =
      typeof deviceIdOrKey === 'number'
        ? this.deviceService.getDeviceById(deviceIdOrKey)
        : this.deviceService.getDeviceByKey(deviceIdOrKey);

    if (!device) {
      return { ok: false, status: 'error', message: `设备不存在: ${String(deviceIdOrKey)}` };
    }

    const cap = device.capabilities.find((c) => c.key === key);
    if (!cap) {
      this.deviceService.recordAuditLog({
        actor,
        deviceId: device.id,
        deviceKey: device.deviceKey,
        action: `control:${key}`,
        payload: { key, value },
        status: 'denied',
        reason: `设备未定义能力字段: ${key}`,
      });
      return { ok: false, status: 'denied', message: `设备未定义能力字段: ${key}` };
    }

    if (cap.access !== 'rw') {
      this.deviceService.recordAuditLog({
        actor,
        deviceId: device.id,
        deviceKey: device.deviceKey,
        action: `control:${key}`,
        payload: { key, value },
        status: 'denied',
        reason: `能力 ${key} 为只读属性 (ro)`,
      });
      return { ok: false, status: 'denied', message: `能力 ${key} 为只读属性，禁止控制` };
    }

    // 物理世界安全护栏（针对 AI 控制）
    if (actor === 'ai') {
      if (device.aiPolicy === 'readonly') {
        const reason = `安全护栏拦截：设备 ${device.name} (${device.deviceKey}) 当前为只读策略 (readonly)`;
        this.deviceService.recordAuditLog({
          actor,
          deviceId: device.id,
          deviceKey: device.deviceKey,
          action: `control:${key}`,
          payload: { key, value },
          status: 'denied',
          reason,
        });
        return { ok: false, status: 'denied', message: reason };
      }

      if (!cap.aiAllowed) {
        const reason = `安全护栏拦截：能力 ${cap.name} (${key}) 未开启 AI 控制许可`;
        this.deviceService.recordAuditLog({
          actor,
          deviceId: device.id,
          deviceKey: device.deviceKey,
          action: `control:${key}`,
          payload: { key, value },
          status: 'denied',
          reason,
        });
        return { ok: false, status: 'denied', message: reason };
      }

      if (device.aiPolicy === 'confirm') {
        const reason = `安全护栏拦截：设备 ${device.name} 处于需人工确认模式 (confirm)，请等待人工审批`;
        this.deviceService.recordAuditLog({
          actor,
          deviceId: device.id,
          deviceKey: device.deviceKey,
          action: `control:${key}`,
          payload: { key, value },
          status: 'pending',
          reason,
        });
        return { ok: false, status: 'pending', message: reason };
      }
    }

    const { topic, payload } = this.deviceService.buildCommandPayload(device, cap, value);

    try {
      await this.publishCommand(topic, payload);
      if (device.protocol === 'virtual' && this.virtualHandler) {
        this.virtualHandler(device.deviceKey, key, value);
      }

      this.deviceService.recordAuditLog({
        actor,
        deviceId: device.id,
        deviceKey: device.deviceKey,
        action: `control:${key}`,
        payload: { key, value, topic },
        status: 'allowed',
      });

      return {
        ok: true,
        status: 'allowed',
        message: `已向 ${device.name} 下发 ${key}=${String(value)}`,
        topic,
        payload,
      };
    } catch (err) {
      const reason = err instanceof Error ? err.message : '指令下发失败';
      this.deviceService.recordAuditLog({
        actor,
        deviceId: device.id,
        deviceKey: device.deviceKey,
        action: `control:${key}`,
        payload: { key, value, topic },
        status: 'error',
        reason,
      });
      return { ok: false, status: 'error', message: reason };
    }
  }
}
