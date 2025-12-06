<template>
  <div v-if="product" class="space-y-12">
    <section class="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
      <div class="rounded-3xl bg-white p-6 shadow-sm">
        <img
          :src="productImage"
          :alt="product.name"
          loading="eager"
          class="w-full rounded-2xl object-cover"
        />
      </div>
      <div class="rounded-3xl bg-white p-6 shadow-sm">
        <p class="text-sm uppercase tracking-wide text-violet-600">
          {{ product.category }}
        </p>
        <h1 class="mt-2 text-3xl font-semibold text-slate-900">
          {{ product.name }}
        </h1>
        <p class="mt-4 text-slate-600">
          {{ product.description }}
        </p>
        <div class="mt-6 flex items-end gap-4">
          <p class="text-4xl font-semibold text-violet-700">
            {{ currencySymbol }}{{ product.price.toFixed(2) }}
          </p>
          <span class="text-sm uppercase tracking-wide text-slate-400">
            {{ product.unit }}
          </span>
        </div>
        <div class="mt-8 space-y-3">
          <button
            type="button"
            class="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            @click="addToCart"
          >
            Add to cart
          </button>
          <button
            type="button"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-500 hover:text-violet-700"
            @click="addToFavorite"
          >
            Add to favorites
          </button>
        </div>
        <div class="mt-10 space-y-4">
          <h2 class="text-lg font-semibold text-slate-900">Benefits</h2>
          <ul class="space-y-3 text-sm text-slate-600">
            <li v-for="(benefit, index) in product.benefits" :key="index" class="flex gap-3">
              <span class="mt-1 size-1.5 rounded-full bg-violet-600"></span>
              <p>{{ benefit }}</p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-slate-900">You may also like</h2>
        <NuxtLink
          to="/shop"
          class="text-sm font-semibold text-violet-700 transition hover:text-violet-500"
        >
          Browse all
        </NuxtLink>
      </div>
      <div class="mt-6">
        <Products :products="relatedProducts" />
      </div>
    </section>
  </div>
  <div v-else class="rounded-3xl bg-white p-10 text-center shadow-sm">
    <p class="text-lg text-slate-600">Product not found. Go back to the shop.</p>
    <NuxtLink
      to="/shop"
      class="mt-4 inline-flex items-center justify-center rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white"
    >
      Back to shop
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useRuntimeConfig } from "#app";
import { useCatalogStore } from "~/stores/catalog";
import { useCartStore } from "~/stores/cart";
import { useFavoriteStore } from "~/stores/favorite";

const route = useRoute();
const catalogStore = useCatalogStore();
const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();
const config = useRuntimeConfig();

catalogStore.hydrate();

const productId = computed(() => Number(route.params.id));
const product = computed(() => catalogStore.productById(productId.value));
const productImage = computed(() =>
  product.value?.image ? `/images/${product.value.image}` : "/nutri.png"
);

const relatedProducts = computed(() =>
  catalogStore.products
    .filter((p) => p.id !== productId.value)
    .slice(0, 4)
);

const currencySymbol = config.public.currencySymbol || "Tk";

const addToCart = () => {
  if (product.value) {
    cartStore.addToCart(product.value);
  }
};

const addToFavorite = () => {
  if (product.value) {
    favoriteStore.addToFavorite(product.value);
  }
};

useHead(() => ({
  title: product.value
    ? `${product.value.name} | NutriZaria`
    : "Product not found | NutriZaria",
}));
</script>
