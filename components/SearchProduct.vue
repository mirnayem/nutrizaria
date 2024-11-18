<template>
  <section
    class="search-product flex items-center gap-2 border-[1px] group border-slate-300 rounded pl-2 h-10 relative"
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
    <XMarkIcon
      @click="searchTerm = ''"
      :class="[
        'w-5 h-5 absolute sm:right-28 right-10 cursor-pointer',
        searchTerm.length > 0 ? 'block' : 'hidden',
      ]"
    />
    <div
      @click="fetchResults(searchTerm)"
      class="absolute right-0 search-button sm:w-24 w-10 gap-2 h-[42px] flex-mid bg-orange-700 text-white cursor-pointer"
    >
      <MagnifyingGlassIcon class="w-5 h-5 text-white" />
      <p class="sm:block hidden">Search</p>
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
const searchTerm = ref<string>("");
const loading = ref<boolean>(false);
let debounceTimeout: NodeJS.Timeout;

const fetchResults: (query: string) => Promise<void> = async (
  query: string
) => {
  if (query) {
    const term = query.toLowerCase();
    loading.value = true;
    await productStore.searchProducts(query);
    loading.value = false;
    const basePath = "/search/";
    router.replace(basePath + term);
  }
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
