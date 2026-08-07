<template>
  <div>
    <AppHeader />
    <div class="mx-auto w-full max-w-[1600px] min-h-screen pb-16 pt-14 sm:pt-16 lg:pt-20">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { useCartStore } from "~/stores/cart";
import { useUserStore } from "~/stores/user";
import { useFavoriteStore } from "~/stores/favorite";

onMounted(() => {
  const cartStore = useCartStore();
  const userStore = useUserStore();
  const favoriteStore = useFavoriteStore();

  cartStore.loadCartFromLocalStorage();
  userStore.loadAuthenticatedUser();
  favoriteStore.loadFavorites();
});
</script>
