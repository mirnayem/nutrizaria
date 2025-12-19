<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

const catalog = useCatalogStore();
catalog.hydrate();
const { products, categories } = storeToRefs(catalog);

const groupedProducts = computed(() => {
  const productList = products.value ?? [];
  const categoryList = categories.value ?? [];
  return categoryList
    .map((category) => {
      const items = productList.filter(
        (product) => product.category === category.slug
      );
      return {
        category,
        items: items.slice(0, 8),
      };
    })
    .filter((group) => group.items.length);
});
</script>

<template>
  <main class="space-y-10  sm:space-y-12 ">
    <section
      v-for="group in groupedProducts"
      :key="group.category.id"
      class="space-y-4 rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm sm:p-7"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600"
          >
            {{ group.category.name }} collection
          </p>
          <h2 class="text-2xl font-semibold text-slate-900">
            Fresh picks in {{ group.category.name }}
          </h2>
          <p class="text-sm text-slate-500">
            Showing {{ group.items.length }} curated products ready to ship.
          </p>
        </div>
        <NuxtLink
          :to="`/categories/${group.category.slug}`"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
        >
          View category
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m9 5 7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <SingleProduct
          v-for="product in group.items"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>
  </main>
</template>
