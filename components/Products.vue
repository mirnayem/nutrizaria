<template>
  <div class="products grid grid-cols-3 gap-8">
    <SingleProduct
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>
</template>
<script setup>
import { products } from "../store/data";
</script>
<style scoped></style>
