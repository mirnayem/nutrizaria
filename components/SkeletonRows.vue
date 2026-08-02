<template>
  <div class="space-y-3" role="status" aria-label="Loading content">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div class="flex items-start gap-3">
        <div class="size-10 flex-shrink-0 rounded-full bg-slate-200"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-2/3 rounded bg-slate-200"></div>
          <div class="h-3 w-full rounded bg-slate-200"></div>
          <div class="h-3 w-1/2 rounded bg-slate-200"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 6 });
</script>
