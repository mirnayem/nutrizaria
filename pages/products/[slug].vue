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
              width="1024"
              height="1024"
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
              <img :src="resolve(img)" :alt="`${product.name} ${index + 1}`" width="96" height="96" class="h-full w-full object-cover" loading="lazy" />
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
              <span v-else class="inline-flex items-center gap-1.5 text-emerald-700">
                <span class="size-2 rounded-full bg-emerald-500"></span>
                In stock
              </span>
            </div>
          </div>

          <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {{ product.name }}
          </h1>
          <p
            v-if="product.brand"
            class="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500"
          >
            Brand: {{ product.brand }}
          </p>

          <!-- Variant Selector -->
          <div v-if="variantOptions.length > 0" class="mt-6">
            <label class="text-sm font-semibold text-slate-800">Options</label>
            <div class="mt-2.5 flex flex-wrap gap-2">
              <button
                v-for="variant in variantOptions"
                :key="variant.id"
                type="button"
                :disabled="variant.stock === 0"
                class="min-w-16 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition"
                :class="variant.stock === 0
                  ? 'cursor-not-allowed border-slate-200 text-slate-300 line-through'
                  : selectedVariant?.id === variant.id
                    ? 'border-violet-600 bg-violet-50 text-violet-700 ring-2 ring-violet-200'
                    : 'border-slate-200 text-slate-700 hover:border-violet-300'"
                @click="selectedVariant = variant"
              >
                {{ variantSizeLabel(variant) }}
              </button>
            </div>
          </div>

          <!-- Price Display -->
          <div class="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
            <div v-if="selectedVariant" class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-slate-900 sm:text-4xl">
                {{ currencySymbol }}{{ activeProduct?.price.toFixed(2) }}
              </span>
              <span
                v-if="activeProduct?.comparePrice && activeProduct.comparePrice > activeProduct.price"
                class="pb-1 text-lg font-medium text-slate-400 line-through"
              >
                {{ currencySymbol }}{{ activeProduct.comparePrice.toFixed(2) }}
              </span>
            </div>
            <div v-else class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-slate-900 sm:text-4xl">
                {{ currencySymbol }}{{ product.price.toFixed(2) }}
              </span>
              <span v-if="product.comparePrice" class="pb-1 text-lg font-medium text-slate-500 line-through">
                {{ currencySymbol }}{{ product.comparePrice.toFixed(2) }}
              </span>
              <span class="text-sm text-slate-500">{{ product.unit }}</span>
            </div>
          </div>

          <p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            {{ product.description }}
          </p>

          <div class="mt-6 space-y-4">
            <!-- Quantity Selector -->
            <div class="flex items-center gap-3">
              <label class="text-sm font-medium text-slate-700 w-20 shrink-0">Quantity</label>
              <div class="flex items-center gap-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  class="flex h-12 w-12 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="quantity <= 1"
                  aria-label="Decrease quantity"
                  @click="decrementQuantity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <div class="flex h-12 w-12 items-center justify-center border-x border-slate-200 bg-slate-50">
                  <span class="text-base font-semibold text-slate-800 tabular-nums">{{ quantity }}</span>
                </div>
                <button
                  type="button"
                  class="flex h-12 w-12 items-center justify-center text-violet-600 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="quantity >= maxQuantity"
                  aria-label="Increase quantity"
                  @click="incrementQuantity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Add to Cart + Wishlist + Share -->
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                :disabled="isOutOfStock"
                @click="addToCart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <span>
                  {{ isOutOfStock ? "Out of stock" : "Add to cart" }}
                </span>
              </button>

              <div class="flex items-center gap-2">
                <!-- Wishlist -->
                <button
                  type="button"
                  class="flex h-12 w-12 items-center justify-center rounded-xl border transition"
                  :class="
                    isFavorite
                      ? 'border-violet-200 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50'
                  "
                  :aria-pressed="isFavorite"
                  :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
                  @click="toggleFavorite"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" :fill="isFavorite ? 'currentColor' : 'none'" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>

                <!-- Share -->
                <ShareButton
                  v-if="product"
                  :title="`${product.name} - NutriZaria`"
                  :url="shareUrl"
                  label="Share this product"
                />
              </div>
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
import { absoluteUrl, breadcrumbJsonLd } from "~/composables/useSeo";

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

const selectedVariant = ref<any | null>(null);

const variantSizeLabel = (v: any) =>
  v && v.weight > 0 && v.unit ? `${v.weight}${v.unit}` : v.label || "";

const variantOptions = computed(() => {
  const vs = product.value?.variants || [];
  return vs
    .filter((v: any) => v.isActive !== false)
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.price ?? 0) - (b.price ?? 0));
});

watch(productSlug, () => {
  quantity.value = 1;
  activeIndex.value = 0;
  selectedVariant.value = null;
});

watch(() => product.value?.variants, (variants) => {
  if (!variants || variants.length === 0) {
    selectedVariant.value = null;
    return;
  }
  if (selectedVariant.value) {
    const stillExists = variants.find((v: any) => v.id === selectedVariant.value?.id);
    if (!stillExists) selectedVariant.value = null;
  }
  if (!selectedVariant.value) {
    selectedVariant.value =
      variants.find((v: any) => v.isActive !== false && v.stock > 0) || variants[0];
  }
}, { immediate: true, deep: true });

const activeProduct = computed(() => {
  const p = product.value;
  if (!p) return null;
  if (selectedVariant.value) {
    return {
      ...p,
      price: selectedVariant.value.price,
      comparePrice: selectedVariant.value.comparePrice,
      stock: selectedVariant.value.stock,
      unit: selectedVariant.value.unit,
      sku: selectedVariant.value.sku,
      image: selectedVariant.value.image || p.image,
      _variant: selectedVariant.value,
    };
  }
  return p;
});

const gallery = computed<string[]>(() => {
  const p = product.value;
  if (!p) return [];
  if (p.variants && p.variants.length > 0) return [];
  return [...new Set([p.image, ...(p.images ?? [])].filter(Boolean))] as string[];
});

const activeIndex = ref(0);
watchEffect(() => {
  if (gallery.value.length) {
    activeIndex.value = Math.min(activeIndex.value, gallery.value.length - 1);
  }
});
const activeImage = computed(() => {
  const variantImg = selectedVariant.value?.image;
  if (variantImg) return resolve(variantImg);
  return resolve(gallery.value[activeIndex.value] || product.value?.image) || "/nutri.png";
});

const maxQuantity = computed(() => {
  const stock = activeProduct.value?.stock;
  return stock && stock > 0 ? stock : 99;
});
const quantity = ref(1);
const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value -= 1;
};
const incrementQuantity = () => {
  if (quantity.value < maxQuantity.value) quantity.value += 1;
};

const isOutOfStock = computed(() => activeProduct.value?.stock === 0);
const discountPercent = computed(() => {
  const p = activeProduct.value;
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
  if (activeProduct.value && !isOutOfStock.value) {
    cartStore.addToCart(activeProduct.value, quantity.value);
  }
};

const relatedProducts = computed(() =>
  catalogStore.products
    .filter((p) => String(p.id) !== String(product.value?.id))
    .slice(0, 4)
);

const seo = useSeo({
  title: () => (product.value ? product.value.name : "Product"),
  description: () => product.value?.description,
  image: () => activeProduct.value?.image ?? product.value?.image ?? null,
  type: "product",
  noindex: () => !product.value,
  canonicalPath: () => (product.value ? `/products/${product.value.slug || product.value.id}` : undefined),
  jsonld: () => {
    const p = product.value;
    if (!p) return null;
    const base = config.public.siteUrl || "https://nutrizaria.com";
    const abs = (path: string) => absoluteUrl(path, base);
    const img = (path: string) => abs(resolve(path));
    const variant = activeProduct.value?._variant;
    const images = variant?.image ? [variant.image, p.image, ...(p.images ?? [])] : [p.image, ...(p.images ?? [])];
    return [
      breadcrumbJsonLd(
        [
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: p.category, url: `/categories/${p.category}` },
          { name: p.name, url: `/products/${p.slug || p.id}` },
        ]
      ),
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        image: images.filter(Boolean).map(im => img(im)),
        description: p.description,
        sku: variant?.sku || p.sku || String(p.id),
        category: p.category,
        ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
        offers: {
          "@type": "Offer",
          url: abs(`/products/${p.slug || p.id}`),
          priceCurrency: "BDT",
          price: activeProduct.value?.price ?? p.price,
          availability: activeProduct.value?.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      },
    ];
  },
});

const shareUrl = computed(() => seo.canonicalUrl.value);

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
