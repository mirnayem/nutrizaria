<template>
  <ClientOnly>
    <div class="shopping-cart">
      <div
        :class="cartStore.isCartOpen ? 'translate-x-0' : 'translate-x-full'"
        class="fixed top-20 right-0 w-[320px] h-full bg-slate-100 shadow-lg transition-transform duration-300 ease-in-out z-50"
      >
        <div>
          <div
            class="total-items flex justify-between items-center bg-slate-600 text-white px-4 py-2"
          >
            <div class="flex gap-2 items-center text-lg font-semibold">
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
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <div class="mt-1">{{ cartStore.totalItems }} Items</div>
            </div>
            <svg
              @click="handleCart"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div class="cart-items divide-y grid gap-4">
            <CartItem
              class="pt-4"
              v-for="cartItem in cartStore.items"
              :key="cartItem.id"
              :cartItem="cartItem"
            />
          </div>
        </div>
        <div
          class="place-order-total absolute bottom-24 w-full left-0 h-16 flex items-center justify-between text-white cursor-pointer"
        >
          <div
            @click="
              navigateToCheckout();
              closeCart();
            "
            class="place-order w-2/3 pl-3 h-full flex items-center justify-between bg-orange-500"
          >
            Place Order
          </div>
          <div
            class="total-amount w-1/3 bg-slate-800 h-full pr-3 flex items-center justify-center"
          >
            ${{ cartStore.totalPrice }}
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useCartStore } from "@/stores/cart";

const cartStore = useCartStore();

const navigateToCheckout = () => {
  navigateTo("/checkout");
};
const closeCart = () => {
  cartStore.toggleCart;
};
const handleCart = () => {
  cartStore.toggleCart;
};
</script>
