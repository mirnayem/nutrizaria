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
        <span class="font-medium text-slate-700">{{ currentCategory?.name ?? "Category" }}</span>
      </nav>

      <div v-if="isLoading" aria-label="Loading category">
        <SkeletonBanner height="lg" />
        <div class="mt-8">
          <SkeletonProductGrid :count="8" :columns="4" />
        </div>
      </div>

      <template v-else-if="currentCategory">
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
                Category
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
                    d="M5 8.14 2.19 5.33a1 1 0 0 1 0-1.41l.63-.63a1 1 0 0 1 1.42 0L7 6l6.3-6.3a2.4 2.4 0 0 1 3.4 0L22 5.1a2.4 2.4 0 0 1 0 3.4L15.7 14.8a1 1 0 0 1-1.4 0L12 12.6l-3.4 3.4a1 1 0 0 1-1.42 0l-1-1a1 1 0 0 1 0-1.4L9 11.6V8.15Z"
                  />
                </svg>
                {{ productCount }} {{ productCount === 1 ? "product" : "products" }}
              </span>
            </div>
            <h1 class="mt-4 text-3xl font-bold text-white sm:text-5xl">
              {{ currentCategory.name }}
            </h1>
            <p v-if="currentCategory.description" class="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              {{ currentCategory.description }}
            </p>
          </div>
        </section>

        <div class="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Browse categories">
          <NuxtLink
            to="/shop"
            class="flex-shrink-0 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
          >
            All products
          </NuxtLink>
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/categories/${category.slug}`"
            class="flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition"
            :class="chipClass(category.slug)"
          >
            {{ category.name }}
          </NuxtLink>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-500">
            <span class="font-semibold text-slate-700">{{ sortedProducts.length }}</span>
            <span class="text-slate-400">of {{ productCount }} products</span>
            <span class="mx-2 text-slate-300">•</span>
            <span>Sorted by {{ sortLabel }}</span>
          </p>
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
              />
            </svg>
            <select
              v-model="sortOption"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="featured">Featured</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>

        <section class="mt-6">
          <Products
            v-if="sortedProducts.length"
            :products="sortedProducts"
            :paginate="true"
            :page-size="12"
            :columns="4"
          />
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
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <p class="mt-4 text-base font-semibold text-slate-800">No products yet</p>
            <p class="mt-1 max-w-sm text-sm text-slate-500">
              We're stocking this category. Check back soon or browse our full range instead.
            </p>
            <NuxtLink
              to="/shop"
              class="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Browse all products
            </NuxtLink>
          </div>
        </section>
      </template>

      <div
        v-else
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-24 text-center"
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
        <p class="mt-4 text-base font-semibold text-slate-800">Category not found</p>
        <p class="mt-1 max-w-sm text-sm text-slate-500">
          The category you're looking for doesn't exist or has been moved.
        </p>
        <NuxtLink
          to="/shop"
          class="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Back to shop
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";
import type { Product } from "~/types/product";

const route = useRoute();

const catalog = useCatalogStore();
await catalog.hydrate();
const { products, categories } = storeToRefs(catalog);

const { resolve } = useImageUrl();

const sortOption = ref<"featured" | "priceLow" | "priceHigh" | "alpha">("featured");

// Watch route changes to ensure data is loaded
watch(() => route.params.category, async () => {
  if (!catalog.hydrated) {
    await catalog.hydrate();
  }
}, { immediate: true });

const currentCategory = computed(() => {
  const slug = String(route.params.category).toLowerCase();
  return (
    categories.value.find((cat) => cat.slug?.toLowerCase() === slug) ??
    categories.value.find((cat) => cat.name?.toLowerCase() === slug) ??
    undefined
  );
});

const categoryProducts = computed<Product[]>(() => {
  if (!currentCategory.value) return [];
  const slug = currentCategory.value.slug;
  return (products.value ?? []).filter(
    (product) => String(product.category).toLowerCase() === String(slug).toLowerCase()
  );
});

const sortedProducts = computed<Product[]>(() => {
  const list = [...(categoryProducts.value ?? [])];
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
      break;
  }
  return list;
});

const productCount = computed(() => categoryProducts.value.length);

const isLoading = computed(() => catalog.loading && !catalog.hydrated);

const sortLabel = computed(() =>
  sortOption.value === "priceLow"
    ? "Price: Low to High"
    : sortOption.value === "priceHigh"
      ? "Price: High to Low"
      : sortOption.value === "alpha"
        ? "Alphabetical"
        : "Featured"
);

const chipClass = (slug: string) =>
  slug === String(route.params.category)
    ? "border-violet-600 bg-violet-600 text-white shadow-sm"
    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700";

const bannerStyle = computed(() => {
  const image = resolve(currentCategory.value?.image);
  if (!image || image === "/placeholder.svg") {
    return { background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" };
  }
  return {
    backgroundImage: `url('${image}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
});

const siteUrl = "https://nutrizaria.com";

const seo = useSeo({
  title: () => (currentCategory.value ? currentCategory.value.name : "Category"),
  description: () =>
    currentCategory.value?.description ||
    (currentCategory.value
      ? `Shop the best ${currentCategory.value.name} in Bangladesh — fresh, authentic and affordable at NutriZaria.`
      : undefined),
  image: () => currentCategory.value?.image ?? null,
  noindex: () => !currentCategory.value,
  canonicalPath: () =>
    currentCategory.value ? `/categories/${currentCategory.value.slug}` : undefined,
  jsonld: () => {
    if (!currentCategory.value) return null;
    const category = currentCategory.value;
    return breadcrumbJsonLd(
      [
        { name: "Home", url: "/" },
        { name: "Shop", url: "/shop" },
        { name: category.name, url: `/categories/${category.slug}` },
      ],
      siteUrl
    );
  },
});
</script>
