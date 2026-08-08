<script setup lang="ts">
import { computed } from "vue";
import { useCatalogStore } from "~/stores/catalog";

useSeo({
  title: "Featured Products - NutriZaria",
  description:
    "Browse hand-picked featured products at NutriZaria — pure, natural and ready to enjoy.",
  image: "/nutri.png",
  type: "website",
});

const catalog = useCatalogStore();
await catalog.hydrate();

const featuredProducts = computed(() => catalog.featuredProducts);
</script>

<template>
  <main class="min-h-screen bg-slate-50 py-6 sm:py-10">
    <div class="mx-auto max-w-[1600px] px-4 sm:px-6">
      <nav class="mb-5 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
        <NuxtLink to="/" class="transition hover:text-violet-600">Home</NuxtLink>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-3.5 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span class="font-medium text-slate-700">Featured Products</span>
      </nav>

      <section class="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 sm:p-8">
        <h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">
          <span class="mr-1 text-amber-500">★</span> Featured Products
        </h1>
        <p class="mt-2 text-sm text-slate-600 sm:text-base">
          {{ featuredProducts.length }} hand-picked product{{ featuredProducts.length === 1 ? "" : "s" }} curated for you.
        </p>
      </section>

      <div v-if="featuredProducts.length" class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        <SingleProduct
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
        />
      </div>

      <div
        v-else
        class="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"
      >
        <p class="text-lg font-semibold text-slate-800">No featured products yet</p>
        <p class="mt-1 text-sm text-slate-500">
          Check back soon for hand-picked picks.
        </p>
        <NuxtLink
          to="/shop"
          class="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Browse All Products
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
