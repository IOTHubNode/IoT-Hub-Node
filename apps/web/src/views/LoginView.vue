<script setup lang="ts">
import { Cpu } from 'lucide-vue-next';
import { ref } from 'vue';
import { useHubStore } from '../stores/hub';

const store = useHubStore();
const username = ref('admin');
const password = ref('');
const error = ref('');
const submitting = ref(false);

async function onSubmit() {
  error.value = '';
  submitting.value = true;
  try {
    if (store.initialized) {
      await store.login(username.value, password.value);
    } else {
      await store.setup(username.value, password.value);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
    <div class="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-6">
      <div class="space-y-1.5">
        <div class="inline-flex items-center gap-2 text-emerald-400 text-xs font-medium">
          <Cpu class="w-4 h-4" /> IoT-Hub-Node v2
        </div>
        <h1 class="text-xl font-semibold text-zinc-100">
          {{ store.initialized ? '登录控制台' : '初始化管理员账号' }}
        </h1>
        <p class="text-xs text-zinc-400">
          {{
            store.initialized
              ? '输入管理员凭据进入轻量 AI-Native 物联网工作台'
              : '首次启动零配置初始化，所有数据保存在本地 SQLite 单文件'
          }}
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-xs text-zinc-400 mb-1">用户名</label>
          <input
            v-model="username"
            required
            class="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block text-xs text-zinc-400 mb-1">密码（至少 6 位）</label>
          <input
            v-model="password"
            type="password"
            minlength="6"
            required
            class="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <p v-if="error" class="text-xs text-red-400">{{ error }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition disabled:opacity-50"
        >
          {{ submitting ? '处理中...' : store.initialized ? '登录' : '完成初始化并进入' }}
        </button>
      </form>
    </div>
  </main>
</template>
