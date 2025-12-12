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
        <div class="relative" ref="categoriesRef">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-sm font-medium transition hover:border-violet-200 hover:text-violet-700"
            @click="toggleCategories()"
            :aria-expanded="isCategoriesOpen"
            aria-haspopup="true"
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
            class="absolute left-1/2 top-full mt-3 w-[min(85vw,720px)] -translate-x-1/2 rounded-3xl border border-slate-100 bg-white/95 p-6 text-sm text-slate-600 shadow-2xl backdrop-blur"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600">
                  Browse by category
                </p>
                <p class="text-base font-semibold text-slate-900">
                  Handpicked essentials for every pantry
                </p>
              </div>
              <NuxtLink
                to="/categories/vegetables"
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
              >
                View all
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <NuxtLink
                v-for="category in featuredCategories"
                :key="category.id"
                :to="`/categories/${category.slug}`"
                class="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
              >
                <img
                  :src="category.image ? `/images/${category.image}` : '/nutri.png'"
                  :alt="category.name"
                  class="h-12 w-12 rounded-xl object-cover"
                  loading="lazy"
                />
                <div>
                  <p class="font-semibold text-slate-900">{{ category.name }}</p>
                  <p class="text-xs text-slate-500">
                    Shop {{ category.name.toLowerCase() }}
                  </p>
                </div>
              </NuxtLink>
            </div>
            <div class="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              <p class="font-semibold text-slate-700">Need help choosing?</p>
              <p>Chat with our concierge for substitution tips before checkout.</p>
            </div>
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
import { useClickOutside } from "~/composables/useClickOutside";

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

const featuredCategories = computed(() => categories.value.slice(0, 8));

const isCategoriesOpen = ref(false);
const categoriesRef = ref<HTMLElement | null>(null);
const route = useRoute();
const uiStore = useUIStore();

const toggleCategories = (value?: boolean) => {
  if (typeof value === "boolean") {
    isCategoriesOpen.value = value;
    return;
  }
  isCategoriesOpen.value = !isCategoriesOpen.value;
};

useClickOutside(categoriesRef, () => {
  isCategoriesOpen.value = false;
});

watch(
  () => route.fullPath,
  () => {
    isCategoriesOpen.value = false;
  }
);
</script>
