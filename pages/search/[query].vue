<template>
  <div class="search-products">
    <Products v-if="store.products.length > 0" :products="store.products" />
    <div class="no-products text-center text-xl" v-else>Search for products (e.g. eggs, milk, potato)</div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from "~/stores/product";
import { onMounted } from "vue";
const store = useProductStore();
import { useRoute } from "vue-router";
const route = useRoute();
const term = route.params.query;

onMounted(() => {
  if (term) {
    store.searchProducts(term.toLocaleString());
  }
});
</script>
