<template>
  <div>
    <AppHeader />
    <div class="container min-h-screen pt-24 z-10">
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
