<script setup lang="ts">
import { products } from "../stores/data";
</script>

<template>
  <main>
    <section class="main-content grid grid-cols-12 gap-8">
      <aside
        class="categories lg:col-span-3 col-span-12"
        aria-labelledby="categories-heading"
      >
        <h2 id="categories-heading" class="sr-only">Categories</h2>
        <Categories />
      </aside>

      <div
        class="products-section lg:col-span-9 col-span-12"
        aria-labelledby="products-query"
      >
        <div class="banner-section">
          <HeroBanner />
        </div>
      </div>
    </section>
    <header class="favorite-categories w-full mx-auto mb-10">
      <h1
        class="favorite-categories__title text-4xl font-light text-center mt-20 mb-6"
      >
        Favorite Categories
      </h1>
      <!-- Featured Categories Component -->
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
        <h2 id="products-heading" class="text-center text-4xl font-light my-10">
          Featured Products
        </h2>
        <Products :products="products"/>
      </div>
    </section>
  </main>
</template>
