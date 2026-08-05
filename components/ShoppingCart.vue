<template>
  <ClientOnly>
    <transition name="cart-fade">
      <div
        v-if="cartStore.isCartOpen"
        class="fixed inset-0 z-[70] flex justify-end"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          class="absolute inset-0 bg-slate-900/60"
          aria-label="Close cart overlay"
          @click="closeCart"
        ></button>
        <transition name="cart-slide">
          <aside
            v-if="cartStore.isCartOpen"
            ref="cartRef"
            class="relative ml-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl"
            tabindex="-1"
            :style="cartPanelStyle"
          >
            <header class="border-b border-slate-100 px-6 py-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-lg font-semibold text-slate-900">
                    Shopping cart
                  </p>
                  <p class="text-sm text-slate-500">
                    {{ cartStore.totalItems }} items selected
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-violet-700"
                  @click="closeCart"
                  aria-label="Close cart drawer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="size-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </header>

            <div class="flex-1 overflow-y-auto px-6 scrollbar-slim">
              <div v-if="cartStore.items.length" class="divide-y divide-slate-100">
                <CartItem
                  v-for="cartItem in cartStore.items"
                  :key="cartItem.id"
                  :cartItem="cartItem"
                />
              </div>
              <div
                v-else
                class="flex h-full flex-col items-center justify-center text-center"
              >
                <div
                  class="flex size-20 items-center justify-center rounded-full bg-slate-50 text-slate-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="size-8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                </div>
                <p class="mt-4 text-lg font-semibold text-slate-900">
                  Your cart feels light
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  Add a few items to start checkout. We save your cart
                  automatically.
                </p>
                <NuxtLink
                  to="/shop"
                  class="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                  @click="closeCart"
                >
                  Browse products
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="size-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </NuxtLink>
              </div>
            </div>

            <footer class="border-t border-slate-100 px-6 py-5">
              <div class="flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{{ currencySymbol }}{{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>
              <button
                type="button"
                class="mt-4 w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                @click="handleCheckout"
                :disabled="!cartStore.items.length"
              >
                Checkout now
              </button>
              <button
                type="button"
                class="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                @click="closeCart"
              >
                Continue shopping
              </button>
            </footer>
          </aside>
        </transition>
      </div>
    </transition>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRuntimeConfig } from "#app";
import { useCartStore } from "@/stores/cart";
import { useClickOutside } from "~/composables/useClickOutside";

const cartStore = useCartStore();
const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || "Tk";
const cartRef = ref<HTMLElement | null>(null);
const cartPanelStyle = computed(() => ({
  height: "100dvh",
  maxHeight: "100dvh",
  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
}));

const closeCart = () => {
  if (cartStore.isCartOpen) {
    cartStore.toggleCart();
  }
};

const handleCheckout = async () => {
  if (!cartStore.items.length) return;
  await navigateTo("/checkout");
  closeCart();
};

useClickOutside(cartRef, () => {
  cartStore.isCartOpen = false;
});
</script>

<style scoped>
.cart-fade-enter-active,
.cart-fade-leave-active {
  transition: opacity 0.25s ease;
}
.cart-fade-enter-from,
.cart-fade-leave-to {
  opacity: 0;
}

.cart-slide-enter-active,
.cart-slide-leave-active {
  transition: transform 0.3s ease;
}
.cart-slide-enter-from,
.cart-slide-leave-to {
  transform: translateX(100%);
}
</style>
