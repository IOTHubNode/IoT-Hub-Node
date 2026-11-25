import type {
  AuditLogDTO,
  CreateDeviceInput,
  DeviceCapabilityDTO,
  DeviceDTO,
  TelemetryPointDTO,
  UpdateCapabilityInput,
  UpdateDeviceInput,
} from '@iothub/shared';

export interface AuthUserDTO {
  id: number;
  username: string;
  apiKey: string;
  createdAt: number;
}

export interface TelemetryResponse {
  deviceKey: string;
  key: string;
  count: number;
  min: number | null;
  max: number | null;
  avg: number | null;
  latest: number | string | boolean | null;
  points: TelemetryPointDTO[];
}

const TOKEN_KEY = 'iothub_session_token';

export function getStoredToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setStoredToken(token: string): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `请求失败 (${res.status})`);
  }
  return data;
}

export const api = {
  authStatus: () => request<{ initialized: boolean }>('/api/auth/status'),
  setup: (username: string, password: string) =>
    request<{ token: string; user: AuthUserDTO }>('/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<{ token: string; user: AuthUserDTO }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<{ user: AuthUserDTO }>('/api/auth/me'),
  rotateApiKey: () => request<{ apiKey: string }>('/api/auth/rotate-key', { method: 'POST' }),

  listDevices: () => request<{ devices: DeviceDTO[] }>('/api/devices'),
  createDevice: (input: CreateDeviceInput) =>
    request<{ device: DeviceDTO }>('/api/devices', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateDevice: (id: number, input: UpdateDeviceInput) =>
    request<{ device: DeviceDTO }>(`/api/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteDevice: (id: number) =>
    request<{ ok: boolean }>(`/api/devices/${id}`, { method: 'DELETE' }),
  updateCapability: (deviceId: number, key: string, input: UpdateCapabilityInput) =>
    request<{ capability: DeviceCapabilityDTO }>(
      `/api/devices/${deviceId}/capabilities/${encodeURIComponent(key)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    ),
  queryTelemetry: (deviceId: number, key: string, minutes = 60) => {
    const now = Date.now();
    const from = now - minutes * 60 * 1000;
    return request<TelemetryResponse>(
      `/api/devices/${deviceId}/telemetry/${encodeURIComponent(key)}?from=${from}&to=${now}&maxPoints=120`,
    );
  },
  controlDevice: (deviceId: number, key: string, value: number | boolean | string) =>
    request<{ ok: boolean; status: string; message: string }>(`/api/devices/${deviceId}/control`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    }),

  listAuditLogs: (limit = 50) => request<{ logs: AuditLogDTO[] }>(`/api/audit-logs?limit=${limit}`),
  simulatorStatus: () => request<{ running: boolean }>('/api/simulator/status'),
  startSimulator: () => request<{ running: boolean; devices: string[] }>('/api/simulator/start', { method: 'POST' }),
  stopSimulator: () => request<{ running: boolean }>('/api/simulator/stop', { method: 'POST' }),
};
