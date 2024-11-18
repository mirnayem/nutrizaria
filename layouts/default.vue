<template>
    <div>
      <AppHeader/>
      <div class="container min-h-screen md:pt-24 pt-36 pb-10 z-10 lg:px-0 px-4">
        <slot />
      </div>
      <AppFooter />
    </div>
</template>
<script setup>
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "~/stores/user";

const cartStore = useCartStore();
const userStore = useUserStore();
if (typeof window !== "undefined") {
  cartStore.loadCartFromLocalStorage();
  userStore.loadAuthenticatedUser();
}
</script>
