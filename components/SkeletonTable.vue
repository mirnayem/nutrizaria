<template>
  <div
    class="overflow-hidden rounded-xl border border-slate-200 bg-white"
    role="status"
    aria-label="Loading table"
  >
    <div class="flex animate-pulse items-center gap-6 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <div
        v-for="i in columns"
        :key="`h-${i}`"
        class="h-3 rounded bg-slate-200"
        :class="i === columns ? 'ml-auto w-20' : 'w-24'"
      ></div>
    </div>
    <div
      v-for="row in rows"
      :key="row"
      class="flex animate-pulse items-center gap-6 border-b border-slate-100 px-4 py-4 last:border-b-0"
    >
      <div
        v-for="i in columns"
        :key="`c-${i}`"
        class="rounded bg-slate-200"
        :class="i === columns ? 'ml-auto h-4 w-12' : 'h-4 w-24'"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rows?: number; columns?: number }>(), {
  rows: 5,
  columns: 6,
});
</script>
