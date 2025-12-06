<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

const catalog = useCatalogStore();
catalog.hydrate();
const { products } = storeToRefs(catalog);
</script>

<template>
  <main>
    <section class="main-content grid grid-cols-12 gap-8">
      <div
        class="products-section col-span-12"
        aria-labelledby="products-query"
      >
        <!-- <div class="banner-section">
          <HeroBanner />
        </div> -->
      </div>
    </section>
    <header class="favorite-categories w-full mx-auto mb-10">
      <h1
        class="favorite-categories__title md:text-4xl text-lg font-light text-center mt-10 mb-6"
      >
        Favorite Categories
      </h1>
      <section aria-labelledby="favorite-categories-heading">
        <h2 id="favorite-categories-heading" class="sr-only">
          Featured Categories
        </h2>
        <FeaturedCategories />
      </section>
    </header>

    <section class="main-content grid grid-cols-12 gap-8">
      <div
        class="products-section col-span-12"
        aria-labelledby="products-heading"
      >
        <h2
          id="products-heading"
          class="text-center md:text-4xl text-lg font-light my-10"
        >
          Featured Products
        </h2>
        <Products :products="products" />
      </div>
    </section>
  </main>
</template>
