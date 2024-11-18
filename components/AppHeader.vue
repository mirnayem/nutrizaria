<template>
  <header class="bg-white shadow-md fixed w-full z-50">
    <TopNavBar />
    <nav
      class="container mx-auto h-12 flex justify-between items-center lg:px-0 px-4 shadow-lg"
    >
      <div class="logo-search flex items-center gap-5">
        <NuxtLink to="/" class="text-orange-800 uppercase text-xl font-medium"
          >Nutriʾakl</NuxtLink
        >
        <SearchProduct
          class="w-full lg:min-w-[600px] md:min-w-[400px] md:flex hidden"
        />
      </div>
      <div class="support-cart-favorite items-center gap-3 md:flex hidden">
        <Support />
        <div class="sm:flex items-center gap-3 hidden">
          <div class="favorite mt-1">
            <svg
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
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </div>
          <ClientOnly>
            <div
              class="cart-bag relative cursor-pointer"
              @click="cartStore.toggleCart()"
            >
              <span
                class="absolute -right-3 -top-2 w-5 h-5 flex items-center justify-center rounded-full bg-orange-700 text-white text-xs"
                >{{ cartStore.totalItems }}</span
              >
              <svg
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
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
            <div class="total">Total: ${{ cartStore.totalPrice }}</div>
          </ClientOnly>
        </div>
      </div>
    </nav>
    <ShoppingCart />
    <SidebarDrawer />
    <SearchProduct class="w-full md:hidden flex mt-2" />
  </header>
</template>

<script setup>
const route = useRoute();
import { useCartStore } from "~/stores/cart";
const cartStore = useCartStore();
</script>

<style scoped></style>
