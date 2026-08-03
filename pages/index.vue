<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

const catalog = useCatalogStore();
await catalog.hydrate();
const { products, categories } = storeToRefs(catalog);

useSeo({
  title: "NutriZaria - Authentic Pure Food Resources",
  description:
    "NutriZaria offers the highest quality natural food resources, ensuring purity and sustainability for healthy living.",
  image: "/nutri.png",
  type: "website",
});

const { resolve } = useImageUrl();

const isCatalogLoading = computed(() => catalog.loading && !catalog.hydrated);

const groupedProducts = computed(() => {
  const productList = products.value ?? [];
  const categoryList = categories.value ?? [];
  return categoryList
    .map((category) => {
      const items = productList.filter(
        (product) => product.category === category.slug,
      );
      return {
        category,
        items: items.slice(0, 8),
      };
    })
    .filter((group) => group.items.length);
});

const firstGroupId = computed(() => groupedProducts.value[0]?.category.id);

const lcpImage = computed(() => {
  const first = groupedProducts.value[0]?.items[0];
  return first?.image ? resolve(first.image) : null;
});

useHead(() => ({
  link: lcpImage.value
    ? [{ rel: "preload", as: "image", href: lcpImage.value, fetchpriority: "high" }]
    : [],
}));
</script>

<template>
  <main class="space-y-10 sm:space-y-12">
    <template v-if="isCatalogLoading">
      <section
        v-for="i in 2"
        :key="i"
        class="space-y-4 rounded-3xl sm:border sm:border-slate-100 sm:bg-white/80 px-0 py-5 shadow-sm sm:px-4 sm:py-7"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="h-4 w-40 animate-pulse rounded-full bg-slate-200"></div>
          <div class="h-8 w-28 animate-pulse rounded-full bg-slate-200"></div>
        </div>
        <SkeletonProductGrid :count="8" :columns="4" />
      </section>
    </template>

    <section
      v-for="group in groupedProducts"
      :key="group.category.id"
      class="space-y-4 rounded-3xl sm:border sm:border-slate-100 sm:bg-white/80 px-0 py-5 shadow-sm sm:px-4 sm:py-7"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600"
          >
            {{ group.category.name }} collection
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
      <div
        class="grid grid-cols-2 gap-1 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        <SingleProduct
          v-for="(product, index) in group.items"
          :key="product.id"
          :product="product"
          :priority="group.category.id === firstGroupId && index === 0"
        />
      </div>
    </section>
  </main>
</template>
