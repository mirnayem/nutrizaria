<template>
  <div>
    <AppHeader />
    <div class="container min-h-screen pb-16 pt-48 sm:pt-36 lg:pt-20">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { useCartStore } from "~/stores/cart";
import { useUserStore } from "~/stores/user";
import { useCatalogStore } from "~/stores/catalog";

const cartStore = useCartStore();
const userStore = useUserStore();
const catalogStore = useCatalogStore();

onMounted(() => {
  catalogStore.hydrate();
  cartStore.loadCartFromLocalStorage();
  userStore.loadAuthenticatedUser();
});
</script>
