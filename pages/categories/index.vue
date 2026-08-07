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

const categoryGroups = computed(() => {
  const all = products.value ?? [];
  return (categories.value ?? [])
    .filter((cat) => !cat.parentId)
    .map((cat) => {
      const children = cat.children || [];
      const ownCount = all.filter((p) => p.category === cat.slug).length;
      const childrenCount = children.reduce(
        (sum, child) =>
          sum + all.filter((p) => p.category === child.slug).length,
        0
      );
      return {
        ...cat,
        count: ownCount + childrenCount,
        children: children.map((child) => ({
          ...child,
          count: all.filter((p) => p.category === child.slug).length,
        })),
      };
    })
    .filter((cat) => cat.count > 0);
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 py-6 sm:py-10">
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
      <header class="mb-8">
        <h1 class="text-2xl font-semibold text-slate-900 sm:text-3xl">
          All Categories
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Fresh, authentic essentials — curated for Bangladeshi kitchens.
        </p>
      </header>

      <section
        v-if="categoryGroups.length"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <NuxtLink
          v-for="cat in categoryGroups"
          :key="cat.id"
          :to="`/categories/${cat.slug}`"
          class="group flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 text-center transition hover:border-violet-200 hover:shadow-md"
        >
          <div class="aspect-square w-full max-w-24 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <img
              :src="resolve(cat.image)"
              :alt="cat.name"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            />
          </div>
          <h2 class="text-sm font-medium text-slate-800 group-hover:text-violet-700">
            {{ cat.name }}
          </h2>
        </NuxtLink>
      </section>

      <div
        v-else
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center"
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
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </div>
        <p class="mt-4 text-base font-semibold text-slate-800">No categories yet</p>
        <p class="mt-1 max-w-sm text-sm text-slate-500">
          Categories will appear here as soon as products are added.
        </p>
      </div>
    </div>
  </main>
</template>