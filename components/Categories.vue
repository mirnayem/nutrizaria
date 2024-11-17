<template>
  <section
    class="category-heading flex justify-between px-10 py-3 bg-orange-700 font-light text-white items-center border-b border-white"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="size-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
      />
    </svg>
    <p>All Categories</p>
    <svg
      @click="showCategory = !showCategory"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="size-4 cursor-pointer"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  </section>
  <div
    class="categories-list grid max-h-[400px] !overflow-y-auto scrollbar-hide border border-t-2 border-t-white rounded"
    v-if="showCategory"
  >
    <div
      class="single-category py-3 cursor-pointer hover:bg-orange-700 hover:text-white hover:font-light px-10"
      v-for="category in categories"
      :key="category.id"
    >
      {{ category.name }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { categories } from "../stores/data";
import { ref, watch } from "vue";
import { useWindowResize } from "~/composables/useWindowResize";
const showCategory = ref<boolean>(true);
const { width } = useWindowResize();
watch(width, () => {
  width.value <= 1020 ? showCategory.value = false : showCategory.value = true
})
</script>
