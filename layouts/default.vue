<template>
  <div>
    <AppHeader />
    <div class="container min-h-screen md:pt-24 pt-36 pb-10 z-10 lg:px-0 px-4">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
<script setup>
import { useCartStore } from "~/stores/cart";
import { useUserStore } from "~/stores/user";
import { onMounted } from "vue";

const cartStore = useCartStore();
const userStore = useUserStore();

onMounted(() => {
  cartStore.loadCartFromLocalStorage();
  userStore.loadAuthenticatedUser();
});
</script>
