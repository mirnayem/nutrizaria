<template>
  <div class="search-products">
    <Products v-if="results.length" :products="results" />
    <div class="no-products text-center text-xl text-slate-500" v-else>
      Search for products (e.g. eggs, milk, potato)
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "~/stores/product";

const route = useRoute();
const productStore = useProductStore();
const { products: results } = storeToRefs(productStore);

const executeSearch = (term?: string | string[]) => {
  if (!term || typeof term !== "string") return;
  productStore.searchProducts(term);
};

onMounted(() => {
  executeSearch(route.params.query);
});

watch(
  () => route.params.query,
  (value) => {
    executeSearch(value);
  }
);
</script>
