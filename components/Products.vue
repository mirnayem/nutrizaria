<template>
  <div class="products grid md:grid-cols-3 sm:grid-cols-2 gap-8 ">
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
