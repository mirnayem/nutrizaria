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
  <div class="mt-8 grid grid-cols-12 sm:mt-10 lg:mt-12">
    <div class="products-section col-span-12">
      <Products :products="products" />
    </div>
  </div>
</template>
