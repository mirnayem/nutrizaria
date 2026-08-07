<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";
import type { Product } from "~/types/product";

useSeo({
  title: "Shop",
  description:
    "Browse the full NutriZaria catalog — fresh produce, daily essentials and more.",
  image: "/nutri.png",
  type: "website",
});

const route = useRoute();
const catalog = useCatalogStore();
await catalog.hydrate();
const { products, categories, brands } = storeToRefs(catalog);

// Ensure data is fresh on navigation
watch(() => route.fullPath, async () => {
  if (!catalog.hydrated) {
    await catalog.hydrate();
  }
}, { immediate: false });

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || "Tk";

const searchQuery = ref("");
const selectedCategory = ref<string>("all");
const selectedBrand = ref<string>("all");
const sortOption = ref<"featured" | "priceLow" | "priceHigh" | "alpha">("featured");
const inStockOnly = ref(false);
const showFilterPanel = ref(false);

const maxPrice = computed(() =>
  (products?.value ?? []).reduce((max, p) => Math.max(max, p.price ?? 0), 0)
);

const priceMin = ref(0);
const priceMax = ref<number | null>(null);
const priceInitialized = ref(false);

watch(maxPrice, (value) => {
  if (value === 0) return;
  if (!priceInitialized.value) {
    priceMax.value = value;
    priceInitialized.value = true;
  }
});

const isOutOfStock = (product: Product) => product.stock === 0;

const categoryStats = computed(() => {
  const counts = (products.value ?? []).reduce<Record<string, number>>(
    (acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    },
    {}
  );
  return (categories.value ?? [])
    .filter((c) => !c.parentId)
    .map((category) => {
      const children = (category.children || []).map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        count: counts[child.slug] ?? 0,
      }));
      const ownCount = counts[category.slug] ?? 0;
      const childrenCount = children.reduce((sum, ch) => sum + ch.count, 0);
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: ownCount + childrenCount,
        children,
      };
    })
    .filter((c) => c.count > 0 || c.children?.some((ch) => ch.count > 0));
});

const brandStats = computed(() => {
  const counts = (products.value ?? []).reduce<Record<string, number>>(
    (acc, product) => {
      if (product.brand) {
        acc[product.brand] = (acc[product.brand] ?? 0) + 1;
      }
      return acc;
    },
    {}
  );
  return (brands.value ?? []).map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    count: counts[brand.slug] ?? 0,
  })).filter((b) => b.count > 0);
});

const filteredProducts = computed<Product[]>(() => {
  let list = [...(products.value ?? [])];

  if (selectedCategory.value !== "all") {
    const cat = categories.value.find((c) => c.slug === selectedCategory.value);
    const allSlugs = [selectedCategory.value];
    if (cat?.children?.length) {
      allSlugs.push(...cat.children.map((ch) => ch.slug));
    }
    list = list.filter((product) => allSlugs.includes(product.category));
  }

  if (selectedBrand.value !== "all") {
    list = list.filter((product) => product.brand === selectedBrand.value);
  }

  const keyword = searchQuery.value.trim().toLowerCase();
  if (keyword) {
    list = list.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        (product.brand || "").toLowerCase().includes(keyword)
    );
  }

  if (priceMin.value > 0 || priceMax.value < maxPrice.value) {
    const min = priceMin.value || 0;
    const max = priceMax.value || Infinity;
    list = list.filter((product) => product.price >= min && product.price <= max);
  }

  if (inStockOnly.value) {
    list = list.filter((product) => !isOutOfStock(product));
  }

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

const isCatalogLoading = computed(() => catalog.loading && !catalog.hydrated);

const totalProducts = computed(() => products.value?.length ?? 0);
const activeCategoryName = computed(() => {
  if (selectedCategory.value === "all") return "All products";
  return (
    categoryStats.value.find((cat) => cat.slug === selectedCategory.value)?.name ??
    "All products"
  );
});

const priceRangeActive = computed(
  () => priceMin.value > 0 || (priceMax.value !== null && priceMax.value < maxPrice.value)
);
const activeFilterCount = computed(
  () =>
    (selectedCategory.value !== "all" ? 1 : 0) +
    (selectedBrand.value !== "all" ? 1 : 0) +
    (Boolean(searchQuery.value.trim()) ? 1 : 0) +
    (priceRangeActive.value ? 1 : 0) +
    (inStockOnly.value ? 1 : 0)
);
const hasActiveFilters = computed(() => activeFilterCount.value > 0);

const sortLabel = computed(() =>
  sortOption.value === "priceLow"
    ? "Price: Low to High"
    : sortOption.value === "priceHigh"
    ? "Price: High to Low"
    : sortOption.value === "alpha"
    ? "Alphabetical"
    : "Featured"
);

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "alpha", label: "Alphabetical" },
];

const clearFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "all";
  selectedBrand.value = "all";
  sortOption.value = "featured";
  priceMin.value = 0;
  priceMax.value = maxPrice.value;
  priceInitialized.value = true;
  inStockOnly.value = false;
  showFilterPanel.value = false;
};

const removeCategoryFilter = () => {
  selectedCategory.value = "all";
};
const removeBrandFilter = () => {
  selectedBrand.value = "all";
};
const removePriceFilter = () => {
  priceMin.value = 0;
  priceMax.value = maxPrice.value;
  priceInitialized.value = true;
};
const removeStockFilter = () => {
  inStockOnly.value = false;
};

const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value;
};
const closeFilterPanel = () => {
  showFilterPanel.value = false;
};

watch([selectedCategory, sortOption, priceMin, priceMax, inStockOnly], () => {
  showFilterPanel.value = false;
});
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
        <span class="font-medium text-slate-700">Shop</span>
      </nav>

      <div class="grid gap-8 lg:grid-cols-[260px,minmax(0,1fr)]">
        <aside class="hidden lg:block">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <ShopFilters
              v-model:search-query="searchQuery"
              v-model:selected-category="selectedCategory"
              v-model:selected-brand="selectedBrand"
              v-model:price-min="priceMin"
              v-model:price-max="priceMax"
              v-model:in-stock-only="inStockOnly"
              :categories="categoryStats"
              :brands="brandStats"
              :max-price="maxPrice"
              :total-products="totalProducts"
            />
            <button
              v-if="hasActiveFilters"
              type="button"
              class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
              @click="clearFilters"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
              Clear all filters
            </button>
          </div>
        </aside>

        <section>
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700 lg:hidden"
                @click="toggleFilterPanel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                  />
                </svg>
                Filters
                <span
                  v-if="activeFilterCount > 0"
                  class="inline-flex size-5 items-center justify-center rounded-full bg-violet-600 text-[11px] font-semibold text-white"
                >
                  {{ activeFilterCount }}
                </span>
              </button>

              <div class="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <span class="font-medium text-slate-700">{{ activeCategoryName }}</span>
                <span class="text-slate-300">•</span>
                <span>Sorted by {{ sortLabel }}</span>
              </div>
            </div>

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
              <AppSelect
                v-model="sortOption"
                :options="sortOptions"
                aria-label="Sort products"
                id="shop-sort"
              />
            </div>
          </div>

          <div
            v-if="hasActiveFilters"
            class="mb-4 flex flex-wrap items-center gap-2"
          >
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
              Active:
            </span>
            <button
              v-if="selectedCategory !== 'all'"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
              @click="removeCategoryFilter"
            >
              {{ activeCategoryName }}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              v-if="selectedBrand !== 'all'"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
              @click="removeBrandFilter"
            >
              {{ brandStats.find((b) => b.slug === selectedBrand)?.name || selectedBrand }}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
<button
  v-if="priceRangeActive"
  type="button"
  class="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
  @click="removePriceFilter"
>
  {{ priceMin > 0 ? currencySymbol + priceMin : "0" }} –
  {{ priceMax !== null && priceMax < maxPrice ? currencySymbol + priceMax : currencySymbol + maxPrice }}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="size-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
</button>
            <button
              v-if="inStockOnly"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
              @click="removeStockFilter"
            >
              In stock
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              type="button"
              class="text-xs font-medium text-slate-500 underline-offset-2 transition hover:text-slate-600 hover:underline"
              @click="clearFilters"
            >
              Clear all
            </button>
          </div>

          <Products
            v-if="!isCatalogLoading && filteredProducts.length"
            :products="filteredProducts"
            :paginate="true"
            :page-size="12"
            :columns="3"
          />
          <div
            v-else-if="isCatalogLoading"
            aria-label="Loading products"
          >
            <SkeletonProductGrid :count="6" :columns="3" />
          </div>
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
            <p class="mt-4 text-base font-semibold text-slate-800">No products found</p>
            <p class="mt-1 max-w-sm text-sm text-slate-500">
              We couldn't find anything matching your search. Try different keywords or clear
              your filters.
            </p>
            <button
              type="button"
              class="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              @click="clearFilters"
            >
              Clear all filters
            </button>
          </div>
        </section>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="showFilterPanel"
        class="fixed inset-0 z-40 flex bg-slate-950/40 backdrop-blur-sm lg:hidden"
      >
        <div
          class="flex h-full w-[85%] max-w-sm flex-col rounded-r-3xl border border-white/10 bg-white shadow-2xl"
        >
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 class="text-lg font-semibold text-slate-900">Filters</h2>
            <button
              type="button"
              class="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
              @click="closeFilterPanel"
              aria-label="Close filters"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-5 scrollbar-slim">
            <ShopFilters
              v-model:search-query="searchQuery"
              v-model:selected-category="selectedCategory"
              v-model:selected-brand="selectedBrand"
              v-model:price-min="priceMin"
              v-model:price-max="priceMax"
              v-model:in-stock-only="inStockOnly"
              :categories="categoryStats"
              :brands="brandStats"
              :max-price="maxPrice"
              :total-products="totalProducts"
            />
          </div>
          <div class="flex gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              class="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
              @click="clearFilters"
            >
              Clear all
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              @click="closeFilterPanel"
            >
              Show {{ filteredProducts.length }} results
            </button>
          </div>
        </div>
        <button
          type="button"
          class="flex-1"
          @click="closeFilterPanel"
          aria-label="Close filters"
        ></button>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
