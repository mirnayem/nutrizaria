<template>
  <main class="min-h-screen bg-slate-50 py-6 sm:py-10" :key="route.fullPath">
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
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
        <NuxtLink to="/shop" class="transition hover:text-violet-600">Shop</NuxtLink>
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
        <span class="font-medium text-slate-700">{{ currentBrand?.name ?? "Brand" }}</span>
      </nav>

      <div v-if="isLoading" aria-label="Loading brand">
        <SkeletonBanner height="lg" />
        <div class="mt-8">
          <SkeletonProductGrid :count="8" :columns="4" />
        </div>
      </div>

      <template v-else-if="currentBrand">
        <section
          class="relative overflow-hidden rounded-3xl bg-slate-900 shadow-sm"
          :style="bannerStyle"
        >
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20"
          ></div>
          <div class="relative flex min-h-56 flex-col justify-end p-6 sm:min-h-72 sm:p-10">
            <div class="flex items-center gap-2">
              <span
                class="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur"
              >
                Brand
              </span>
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.8"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
                {{ productCount }} {{ productCount === 1 ? "product" : "products" }}
              </span>
            </div>
            <h1 class="mt-4 text-3xl font-bold text-white sm:text-5xl">
              {{ currentBrand.name }}
            </h1>
            <p v-if="currentBrand.description" class="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              {{ currentBrand.description }}
            </p>
          </div>
        </section>

        <div class="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Browse brands">
          <NuxtLink
            to="/shop"
            class="flex-shrink-0 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
          >
            All products
          </NuxtLink>
          <NuxtLink
            v-for="brand in brands"
            :key="brand.id"
            :to="`/brands/${brand.slug}`"
            class="flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition"
            :class="chipClass(brand.slug)"
          >
            {{ brand.name }}
          </NuxtLink>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-500">
            Showing <span class="font-semibold text-slate-700">{{ filteredProducts.length }}</span> of
            <span class="font-semibold text-slate-700">{{ productCount }}</span> products
          </p>
          <div class="flex items-center gap-2">
            <label for="brand-sort" class="text-sm text-slate-500">Sort by</label>
            <AppSelect
              id="brand-sort"
              v-model="sortOption"
              :options="brandSortOptions"
            />
          </div>
        </div>

        <div v-if="filteredProducts.length" class="mt-6">
          <Products :products="filteredProducts" :columns="4" />
        </div>
        <div v-else class="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p class="text-sm text-slate-500">No products found for this brand yet.</p>
          <NuxtLink to="/shop" class="mt-3 inline-block text-sm font-medium text-violet-600 hover:text-violet-700">
            Browse all products →
          </NuxtLink>
        </div>
      </template>

      <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p class="text-sm text-slate-500">Brand not found.</p>
        <NuxtLink to="/shop" class="mt-3 inline-block text-sm font-medium text-violet-600 hover:text-violet-700">
          Browse all products →
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";
import type { Product } from "~/types/product";

const route = useRoute();
const catalog = useCatalogStore();
await catalog.hydrate();
const { products, brands } = storeToRefs(catalog);

const isLoading = computed(() => catalog.loading && !catalog.hydrated);

const currentBrand = computed(() => {
  const slug = route.params.brand as string;
  return brands.value.find((b) => b.slug === slug);
});

const brandProducts = computed(() => {
  if (!currentBrand.value) return [];
  return products.value.filter((p) => p.brand === currentBrand.value!.slug);
});

const productCount = computed(() => brandProducts.value.length);

const sortOption = ref<"featured" | "priceLow" | "priceHigh" | "alpha">("featured");

const brandSortOptions = [
  { value: "featured", label: "Featured" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "alpha", label: "Name (A–Z)" },
];

const filteredProducts = computed<Product[]>(() => {
  const list = [...brandProducts.value];
  switch (sortOption.value) {
    case "priceLow":
      list.sort((a, b) => a.price - b.price);
      break;
    case "priceHigh":
      list.sort((a, b) => b.price - a.price);
      break;
    case "alpha":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      list.sort((a, b) => {
        const fa = Number(Boolean(a.isFeatured));
        const fb = Number(Boolean(b.isFeatured));
        if (fa !== fb) return fb - fa;
        return String(a.id).localeCompare(String(b.id));
      });
  }
  return list;
});

const chipClass = (slug: string) =>
  slug === currentBrand.value?.slug
    ? "border-violet-300 bg-violet-50 text-violet-700"
    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700";

const bannerStyle = computed(() => {
  const img = currentBrand.value?.image;
  return img ? { backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" } : {};
});

useSeo({
  title: currentBrand.value?.name ? `${currentBrand.value.name} — Brands` : "Brand",
  description: currentBrand.value?.description || `Browse products from ${currentBrand.value?.name || "this brand"}`,
});
</script>
