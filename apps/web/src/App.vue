<script setup lang="ts">
import { onMounted, ref } from 'vue';

const status = ref<'checking' | 'ok' | 'error'>('checking');

onMounted(async () => {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      status.value = 'ok';
    } else {
      status.value = 'error';
    }
  } catch {
    status.value = 'error';
  }
});
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-md w-full rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-3">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-semibold tracking-tight">IoT-Hub-Node v2</h1>
        <span
          class="text-xs px-2 py-0.5 rounded-full"
          :class="
            status === 'ok'
              ? 'bg-emerald-500/15 text-emerald-400'
              : status === 'error'
                ? 'bg-red-500/15 text-red-400'
                : 'bg-zinc-800 text-zinc-400'
          "
        >
          {{ status === 'ok' ? '服务在线' : status === 'error' ? '未连接' : '检查中...' }}
        </span>
      </div>
      <p class="text-sm text-zinc-400">
        极致轻量、10 秒零依赖启动、AI-Native（原生内置 MCP 与安全护栏）的开源物联网中枢。
      </p>
    </div>
  </main>
</template>
