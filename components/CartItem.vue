<template>
  <article class="flex gap-4 py-4">
    <div class="shrink-0">
      <img
        :src="imgSrc(cartItem.image)"
        :alt="cartItem.name"
        loading="lazy"
        class="h-16 w-16 rounded-2xl object-cover"
      />
    </div>
    <div class="flex flex-1 flex-col text-sm text-slate-600">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-base font-semibold text-slate-900">
            {{ cartItem.name }}
          </p>
          <p class="text-xs text-slate-500">
            {{ currencySymbol }}{{ cartItem.price.toFixed(2) }} /
            {{ cartItem.unit }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          @click="removeFromCart(cartItem.id)"
        >
          <span class="sr-only">Remove {{ cartItem.name }} from cart</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="size-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900"
        >
          <button
            type="button"
            class="rounded-full p-1 transition hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent"
            @click="updateCartItem(cartItem.id, 'DEC')"
            :disabled="cartItem.quantity === 1"
            aria-label="Decrease {{ cartItem.name }} quantity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="size-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <span class="min-w-[1.5rem] text-center text-base font-semibold">
            {{ cartItem.quantity }}
          </span>
          <button
            type="button"
            class="rounded-full p-1 transition hover:bg-slate-100"
            @click="updateCartItem(cartItem.id, 'INC')"
            aria-label="Increase {{ cartItem.name }} quantity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="size-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
          </button>
        </div>
        <p class="ml-auto text-base font-semibold text-slate-900">
          {{ currencySymbol }}{{ lineTotal.toFixed(2) }}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRuntimeConfig } from "#app";
import type { CartItem } from "~/types/product";
import { useCartStore } from "~/stores/cart";

const cartStore = useCartStore();

function removeFromCart(itemId: number) {
  cartStore.removeFromCart(itemId);
}

function updateCartItem(itemId: number, type: string) {
  cartStore.updateCartItem(itemId, type);
}

interface Props {
  cartItem: CartItem;
}

const props = defineProps<Props>();
const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || "Tk";
const lineTotal = computed(() => props.cartItem.price * props.cartItem.quantity);

const { resolve } = useImageUrl();
function imgSrc(url: string | null | undefined): string {
  return resolve(url) || "/nutri.png";
}
</script>
