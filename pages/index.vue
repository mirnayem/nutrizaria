<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

const catalog = useCatalogStore();
catalog.hydrate();
const { products } = storeToRefs(catalog);
</script>

<template>
  <main class="space-y-16 mt-10">
    <section aria-labelledby="favorite-categories-heading" class="space-y-6">
      <div class="text-center space-y-2">
        <p
          class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600"
        >
          Curated by nutritionists
        </p>
        <h2
          id="favorite-categories-heading"
          class="text-3xl font-light text-slate-900"
        >
          Favorite Categories
        </h2>
        <p class="text-sm text-slate-500">
          Daily essentials, seasonal harvests, and artisanal pantry picks for
          every household.
        </p>
      </div>
      <FeaturedCategories />
    </section>

    <section aria-labelledby="products-heading" class="space-y-6">
      <div class="text-center space-y-2">
        <h2 id="products-heading" class="text-3xl font-light text-slate-900">
          Featured Products
        </h2>
        <p class="text-sm text-slate-500">
          Shop the most-loved products carefully sourced from organic partner
          farms.
        </p>
      </div>
      <Products :products="products" />
    </section>
  </main>
</template>
