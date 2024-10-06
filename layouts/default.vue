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

const cartStore = useCartStore();
if (typeof window !== "undefined") {
  cartStore.loadCartFromLocalStorage();
}
</script>
