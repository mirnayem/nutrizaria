<script setup></script>
<template>
  <section
    class="search-product flex items-center gap-2 border-[1px] border-slate-300 rounded pl-2 h-10 relative"
  >
    <div class="search-input sm:w-1/2 w-2/3">
      <input
        v-model="searchTerm"
        @input="onInputChange"
        type="text"
        class="w-full h-full focus:outline-none"
        placeholder="search your product..."
      />
    </div>
    <div
      class="absolute right-0 search-button sm:w-1/4 w-1/6 h-[42px] flex-mid bg-orange-700 text-white"
    >
      Search
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { Product } from "~/types/Product";
import { useProductStore } from "~/stores/product";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();
const { products } = productStore;
const searchTerm = ref<string>("");
const loading = ref<boolean>(false);
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

const fetchResults = async (query) => {
  const term = query.toLowerCase();
  loading.value = true;
  await productStore.searchProducts(query);
  loading.value = false;
  const basePath = "/search/";
  router.replace(basePath + term);
};

const onInputChange = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (searchTerm.value.trim()) {
      fetchResults(searchTerm.value);
    }
  }, 700);
};
</script>
