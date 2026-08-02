<template>
  <main class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Search results
        </h1>
        <p v-if="query" class="mt-1 text-sm text-slate-500">
          {{ resultCount }} {{ resultCount === 1 ? "product" : "products" }} for
          “{{ query }}”
        </p>
      </div>
      <NuxtLink
        to="/shop"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
      >
        Browse all products
      </NuxtLink>
    </div>

    <SkeletonProductGrid v-if="isLoading" :count="8" :columns="4" />

    <Products v-else-if="results.length" :products="results" :paginate="true" :page-size="12" :columns="4" />

    <div
      v-else
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center"
    >
      <div class="flex size-14 items-center justify-center rounded-full bg-slate-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-7 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <p class="mt-4 text-base font-semibold text-slate-800">
        {{ query ? "No products found" : "Search for products" }}
      </p>
      <p class="mt-1 max-w-sm text-sm text-slate-500">
        {{
          query
            ? `Nothing matched “${query}”. Try a different keyword or check back soon.`
            : "Try searching for products like eggs, milk, potato, or dates."
        }}
      </p>
      <NuxtLink
        to="/shop"
        class="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
      >
        Explore the shop
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useProductStore } from "~/stores/product";
import { useCatalogStore } from "~/stores/catalog";

const route = useRoute();
const productStore = useProductStore();
const catalogStore = useCatalogStore();
await catalogStore.hydrate();
const { products: results } = storeToRefs(productStore);

const isSearching = ref(true);

const query = computed(() => String(route.params.query ?? ""));

useSeo({
  title: () => (query.value ? `Search: ${query.value}` : "Search"),
  noindex: true,
});

const resultCount = computed(() => results.value.length);

const isLoading = computed(
  () => isSearching.value || (catalogStore.loading && !catalogStore.hydrated)
);

const executeSearch = (term?: string | string[]) => {
  if (!term || typeof term !== "string") return;
  isSearching.value = true;
  try {
    productStore.searchProducts(term);
  } finally {
    isSearching.value = false;
  }
};

onMounted(() => {
  executeSearch(route.params.query);
});

watch(
  () => route.params.query,
  (value) => {
    executeSearch(value);
  }
);
</script>
