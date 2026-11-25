import type { Server as HttpServer } from 'node:http';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { startMqttBroker } from './broker/mqtt.broker.js';
import { loadConfig } from './config.js';
import { createDatabase } from './db/index.js';
import { AuthService } from './services/auth.service.js';
import { ControlService } from './services/control.service.js';
import { DeviceService } from './services/device.service.js';
import { HubEventBus } from './services/event-bus.js';
import { VirtualSimulatorService } from './services/simulator.service.js';
import { attachWebSocketHub } from './ws/ws.hub.js';

async function main() {
  const config = loadConfig();
  const dbHandle = createDatabase(config.dbPath);
  const eventBus = new HubEventBus();
  const authService = new AuthService(dbHandle.db, config.jwtSecret);
  const deviceService = new DeviceService(dbHandle.db, eventBus);

  const mqttBroker = await startMqttBroker({
    port: config.mqttPort,
    deviceService,
    eventBus,
  });

  const controlService = new ControlService(deviceService, mqttBroker.publishCommand);
  const simulatorService = new VirtualSimulatorService(deviceService);
  controlService.registerVirtualHandler((deviceKey, key, value) => {
    simulatorService.handleCommand(deviceKey, key, value);
  });

  const app = createApp({
    authService,
    deviceService,
    controlService,
    simulatorService,
    mqttPort: mqttBroker.port,
    webDistDir: config.webDistDir,
  });

  const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
    console.log(`[IoT-Hub-Node] HTTP & MCP Server listening on http://localhost:${info.port}`);
    console.log(`[IoT-Hub-Node] Embedded MQTT Broker listening on mqtt://localhost:${mqttBroker.port}`);
    console.log(`[IoT-Hub-Node] SQLite WAL ready at ${config.dbPath}`);
  }) as HttpServer;

  const wsHub = attachWebSocketHub({ server, eventBus, authService });

  const shutdown = async () => {
    simulatorService.stop();
    wsHub.close();
    await mqttBroker.close();
    server.close();
    dbHandle.close();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((err) => {
  console.error('[IoT-Hub-Node] Failed to start:', err);
  process.exit(1);
});
