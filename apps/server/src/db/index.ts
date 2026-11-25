import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export type AppDatabase = BetterSQLite3Database<typeof schema>;

export interface DatabaseHandle {
  sqlite: Database.Database;
  db: AppDatabase;
  close: () => void;
}

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_key TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  protocol TEXT NOT NULL DEFAULT 'mqtt',
  status TEXT NOT NULL DEFAULT 'offline',
  ai_policy TEXT NOT NULL DEFAULT 'readonly',
  last_seen_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS device_capabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'number',
  unit TEXT NOT NULL DEFAULT '',
  access TEXT NOT NULL DEFAULT 'ro',
  state_topic TEXT,
  command_topic TEXT,
  value_template TEXT,
  command_template TEXT,
  payload_on TEXT,
  payload_off TEXT,
  ai_allowed INTEGER NOT NULL DEFAULT 0,
  last_value TEXT,
  last_updated_at INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_cap_unique ON device_capabilities(device_id, key);

CREATE TABLE IF NOT EXISTS telemetry_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  num_value REAL,
  str_value TEXT,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_key_ts ON telemetry_points(device_id, key, ts);

CREATE TABLE IF NOT EXISTS automation_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  trigger_json TEXT NOT NULL,
  action_json TEXT NOT NULL,
  cooldown_sec INTEGER NOT NULL DEFAULT 60,
  last_triggered_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  device_id INTEGER,
  device_key TEXT,
  action TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
`;

export function createDatabase(dbPath: string): DatabaseHandle {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(INIT_SQL);

  const db = drizzle(sqlite, { schema });
  return {
    sqlite,
    db,
    close: () => sqlite.close(),
  };
}
