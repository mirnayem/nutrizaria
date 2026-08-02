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
      v-if="shouldPaginate && visibleProducts.length < safeProducts.length"
      ref="loadMoreTrigger"
      class="flex items-center justify-center py-6"
    >
      <p v-if="loading" class="spinner"></p>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center"
  >
    <div class="flex size-14 items-center justify-center rounded-full bg-slate-100">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-7 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </div>
    <p class="mt-4 text-base font-semibold text-slate-800">No products found</p>
    <p class="mt-1 max-w-sm text-sm text-slate-500">
      No products match your search. Try a different keyword or check back soon.
    </p>
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
    columns?: 2 | 3 | 4;
    maxTwoPerRow?: boolean;
  }>(),
  {
    paginate: false,
    pageSize: 12,
    columns: 4,
    maxTwoPerRow: false,
  }
);

const loading = ref(false);
const visibleProducts = ref<Product[]>([]);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const safeProducts = computed<Product[]>(() => props.products ?? []);
const shouldPaginate = computed(() => props.paginate);
const pageSize = computed(() => Math.max(1, props.pageSize));

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
  [safeProducts, shouldPaginate, pageSize, gridClass],
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
  @apply h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-500;
}
</style>
