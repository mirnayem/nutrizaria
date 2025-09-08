<script setup>
definePageMeta({
  title: "My Website Title",
  meta: [
    {
      name: "description",
      content: "A brief description of the page content.",
    },
  ],
});

import { products } from "../stores/data";
</script>
<template>
  <div class="grid grid-cols-12">
    <div class="products-section col-span-12">
      <Products :products="products" />
    </div>
  </div>
</template>
