<template>
  <div
    class="cart-item grid grid-cols-12 text-xs px-3 place-items-center gap-2"
  >
    <div class="image col-span-2">
      <NuxtImg
        :src="`/images/${cartItem.image}`"
        :alt="cartItem.name"
        width="50"
        height="50"
        loading="lazy"
        sizes="100vw sm:50vw md:400px"
        class="rounded-md w-12 h-12 object-cover"
      />
    </div>
    <div class="name col-span-3">{{ cartItem.name }}</div>
    <div class="price col-span-3">{{ cartItem.price }}</div>
    <div class="quantity col-span-3">{{ cartItem.quantity }}</div>
    <div class="close-col-span-2">
      <svg
        @click="removeFromCart(cartItem.id)"
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
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { CartItem } from "~/types/product";
import { useCartStore } from "~/stores/cart";
const cartStore = useCartStore();

function removeFromCart(itemId: number) {
  cartStore.removeFromCart(itemId);
}

function updateCartItem(itemId: number, quantity: number) {
  cartStore.updateCartItem(itemId, quantity);
}

interface Props {
  cartItem: CartItem;
}
const props = defineProps<Props>();
</script>
