<script setup lang="ts">
import type { AiPolicy, DeviceDTO } from '@iothub/shared';
import {
  Activity,
  Bot,
  Check,
  Copy,
  Cpu,
  LogOut,
  Play,
  Plus,
  RefreshCw,
  Square,
  Terminal,
  Trash2,
} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import DeviceCard from '../components/DeviceCard.vue';
import DeviceDetailDrawer from '../components/DeviceDetailDrawer.vue';
import { api } from '../lib/api';
import { useHubStore } from '../stores/hub';

const store = useHubStore();
const activeTab = ref<'devices' | 'mcp' | 'logs'>('devices');
const selectedDeviceId = ref<number | null>(null);

const showCreateModal = ref(false);
const newName = ref('');
const newKey = ref('');
const newDesc = ref('');
const newPolicy = ref<AiPolicy>('readonly');
const createError = ref('');

const logFilter = ref('');
const copiedMcp = ref(false);

const selectedDevice = computed(
  () => store.devices.find((d) => d.id === selectedDeviceId.value) ?? null,
);

const onlineCount = computed(() => store.devices.filter((d) => d.status === 'online').length);

const filteredLogs = computed(() => {
  const q = logFilter.value.trim().toLowerCase();
  if (!q) return store.mqttLogs;
  return store.mqttLogs.filter(
    (l) => l.topic.toLowerCase().includes(q) || l.payload.toLowerCase().includes(q),
  );
});

const mcpConfigJson = computed(() => {
  const origin = window.location.origin;
  const apiKey = store.user?.apiKey ?? '<YOUR_API_KEY>';
  return JSON.stringify(
    {
      mcpServers: {
        'iot-hub-node': {
          url: `${origin}/mcp`,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      },
    },
    null,
    2,
  );
});

async function handleToggle(deviceId: number, key: string, nextVal: boolean) {
  await api.controlDevice(deviceId, key, nextVal);
  await store.refreshAuditLogs();
}

async function handleCreateDevice() {
  createError.value = '';
  try {
    await api.createDevice({
      name: newName.value,
      deviceKey: newKey.value.trim() || undefined,
      description: newDesc.value,
      protocol: 'mqtt',
      aiPolicy: newPolicy.value,
    });
    newName.value = '';
    newKey.value = '';
    newDesc.value = '';
    showCreateModal.value = false;
    await store.refreshDevices();
  } catch (err) {
    createError.value = err instanceof Error ? err.message : '创建失败';
  }
}

async function quickChangePolicy(device: DeviceDTO, policy: AiPolicy) {
  await api.updateDevice(device.id, { aiPolicy: policy });
  await store.refreshDevices();
}

async function copyMcpConfig() {
  await navigator.clipboard.writeText(mcpConfigJson.value);
  copiedMcp.value = true;
  setTimeout(() => {
    copiedMcp.value = false;
  }, 1500);
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
    <!-- Top Bar -->
    <header class="h-14 border-b border-zinc-800/90 px-4 sm:px-6 flex items-center justify-between gap-4 bg-zinc-950/90 sticky top-0 z-30 backdrop-blur-sm">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 font-semibold text-sm tracking-tight">
          <Cpu class="w-4 h-4 text-emerald-400" />
          <span>IoT-Hub-Node</span>
          <span class="text-[11px] font-normal px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">v0.1</span>
        </div>

        <nav class="flex items-center gap-1 text-xs">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition"
            :class="activeTab === 'devices' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'"
            @click="activeTab = 'devices'"
          >
            <Activity class="w-3.5 h-3.5" /> 设备概览
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition"
            :class="activeTab === 'mcp' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'"
            @click="
              activeTab = 'mcp';
              store.refreshAuditLogs();
            "
          >
            <Bot class="w-3.5 h-3.5" /> AI 与 MCP
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition"
            :class="activeTab === 'logs' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'"
            @click="activeTab = 'logs'"
          >
            <Terminal class="w-3.5 h-3.5" /> 报文调试
          </button>
        </nav>
      </div>

      <div class="flex items-center gap-2.5 text-xs">
        <span
          class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="store.wsConnected ? 'bg-emerald-400' : 'bg-amber-400'"
          />
          {{ store.wsConnected ? '实时推流已连接' : '重连中' }}
        </span>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition"
          :class="
            store.simulatorRunning
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
          "
          @click="store.toggleSimulator()"
        >
          <Square v-if="store.simulatorRunning" class="w-3 h-3 fill-current" />
          <Play v-else class="w-3 h-3 fill-current" />
          {{ store.simulatorRunning ? '停止虚拟设备' : '启动虚拟设备' }}
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold transition"
          @click="showCreateModal = true"
        >
          <Plus class="w-3.5 h-3.5" /> 新建设备
        </button>

        <button
          type="button"
          class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          title="退出登录"
          @click="store.logout()"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
      <!-- Tab 1: Devices -->
      <template v-if="activeTab === 'devices'">
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div class="text-xs text-zinc-400">已纳管设备</div>
            <div class="text-2xl font-semibold mt-1 tabular-nums">{{ store.devices.length }}</div>
          </div>
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div class="text-xs text-zinc-400">当前在线</div>
            <div class="text-2xl font-semibold mt-1 text-emerald-400 tabular-nums">{{ onlineCount }}</div>
          </div>
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div class="text-xs text-zinc-400">允许 AI 控制</div>
            <div class="text-2xl font-semibold mt-1 text-cyan-400 tabular-nums">
              {{ store.devices.filter((d) => d.aiPolicy === 'allow').length }}
            </div>
          </div>
        </div>

        <div
          v-if="store.devices.length === 0"
          class="rounded-2xl border border-dashed border-zinc-800 p-12 text-center space-y-3"
        >
          <Cpu class="w-8 h-8 mx-auto text-zinc-600" />
          <h2 class="text-base font-medium text-zinc-200">还没有接入设备</h2>
          <p class="text-xs text-zinc-400 max-w-md mx-auto">
            点击右上角「启动虚拟设备」即可 10 秒体验实时传感器曲线、四路继电器控制与 AI MCP 联调；也可以新建设备或直接发送 Home Assistant MQTT Discovery 报文自动发现。
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DeviceCard
            v-for="dev in store.devices"
            :key="dev.id"
            :device="dev"
            @select="(d) => (selectedDeviceId = d.id)"
            @toggle="handleToggle"
          />
        </div>
      </template>

      <!-- Tab 2: AI & MCP -->
      <template v-else-if="activeTab === 'mcp'">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-zinc-100">原生 MCP Server 配置（Streamable HTTP）</h2>
                <p class="text-xs text-zinc-400 mt-0.5">复制到 Claude Desktop / Cursor / Antigravity 即可让 AI 安全读写硬件</p>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                @click="store.rotateApiKey()"
              >
                <RefreshCw class="w-3 h-3" /> 轮换 Token
              </button>
            </div>

            <div class="relative">
              <pre class="rounded-lg bg-zinc-950 border border-zinc-800 p-4 text-xs text-emerald-300 overflow-x-auto leading-relaxed">{{ mcpConfigJson }}</pre>
              <button
                type="button"
                class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200"
                @click="copyMcpConfig"
              >
                <Check v-if="copiedMcp" class="w-3.5 h-3.5 text-emerald-400" />
                <Copy v-else class="w-3.5 h-3.5" />
                {{ copiedMcp ? '已复制' : '复制配置' }}
              </button>
            </div>
          </div>

          <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <h2 class="text-sm font-semibold text-zinc-100">物理世界安全护栏策略</h2>
            <p class="text-xs text-zinc-400">按设备控制 AI 调用 `control_device` 的权限级别</p>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="dev in store.devices"
                :key="dev.id"
                class="flex items-center justify-between gap-2 rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 text-xs"
              >
                <div class="min-w-0">
                  <div class="font-medium text-zinc-200 truncate">{{ dev.name }}</div>
                  <div class="text-zinc-500 font-mono truncate">{{ dev.deviceKey }}</div>
                </div>
                <select
                  :value="dev.aiPolicy"
                  class="rounded bg-zinc-900 border border-zinc-700 px-2 py-1 text-zinc-200"
                  @change="quickChangePolicy(dev, ($event.target as HTMLSelectElement).value as AiPolicy)"
                >
                  <option value="readonly">只读 (readonly)</option>
                  <option value="allow">允许 AI (allow)</option>
                  <option value="confirm">需确认 (confirm)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-zinc-100">控制与 AI 审计日志</h2>
            <button
              type="button"
              class="text-xs text-zinc-400 hover:text-zinc-200"
              @click="store.refreshAuditLogs()"
            >
              刷新
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th class="py-2 pr-3">时间</th>
                  <th class="py-2 pr-3">发起方</th>
                  <th class="py-2 pr-3">设备</th>
                  <th class="py-2 pr-3">动作</th>
                  <th class="py-2 pr-3">结果</th>
                  <th class="py-2">说明 / 负载</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800/60">
                <tr v-for="log in store.auditLogs" :key="log.id">
                  <td class="py-2 pr-3 text-zinc-500 whitespace-nowrap">
                    {{ new Date(log.createdAt).toLocaleTimeString('zh-CN', { hour12: false }) }}
                  </td>
                  <td class="py-2 pr-3">
                    <span
                      class="px-1.5 py-0.5 rounded uppercase text-[10px]"
                      :class="log.actor === 'ai' ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-800 text-zinc-300'"
                    >
                      {{ log.actor }}
                    </span>
                  </td>
                  <td class="py-2 pr-3 font-mono text-zinc-300">{{ log.deviceKey ?? '-' }}</td>
                  <td class="py-2 pr-3 font-mono text-zinc-300">{{ log.action }}</td>
                  <td class="py-2 pr-3">
                    <span
                      :class="
                        log.status === 'allowed'
                          ? 'text-emerald-400'
                          : log.status === 'pending'
                            ? 'text-amber-400'
                            : 'text-red-400'
                      "
                    >
                      {{ log.status }}
                    </span>
                  </td>
                  <td class="py-2 text-zinc-400 truncate max-w-xs">{{ log.reason ?? log.payload }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- Tab 3: Live MQTT Logs -->
      <template v-else>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
          <div class="flex items-center justify-between gap-3">
            <input
              v-model="logFilter"
              placeholder="按 Topic 或 Payload 关键字过滤..."
              class="flex-1 max-w-md rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
              @click="store.clearMqttLogs()"
            >
              <Trash2 class="w-3.5 h-3.5" /> 清空
            </button>
          </div>

          <div class="space-y-1.5 font-mono text-xs max-h-[65vh] overflow-y-auto">
            <div v-if="filteredLogs.length === 0" class="py-12 text-center text-zinc-500">
              等待 MQTT 收发报文...（内嵌 Broker 监听端口 1883）
            </div>
            <div
              v-for="item in filteredLogs"
              :key="item.id"
              class="rounded-lg bg-zinc-950/80 border border-zinc-800/80 px-3 py-2 flex items-start gap-3"
            >
              <span class="text-zinc-500 shrink-0">
                {{ new Date(item.ts).toLocaleTimeString('zh-CN', { hour12: false }) }}
              </span>
              <span
                class="px-1.5 py-0.5 rounded text-[10px] uppercase shrink-0"
                :class="item.direction === 'in' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-emerald-500/15 text-emerald-400'"
              >
                {{ item.direction }}
              </span>
              <span class="text-zinc-200 shrink-0">{{ item.topic }}</span>
              <span class="text-zinc-400 break-all">{{ item.payload }}</span>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Device Detail Drawer -->
    <DeviceDetailDrawer
      v-if="selectedDevice"
      :device="selectedDevice"
      @close="selectedDeviceId = null"
      @updated="store.refreshDevices()"
      @deleted="
        selectedDeviceId = null;
        store.refreshDevices();
      "
    />

    <!-- Create Device Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="showCreateModal = false"
    >
      <div class="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
        <h2 class="text-base font-semibold">新建设备</h2>
        <form class="space-y-3" @submit.prevent="handleCreateDevice">
          <div>
            <label class="block text-xs text-zinc-400 mb-1">设备名称 *</label>
            <input
              v-model="newName"
              required
              placeholder="例如：实验室温湿度节点"
              class="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">deviceKey（留空自动生成）</label>
            <input
              v-model="newKey"
              placeholder="例如：lab_env_01"
              class="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm font-mono text-zinc-100"
            />
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">AI 语义描述</label>
            <input
              v-model="newDesc"
              placeholder="描述设备位置与用途，方便 AI 理解"
              class="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">AI 安全护栏策略</label>
            <select
              v-model="newPolicy"
              class="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="readonly">只读 (readonly)</option>
              <option value="allow">允许 AI 控制 (allow)</option>
              <option value="confirm">需人工确认 (confirm)</option>
            </select>
          </div>

          <p v-if="createError" class="text-xs text-red-400">{{ createError }}</p>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-900"
              @click="showCreateModal = false"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
