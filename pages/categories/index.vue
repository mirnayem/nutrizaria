<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

const catalog = useCatalogStore();
await catalog.hydrate();
const { categories, products } = storeToRefs(catalog);

useSeo({
  title: "All Categories - NutriZaria",
  description: "Browse all product categories at NutriZaria.",
});

const { resolve } = useImageUrl();

const categoryCounts = computed(() => {
  const all = products.value ?? [];
  return categories.value.map((cat) => ({
    ...cat,
    count: all.filter((p) => p.category === cat.slug).length,
  }));
});
</script>

<template>
  <main class="space-y-6">
    <section class="rounded-xl border border-slate-100 bg-white px-4 py-6 shadow-sm">
      <h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">All Categories</h1>
      <p class="mt-1 text-sm text-slate-500">
        Browse our full range of natural food categories.
      </p>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <NuxtLink
        v-for="cat in categoryCounts"
        :key="cat.id"
        :to="`/categories/${cat.slug}`"
        class="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-violet-200 hover:shadow-md"
      >
        <div class="aspect-[4/3] overflow-hidden bg-slate-50">
          <img
            :src="resolve(cat.image)"
            :alt="cat.name"
            loading="lazy"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div class="p-4">
          <h2 class="text-base font-semibold text-slate-900 group-hover:text-violet-700">
            {{ cat.name }}
          </h2>
          <p class="mt-0.5 text-xs text-slate-500">
            {{ cat.count }} {{ cat.count === 1 ? 'product' : 'products' }}
          </p>
        </div>
      </NuxtLink>
    </section>
  </main>
</template>
