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
}

const props = defineProps<Props>();

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || "Tk";
const detailLink = computed(() => `/products/${props.product.id}`);

const selectedItem = computed<CartItem>(() => ({
  id: props.product.id,
  name: props.product.name,
  price: props.product.price,
  image: props.product.image,
  quantity: 1,
  unit: props.product.unit,
}));

const imageSrc = computed(() =>
  props.product.image ? `/images/${props.product.image}` : "/nutri.png"
);

const handleQuickAdd = () => {
  cartStore.addToCart(selectedItem.value);
  isModalOpen.value = false;
};
const addToFavorite = () => favoriteStore.addToFavorite(props.product);

const isModalOpen = ref(false);
const openModal = () => (isModalOpen.value = true);
</script>

<template>
  <article
    class="group flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-4"
  >
    <div class="relative overflow-hidden rounded-2xl bg-slate-100">
      <img
        :src="imageSrc"
        :alt="product.name"
        loading="lazy"
        class="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <button
        type="button"
        class="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-slate-600 shadow"
        @click="addToFavorite"
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
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      </button>
      <button
        type="button"
        class="absolute left-3 bottom-3 hidden items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:text-violet-700 sm:inline-flex"
        @click="openModal"
      >
        Quick look
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="size-4"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7Z"
          />
        </svg>
      </button>
      <button
        type="button"
        class="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:text-violet-700 sm:hidden"
        @click="openModal"
      >
        View
      </button>
    </div>
    <div class="mt-3 flex flex-1 flex-col gap-2 text-sm text-slate-500">
      <span class="uppercase tracking-wide text-[11px] text-violet-600">
        {{ product.category }}
      </span>
      <h3 class="text-lg font-semibold text-slate-800">
        {{ product.name }}
      </h3>
      <p class="line-clamp-2 text-sm">
        {{ product.description }}
      </p>
      <div class="mt-auto flex items-center justify-between pt-2">
        <p class="text-lg font-semibold text-violet-700">
          {{ currencySymbol }}{{ product.price.toFixed(2) }}
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-violet-500 hover:text-violet-600"
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add
        </button>
      </div>
      <NuxtLink
        :to="detailLink"
        class="mt-2 inline-flex items-center justify-center rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-violet-400 hover:text-violet-700"
      >
        View details
      </NuxtLink>
    </div>

    <AppModal
      :isOpen="isModalOpen"
      @handleModal="isModalOpen = $event"
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
            <p class="text-3xl font-semibold text-violet-700">
              {{ currencySymbol }}{{ product.price.toFixed(2) }}
            </p>
            <p class="text-xs uppercase tracking-wide text-slate-500">
              {{ product.unit }}
            </p>
          </div>
          <QuantityControl :product="product" />
          <div class="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              class="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
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
          <div>
            <p class="pb-3 text-base font-semibold text-slate-900">
              Benefits
            </p>
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
