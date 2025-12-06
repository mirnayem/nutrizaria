<template>
  <div class="categories" v-if="currentCategory">
    <div
      class="categories-banner h-96 w-full flex items-center justify-center"
      :style="bannerStyle"
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
import { computed, ref, watchEffect } from "vue";
import type { Category, Product } from "~/types/product";
import { useCatalogStore } from "~/stores/catalog";

const currentCategory = ref<Category>();
const categoryProducts = ref<Product[]>([]);
const route = useRoute();
const catalog = useCatalogStore();
catalog.hydrate();

watchEffect(() => {
  const slug = String(route.params.category);
  currentCategory.value = catalog.categories.find((cat) => cat.slug === slug);
  categoryProducts.value = catalog.products.filter(
    (product: Product) => product.category === slug
  );
});

const bannerStyle = computed(() => {
  const image = currentCategory.value?.image
    ? `/images/${currentCategory.value.image}`
    : "/nutri.png";
  return {
    backgroundImage: `url('${image}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
});
</script>
