<template>
  <div
    :class="['products grid sm:grid-cols-2 gap-8', $route.path === '/' ? 'md:grid-cols-4': 'md:grid-cols-3']"
    v-if="products && products.length > 0"
  >
    <SingleProduct
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>
</template>
<script setup lang="ts">
import { products } from "../stores/data";
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
<style scoped></style>
