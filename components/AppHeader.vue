<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl"
  >
    <div
      class="container flex items-center justify-between gap-3 py-3 text-sm font-medium text-slate-700"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2 text-lg font-semibold text-violet-700"
      >
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white">
          NZ
        </span>
        NutriZaria
      </NuxtLink>

      <nav class="hidden items-center gap-6 lg:flex">
        <NuxtLink
          to="/shop"
          class="transition hover:text-violet-700"
          active-class="text-violet-700"
        >
          Shop
        </NuxtLink>
        <div
          class="relative"
          @mouseenter="toggleCategories(true)"
          @mouseleave="toggleCategories(false)"
        >
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-sm font-medium transition hover:border-violet-200 hover:text-violet-700"
          >
            Categories
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div
            v-if="isCategoriesOpen"
            class="absolute left-1/2 top-10 w-[320px] -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Browse categories
            </p>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <NuxtLink
                v-for="category in featuredCategories"
                :key="category.id"
                :to="`/categories/${category.slug}`"
                class="flex items-center gap-3 rounded-xl border border-slate-100 p-2 text-sm text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
              >
                <img
                  :src="category.image ? `/images/${category.image}` : '/nutri.png'"
                  :alt="category.name"
                  class="h-10 w-10 rounded-lg object-cover"
                  loading="lazy"
                />
                <span>{{ category.name }}</span>
              </NuxtLink>
            </div>
            <NuxtLink
              to="/categories/vegetables"
              class="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-wide text-violet-700"
            >
              All categories →
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div class="hidden flex-1 justify-center px-6 lg:flex">
        <SearchProduct class="w-full max-w-xl" />
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink to="/favorite" class="relative rounded-full bg-white/90 p-2 shadow">
          <HeartIcon class="size-5 text-slate-600" />
          <ClientOnly>
            <span
              v-if="favoriteItems.length"
              class="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] text-white"
            >
              {{ favoriteItems.length }}
            </span>
          </ClientOnly>
        </NuxtLink>

        <button
          type="button"
          class="relative rounded-full bg-white/90 p-2 shadow"
          @click="cartStore.toggleCart()"
        >
          <ShoppingBagIcon class="size-5 text-slate-600" />
          <ClientOnly>
            <span
              v-if="cartTotalItems"
              class="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white"
            >
              {{ cartTotalItems }}
            </span>
          </ClientOnly>
        </button>

        <NuxtLink
          to="/checkout"
          class="hidden rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-violet-500 lg:inline-flex"
        >
          Checkout
        </NuxtLink>

        <button
          type="button"
          class="inline-flex rounded-full border border-slate-200 p-2 lg:hidden"
          @click="uiStore.toggleSidebar(true)"
        >
          <Bars3Icon class="size-6 text-slate-700" />
        </button>
      </div>
    </div>

    <div class="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
      <SearchProduct class="w-full" />
    </div>
    <nav
      class="flex items-center gap-4 overflow-x-auto border-t border-slate-100 bg-white px-4 py-3 text-sm text-slate-600 lg:hidden"
      aria-label="Quick links"
    >
      <NuxtLink
        v-for="link in mobileLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 transition hover:border-violet-200 hover:text-violet-700"
      >
        <component :is="link.icon" class="size-4" />
        {{ link.label }}
      </NuxtLink>
    </nav>

    <ShoppingCart />
    <SidebarDrawer />
  </header>
</template>

<script setup lang="ts">
import {
  Bars3Icon,
  HeartIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
} from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useCartStore } from "~/stores/cart";
import { useFavoriteStore } from "~/stores/favorite";
import { useCatalogStore } from "~/stores/catalog";
import { useUIStore } from "~/stores/ui";

const mobileLinks = [
  { label: "Shop", to: "/shop", icon: ShoppingBagIcon },
  { label: "Favorite", to: "/favorite", icon: HeartIcon },
  { label: "Checkout", to: "/checkout", icon: ShoppingBagIcon },
  { label: "FAQ", to: "/faq", icon: QuestionMarkCircleIcon },
];
const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();
const catalogStore = useCatalogStore();
catalogStore.hydrate();

const { items: favoriteItems } = storeToRefs(favoriteStore);
const { totalItems: cartTotalItems } = storeToRefs(cartStore);
const { categories } = storeToRefs(catalogStore);

const featuredCategories = computed(() => categories.value.slice(0, 6));

const isCategoriesOpen = ref(false);
const route = useRoute();
const uiStore = useUIStore();

const toggleCategories = (value: boolean) => {
  isCategoriesOpen.value = value;
};

watch(
  () => route.fullPath,
  () => {
    isCategoriesOpen.value = false;
  }
);
</script>
