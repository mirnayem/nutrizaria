<template>
  <div>
    <AppHeader />
    <div class="container min-h-screen pt-32 pb-0 z-10 lg:px-0 px-4">
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
