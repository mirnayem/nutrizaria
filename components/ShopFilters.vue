<template>
  <div class="space-y-6">
    <div>
      <label for="shop-filter-search" class="mb-2 block text-sm font-semibold text-slate-700">Search</label>
      <div class="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
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
          id="shop-filter-search"
          v-model="searchQuery"
          type="search"
          :placeholder="`Search ${totalProducts} products...`"
          class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:text-slate-600"
          aria-label="Clear search"
          @click="searchQuery = ''"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div>
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-700">Categories</h3>
        <button
          v-if="selectedCategory !== 'all'"
          type="button"
          class="text-xs font-medium text-violet-600 transition hover:text-violet-700"
          @click="selectedCategory = 'all'"
        >
          Clear
        </button>
      </div>
      <div class="max-h-80 space-y-1 overflow-y-auto pr-1.5 scrollbar-slim">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition"
          :class="
            selectedCategory === 'all'
              ? 'bg-violet-50 font-semibold text-violet-700'
              : 'text-slate-600 hover:bg-slate-50'
          "
          @click="selectedCategory = 'all'"
        >
          <span>All products</span>
          <span class="text-xs text-slate-500">{{ totalProducts }}</span>
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition"
          :class="
            selectedCategory === category.slug
              ? 'bg-violet-50 font-semibold text-violet-700'
              : 'text-slate-600 hover:bg-slate-50'
          "
          @click="selectedCategory = category.slug"
        >
          <span class="truncate">{{ category.name }}</span>
          <span class="text-xs text-slate-500">{{ category.count }}</span>
        </button>
      </div>
    </div>

    <div v-if="brands.length">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-700">Brands</h3>
        <button
          v-if="selectedBrand !== 'all'"
          type="button"
          class="text-xs font-medium text-violet-600 transition hover:text-violet-700"
          @click="selectedBrand = 'all'"
        >
          Clear
        </button>
      </div>
      <div class="max-h-80 space-y-1 overflow-y-auto pr-1.5 scrollbar-slim">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition"
          :class="
            selectedBrand === 'all'
              ? 'bg-violet-50 font-semibold text-violet-700'
              : 'text-slate-600 hover:bg-slate-50'
          "
          @click="selectedBrand = 'all'"
        >
          <span>All brands</span>
        </button>
        <button
          v-for="brand in brands"
          :key="brand.id"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition"
          :class="
            selectedBrand === brand.slug
              ? 'bg-violet-50 font-semibold text-violet-700'
              : 'text-slate-600 hover:bg-slate-50'
          "
          @click="selectedBrand = brand.slug"
        >
          <span class="truncate">{{ brand.name }}</span>
          <span class="text-xs text-slate-500">{{ brand.count }}</span>
        </button>
      </div>
    </div>

    <div>
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-700">Price</h3>
        <button
          v-if="priceMin > 0 || priceMax < maxPrice"
          type="button"
          class="text-xs font-medium text-violet-600 transition hover:text-violet-700"
          @click="resetPrice"
        >
          Reset
        </button>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model.number="priceMin"
          type="number"
          min="0"
          :max="priceMax || maxPrice"
          placeholder="Min"
          aria-label="Minimum price"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <span class="text-slate-500" aria-hidden="true">–</span>
        <input
          v-model.number="priceMax"
          type="number"
          :min="priceMin"
          :max="maxPrice"
          placeholder="Max"
          aria-label="Maximum price"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>
    </div>

    <label
      class="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-slate-300"
    >
      <span class="text-sm font-medium text-slate-700">In stock only</span>
      <input
        v-model="inStockOnly"
        type="checkbox"
        class="size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
const searchQuery = defineModel<string>("searchQuery", { default: "" });
const selectedCategory = defineModel<string>("selectedCategory", { default: "all" });
const selectedBrand = defineModel<string>("selectedBrand", { default: "all" });
const priceMin = defineModel<number>("priceMin", { default: 0 });
const priceMax = defineModel<number>("priceMax", { default: 0 });
const inStockOnly = defineModel<boolean>("inStockOnly", { default: false });

const props = defineProps<{
  categories: { id: string; name: string; slug: string; count: number }[];
  brands: { id: string; name: string; slug: string; count: number }[];
  maxPrice: number;
  totalProducts: number;
}>();

const resetPrice = () => {
  priceMin.value = 0;
  priceMax.value = props.maxPrice;
};
</script>
