<template>
  <section class="w-full" aria-label="Search products">
    <div
      class="group flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200"
    >
      <MagnifyingGlassIcon class="size-5 text-slate-400" aria-hidden="true" />
      <label class="sr-only" for="product-search-input">Search products</label>
      <input
        id="product-search-input"
        v-model="searchTerm"
        @input="onInputChange"
        type="search"
        class="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        placeholder="Search for dates, honey, spices..."
        autocomplete="off"
      />
      <button
        v-if="searchTerm"
        type="button"
        aria-label="Clear search"
        class="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
        @click="clearSearch"
      >
        <XMarkIcon class="size-5" />
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-violet-500"
        @click="triggerSearch"
      >
        Search
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useProductStore } from "~/stores/product";
import { useRouter } from "vue-router";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/16/solid";

const router = useRouter();
const productStore = useProductStore();
const searchTerm = ref("");
const loading = ref(false);
let debounceTimeout: NodeJS.Timeout;

const fetchResults = async (query: string) => {
  if (!query) return;
  const term = query.toLowerCase();
  loading.value = true;
  await productStore.searchProducts(query);
  loading.value = false;
  router.replace(`/search/${term}`);
};

const onInputChange = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (searchTerm.value.trim()) {
      fetchResults(searchTerm.value.trim());
    }
  }, 600);
};

const triggerSearch = () => {
  if (loading.value) return;
  if (searchTerm.value.trim()) {
    fetchResults(searchTerm.value.trim());
  }
};

const clearSearch = () => {
  searchTerm.value = "";
};
</script>
