<template>
  <div>
    <AppHeader />
    <div class="mx-auto w-full max-w-[1600px] min-h-screen pb-16 pt-14 sm:pt-16 lg:pt-32">
      <slot />
    </div>
    <AppFooter />

    <!-- Floating Cart Button (Mobile Only) -->
    <button
      v-if="cartTotalItems"
      type="button"
      class="fixed bottom-5 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:bg-violet-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:hidden"
      @click="cartStore.toggleCart()"
      aria-label="Open shopping cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="h-5 w-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      <span
        class="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white"
      >
        {{ cartTotalItems }}
      </span>
    </button>
  </div>
</template>
<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCartStore } from "~/stores/cart";
import { useUserStore } from "~/stores/user";
import { useFavoriteStore } from "~/stores/favorite";

const cartStore = useCartStore();
const { totalItems: cartTotalItems } = storeToRefs(cartStore);

onMounted(() => {
  const userStore = useUserStore();
  const favoriteStore = useFavoriteStore();

  cartStore.loadCartFromLocalStorage();
  userStore.loadAuthenticatedUser();
  favoriteStore.loadFavorites();
});
</script>
