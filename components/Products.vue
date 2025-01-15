<template>
  <div
    :class="[
      'products grid md:gap-8 gap-3 grid-cols-2',
      route.path !== '/shop'
        ? 'lg:grid-cols-4 md:grid-cols-3'
        : 'lg:grid-cols-3 md:grid-cols-2',
    ]"
    v-if="visibleProducts && visibleProducts.length > 0"
  >
    <SingleProduct
      v-for="product in visibleProducts"
      :key="product.id"
      :product="product"
    />
  </div>
  <div
    ref="loadMoreTrigger"
    class="loading min-h-32 flex items-center justify-center"
  >
    <p
      class="spinner"
      v-if="loading && visibleProducts.length < products.length"
    ></p>
  </div>
</template>
<script setup lang="ts">
const props = defineProps(["products"]);
import { useRoute } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { Product } from "~/types/product";

const loading = ref<boolean>(false);
const visibleProducts = ref<Product[]>([]);
const itemsPerPage = 8;
const route = useRoute();

const loadMoreItems = () => {
  const offset = visibleProducts.value.length;
  const limit = itemsPerPage;

  const nextItems: Product[] = props.products.slice(offset, offset + limit);
  visibleProducts.value.push(...nextItems);
  loading.value = false;
};

let observer: IntersectionObserver | null = null;
const loadMoreTrigger = ref(null);
const setupObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      loading.value = true;
      if (entries[0].isIntersecting) {
        loadMoreItems();
      }
    },
    {
      root: null,
      threshold: 0.9,
    }
  );
  if (loadMoreTrigger && loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
};

onMounted(async () => {
  loadMoreItems();
  setupObserver();
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>
<style scoped>
.spinner {
  @apply w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin;
}
</style>
