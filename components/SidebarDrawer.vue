<template>
  <div class="relative block md:hidden">
    <button
      @click="toggleDrawer"
      class="absolute right-4 -top-10 text-gray-700 focus:outline-none rounded-md"
      aria-label="navigate drawer"
    >
      <svg
        class="w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16m-7 6h7"
        />
      </svg>
    </button>
    <transition name="slide">
      <div
        v-if="drawerOpen"
        class="fixed top-0 left-0 w-3/4 h-full bg-white shadow-lg z-40 transition-transform transform -translate-x-full"
        :class="drawerOpen ? 'translate-x-0' : ''"
      >
        <nav class="px-4 py-10 space-y-4">
          <div class="logo flex items-center gap-2">
            <img
              class="w-12 h-12 rounded-full object-cover"
              src="/nutri.png"
              alt="NutriZaria"
            />
            <div>
              <p class="xsm:text-2xl text-xl">NutriZaria</p>
              <p class="xsm:text-sm text-xs font-thin">
                Authenticity with affordability
              </p>
            </div>
          </div>
          <div class="divider w-full h-0.5 bg-slate-800"></div>
          <div class="menu-lists grid gap-4 mt-2">
            <NuxtLink
              class="menu-single h-10 px-2 flex items-center hover:bg-violet-100 cursor-pointer rounded"
              to="/shop"
              >Shop</NuxtLink
            >

            <NuxtLink
              class="menu-single h-10 px-2 flex items-center hover:bg-violet-100 cursor-pointer rounded"
              to="/blog"
              >Blog</NuxtLink
            >

            <NuxtLink
              class="menu-single h-10 px-2 flex items-center hover:bg-violet-100 cursor-pointer rounded"
              to="/contact"
              >Contact</NuxtLink
            >

            <NuxtLink
              class="menu-single h-10 px-2 flex items-center hover:bg-violet-100 cursor-pointer rounded"
              to="/faq"
              >FAQ</NuxtLink
            >

            <NuxtLink
              class="menu-single h-10 px-2 flex items-center hover:bg-violet-100 cursor-pointer rounded"
              to="/checkout"
              >Checkout</NuxtLink
            >
          </div>
        </nav>
      </div>
    </transition>
    <div
      v-if="drawerOpen"
      @click="toggleDrawer"
      class="fixed inset-0 bg-black bg-opacity-50 z-30"
    ></div>
  </div>
</template>
<script setup>
import { ref } from "vue";

const drawerOpen = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
