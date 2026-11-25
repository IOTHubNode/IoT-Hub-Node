import { z } from 'zod';

export const AiPolicySchema = z.enum(['readonly', 'allow', 'confirm']);
export type AiPolicy = z.infer<typeof AiPolicySchema>;

export const DeviceStatusSchema = z.enum(['online', 'offline']);
export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;

export const DeviceProtocolSchema = z.enum(['mqtt', 'http', 'ha_discovery', 'virtual']);
export type DeviceProtocol = z.infer<typeof DeviceProtocolSchema>;

export const CapabilityTypeSchema = z.enum(['number', 'boolean', 'string']);
export type CapabilityType = z.infer<typeof CapabilityTypeSchema>;

export const CapabilityAccessSchema = z.enum(['ro', 'rw']);
export type CapabilityAccess = z.infer<typeof CapabilityAccessSchema>;

export const AuditActorSchema = z.enum(['human', 'ai', 'rule', 'system']);
export type AuditActor = z.infer<typeof AuditActorSchema>;

export const CreateDeviceSchema = z.object({
  deviceKey: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'deviceKey 仅允许字母、数字、下划线和短横线')
    .optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(''),
  protocol: DeviceProtocolSchema.default('mqtt'),
  aiPolicy: AiPolicySchema.default('readonly'),
});
export type CreateDeviceInput = z.infer<typeof CreateDeviceSchema>;

export const UpdateDeviceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  aiPolicy: AiPolicySchema.optional(),
});
export type UpdateDeviceInput = z.infer<typeof UpdateDeviceSchema>;

export const UpdateCapabilitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  unit: z.string().max(32).optional(),
  access: CapabilityAccessSchema.optional(),
  aiAllowed: z.boolean().optional(),
  description: z.string().max(300).optional(),
});
export type UpdateCapabilityInput = z.infer<typeof UpdateCapabilitySchema>;

export const ControlDeviceSchema = z.object({
  key: z.string().min(1).max(64),
  value: z.union([z.number(), z.boolean(), z.string()]),
});
export type ControlDeviceInput = z.infer<typeof ControlDeviceSchema>;

export interface DeviceCapabilityDTO {
  id: number;
  deviceId: number;
  key: string;
  name: string;
  description: string;
  type: CapabilityType;
  unit: string;
  access: CapabilityAccess;
  stateTopic: string | null;
  commandTopic: string | null;
  valueTemplate: string | null;
  commandTemplate: string | null;
  payloadOn: string | null;
  payloadOff: string | null;
  aiAllowed: boolean;
  lastValue: string | null;
  lastUpdatedAt: number | null;
}

export interface DeviceDTO {
  id: number;
  deviceKey: string;
  token: string;
  name: string;
  description: string;
  protocol: DeviceProtocol;
  status: DeviceStatus;
  aiPolicy: AiPolicy;
  lastSeenAt: number | null;
  createdAt: number;
  capabilities: DeviceCapabilityDTO[];
}

export interface TelemetryPointDTO {
  ts: number;
  value: number | string | boolean;
}

export interface AuditLogDTO {
  id: number;
  actor: AuditActor;
  deviceId: number | null;
  deviceKey: string | null;
  action: string;
  payload: string;
  status: 'allowed' | 'denied' | 'pending' | 'error';
  reason: string | null;
  createdAt: number;
}

export type WsMessage =
  | {
      type: 'telemetry';
      deviceId: number;
      deviceKey: string;
      values: Record<string, number | boolean | string>;
      ts: number;
    }
  | {
      type: 'status';
      deviceId: number;
      deviceKey: string;
      status: DeviceStatus;
      ts: number;
    }
  | {
      type: 'device_discovered';
      device: DeviceDTO;
      ts: number;
    }
  | {
      type: 'mqtt_log';
      direction: 'in' | 'out';
      topic: string;
      payload: string;
      clientId?: string;
      ts: number;
    };
