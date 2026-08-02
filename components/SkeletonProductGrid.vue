<template>
  <div :class="gridClass" role="status" aria-label="Loading products">
    <SkeletonProductCard v-for="i in count" :key="i" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    count?: number;
    columns?: 2 | 3 | 4;
    maxTwoPerRow?: boolean;
  }>(),
  {
    count: 8,
    columns: 4,
    maxTwoPerRow: false,
  }
);

const gridClass = computed(() => {
  const cols = props.maxTwoPerRow ? 2 : props.columns;
  switch (cols) {
    case 2:
      return "grid grid-cols-2 gap-3 sm:gap-5";
    case 3:
      return "grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3";
    case 4:
    default:
      return "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4";
  }
});
</script>
