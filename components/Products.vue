<template>
  <div v-if="visibleProducts.length" class="space-y-6">
    <div
      :class="[
        'grid grid-cols-2 gap-4 sm:gap-6',
        route.path !== '/shop'
          ? 'md:grid-cols-3 lg:grid-cols-4'
          : 'md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4',
      ]"
    >
      <SingleProduct
        v-for="product in visibleProducts"
        :key="product.id"
        :product="product"
      />
    </div>
    <div ref="loadMoreTrigger" class="flex items-center justify-center py-4">
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
import { useRoute } from "vue-router";
import type { Product } from "~/types/product";

const props = defineProps<{
  products: Product[];
}>();

const route = useRoute();
const itemsPerPage = 8;
const loading = ref(false);
const visibleProducts = ref<Product[]>([]);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const safeProducts = computed<Product[]>(() => props.products ?? []);

const loadMoreItems = () => {
  if (!safeProducts.value.length) {
    visibleProducts.value = [];
    loading.value = false;
    return;
  }
  const offset = visibleProducts.value.length;
  const nextItems = safeProducts.value.slice(offset, offset + itemsPerPage);
  if (nextItems.length) {
    visibleProducts.value = [...visibleProducts.value, ...nextItems];
  }
  loading.value = false;
};

let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  if (observer) {
    observer.disconnect();
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      loading.value = true;
      loadMoreItems();
    },
    { threshold: 0.25 }
  );
  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
};

const resetProducts = () => {
  visibleProducts.value = [];
  loadMoreItems();
};

onMounted(() => {
  resetProducts();
  setupObserver();
});

watch(
  safeProducts,
  () => {
    resetProducts();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.spinner {
  @apply h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-violet-500;
}
</style>
