<script setup lang="ts">
import type { TelemetryPointDTO } from '@iothub/shared';
import * as echarts from 'echarts';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  points: TelemetryPointDTO[];
  label: string;
  unit?: string;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let instance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function renderChart() {
  if (!instance) return;
  const xData = props.points.map((p) => {
    const d = new Date(p.ts);
    return d.toLocaleTimeString('zh-CN', { hour12: false });
  });
  const yData = props.points.map((p) => (typeof p.value === 'number' ? p.value : Number(p.value) || 0));

  instance.setOption({
    backgroundColor: 'transparent',
    grid: { top: 20, right: 16, bottom: 28, left: 46 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      textStyle: { color: '#f4f4f5', fontSize: 12 },
      valueFormatter: (v: unknown) => `${v}${props.unit ? ` ${props.unit}` : ''}`,
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: '#27272a' } },
      axisLabel: { color: '#71717a', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: { lineStyle: { color: '#27272a', type: 'dashed' } },
      axisLabel: { color: '#71717a', fontSize: 11 },
    },
    series: [
      {
        name: props.label,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: yData,
        lineStyle: { color: '#10b981', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.28)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.01)' },
          ]),
        },
      },
    ],
  });
}

onMounted(() => {
  if (!chartEl.value) return;
  instance = echarts.init(chartEl.value);
  renderChart();
  resizeObserver = new ResizeObserver(() => instance?.resize());
  resizeObserver.observe(chartEl.value);
});

watch(
  () => [props.points, props.label, props.unit],
  () => renderChart(),
  { deep: true },
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  instance?.dispose();
});
</script>

<template>
  <div ref="chartEl" class="w-full h-56" />
</template>
