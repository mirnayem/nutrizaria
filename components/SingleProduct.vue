<script setup lang="ts">
import { computed, ref } from "vue";
import { useRuntimeConfig } from "#app";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "~/stores/favorite";
import type { CartItem, Product } from "~/types/product";

const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();

interface Props {
  product: Product;
  priority?: boolean;
}

const props = defineProps<Props>();

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || "Tk";
const detailLink = computed(() => `/products/${props.product.slug || props.product.id}`);

const selectedItem = computed<CartItem>(() => {
  const v = activeVariant.value;
  return {
    id: v ? `${props.product.id}-${v.id}` : props.product.id,
    productId: props.product.id,
    name: props.product.name,
    price: displayPrice.value,
    image: v?.image || props.product.image,
    quantity: 1,
    unit: displayUnit.value,
    variantId: v?.id,
    variantLabel: variantSizeLabel(v),
  };
});

const { resolve } = useImageUrl();
const imageSrc = computed(
  () => resolve(activeVariant.value?.image || props.product.image) || "/nutri.png"
);

const activeVariants = computed(() => {
  const vs = props.product.variants || [];
  return vs
    .filter((v) => v.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.price ?? 0) - (b.price ?? 0));
});
const hasVariants = computed(() => activeVariants.value.length > 0);

const selectedVariant = ref<any | null>(null);
watch(
  () => props.product.variants,
  (vs) => {
    if (!vs || vs.length === 0) {
      selectedVariant.value = null;
      return;
    }
    const active = vs.filter((v) => v.isActive !== false);
    selectedVariant.value = active.find((v) => v.stock > 0) || active[0] || null;
  },
  { immediate: true, deep: true }
);
const selectVariant = (v: any) => {
  if (v.stock > 0) selectedVariant.value = v;
};

const activeVariant = computed(() => selectedVariant.value || null);
const variantSizeLabel = (v: any) =>
  v && v.weight > 0 && v.unit ? `${v.weight}${v.unit}` : v.label || "";
const displayPrice = computed(() => activeVariant.value?.price ?? props.product.price);
const displayUnit = computed(() => activeVariant.value?.unit ?? props.product.unit);
const displayComparePrice = computed(() =>
  activeVariant.value?.comparePrice ?? props.product.comparePrice
);
const displayStock = computed(() =>
  hasVariants.value
    ? (activeVariant.value?.stock ?? 0)
    : (props.product.stock ?? 0)
);
const isOutOfStock = computed(() => displayStock.value === 0);
const discountPercent = computed(() => {
  const { comparePrice } = props.product;
  const price = displayPrice.value;
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
});

const handleQuickAdd = () => {
  if (isOutOfStock.value) return;
  cartStore.addToCart(selectedItem.value);
  isModalOpen.value = false;
};
const isFavorite = computed(() => favoriteStore.isFavorite(props.product.id));
const toggleFavorite = () => favoriteStore.toggleFavorite(props.product);

const isModalOpen = ref(false);
const openModal = () => (isModalOpen.value = true);
</script>

<template>
  <article
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    <NuxtLink
      :to="detailLink"
      class="relative block aspect-square overflow-hidden bg-slate-100"
      :aria-label="`View ${product.name}`"
    >
      <img
        :src="imageSrc"
        :alt="product.name"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        width="600"
        height="600"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
      />

      <span
        v-if="discountPercent > 0"
        class="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
      >
        -{{ discountPercent }}%
      </span>

      <div
        v-if="isOutOfStock"
        class="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
      >
        <span
          class="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
        >
          Out of stock
        </span>
      </div>
    </NuxtLink>

    <button
      type="button"
      class="absolute right-3 top-3 rounded-full p-2 shadow-sm transition"
      :class="
        isFavorite
          ? 'bg-violet-600 text-white'
          : 'bg-white/90 text-slate-500 hover:text-violet-600'
      "
      :aria-pressed="isFavorite"
      aria-label="Toggle favorite"
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

    <div class="flex flex-1 flex-col p-3.5 sm:p-4">
      <span class="text-[10px] font-semibold uppercase tracking-wider text-violet-600 sm:text-[11px]">
        {{ product.category }}
      </span>
      <span v-if="product.brand" class="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
        {{ product.brand }}
      </span>
      <NuxtLink
        :to="detailLink"
        class="mt-1 line-clamp-2 text-sm font-semibold text-slate-800 transition hover:text-violet-700 sm:text-[15px]"
      >
        {{ product.name }}
      </NuxtLink>

      <div
        v-if="isOutOfStock"
        class="mt-1.5 flex items-center gap-1 text-[11px] text-rose-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-3 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <span>Out of stock</span>
      </div>

      <div
        v-if="hasVariants"
        class="mt-2.5 flex flex-wrap gap-1.5"
        role="radiogroup"
        aria-label="Select size"
      >
        <button
          v-for="v in activeVariants"
          :key="v.id"
          type="button"
          role="radio"
          :aria-checked="activeVariant?.id === v.id"
          :disabled="v.stock === 0"
          class="rounded-full border px-2.5 py-1 text-[11px] font-medium transition disabled:cursor-not-allowed"
          :class="v.stock === 0
            ? 'border-slate-200 text-slate-300 line-through'
            : activeVariant?.id === v.id
              ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
              : 'border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600'"
          @click="selectVariant(v)"
        >
          {{ variantSizeLabel(v) }}
        </button>
      </div>

      <div class="mt-auto flex items-end justify-between gap-2 pt-3">
        <div class="min-w-0">
          <p class="text-base font-bold text-slate-900 sm:text-lg">
            {{ currencySymbol }}{{ displayPrice.toFixed(2) }}
          </p>
          <p
            v-if="displayComparePrice > displayPrice"
            class="text-xs font-medium text-slate-500 line-through"
          >
            {{ currencySymbol }}{{ displayComparePrice.toFixed(2) }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:text-sm"
          :disabled="isOutOfStock"
          :aria-label="`Add ${product.name} to cart`"
          @click="handleQuickAdd"
        >
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
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <span class="hidden sm:inline">Add</span>
          <span class="sm:hidden">+</span>
        </button>
      </div>
    </div>

    <AppModal
      :is-open="isModalOpen"
      @handle-modal="isModalOpen = $event"
      :title="product.name"
    >
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="lg:w-1/2">
          <div class="rounded-2xl bg-slate-100 p-2">
            <img
              :src="imageSrc"
              :alt="product.name"
              loading="lazy"
              class="h-full w-full rounded-xl object-cover"
            />
          </div>
        </div>
        <div class="flex flex-1 flex-col gap-5 text-sm text-slate-600">
          <div>
            <p class="text-sm uppercase tracking-wide text-violet-600">
              {{ product.category }}
            </p>
            <h3 class="text-2xl font-semibold text-slate-900">
              {{ product.name }}
            </h3>
          </div>
          <p>{{ product.description }}</p>
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="flex items-end gap-3">
              <p class="text-3xl font-semibold text-violet-700">
                {{ currencySymbol }}{{ displayPrice.toFixed(2) }}
              </p>
              <p
                v-if="displayComparePrice > displayPrice"
                class="pb-1 text-sm font-medium text-slate-500 line-through"
              >
                {{ currencySymbol }}{{ displayComparePrice.toFixed(2) }}
              </p>
            </div>
            <p class="text-xs uppercase tracking-wide text-slate-500">
              {{ displayUnit }}
            </p>
          </div>
          <QuantityControl :product="product" />
          <div class="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              class="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-200"
              :disabled="isOutOfStock"
              @click="handleQuickAdd"
            >
              Add to cart
            </button>
            <NuxtLink
              :to="detailLink"
              class="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-violet-500 hover:text-violet-700"
            >
              View full details
            </NuxtLink>
          </div>
          <div v-if="product.benefits?.length">
            <p class="pb-3 text-base font-semibold text-slate-900">Benefits</p>
            <ul class="space-y-3 text-sm text-slate-600">
              <li
                v-for="(benefit, index) in product.benefits"
                :key="index"
                class="flex gap-3"
              >
                <span class="mt-1 size-1.5 rounded-full bg-violet-600"></span>
                <p>{{ benefit }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppModal>
  </article>
</template>
