<template>
  <div class="categories" v-if="currentCategory">
    <div
      class="categories-banner h-96 w-full flex items-center justify-center"
      :style="{
        backgroundImage: `url('/images/${currentCategory.image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <h1 class="text-white font-bold text-4xl capitalize">
        {{ currentCategory.name }}
      </h1>
    </div>
    <section class="category-products mt-10">
      <Products :products="categoryProducts" />
    </section>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { categories } from "~/stores/data";
import { ref, onMounted } from "vue";
import type { Category, Product } from "~/types/product";
import { products } from "~/stores/data";

const currentCategory = ref<Category>();
const categoryProducts = ref<Product[]>();
const route = useRoute();
const category = route.params.category;
onMounted(() => {
  currentCategory.value = categories.find((cat) => cat.slug === category);
  categoryProducts.value = products.filter(
    (product: Product) => product.category === category
  );
});
</script>
