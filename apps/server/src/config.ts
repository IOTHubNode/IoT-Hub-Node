import path from 'node:path';

export interface AppConfig {
  port: number;
  mqttPort: number;
  dataDir: string;
  dbPath: string;
  jwtSecret: string;
  webDistDir: string;
}

export function loadConfig(): AppConfig {
  const dataDir = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), 'data'));
  return {
    port: Number(process.env.PORT ?? 3000),
    mqttPort: Number(process.env.MQTT_PORT ?? 1883),
    dataDir,
    dbPath: process.env.DB_PATH ?? path.join(dataDir, 'iothub.db'),
    jwtSecret: process.env.JWT_SECRET ?? 'iothub-dev-secret-change-in-production',
    webDistDir: process.env.WEB_DIST_DIR ?? path.resolve(process.cwd(), '../web/dist'),
  };
}
