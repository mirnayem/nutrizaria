<template>
  <main class="min-h-screen bg-slate-50 py-6 sm:py-10">
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
      <nav
        v-if="product"
        class="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        aria-label="Breadcrumb"
      >
        <NuxtLink to="/" class="transition hover:text-violet-600">Home</NuxtLink>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-3.5 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <NuxtLink to="/shop" class="transition hover:text-violet-600">Shop</NuxtLink>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-3.5 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span class="font-medium text-slate-700">{{ product.category }}</span>
      </nav>

      <div
        v-if="isLoading"
        class="grid gap-8 lg:grid-cols-[1.05fr,1fr]"
        aria-label="Loading product"
      >
        <div class="aspect-square animate-pulse rounded-3xl border border-slate-200 bg-white"></div>
        <div class="animate-pulse space-y-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div class="h-3 w-20 rounded bg-slate-200"></div>
          <div class="h-8 w-3/4 rounded bg-slate-200"></div>
          <div class="h-4 w-1/2 rounded bg-slate-200"></div>
          <div class="h-10 w-full rounded-xl bg-slate-200"></div>
          <div class="h-10 w-full rounded-xl bg-slate-200"></div>
        </div>
      </div>

      <section
        v-else-if="product"
        class="grid gap-8 lg:grid-cols-[1.05fr,1fr]"
      >
        <div>
          <div
            class="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <img
              :src="activeImage"
              :alt="product.name"
              class="h-full w-full object-cover"
              loading="eager"
            />
            <span
              v-if="discountPercent > 0"
              class="absolute left-4 top-4 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
            >
              Save {{ discountPercent }}%
            </span>
            <div
              v-if="isOutOfStock"
              class="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
            >
              <span
                class="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white"
              >
                Out of stock
              </span>
            </div>
          </div>

          <div v-if="gallery.length > 1" class="mt-4 flex gap-3">
            <button
              v-for="(img, index) in gallery"
              :key="index"
              type="button"
              class="relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition sm:w-24"
              :class="
                index === activeIndex
                  ? 'border-violet-600 ring-2 ring-violet-200'
                  : 'border-slate-200 hover:border-slate-300'
              "
              :aria-label="`View image ${index + 1}`"
              @click="activeIndex = index"
            >
              <img :src="resolve(img)" :alt="`${product.name} ${index + 1}`" class="h-full w-full object-cover" loading="lazy" />
            </button>
          </div>
        </div>

        <div class="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-24">
          <div class="flex items-center justify-between gap-4">
            <span
              class="inline-flex rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-700"
            >
              {{ product.category }}
            </span>
            <div class="flex items-center gap-2 text-xs font-medium">
              <span
                v-if="isOutOfStock"
                class="inline-flex items-center gap-1.5 text-rose-600"
              >
                <span class="size-2 rounded-full bg-rose-500"></span>
                Out of stock
              </span>
              <span v-else class="inline-flex items-center gap-1.5 text-emerald-600">
                <span class="size-2 rounded-full bg-emerald-500"></span>
                In stock
              </span>
            </div>
          </div>

          <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {{ product.name }}
          </h1>

          <div class="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p class="text-3xl font-bold text-slate-900 sm:text-4xl">
              {{ currencySymbol }}{{ product.price.toFixed(2) }}
            </p>
            <p
              v-if="product.comparePrice"
              class="pb-1 text-lg font-medium text-slate-400 line-through"
            >
              {{ currencySymbol }}{{ product.comparePrice.toFixed(2) }}
            </p>
            <span class="text-sm font-medium text-slate-500">{{ product.unit }}</span>
          </div>

          <p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            {{ product.description }}
          </p>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <div class="flex items-center justify-between rounded-xl border border-slate-200 px-4">
              <button
                type="button"
                class="py-3 text-slate-500 transition hover:text-violet-600"
                :class="quantity > 1 ? 'cursor-pointer' : 'cursor-not-allowed'"
                :disabled="quantity <= 1"
                aria-label="Decrease quantity"
                @click="decrementQuantity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                </svg>
              </button>
              <span class="min-w-8 text-center text-base font-semibold text-slate-800">
                {{ quantity }}
              </span>
              <button
                type="button"
                class="py-3 text-violet-600 transition hover:text-violet-700"
                :disabled="quantity >= maxQuantity"
                aria-label="Increase quantity"
                @click="incrementQuantity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              :disabled="isOutOfStock"
              @click="addToCart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              {{ isOutOfStock ? "Out of stock" : "Add to cart" }}
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl border px-4 py-3.5 text-sm font-semibold transition"
              :class="
                isFavorite
                  ? 'border-violet-200 bg-violet-50 text-violet-700'
                  : 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700'
              "
              :aria-pressed="isFavorite"
              @click="toggleFavorite"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                :fill="isFavorite ? 'currentColor' : 'none'"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </button>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-500 sm:grid-cols-3">
            <div class="rounded-xl bg-slate-50 px-3 py-2.5">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Unit</p>
              <p class="mt-0.5 font-medium text-slate-700">{{ product.unit }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 px-3 py-2.5">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Category</p>
              <p class="mt-0.5 font-medium capitalize text-slate-700">{{ product.category }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 px-3 py-2.5">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Availability</p>
              <p class="mt-0.5 font-medium" :class="isOutOfStock ? 'text-rose-600' : 'text-emerald-600'">
                {{ isOutOfStock ? "Out of stock" : "In stock" }}
              </p>
            </div>
          </div>

          <div v-if="product.benefits?.length" class="mt-6 border-t border-slate-100 pt-6">
            <h2 class="text-base font-semibold text-slate-900">Key benefits</h2>
            <ul class="mt-3 space-y-2.5 text-sm text-slate-600">
              <li
                v-for="(benefit, index) in product.benefits"
                :key="index"
                class="flex items-start gap-2.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mt-0.5 size-4 flex-shrink-0 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>{{ benefit }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-6 grid gap-2.5 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:grid-cols-3">
            <div class="flex items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5 flex-shrink-0 text-violet-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              <span>Free delivery over {{ currencySymbol }}2,000</span>
            </div>
            <div class="flex items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5 flex-shrink-0 text-violet-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
              <span>COD, bKash &amp; Nagad accepted</span>
            </div>
            <div class="flex items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5 flex-shrink-0 text-violet-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                />
              </svg>
              <span>Authentic &amp; quality checked</span>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
        <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .621-.504 1.125-1.125 1.125S7.5 10.371 7.5 9.75 8.004 8.625 8.625 8.625 9.75 9.129 9.75 9.75Zm7.5 0c0 .621-.504 1.125-1.125 1.125s-1.125-.504-1.125-1.125.504-1.125 1.125-1.125S17.25 9.129 17.25 9.75Z"
            />
          </svg>
        </div>
        <p class="mt-4 text-lg font-semibold text-slate-800">Product not found</p>
        <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <NuxtLink
          to="/shop"
          class="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to shop
        </NuxtLink>
      </section>

      <section v-if="product && relatedProducts.length" class="mt-16">
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
          <Products :products="relatedProducts" :columns="4" />
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useRuntimeConfig } from "#app";
import { useCatalogStore } from "~/stores/catalog";
import { useCartStore } from "~/stores/cart";
import { useFavoriteStore } from "~/stores/favorite";

definePageMeta({
  title: "Product | NutriZaria",
});

const route = useRoute();
const catalogStore = useCatalogStore();
const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();
const config = useRuntimeConfig();

const currencySymbol = config.public.currencySymbol || "Tk";
const { resolve } = useImageUrl();

await catalogStore.hydrate();

const productSlug = computed(() => route.params.slug as string);
const product = computed(() => catalogStore.productBySlug(productSlug.value));
const isLoading = computed(() => catalogStore.loading && !catalogStore.hydrated);

watch(productSlug, () => {
  quantity.value = 1;
  activeIndex.value = 0;
});

const gallery = computed<string[]>(() => {
  const p = product.value;
  if (!p) return [];
  return [...new Set([p.image, ...(p.images ?? [])].filter(Boolean))] as string[];
});

const activeIndex = ref(0);
watchEffect(() => {
  if (gallery.value.length) {
    activeIndex.value = Math.min(activeIndex.value, gallery.value.length - 1);
  }
});
const activeImage = computed(() => resolve(gallery.value[activeIndex.value]) || "/nutri.png");

const maxQuantity = computed(() => {
  const stock = product.value?.stock;
  return stock && stock > 0 ? stock : 99;
});
const quantity = ref(1);
const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value -= 1;
};
const incrementQuantity = () => {
  if (quantity.value < maxQuantity.value) quantity.value += 1;
};

const isOutOfStock = computed(() => product.value?.stock === 0);
const discountPercent = computed(() => {
  const p = product.value;
  if (!p?.comparePrice || p.comparePrice <= p.price) return 0;
  return Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
});

const isFavorite = computed(() =>
  favoriteStore.isFavorite(product.value?.id ?? "")
);
const toggleFavorite = () => {
  if (product.value) favoriteStore.toggleFavorite(product.value);
};

const addToCart = () => {
  if (product.value && !isOutOfStock.value) {
    cartStore.addToCart(product.value, quantity.value);
  }
};

const relatedProducts = computed(() =>
  catalogStore.products
    .filter((p) => String(p.id) !== String(product.value?.id))
    .slice(0, 4)
);

useSeo({
  title: () => (product.value ? product.value.name : "Product"),
  description: () => product.value?.description,
  image: () => (product.value ? resolve(product.value.image) : null),
  type: "product",
  noindex: () => !product.value,
  canonicalPath: () => (product.value ? `/products/${product.value.slug || product.value.id}` : undefined),
  jsonld: () => {
    const p = product.value;
    if (!p) return null;
    return [
      breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Shop", url: "/shop" },
        { name: p.category, url: `/categories/${p.category}` },
        { name: p.name, url: `/products/${p.slug || p.id}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        image: [resolve(p.image), ...(p.images ?? []).map((img) => resolve(img))],
        description: p.description,
        sku: p.sku || String(p.id),
        category: p.category,
        offers: {
          "@type": "Offer",
          url: absoluteUrl(`/products/${p.slug || p.id}`),
          priceCurrency: "BDT",
          price: p.price,
          availability: p.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      },
    ];
  },
});

watchEffect(() => {
  const p = product.value;
  if (p) {
    const { track } = useMetaPixel();
    track("ViewContent", {
      content_ids: [String(p.id)],
      content_name: p.name,
      content_type: "product",
      value: p.price,
      currency: "BDT",
    });
  }
});
</script>
