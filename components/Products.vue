<template>
  <div
    :class="['products grid sm:grid-cols-2 gap-8', $route.path !== '/shop' ? 'md:grid-cols-4': 'md:grid-cols-3']"
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
defineProps(['products'])
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
<style scoped></style>
