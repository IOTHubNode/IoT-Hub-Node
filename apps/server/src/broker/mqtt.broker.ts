import net from 'node:net';
import Aedes from 'aedes';
import type { DeviceService } from '../services/device.service.js';
import type { HubEventBus } from '../services/event-bus.js';

export interface MqttBrokerHandle {
  aedes: Aedes;
  server: net.Server;
  port: number;
  publishCommand: (topic: string, payload: string) => Promise<void>;
  close: () => Promise<void>;
}

const TELEMETRY_TOPIC_RE = /^iothub\/([^/]+)\/telemetry$/;
const HA_DISCOVERY_RE = /^(?:homeassistant\/[^/]+\/(?:[^/]+\/)?[^/]+|iothub\/discovery\/[^/]+)\/config$/;

export async function startMqttBroker(options: {
  port: number;
  deviceService: DeviceService;
  eventBus: HubEventBus;
  allowAnonymous?: boolean;
}): Promise<MqttBrokerHandle> {
  const { port, deviceService, eventBus, allowAnonymous = true } = options;
  const aedes = new Aedes();

  aedes.authenticate = (client, username, password, callback) => {
    const userStr = username?.trim() ?? '';
    const passStr = password ? password.toString('utf8') : '';

    if (userStr) {
      const existing = deviceService.getDeviceByKey(userStr);
      if (existing) {
        if (existing.token === passStr) {
          return callback(null, true);
        }
        const err = Object.assign(new Error('设备 Token 鉴权失败'), { returnCode: 4 as const });
        return callback(err, false);
      }
    }

    if (allowAnonymous) {
      return callback(null, true);
    }

    const err = Object.assign(new Error('未授权的 MQTT 连接'), { returnCode: 4 as const });
    return callback(err, false);
  };

  aedes.on('clientReady', (client) => {
    const key = client.id;
    deviceService.setDeviceStatus(key, 'online');
  });

  aedes.on('clientDisconnect', (client) => {
    const key = client.id;
    deviceService.setDeviceStatus(key, 'offline');
  });

  aedes.on('publish', (packet, client) => {
    // 忽略 broker 内部系统主题和服务端自身下发的消息
    if (!client || packet.topic.startsWith('$SYS/')) return;

    const topic = packet.topic;
    const rawPayload = packet.payload.toString('utf8');

    eventBus.emit({
      type: 'mqtt_log',
      direction: 'in',
      topic,
      payload: rawPayload,
      clientId: client.id,
      ts: Date.now(),
    });

    if (HA_DISCOVERY_RE.test(topic)) {
      deviceService.handleHaDiscovery(topic, rawPayload);
      return;
    }

    const telemetryMatch = topic.match(TELEMETRY_TOPIC_RE);
    if (telemetryMatch?.[1]) {
      try {
        const parsed = JSON.parse(rawPayload);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          deviceService.ingestTelemetry(telemetryMatch[1], parsed as Record<string, unknown>);
        }
      } catch {
        // 忽略非法 JSON 上报，不崩溃 Broker
      }
      return;
    }

    deviceService.ingestByStateTopic(topic, rawPayload);
  });

  const server = net.createServer(aedes.handle);

  const boundPort = await new Promise<number>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      const addr = server.address();
      resolve(typeof addr === 'object' && addr ? addr.port : port);
    });
  });

  const publishCommand = (topic: string, payload: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      aedes.publish(
        {
          cmd: 'publish',
          qos: 0,
          dup: false,
          retain: false,
          topic,
          payload: Buffer.from(payload, 'utf8'),
        },
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          eventBus.emit({
            type: 'mqtt_log',
            direction: 'out',
            topic,
            payload,
            ts: Date.now(),
          });
          resolve();
        },
      );
    });
  };

  const close = async (): Promise<void> => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await new Promise<void>((resolve) => aedes.close(() => resolve()));
  };

  return { aedes, server, port: boundPort, publishCommand, close };
}
