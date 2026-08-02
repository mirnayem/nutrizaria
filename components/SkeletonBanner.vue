<template>
  <div
    :class="[
      'animate-pulse rounded-3xl bg-slate-200',
      height === 'lg' ? 'h-56 sm:h-72' : 'h-40 sm:h-52',
    ]"
    role="status"
    aria-label="Loading banner"
  ></div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ height?: "md" | "lg" }>(), { height: "md" });
</script>
