<script setup lang="ts">
import type { AiPolicy, DeviceCapabilityDTO, DeviceDTO } from '@iothub/shared';
import { Check, Code2, Copy, LineChart, Settings2, Trash2, X } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { api, type TelemetryResponse } from '../lib/api';
import TelemetryChart from './TelemetryChart.vue';

const props = defineProps<{
  device: DeviceDTO;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated'): void;
  (e: 'deleted'): void;
}>();

const tab = ref<'telemetry' | 'config' | 'code'>('telemetry');
const selectedKey = ref<string>('');
const minutes = ref<number>(60);
const telemetry = ref<TelemetryResponse | null>(null);
const loadingChart = ref(false);

const editName = ref('');
const editDesc = ref('');
const editPolicy = ref<AiPolicy>('readonly');
const savingDevice = ref(false);

const codeLang = ref<'curl' | 'arduino' | 'micropython' | 'mqtt'>('curl');
const copied = ref(false);

const numericCaps = computed(() =>
  props.device.capabilities.filter((c) => c.type === 'number' || c.type === 'boolean'),
);

watch(
  () => props.device,
  (dev) => {
    editName.value = dev.name;
    editDesc.value = dev.description;
    editPolicy.value = dev.aiPolicy;
    if (!selectedKey.value || !dev.capabilities.some((c) => c.key === selectedKey.value)) {
      selectedKey.value = dev.capabilities[0]?.key ?? '';
    }
  },
  { immediate: true },
);

async function loadTelemetry() {
  if (!selectedKey.value) {
    telemetry.value = null;
    return;
  }
  loadingChart.value = true;
  try {
    telemetry.value = await api.queryTelemetry(props.device.id, selectedKey.value, minutes.value);
  } finally {
    loadingChart.value = false;
  }
}

watch([selectedKey, minutes, () => props.device.lastSeenAt], () => {
  if (tab.value === 'telemetry') {
    void loadTelemetry();
  }
}, { immediate: true });

async function saveDeviceMeta() {
  savingDevice.value = true;
  try {
    await api.updateDevice(props.device.id, {
      name: editName.value,
      description: editDesc.value,
      aiPolicy: editPolicy.value,
    });
    emit('updated');
  } finally {
    savingDevice.value = false;
  }
}

async function saveCap(cap: DeviceCapabilityDTO, patch: Partial<DeviceCapabilityDTO>) {
  await api.updateCapability(props.device.id, cap.key, {
    name: patch.name,
    unit: patch.unit,
    access: patch.access,
    aiAllowed: patch.aiAllowed,
    description: patch.description,
  });
  emit('updated');
}

async function handleDelete() {
  if (!window.confirm(`确定删除设备「${props.device.name}」及其历史数据吗？`)) return;
  await api.deleteDevice(props.device.id);
  emit('deleted');
}

async function toggleSwitch(cap: DeviceCapabilityDTO) {
  const cur = cap.lastValue === 'true' || cap.lastValue === '1';
  await api.controlDevice(props.device.id, cap.key, !cur);
  emit('updated');
}

const activeCap = computed(() => props.device.capabilities.find((c) => c.key === selectedKey.value));

const snippet = computed(() => {
  const host = window.location.hostname || 'localhost';
  const origin = window.location.origin;
  const key = props.device.deviceKey;
  const token = props.device.token;

  if (codeLang.value === 'curl') {
    return `# 1. 极简 HTTP JSON 上报（首次上报自动推断字段并画曲线）
curl -X POST "${origin}/api/ingest/${key}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{"temp": 26.5, "humi": 58}'`;
  }
  if (codeLang.value === 'mqtt') {
    return `# MQTT 上报示例（内置 Broker 端口 1883）
mosquitto_pub -h ${host} -p 1883 \\
  -u "${key}" -P "${token}" \\
  -t "iothub/${key}/telemetry" \\
  -m '{"temp": 26.5, "humi": 58}'

# 订阅下行控制指令
mosquitto_sub -h ${host} -p 1883 \\
  -u "${key}" -P "${token}" \\
  -t "iothub/${key}/command"`;
  }
  if (codeLang.value === 'micropython') {
    return `import ujson, time
from umqtt.simple import MQTTClient

client = MQTTClient("${key}", "${host}", port=1883, user="${key}", password="${token}")
client.connect()

while True:
    payload = ujson.dumps({"temp": 26.5, "humi": 58})
    client.publish("iothub/${key}/telemetry", payload)
    time.sleep(5)`;
  }
  return `// ESP32 Arduino (PubSubClient) 示例
#include <WiFi.h>
#include <PubSubClient.h>

const char* MQTT_HOST = "${host}";
const char* DEVICE_KEY = "${key}";
const char* DEVICE_TOKEN = "${token}";

void publishTelemetry(PubSubClient& mqtt, float temp, float humi) {
  String payload = "{\\"temp\\":" + String(temp, 1) + ",\\"humi\\":" + String(humi, 1) + "}";
  mqtt.publish("iothub/${key}/telemetry", payload.c_str());
}`;
});

async function copySnippet() {
  await navigator.clipboard.writeText(snippet.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs" @click.self="emit('close')">
    <div class="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-100">{{ props.device.name }}</h2>
          <p class="text-xs text-zinc-500 font-mono">{{ props.device.deviceKey }}</p>
        </div>
        <button
          type="button"
          class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="px-6 pt-3 border-b border-zinc-800 flex gap-4 text-sm">
        <button
          type="button"
          class="pb-2.5 inline-flex items-center gap-1.5 border-b-2 transition"
          :class="tab === 'telemetry' ? 'border-emerald-400 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'"
          @click="tab = 'telemetry'"
        >
          <LineChart class="w-4 h-4" /> 实时与曲线
        </button>
        <button
          type="button"
          class="pb-2.5 inline-flex items-center gap-1.5 border-b-2 transition"
          :class="tab === 'config' ? 'border-emerald-400 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'"
          @click="tab = 'config'"
        >
          <Settings2 class="w-4 h-4" /> 语义与 AI 护栏
        </button>
        <button
          type="button"
          class="pb-2.5 inline-flex items-center gap-1.5 border-b-2 transition"
          :class="tab === 'code' ? 'border-emerald-400 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'"
          @click="tab = 'code'"
        >
          <Code2 class="w-4 h-4" /> 一键接入代码
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Tab 1: Telemetry -->
        <template v-if="tab === 'telemetry'">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
              v-for="cap in props.device.capabilities"
              :key="cap.key"
              class="rounded-lg border p-3 transition cursor-pointer"
              :class="selectedKey === cap.key ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'"
              @click="selectedKey = cap.key"
            >
              <div class="text-xs text-zinc-400 truncate">{{ cap.name }}</div>
              <div class="mt-1 flex items-center justify-between">
                <span class="text-base font-semibold tabular-nums">
                  {{ cap.lastValue ? JSON.parse(cap.lastValue) : '--' }}
                  <span v-if="cap.unit" class="text-xs font-normal text-zinc-500">{{ cap.unit }}</span>
                </span>
                <button
                  v-if="cap.access === 'rw' && cap.type === 'boolean'"
                  type="button"
                  class="text-xs px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  @click.stop="toggleSwitch(cap)"
                >
                  切换
                </button>
              </div>
            </div>
          </div>

          <div v-if="numericCaps.length > 0" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm font-medium text-zinc-200">
                {{ activeCap?.name ?? selectedKey }} 历史趋势
              </div>
              <div class="flex items-center gap-1.5 text-xs">
                <button
                  v-for="m in [15, 60, 360, 1440]"
                  :key="m"
                  type="button"
                  class="px-2 py-1 rounded-md transition"
                  :class="minutes === m ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'"
                  @click="minutes = m"
                >
                  {{ m < 60 ? `${m}m` : `${m / 60}h` }}
                </button>
              </div>
            </div>

            <div v-if="telemetry" class="grid grid-cols-4 gap-2 text-xs">
              <div class="rounded bg-zinc-950/70 px-2.5 py-1.5">
                <div class="text-zinc-500">样本数</div>
                <div class="font-semibold mt-0.5">{{ telemetry.count }}</div>
              </div>
              <div class="rounded bg-zinc-950/70 px-2.5 py-1.5">
                <div class="text-zinc-500">均值</div>
                <div class="font-semibold mt-0.5">{{ telemetry.avg ?? '--' }}</div>
              </div>
              <div class="rounded bg-zinc-950/70 px-2.5 py-1.5">
                <div class="text-zinc-500">最小</div>
                <div class="font-semibold mt-0.5">{{ telemetry.min ?? '--' }}</div>
              </div>
              <div class="rounded bg-zinc-950/70 px-2.5 py-1.5">
                <div class="text-zinc-500">最大</div>
                <div class="font-semibold mt-0.5">{{ telemetry.max ?? '--' }}</div>
              </div>
            </div>

            <TelemetryChart
              v-if="telemetry && telemetry.points.length > 0"
              :points="telemetry.points"
              :label="activeCap?.name ?? selectedKey"
              :unit="activeCap?.unit"
            />
            <div v-else class="h-44 flex items-center justify-center text-xs text-zinc-500">
              {{ loadingChart ? '加载曲线中...' : '当前时间范围内暂无历史数据' }}
            </div>
          </div>
        </template>

        <!-- Tab 2: Config & AI Guardrails -->
        <template v-else-if="tab === 'config'">
          <div class="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h3 class="text-sm font-medium text-zinc-200">基础信息与 AI 安全护栏</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-zinc-400 mb-1">设备名称</label>
                <input
                  v-model="editName"
                  class="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label class="block text-xs text-zinc-400 mb-1">AI 语义描述（供 MCP 大模型理解设备用途）</label>
                <textarea
                  v-model="editDesc"
                  rows="2"
                  class="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label class="block text-xs text-zinc-400 mb-1">AI 控制安全策略</label>
                <select
                  v-model="editPolicy"
                  class="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="readonly">readonly · 仅允许 AI 读取数据（默认最安全）</option>
                  <option value="allow">allow · 允许 AI 直接控制已授权的可写能力</option>
                  <option value="confirm">confirm · 需人工二次确认后下发</option>
                </select>
              </div>
              <div class="flex items-center justify-between pt-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
                  @click="handleDelete"
                >
                  <Trash2 class="w-3.5 h-3.5" /> 删除设备
                </button>
                <button
                  type="button"
                  :disabled="savingDevice"
                  class="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold disabled:opacity-50"
                  @click="saveDeviceMeta"
                >
                  {{ savingDevice ? '保存中...' : '保存配置' }}
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-medium text-zinc-200">能力字段语义配置</h3>
            <div
              v-for="cap in props.device.capabilities"
              :key="cap.key"
              class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 grid grid-cols-12 gap-2 items-center text-xs"
            >
              <div class="col-span-3 font-mono text-zinc-400 truncate">{{ cap.key }}</div>
              <input
                :value="cap.name"
                placeholder="中文名"
                class="col-span-4 rounded bg-zinc-950 border border-zinc-800 px-2 py-1 text-zinc-100"
                @change="saveCap(cap, { name: ($event.target as HTMLInputElement).value })"
              />
              <input
                :value="cap.unit"
                placeholder="单位"
                class="col-span-2 rounded bg-zinc-950 border border-zinc-800 px-2 py-1 text-zinc-100"
                @change="saveCap(cap, { unit: ($event.target as HTMLInputElement).value })"
              />
              <select
                :value="cap.access"
                class="col-span-2 rounded bg-zinc-950 border border-zinc-800 px-1.5 py-1 text-zinc-100"
                @change="saveCap(cap, { access: ($event.target as HTMLSelectElement).value as 'ro' | 'rw' })"
              >
                <option value="ro">只读</option>
                <option value="rw">可控</option>
              </select>
              <label class="col-span-1 flex justify-end items-center" title="允许 AI 控制">
                <input
                  type="checkbox"
                  :checked="cap.aiAllowed"
                  class="accent-emerald-500"
                  @change="saveCap(cap, { aiAllowed: ($event.target as HTMLInputElement).checked })"
                />
              </label>
            </div>
          </div>
        </template>

        <!-- Tab 3: Code Snippets -->
        <template v-else>
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <div class="text-zinc-400">
                Token: <code class="text-emerald-400 font-mono">{{ props.device.token }}</code>
              </div>
              <div class="flex gap-1.5">
                <button
                  v-for="lang in (['curl', 'mqtt', 'arduino', 'micropython'] as const)"
                  :key="lang"
                  type="button"
                  class="px-2.5 py-1 rounded-md uppercase"
                  :class="codeLang === lang ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'"
                  @click="codeLang = lang"
                >
                  {{ lang }}
                </button>
              </div>
            </div>

            <div class="relative">
              <pre class="rounded-lg bg-zinc-950 border border-zinc-800 p-4 text-xs text-zinc-200 overflow-x-auto leading-relaxed">{{ snippet }}</pre>
              <button
                type="button"
                class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200"
                @click="copySnippet"
              >
                <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-400" />
                <Copy v-else class="w-3.5 h-3.5" />
                {{ copied ? '已复制' : '复制' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
