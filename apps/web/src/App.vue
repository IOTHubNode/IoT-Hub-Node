<script setup lang="ts">
import { onMounted } from 'vue';
import { useHubStore } from './stores/hub';
import DashboardView from './views/DashboardView.vue';
import LoginView from './views/LoginView.vue';

const store = useHubStore();

onMounted(() => {
  void store.bootstrap();
});
</script>

<template>
  <div v-if="store.initialized === null" class="min-h-screen flex items-center justify-center bg-zinc-950 text-xs text-zinc-500">
    正在连接 IoT-Hub-Node...
  </div>
  <DashboardView v-else-if="store.user" />
  <LoginView v-else />
</template>
