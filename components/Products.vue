<template>
  <div v-if="visibleProducts.length" class="space-y-6">
    <div :class="gridClass">
      <SingleProduct
        v-for="product in visibleProducts"
        :key="product.id"
        :product="product"
      />
    </div>
    <div
      v-if="shouldPaginate"
      ref="loadMoreTrigger"
      class="flex items-center justify-center py-4"
    >
      <p
        class="spinner"
        v-if="loading && visibleProducts.length < safeProducts.length"
      ></p>
    </div>
  </div>
  <div
    v-else
    class="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500"
  >
    No products match your filters. Try searching for a different keyword.
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { Product } from "~/types/product";

const props = withDefaults(
  defineProps<{
    products: Product[];
    paginate?: boolean;
    pageSize?: number;
    maxTwoPerRow?: boolean;
  }>(),
  {
    paginate: false,
    pageSize: 12,
    maxTwoPerRow: false,
  }
);

const loading = ref(false);
const visibleProducts = ref<Product[]>([]);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const safeProducts = computed<Product[]>(() => props.products ?? []);
const shouldPaginate = computed(() => props.paginate);
const pageSize = computed(() => Math.max(1, props.pageSize));
const gridClass = computed(() =>
  props.maxTwoPerRow
    ? "grid grid-cols-2 gap-1 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 lg:gap-8"
    : "grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-6 lg:grid-cols-3 lg:gap-8"
);

const loadMoreItems = () => {
  if (!shouldPaginate.value) return;
  if (!safeProducts.value.length) {
    visibleProducts.value = [];
    loading.value = false;
    return;
  }
  const offset = visibleProducts.value.length;
  const nextItems = safeProducts.value.slice(offset, offset + pageSize.value);
  if (nextItems.length) {
    visibleProducts.value = [...visibleProducts.value, ...nextItems];
  }
  loading.value = false;
};

let observer: IntersectionObserver | null = null;

const teardownObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

const setupObserver = () => {
  teardownObserver();
  if (!shouldPaginate.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      loading.value = true;
      loadMoreItems();
    },
    { threshold: 0.1, rootMargin: "200px" }
  );
  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
};

const resetProducts = () => {
  loading.value = false;
  if (!safeProducts.value.length) {
    visibleProducts.value = [];
    return;
  }
  if (shouldPaginate.value) {
    visibleProducts.value = [];
    loadMoreItems();
  } else {
    visibleProducts.value = [...safeProducts.value];
  }
};

onMounted(() => {
  resetProducts();
  setupObserver();
});

watch(
  [safeProducts, shouldPaginate, pageSize],
  () => {
    resetProducts();
    setupObserver();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  teardownObserver();
});
</script>

<style scoped>
.spinner {
  @apply h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-violet-500;
}
</style>
