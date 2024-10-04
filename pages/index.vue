<script setup lang="ts">
import { categories } from "../store/data";

</script>
<template>
  <div class="py-5 grid grid-cols-12 gap-8">
    <div class="categories col-span-3">
      <section
        class="category-heading flex justify-between px-10 py-3 bg-orange-500 text-white items-center"
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
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </section>
      <div class="categories-list grid rounded-b-lg border">
        <div
          class="single-category py-4 cursor-pointer hover:bg-orange-500 px-10"
          v-for="category in categories"
          :key="category.id"
        >
          {{ category.name }}
        </div>
      </div>
    </div>
    <div class="products-section col-span-9">
      <Products />
    </div>
  </div>
</template>
