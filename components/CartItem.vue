<template>
  <ClientOnly>
    <div
      class="cart-item grid grid-cols-12 text-xs px-3 place-items-center py-3"
    >
      <div class="quantity col-span-2 grid place-items-center mr-4 text-sm">
        <div
          class="increment cursor-pointer"
          @click="updateCartItem(cartItem.id, 'INC')"
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
              d="m4.5 15.75 7.5-7.5 7.5 7.5"
            />
          </svg>
        </div>
        <p>{{ cartItem.quantity }}</p>
        <div class="decrement">
          <svg
            @click="updateCartItem(cartItem.id, 'DEC')"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            :class="`size-4 ${
              cartItem.quantity === 1
                ? 'text-gray-300 cursor-default'
                : 'cursor-pointer'
            }`"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>

      <div class="image col-span-2">
        <NuxtImg
          :src="`/images/${cartItem.image}`"
          :alt="cartItem.name"
          width="40"
          height="40"
          loading="lazy"
          sizes="lg:200px 100px"
          class="rounded-md w-10 h-10 object-cover aspect-square"
        />
      </div>
      <div class="name col-span-5">
        <p>{{ cartItem.name }}</p>
        <p>${{ cartItem.price + "/" + cartItem.unit }}</p>
      </div>
      <div class="price col-span-2">
        ${{ cartItem.price * cartItem.quantity }}
      </div>
      <div class="close-col-span-1">
        <svg
          @click="removeFromCart(cartItem.id)"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4 cursor-pointer"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>
    </div>
  </ClientOnly>
</template>
<script setup lang="ts">
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
</script>
