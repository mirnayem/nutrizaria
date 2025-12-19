<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";
import type { Product } from "~/types/product";

definePageMeta({
  title: "NutriZaria Shop",
  meta: [
    {
      name: "description",
      content: "Browse the full NutriZaria catalog.",
    },
  ],
});

const catalog = useCatalogStore();
catalog.hydrate();
const { products, categories } = storeToRefs(catalog);

const searchQuery = ref("");
const selectedCategory = ref<string>("all");
const sortOption = ref<"featured" | "priceLow" | "priceHigh" | "alpha">(
  "featured"
);
const showFilterPanel = ref(false);

const categoryStats = computed(() => {
  const counts = (products.value ?? []).reduce<Record<string, number>>(
    (acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    },
    {}
  );
  return (categories.value ?? []).map((category) => ({
    ...category,
    count: counts[category.slug] ?? 0,
  }));
});

const filteredProducts = computed<Product[]>(() => {
  let list = [...(products.value ?? [])];
  if (selectedCategory.value !== "all") {
    list = list.filter(
      (product) => product.category === selectedCategory.value
    );
  }
  const keyword = searchQuery.value.trim().toLowerCase();
  if (keyword) {
    list = list.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)
      );
    });
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
      list.sort((a, b) => a.id - b.id);
      break;
  }
  return list;
});

const totalProducts = computed(() => products.value?.length ?? 0);
const activeCategoryName = computed(() => {
  if (selectedCategory.value === "all") return "All categories";
  return (
    categoryStats.value.find((cat) => cat.slug === selectedCategory.value)
      ?.name ?? "All categories"
  );
});
const hasActiveFilters = computed(
  () =>
    selectedCategory.value !== "all" ||
    Boolean(searchQuery.value.trim()) ||
    sortOption.value !== "featured"
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "all";
  sortOption.value = "featured";
  showFilterPanel.value = false;
};

const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value;
};
const closeFilterPanel = () => {
  showFilterPanel.value = false;
};

watch([selectedCategory, sortOption], () => {
  showFilterPanel.value = false;
});
</script>
<template>
  <main class="bg-slate-50 py-4 sm:py-12">
    <div class="mx-auto max-w-6xl space-y-6 px-0 sm:space-y-8 sm:px-4">
      <section
        class="rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-violet-50/80 p-4 shadow-sm sm:p-8"
      >
        <div
          class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="max-w-2xl space-y-3 sm:space-y-4">
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.35em] text-violet-600 sm:text-xs"
            >
              Bangladesh pantry market
            </p>
            <h1
              class="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl"
            >
              Trusted everyday essentials for Bangladeshi kitchens
            </h1>
            <p class="text-sm text-slate-500 sm:text-base">
              Browse fresh produce, halal proteins, and pantry staples curated
              for local tastes. From Cox’s Bazar seafood to Dinajpur rice, every
              order ships quickly across the country.
            </p>
          </div>
          <div
            class="grid gap-4 rounded-2xl border border-slate-100 bg-white/90 p-4 text-center text-xs text-slate-500 sm:grid-cols-2 sm:text-sm"
          >
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-400">
                Total products
              </p>
              <p class="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {{ totalProducts }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-400">
                Categories
              </p>
              <p class="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {{ categoryStats.length }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        class="space-y-4 rounded-3xl border border-slate-100 bg-white/95 p-4 shadow-sm lg:hidden"
      >
        <div>
          <label class="text-sm font-semibold text-slate-600"
            >Search inventory</label
          >
          <div
            class="mt-3 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-violet-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m15.75 15.75 4.5 4.5m-2.25-7.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search items, e.g. honey"
              class="ml-3 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
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
                d="M3.75 6h16.5M4.5 12h15m-13.5 6h12"
              />
            </svg>
            Sort & Filters
          </button>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-violet-700"
            @click="clearFilters"
          >
            Reset
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="space-y-2">
          <p
            class="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400"
          >
            Categories
          </p>
          <div class="mt-1 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              class="flex-shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition"
              :class="
                selectedCategory === 'all'
                  ? 'border-violet-400 bg-violet-50 text-violet-700'
                  : 'border-slate-200 bg-white text-slate-600'
              "
              @click="selectedCategory = 'all'"
            >
              All ({{ totalProducts }})
            </button>
            <button
              v-for="category in categoryStats"
              :key="category.id"
              type="button"
              class="flex-shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition"
              :class="
                selectedCategory === category.slug
                  ? 'border-violet-400 bg-violet-50 text-violet-700'
                  : 'border-slate-200 bg-white text-slate-600'
              "
              @click="selectedCategory = category.slug"
            >
              {{ category.name }} ({{ category.count }})
            </button>
          </div>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-[300px,1fr]">
        <aside class="hidden space-y-6 lg:block lg:sticky lg:top-24 lg:h-fit">
          <div
            class="rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm"
          >
            <label class="text-sm font-semibold text-slate-600"
              >Search inventory</label
            >
            <div
              class="mt-3 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-violet-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m15.75 15.75 4.5 4.5m-2.25-7.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
                />
              </svg>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search items, e.g. honey"
                class="ml-3 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div
            class="rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-slate-600">Categories</h2>
              <span class="text-xs text-slate-400"
                >{{ categoryStats.length }} total</span
              >
            </div>
            <div class="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-2xl border px-4 py-2 text-left text-sm transition"
                :class="
                  selectedCategory === 'all'
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : 'border-transparent bg-slate-50/60 text-slate-600 hover:border-slate-200'
                "
                @click="selectedCategory = 'all'"
              >
                <span>All products</span>
                <span class="text-xs text-slate-400">{{ totalProducts }}</span>
              </button>
              <button
                v-for="category in categoryStats"
                :key="category.id"
                type="button"
                class="flex w-full items-center justify-between rounded-2xl border px-4 py-2 text-left text-sm transition"
                :class="
                  selectedCategory === category.slug
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : 'border-transparent bg-slate-50/60 text-slate-600 hover:border-slate-200'
                "
                @click="selectedCategory = category.slug"
              >
                <span>{{ category.name }}</span>
                <span class="text-xs text-slate-400">{{ category.count }}</span>
              </button>
            </div>
          </div>

          <div
            class="rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm space-y-3"
          >
            <label class="text-sm font-semibold text-slate-600"
              >Sort products</label
            >
            <select
              v-model="sortOption"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-400"
            >
              <option value="featured">Featured (default)</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </aside>

        <section
          class="space-y-5 rounded-3xl border border-slate-100 bg-white/95 py-4 px-2 shadow-sm sm:p-6 lg:order-2"
        >
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500"
              >
                Results
              </p>
              <h2
                class="text-[1.75rem] font-semibold text-slate-900 sm:text-2xl"
              >
                {{ filteredProducts.length }} products available
              </h2>
              <p class="text-sm text-slate-500 sm:text-base">
                {{ activeCategoryName }}
                • Sorted by
                {{
                  sortOption === "priceLow"
                    ? "Price (Low → High)"
                    : sortOption === "priceHigh"
                    ? "Price (High → Low)"
                    : sortOption === "alpha"
                    ? "Alphabetical"
                    : "Featured"
                }}
              </p>
            </div>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
              @click="clearFilters"
            >
              Clear filters
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
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <Products
            :products="filteredProducts"
            :paginate="true"
            :page-size="12"
            :max-two-per-row="true"
          />
        </section>
      </div>
    </div>

    <div
      v-if="showFilterPanel"
      class="fixed inset-0 z-40 flex bg-slate-950/40 backdrop-blur-sm lg:hidden"
    >
      <button
        class="flex-1"
        @click="closeFilterPanel"
        aria-label="Close filters"
      ></button>
      <div
        class="h-full w-[85%] max-w-sm overflow-y-auto rounded-l-3xl border border-white/10 bg-white p-5 shadow-2xl"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">
            Filters & sorting
          </h2>
          <button
            type="button"
            class="rounded-full bg-slate-100 p-2 text-slate-500"
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="space-y-6">
          <div>
            <label class="text-sm font-semibold text-slate-600"
              >Search inventory</label
            >
            <div
              class="mt-3 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-violet-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m15.75 15.75 4.5 4.5m-2.25-7.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
                />
              </svg>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search items"
                class="ml-3 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-600">Categories</h3>
              <span class="text-xs text-slate-400"
                >{{ categoryStats.length }} total</span
              >
            </div>
            <div class="mt-3 space-y-2">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-2xl border px-4 py-2 text-left text-sm transition"
                :class="
                  selectedCategory === 'all'
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : 'border-slate-100 bg-slate-50 text-slate-600'
                "
                @click="selectedCategory = 'all'"
              >
                <span>All products</span>
                <span class="text-xs text-slate-400">{{ totalProducts }}</span>
              </button>
              <button
                v-for="category in categoryStats"
                :key="category.id"
                type="button"
                class="flex w-full items-center justify-between rounded-2xl border px-4 py-2 text-left text-sm transition"
                :class="
                  selectedCategory === category.slug
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : 'border-slate-100 bg-slate-50 text-slate-600'
                "
                @click="selectedCategory = category.slug"
              >
                <span>{{ category.name }}</span>
                <span class="text-xs text-slate-400">{{ category.count }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-slate-600"
              >Sort products</label
            >
            <select
              v-model="sortOption"
              class="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-400"
            >
              <option value="featured">Featured (default)</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>

          <button
            type="button"
            class="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            @click="closeFilterPanel"
          >
            Apply & close
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
