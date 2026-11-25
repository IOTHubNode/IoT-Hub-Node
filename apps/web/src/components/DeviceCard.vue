<script setup lang="ts">
import type { DeviceCapabilityDTO, DeviceDTO } from '@iothub/shared';
import { Cpu, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-vue-next';

const props = defineProps<{
  device: DeviceDTO;
}>();

const emit = defineEmits<{
  (e: 'select', device: DeviceDTO): void;
  (e: 'toggle', deviceId: number, key: string, nextVal: boolean): void;
}>();

function parseVal(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function isTruthy(cap: DeviceCapabilityDTO): boolean {
  const v = parseVal(cap.lastValue);
  return v === true || v === 1 || v === '1' || v === 'ON';
}

function protocolLabel(protocol: string): string {
  switch (protocol) {
    case 'ha_discovery':
      return 'HA 自动发现';
    case 'virtual':
      return '虚拟设备';
    case 'http':
      return 'HTTP';
    default:
      return 'MQTT';
  }
}
</script>

<template>
  <div
    class="group rounded-xl border border-zinc-800/90 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900/90 transition p-4 flex flex-col gap-4 cursor-pointer"
    @click="emit('select', props.device)"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span
            class="inline-block w-2 h-2 rounded-full shrink-0"
            :class="props.device.status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-zinc-600'"
          />
          <h3 class="text-sm font-semibold text-zinc-100 truncate">{{ props.device.name }}</h3>
        </div>
        <p class="text-xs text-zinc-500 font-mono mt-0.5 truncate">{{ props.device.deviceKey }}</p>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <span class="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
          {{ protocolLabel(props.device.protocol) }}
        </span>
        <span
          class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md"
          :class="
            props.device.aiPolicy === 'allow'
              ? 'bg-emerald-500/15 text-emerald-400'
              : props.device.aiPolicy === 'confirm'
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-zinc-800 text-zinc-400'
          "
          :title="`AI 护栏策略: ${props.device.aiPolicy}`"
        >
          <ShieldCheck v-if="props.device.aiPolicy === 'allow'" class="w-3 h-3" />
          <ShieldAlert v-else-if="props.device.aiPolicy === 'confirm'" class="w-3 h-3" />
          <ShieldOff v-else class="w-3 h-3" />
          {{
            props.device.aiPolicy === 'allow'
              ? 'AI 可控'
              : props.device.aiPolicy === 'confirm'
                ? '需确认'
                : 'AI 只读'
          }}
        </span>
      </div>
    </div>

    <div v-if="props.device.capabilities.length === 0" class="py-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
      <Cpu class="w-4 h-4 mx-auto mb-1 opacity-50" />
      等待设备首次上报（自动推断字段）
    </div>

    <div v-else class="grid grid-cols-2 gap-2">
      <div
        v-for="cap in props.device.capabilities.slice(0, 6)"
        :key="cap.key"
        class="rounded-lg bg-zinc-950/70 border border-zinc-800/80 px-3 py-2 flex items-center justify-between gap-2"
      >
        <div class="min-w-0">
          <div class="text-[11px] text-zinc-400 truncate">{{ cap.name }}</div>
          <div v-if="cap.access !== 'rw' || cap.type !== 'boolean'" class="text-sm font-semibold text-zinc-100 mt-0.5 tabular-nums">
            {{ parseVal(cap.lastValue) ?? '--' }}
            <span v-if="cap.unit" class="text-xs font-normal text-zinc-500">{{ cap.unit }}</span>
          </div>
          <div v-else class="text-xs font-medium mt-0.5" :class="isTruthy(cap) ? 'text-emerald-400' : 'text-zinc-500'">
            {{ isTruthy(cap) ? '已开启' : '已关闭' }}
          </div>
        </div>

        <button
          v-if="cap.access === 'rw' && cap.type === 'boolean'"
          type="button"
          class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
          :class="isTruthy(cap) ? 'bg-emerald-500' : 'bg-zinc-700'"
          @click.stop="emit('toggle', props.device.id, cap.key, !isTruthy(cap))"
        >
          <span
            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
            :class="isTruthy(cap) ? 'translate-x-4.5' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>
  </div>
</template>
