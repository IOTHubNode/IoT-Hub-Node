import crypto from 'node:crypto';
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';
import type {
  AiPolicy,
  AuditActor,
  AuditLogDTO,
  CapabilityAccess,
  CapabilityType,
  CreateDeviceInput,
  DeviceCapabilityDTO,
  DeviceDTO,
  DeviceProtocol,
  DeviceStatus,
  TelemetryPointDTO,
  UpdateCapabilityInput,
  UpdateDeviceInput,
} from '@iothub/shared';
import type { AppDatabase } from '../db/index.js';
import { auditLogs, deviceCapabilities, devices, telemetryPoints } from '../db/schema.js';
import type { HubEventBus } from './event-bus.js';

interface HaDiscoveryPayload {
  name?: string;
  unique_id?: string;
  state_topic?: string;
  command_topic?: string;
  value_template?: string;
  command_template?: string;
  payload_on?: string | number | boolean;
  payload_off?: string | number | boolean;
  unit_of_measurement?: string;
  device?: {
    name?: string;
    model?: string;
    manufacturer?: string;
    identifiers?: string | string[];
  };
}

export interface TelemetryQueryResult {
  deviceKey: string;
  key: string;
  count: number;
  min: number | null;
  max: number | null;
  avg: number | null;
  latest: number | string | boolean | null;
  points: TelemetryPointDTO[];
}

export class DeviceService {
  constructor(
    private readonly db: AppDatabase,
    private readonly eventBus: HubEventBus,
  ) {}

  listDevices(): DeviceDTO[] {
    const allDevices = this.db.select().from(devices).orderBy(desc(devices.createdAt)).all();
    const allCaps = this.db.select().from(deviceCapabilities).all();
    const capsByDevice = new Map<number, DeviceCapabilityDTO[]>();

    for (const cap of allCaps) {
      const list = capsByDevice.get(cap.deviceId) ?? [];
      list.push(this.mapCapability(cap));
      capsByDevice.set(cap.deviceId, list);
    }

    return allDevices.map((d) => this.mapDevice(d, capsByDevice.get(d.id) ?? []));
  }

  getDeviceById(id: number): DeviceDTO | null {
    const d = this.db.select().from(devices).where(eq(devices.id, id)).get();
    if (!d) return null;
    const caps = this.db
      .select()
      .from(deviceCapabilities)
      .where(eq(deviceCapabilities.deviceId, d.id))
      .all()
      .map((c) => this.mapCapability(c));
    return this.mapDevice(d, caps);
  }

  getDeviceByKey(deviceKey: string): DeviceDTO | null {
    const d = this.db.select().from(devices).where(eq(devices.deviceKey, deviceKey)).get();
    if (!d) return null;
    const caps = this.db
      .select()
      .from(deviceCapabilities)
      .where(eq(deviceCapabilities.deviceId, d.id))
      .all()
      .map((c) => this.mapCapability(c));
    return this.mapDevice(d, caps);
  }

  createDevice(input: CreateDeviceInput): DeviceDTO {
    const deviceKey = input.deviceKey ?? `dev_${crypto.randomBytes(4).toString('hex')}`;
    const token = crypto.randomBytes(16).toString('hex');
    const createdAt = Date.now();

    const inserted = this.db
      .insert(devices)
      .values({
        deviceKey,
        token,
        name: input.name,
        description: input.description ?? '',
        protocol: input.protocol ?? 'mqtt',
        status: 'offline',
        aiPolicy: input.aiPolicy ?? 'readonly',
        createdAt,
      })
      .returning()
      .get();

    return this.mapDevice(inserted, []);
  }

  updateDevice(id: number, input: UpdateDeviceInput): DeviceDTO | null {
    const existing = this.getDeviceById(id);
    if (!existing) return null;

    const patch = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.aiPolicy !== undefined ? { aiPolicy: input.aiPolicy } : {}),
    };
    if (Object.keys(patch).length > 0) {
      this.db.update(devices).set(patch).where(eq(devices.id, id)).run();
    }

    return this.getDeviceById(id);
  }

  deleteDevice(id: number): boolean {
    const res = this.db.delete(devices).where(eq(devices.id, id)).run();
    return res.changes > 0;
  }

  updateCapability(
    deviceId: number,
    key: string,
    input: UpdateCapabilityInput,
  ): DeviceCapabilityDTO | null {
    const existing = this.db
      .select()
      .from(deviceCapabilities)
      .where(and(eq(deviceCapabilities.deviceId, deviceId), eq(deviceCapabilities.key, key)))
      .get();
    if (!existing) return null;

    const patch = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
      ...(input.access !== undefined ? { access: input.access } : {}),
      ...(input.aiAllowed !== undefined ? { aiAllowed: input.aiAllowed } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    };
    if (Object.keys(patch).length > 0) {
      this.db.update(deviceCapabilities).set(patch).where(eq(deviceCapabilities.id, existing.id)).run();
    }

    const updated = this.db
      .select()
      .from(deviceCapabilities)
      .where(eq(deviceCapabilities.id, existing.id))
      .get();
    return updated ? this.mapCapability(updated) : null;
  }

  ensureCapability(
    deviceId: number,
    spec: {
      key: string;
      name?: string;
      description?: string;
      type: CapabilityType;
      unit?: string;
      access?: CapabilityAccess;
      stateTopic?: string | null;
      commandTopic?: string | null;
      valueTemplate?: string | null;
      commandTemplate?: string | null;
      payloadOn?: string | null;
      payloadOff?: string | null;
      aiAllowed?: boolean;
    },
  ): DeviceCapabilityDTO {
    const existing = this.db
      .select()
      .from(deviceCapabilities)
      .where(and(eq(deviceCapabilities.deviceId, deviceId), eq(deviceCapabilities.key, spec.key)))
      .get();

    if (existing) {
      const patch = {
        ...(spec.stateTopic !== undefined ? { stateTopic: spec.stateTopic } : {}),
        ...(spec.commandTopic !== undefined ? { commandTopic: spec.commandTopic } : {}),
        ...(spec.valueTemplate !== undefined ? { valueTemplate: spec.valueTemplate } : {}),
        ...(spec.commandTemplate !== undefined ? { commandTemplate: spec.commandTemplate } : {}),
        ...(spec.payloadOn !== undefined ? { payloadOn: spec.payloadOn } : {}),
        ...(spec.payloadOff !== undefined ? { payloadOff: spec.payloadOff } : {}),
      };
      if (Object.keys(patch).length > 0) {
        this.db
          .update(deviceCapabilities)
          .set(patch)
          .where(eq(deviceCapabilities.id, existing.id))
          .run();
      }
      const refreshed = this.db
        .select()
        .from(deviceCapabilities)
        .where(eq(deviceCapabilities.id, existing.id))
        .get()!;
      return this.mapCapability(refreshed);
    }

    const inserted = this.db
      .insert(deviceCapabilities)
      .values({
        deviceId,
        key: spec.key,
        name: spec.name ?? spec.key,
        description: spec.description ?? '',
        type: spec.type,
        unit: spec.unit ?? '',
        access: spec.access ?? 'ro',
        stateTopic: spec.stateTopic ?? null,
        commandTopic: spec.commandTopic ?? null,
        valueTemplate: spec.valueTemplate ?? null,
        commandTemplate: spec.commandTemplate ?? null,
        payloadOn: spec.payloadOn ?? null,
        payloadOff: spec.payloadOff ?? null,
        aiAllowed: spec.aiAllowed ?? false,
      })
      .returning()
      .get();

    return this.mapCapability(inserted);
  }

  setDeviceStatus(deviceKey: string, status: DeviceStatus, ts = Date.now()): void {
    const device = this.db.select().from(devices).where(eq(devices.deviceKey, deviceKey)).get();
    if (!device) return;

    this.db
      .update(devices)
      .set({ status, lastSeenAt: ts })
      .where(eq(devices.id, device.id))
      .run();

    this.eventBus.emit({
      type: 'status',
      deviceId: device.id,
      deviceKey: device.deviceKey,
      status,
      ts,
    });
  }

  verifyDeviceToken(deviceKey: string, token: string): boolean {
    const device = this.db.select().from(devices).where(eq(devices.deviceKey, deviceKey)).get();
    if (!device) return false;
    return device.token === token;
  }

  /**
   * 极简 JSON 直连入库（Schema-on-Write 自动推断字段）
   */
  ingestTelemetry(
    deviceKey: string,
    payload: Record<string, unknown>,
    ts = Date.now(),
  ): { deviceId: number; acceptedKeys: string[] } | null {
    let device = this.db.select().from(devices).where(eq(devices.deviceKey, deviceKey)).get();
    if (!device) {
      return null;
    }

    const accepted: Record<string, number | boolean | string> = {};

    for (const [key, rawVal] of Object.entries(payload)) {
      if (rawVal === null || rawVal === undefined || typeof rawVal === 'object') {
        continue;
      }
      const val = rawVal as number | boolean | string;
      const inferredType = this.inferType(val);

      const cap = this.ensureCapability(device.id, {
        key,
        type: inferredType,
        access: 'ro',
      });

      this.recordValue(device.id, cap.id, key, val, ts);
      accepted[key] = val;
    }

    const acceptedKeys = Object.keys(accepted);
    if (acceptedKeys.length > 0) {
      this.db
        .update(devices)
        .set({ status: 'online', lastSeenAt: ts })
        .where(eq(devices.id, device.id))
        .run();

      this.eventBus.emit({
        type: 'telemetry',
        deviceId: device.id,
        deviceKey: device.deviceKey,
        values: accepted,
        ts,
      });
    }

    return { deviceId: device.id, acceptedKeys };
  }

  /**
   * 处理 Home Assistant MQTT Discovery 报文
   * 支持 topic:
   * - homeassistant/{component}/{objectId}/config
   * - homeassistant/{component}/{nodeId}/{objectId}/config
   * - iothub/discovery/{objectId}/config
   */
  handleHaDiscovery(topic: string, rawPayload: string): DeviceDTO | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawPayload);
    } catch {
      return null;
    }

    const items: HaDiscoveryPayload[] = Array.isArray(parsed)
      ? (parsed as HaDiscoveryPayload[])
      : [parsed as HaDiscoveryPayload];

    const segments = topic.split('/');
    const component = segments[0] === 'homeassistant' ? (segments[1] ?? 'sensor') : 'sensor';
    let lastDeviceId: number | null = null;

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;

      const identifiers = item.device?.identifiers;
      const primaryIdentifier = Array.isArray(identifiers)
        ? identifiers[0]
        : typeof identifiers === 'string'
          ? identifiers
          : undefined;
      const deviceKey = this.sanitizeKey(
        primaryIdentifier ?? item.unique_id ?? segments[segments.length - 2] ?? 'ha_device',
      );

      let device = this.db.select().from(devices).where(eq(devices.deviceKey, deviceKey)).get();
      const isNew = !device;
      if (!device) {
        device = this.db
          .insert(devices)
          .values({
            deviceKey,
            token: crypto.randomBytes(16).toString('hex'),
            name: item.device?.name ?? item.name ?? deviceKey,
            description: [item.device?.manufacturer, item.device?.model].filter(Boolean).join(' '),
            protocol: 'ha_discovery',
            status: 'online',
            aiPolicy: 'readonly',
            lastSeenAt: Date.now(),
            createdAt: Date.now(),
          })
          .returning()
          .get();
      } else {
        this.db
          .update(devices)
          .set({ status: 'online', lastSeenAt: Date.now() })
          .where(eq(devices.id, device.id))
          .run();
      }

      const capKey = this.extractCapabilityKey(item);
      const isControllable =
        Boolean(item.command_topic) ||
        ['switch', 'light', 'fan', 'number', 'select', 'button'].includes(component);
      const capType: CapabilityType =
        component === 'switch' || component === 'binary_sensor' || component === 'light'
          ? 'boolean'
          : 'number';

      this.ensureCapability(device.id, {
        key: capKey,
        name: item.name ?? capKey,
        type: capType,
        unit: item.unit_of_measurement ?? '',
        access: isControllable ? 'rw' : 'ro',
        stateTopic: item.state_topic ?? null,
        commandTopic: item.command_topic ?? null,
        valueTemplate: item.value_template ?? null,
        commandTemplate: item.command_template ?? null,
        payloadOn: item.payload_on !== undefined ? String(item.payload_on) : null,
        payloadOff: item.payload_off !== undefined ? String(item.payload_off) : null,
        aiAllowed: isControllable,
      });

      lastDeviceId = device.id;
      if (isNew) {
        const dto = this.getDeviceById(device.id);
        if (dto) {
          this.eventBus.emit({ type: 'device_discovered', device: dto, ts: Date.now() });
        }
      }
    }

    return lastDeviceId !== null ? this.getDeviceById(lastDeviceId) : null;
  }

  /**
   * 根据 HA Discovery 注册的 state_topic 解析上报数据
   */
  ingestByStateTopic(topic: string, rawPayload: string, ts = Date.now()): number {
    const matchingCaps = this.db
      .select()
      .from(deviceCapabilities)
      .where(eq(deviceCapabilities.stateTopic, topic))
      .all();

    if (matchingCaps.length === 0) return 0;

    let jsonObj: Record<string, unknown> | null = null;
    try {
      const parsed = JSON.parse(rawPayload);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        jsonObj = parsed as Record<string, unknown>;
      }
    } catch {
      jsonObj = null;
    }

    const updatedByDevice = new Map<number, Record<string, number | boolean | string>>();

    for (const cap of matchingCaps) {
      const extracted = this.extractValueByTemplate(cap.valueTemplate, rawPayload, jsonObj);
      if (extracted === undefined || extracted === null) continue;

      let normalized: number | boolean | string = extracted;
      if (cap.type === 'boolean') {
        if (cap.payloadOn !== null && String(extracted) === cap.payloadOn) {
          normalized = true;
        } else if (cap.payloadOff !== null && String(extracted) === cap.payloadOff) {
          normalized = false;
        } else if (typeof extracted === 'number') {
          normalized = extracted !== 0;
        } else if (typeof extracted === 'string') {
          normalized = extracted === '1' || extracted.toLowerCase() === 'on' || extracted.toLowerCase() === 'true';
        }
      }

      this.recordValue(cap.deviceId, cap.id, cap.key, normalized, ts);
      const map = updatedByDevice.get(cap.deviceId) ?? {};
      map[cap.key] = normalized;
      updatedByDevice.set(cap.deviceId, map);
    }

    for (const [deviceId, values] of updatedByDevice.entries()) {
      const device = this.db.select().from(devices).where(eq(devices.id, deviceId)).get();
      if (!device) continue;
      this.db
        .update(devices)
        .set({ status: 'online', lastSeenAt: ts })
        .where(eq(devices.id, deviceId))
        .run();

      this.eventBus.emit({
        type: 'telemetry',
        deviceId,
        deviceKey: device.deviceKey,
        values,
        ts,
      });
    }

    return updatedByDevice.size;
  }

  /**
   * 构造下行控制指令的 MQTT Topic 与 Payload
   */
  buildCommandPayload(
    device: DeviceDTO,
    cap: DeviceCapabilityDTO,
    value: number | boolean | string,
  ): { topic: string; payload: string } {
    let wireValue: string | number | boolean = value;
    if (cap.type === 'boolean') {
      const boolVal =
        typeof value === 'boolean'
          ? value
          : value === 1 || value === '1' || String(value).toLowerCase() === 'on' || String(value).toLowerCase() === 'true';
      if (boolVal && cap.payloadOn !== null) {
        wireValue = cap.payloadOn;
      } else if (!boolVal && cap.payloadOff !== null) {
        wireValue = cap.payloadOff;
      } else {
        wireValue = boolVal;
      }
    }

    if (cap.commandTopic) {
      const payload = cap.commandTemplate
        ? cap.commandTemplate.replace(/\{\{\s*value\s*\}\}/g, String(wireValue))
        : String(wireValue);
      return { topic: cap.commandTopic, payload };
    }

    return {
      topic: `iothub/${device.deviceKey}/command`,
      payload: JSON.stringify({ [cap.key]: wireValue }),
    };
  }

  /**
   * 查询时序数据与聚合统计（带降采样，适合图表与 MCP）
   */
  queryTelemetry(
    deviceId: number,
    key: string,
    options: { from?: number; to?: number; maxPoints?: number } = {},
  ): TelemetryQueryResult | null {
    const device = this.db.select().from(devices).where(eq(devices.id, deviceId)).get();
    if (!device) return null;

    const conditions = [eq(telemetryPoints.deviceId, deviceId), eq(telemetryPoints.key, key)];
    if (options.from !== undefined) {
      conditions.push(gte(telemetryPoints.ts, options.from));
    }
    if (options.to !== undefined) {
      conditions.push(lte(telemetryPoints.ts, options.to));
    }

    const rows = this.db
      .select()
      .from(telemetryPoints)
      .where(and(...conditions))
      .orderBy(asc(telemetryPoints.ts))
      .all();

    let min: number | null = null;
    let max: number | null = null;
    let sum = 0;
    let numCount = 0;

    const allPoints: TelemetryPointDTO[] = rows.map((r) => {
      if (r.numValue !== null) {
        if (min === null || r.numValue < min) min = r.numValue;
        if (max === null || r.numValue > max) max = r.numValue;
        sum += r.numValue;
        numCount += 1;
        return { ts: r.ts, value: r.numValue };
      }
      return { ts: r.ts, value: r.strValue ?? '' };
    });

    const maxPoints = options.maxPoints ?? 200;
    const points = this.downsample(allPoints, maxPoints);
    const latest = allPoints.length > 0 ? (allPoints[allPoints.length - 1]?.value ?? null) : null;

    return {
      deviceKey: device.deviceKey,
      key,
      count: allPoints.length,
      min,
      max,
      avg: numCount > 0 ? Number((sum / numCount).toFixed(3)) : null,
      latest,
      points,
    };
  }

  recordAuditLog(entry: {
    actor: AuditActor;
    deviceId?: number | null;
    deviceKey?: string | null;
    action: string;
    payload: unknown;
    status: 'allowed' | 'denied' | 'pending' | 'error';
    reason?: string | null;
  }): AuditLogDTO {
    const inserted = this.db
      .insert(auditLogs)
      .values({
        actor: entry.actor,
        deviceId: entry.deviceId ?? null,
        deviceKey: entry.deviceKey ?? null,
        action: entry.action,
        payload: typeof entry.payload === 'string' ? entry.payload : JSON.stringify(entry.payload),
        status: entry.status,
        reason: entry.reason ?? null,
        createdAt: Date.now(),
      })
      .returning()
      .get();

    return {
      id: inserted.id,
      actor: inserted.actor as AuditActor,
      deviceId: inserted.deviceId,
      deviceKey: inserted.deviceKey,
      action: inserted.action,
      payload: inserted.payload,
      status: inserted.status as AuditLogDTO['status'],
      reason: inserted.reason,
      createdAt: inserted.createdAt,
    };
  }

  listAuditLogs(limit = 50): AuditLogDTO[] {
    return this.db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .all()
      .map((row) => ({
        id: row.id,
        actor: row.actor as AuditActor,
        deviceId: row.deviceId,
        deviceKey: row.deviceKey,
        action: row.action,
        payload: row.payload,
        status: row.status as AuditLogDTO['status'],
        reason: row.reason,
        createdAt: row.createdAt,
      }));
  }

  private recordValue(
    deviceId: number,
    capabilityId: number,
    key: string,
    val: number | boolean | string,
    ts: number,
  ): void {
    const numValue = typeof val === 'number' ? val : typeof val === 'boolean' ? (val ? 1 : 0) : null;
    const strValue = typeof val === 'string' ? val : null;

    this.db
      .insert(telemetryPoints)
      .values({ deviceId, key, numValue, strValue, ts })
      .run();

    this.db
      .update(deviceCapabilities)
      .set({ lastValue: JSON.stringify(val), lastUpdatedAt: ts })
      .where(eq(deviceCapabilities.id, capabilityId))
      .run();
  }

  private extractCapabilityKey(item: HaDiscoveryPayload): string {
    if (item.value_template) {
      const match = item.value_template.match(/value_json\.([a-zA-Z0-9_]+)/);
      if (match?.[1]) return match[1];
    }
    if (item.unique_id) {
      return this.sanitizeKey(item.unique_id);
    }
    return this.sanitizeKey(item.name ?? 'value');
  }

  private extractValueByTemplate(
    template: string | null,
    rawPayload: string,
    jsonObj: Record<string, unknown> | null,
  ): number | boolean | string | undefined {
    if (template && jsonObj) {
      const dotMatch = template.match(/value_json\.([a-zA-Z0-9_]+)/);
      if (dotMatch?.[1] && dotMatch[1] in jsonObj) {
        const v = jsonObj[dotMatch[1]];
        if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') {
          return v;
        }
      }
    }
    if (jsonObj === null) {
      const trimmed = rawPayload.trim();
      const asNum = Number(trimmed);
      if (trimmed !== '' && !Number.isNaN(asNum)) return asNum;
      return trimmed;
    }
    return undefined;
  }

  private inferType(val: number | boolean | string): CapabilityType {
    if (typeof val === 'boolean') return 'boolean';
    if (typeof val === 'number') return 'number';
    return 'string';
  }

  private sanitizeKey(raw: string): string {
    return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  private downsample(points: TelemetryPointDTO[], maxPoints: number): TelemetryPointDTO[] {
    if (points.length <= maxPoints || maxPoints <= 2) return points;
    const step = (points.length - 1) / (maxPoints - 1);
    const sampled: TelemetryPointDTO[] = [];
    for (let i = 0; i < maxPoints; i++) {
      const idx = Math.round(i * step);
      const pt = points[idx];
      if (pt) sampled.push(pt);
    }
    return sampled;
  }

  private mapDevice(
    row: typeof devices.$inferSelect,
    capabilities: DeviceCapabilityDTO[],
  ): DeviceDTO {
    return {
      id: row.id,
      deviceKey: row.deviceKey,
      token: row.token,
      name: row.name,
      description: row.description,
      protocol: row.protocol as DeviceProtocol,
      status: row.status as DeviceStatus,
      aiPolicy: row.aiPolicy as AiPolicy,
      lastSeenAt: row.lastSeenAt,
      createdAt: row.createdAt,
      capabilities,
    };
  }

  private mapCapability(row: typeof deviceCapabilities.$inferSelect): DeviceCapabilityDTO {
    return {
      id: row.id,
      deviceId: row.deviceId,
      key: row.key,
      name: row.name,
      description: row.description,
      type: row.type as CapabilityType,
      unit: row.unit,
      access: row.access as CapabilityAccess,
      stateTopic: row.stateTopic,
      commandTopic: row.commandTopic,
      valueTemplate: row.valueTemplate,
      commandTemplate: row.commandTemplate,
      payloadOn: row.payloadOn,
      payloadOff: row.payloadOff,
      aiAllowed: row.aiAllowed,
      lastValue: row.lastValue,
      lastUpdatedAt: row.lastUpdatedAt,
    };
  }
}
