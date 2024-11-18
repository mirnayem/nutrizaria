<template>
  <div class="search-products">
    <Products :products="store.products" />
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from "~/stores/product";
const store = useProductStore();

</script>
