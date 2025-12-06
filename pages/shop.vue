<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

definePageMeta({
  title: "NutriZaria Shop",
  meta: [
    {
      name: "description",
      content: "Browse the full NutriZaria catalog.",
    },
  ],
});

const catalog = useCatalogStore();
catalog.hydrate();
const { products } = storeToRefs(catalog);
</script>
<template>
  <div class="grid grid-cols-12">
    <div class="products-section col-span-12">
      <Products :products="products" />
    </div>
  </div>
</template>
