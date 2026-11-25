import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  apiKey: text('api_key').notNull().unique(),
  createdAt: integer('created_at').notNull(),
});

export const devices = sqliteTable('devices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deviceKey: text('device_key').notNull().unique(),
  token: text('token').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  protocol: text('protocol').notNull().default('mqtt'),
  status: text('status').notNull().default('offline'),
  aiPolicy: text('ai_policy').notNull().default('readonly'),
  lastSeenAt: integer('last_seen_at'),
  createdAt: integer('created_at').notNull(),
});

export const deviceCapabilities = sqliteTable(
  'device_capabilities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    deviceId: integer('device_id')
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    type: text('type').notNull().default('number'),
    unit: text('unit').notNull().default(''),
    access: text('access').notNull().default('ro'),
    stateTopic: text('state_topic'),
    commandTopic: text('command_topic'),
    valueTemplate: text('value_template'),
    commandTemplate: text('command_template'),
    payloadOn: text('payload_on'),
    payloadOff: text('payload_off'),
    aiAllowed: integer('ai_allowed', { mode: 'boolean' }).notNull().default(false),
    lastValue: text('last_value'),
    lastUpdatedAt: integer('last_updated_at'),
  },
  (table) => [uniqueIndex('idx_device_cap_unique').on(table.deviceId, table.key)],
);

export const telemetryPoints = sqliteTable(
  'telemetry_points',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    deviceId: integer('device_id')
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    numValue: real('num_value'),
    strValue: text('str_value'),
    ts: integer('ts').notNull(),
  },
  (table) => [index('idx_telemetry_device_key_ts').on(table.deviceId, table.key, table.ts)],
);

export const automationRules = sqliteTable('automation_rules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  triggerJson: text('trigger_json').notNull(),
  actionJson: text('action_json').notNull(),
  cooldownSec: integer('cooldown_sec').notNull().default(60),
  lastTriggeredAt: integer('last_triggered_at'),
  createdAt: integer('created_at').notNull(),
});

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    actor: text('actor').notNull(),
    deviceId: integer('device_id'),
    deviceKey: text('device_key'),
    action: text('action').notNull(),
    payload: text('payload').notNull(),
    status: text('status').notNull(),
    reason: text('reason'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('idx_audit_created_at').on(table.createdAt)],
);
