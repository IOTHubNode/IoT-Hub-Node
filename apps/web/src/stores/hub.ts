import type { AuditLogDTO, DeviceDTO, WsMessage } from '@iothub/shared';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api, getStoredToken, setStoredToken, type AuthUserDTO } from '../lib/api';

export interface MqttLogItem {
  id: number;
  direction: 'in' | 'out';
  topic: string;
  payload: string;
  clientId?: string;
  ts: number;
}

export const useHubStore = defineStore('hub', () => {
  const initialized = ref<boolean | null>(null);
  const user = ref<AuthUserDTO | null>(null);
  const devices = ref<DeviceDTO[]>([]);
  const auditLogs = ref<AuditLogDTO[]>([]);
  const simulatorRunning = ref(false);
  const wsConnected = ref(false);
  const mqttLogs = ref<MqttLogItem[]>([]);

  let ws: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let logSeq = 0;

  async function bootstrap() {
    const status = await api.authStatus();
    initialized.value = status.initialized;

    const token = getStoredToken();
    if (status.initialized && token) {
      try {
        const { user: me } = await api.me();
        user.value = me;
        await loadAll();
        connectWs();
      } catch {
        setStoredToken('');
        user.value = null;
      }
    }
  }

  async function setup(username: string, password: string) {
    const res = await api.setup(username, password);
    setStoredToken(res.token);
    initialized.value = true;
    user.value = res.user;
    await loadAll();
    connectWs();
  }

  async function login(username: string, password: string) {
    const res = await api.login(username, password);
    setStoredToken(res.token);
    user.value = res.user;
    await loadAll();
    connectWs();
  }

  function logout() {
    disconnectWs();
    setStoredToken('');
    user.value = null;
    devices.value = [];
    auditLogs.value = [];
  }

  async function loadAll() {
    const [devRes, simRes, logRes] = await Promise.all([
      api.listDevices(),
      api.simulatorStatus(),
      api.listAuditLogs(50),
    ]);
    devices.value = devRes.devices;
    simulatorRunning.value = simRes.running;
    auditLogs.value = logRes.logs;
  }

  async function refreshDevices() {
    const res = await api.listDevices();
    devices.value = res.devices;
  }

  async function refreshAuditLogs() {
    const res = await api.listAuditLogs(50);
    auditLogs.value = res.logs;
  }

  async function toggleSimulator() {
    if (simulatorRunning.value) {
      await api.stopSimulator();
      simulatorRunning.value = false;
    } else {
      await api.startSimulator();
      simulatorRunning.value = true;
    }
    await refreshDevices();
  }

  async function rotateApiKey() {
    const { apiKey } = await api.rotateApiKey();
    if (user.value) {
      user.value = { ...user.value, apiKey };
    }
  }

  function connectWs() {
    disconnectWs();
    const token = getStoredToken();
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      wsConnected.value = true;
    };

    ws.onclose = () => {
      wsConnected.value = false;
      if (user.value) {
        reconnectTimer = window.setTimeout(() => connectWs(), 3000);
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as WsMessage;
        handleWsMessage(msg);
      } catch {
        // ignore invalid frames
      }
    };
  }

  function disconnectWs() {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
    wsConnected.value = false;
  }

  function handleWsMessage(msg: WsMessage) {
    if (msg.type === 'mqtt_log') {
      mqttLogs.value.unshift({
        id: ++logSeq,
        direction: msg.direction,
        topic: msg.topic,
        payload: msg.payload,
        clientId: msg.clientId,
        ts: msg.ts,
      });
      if (mqttLogs.value.length > 100) {
        mqttLogs.value.length = 100;
      }
      return;
    }

    if (msg.type === 'device_discovered') {
      const idx = devices.value.findIndex((d) => d.id === msg.device.id);
      if (idx >= 0) {
        devices.value[idx] = msg.device;
      } else {
        devices.value.unshift(msg.device);
      }
      return;
    }

    if (msg.type === 'status') {
      const dev = devices.value.find((d) => d.id === msg.deviceId);
      if (dev) {
        dev.status = msg.status;
        dev.lastSeenAt = msg.ts;
      }
      return;
    }

    if (msg.type === 'telemetry') {
      const dev = devices.value.find((d) => d.id === msg.deviceId);
      if (!dev) {
        void refreshDevices();
        return;
      }
      dev.status = 'online';
      dev.lastSeenAt = msg.ts;
      let hasNewKey = false;
      for (const [k, val] of Object.entries(msg.values)) {
        const cap = dev.capabilities.find((c) => c.key === k);
        if (cap) {
          cap.lastValue = JSON.stringify(val);
          cap.lastUpdatedAt = msg.ts;
        } else {
          hasNewKey = true;
        }
      }
      if (hasNewKey) {
        void refreshDevices();
      }
    }
  }

  function clearMqttLogs() {
    mqttLogs.value = [];
  }

  return {
    initialized,
    user,
    devices,
    auditLogs,
    simulatorRunning,
    wsConnected,
    mqttLogs,
    bootstrap,
    setup,
    login,
    logout,
    loadAll,
    refreshDevices,
    refreshAuditLogs,
    toggleSimulator,
    rotateApiKey,
    clearMqttLogs,
  };
});
