<template>
  <div>
    <header
      class="fixed inset-x-0 top-0 z-50 bg-white shadow-sm"
    >
    <!-- Top bar: violet -->
    <div class="bg-violet-700">
      <div
        class="container flex items-center justify-between gap-3 py-2.5 text-sm text-white"
      >
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-lg font-bold text-white"
        >
          <img
            src="/nutri.png"
            alt="NutriZaria Logo"
            width="36"
            height="36"
            class="h-9 w-9 rounded-full bg-white/20 p-0.5"
          />
          NutriZaria
        </NuxtLink>

        <div class="hidden flex-1 justify-center px-6 lg:flex">
          <div class="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search for products.."
              class="w-full rounded-md border-0 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-violet-400"
              @focus="router.push('/shop')"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/favorite"
            class="relative hidden rounded p-1.5 transition hover:bg-white/10 sm:inline-flex"
            aria-label="View favorites"
          >
            <HeartIcon class="size-5 text-white" />
            <ClientOnly>
              <span
                v-if="favoriteItems.length"
                class="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
              >
                {{ favoriteItems.length }}
              </span>
            </ClientOnly>
          </NuxtLink>

          <button
            type="button"
            class="relative rounded p-1.5 transition hover:bg-white/10"
            @click="cartStore.toggleCart()"
            aria-label="Open shopping cart"
          >
            <ShoppingBagIcon class="size-5 text-white" />
            <ClientOnly>
              <span
                v-if="cartTotalItems"
                class="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
              >
                {{ cartTotalItems }}
              </span>
            </ClientOnly>
          </button>

          <div class="relative hidden sm:block" ref="profileRef">
            <ClientOnly>
              <button
                v-if="!isAuthenticated"
                type="button"
                class="flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium transition hover:bg-white/10"
                @click="router.push('/login')"
                aria-label="Sign in to your account"
              >
                <UserIcon class="size-4 text-white" />
                <span class="text-white">Sign In</span>
              </button>

              <button
                v-else
                type="button"
                class="flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium transition hover:bg-white/10"
                @click="toggleProfile()"
                :aria-expanded="isProfileOpen"
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <UserIcon class="size-4 text-white" />
                <span class="text-white">{{ userStore.displayName?.split(' ')[0] || 'Account' }}</span>
              </button>
            </ClientOnly>

            <transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="translate-y-1 opacity-0"
            >
              <div
                v-if="isProfileOpen && isAuthenticated"
                class="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
              >
                <div class="border-b border-slate-100 px-4 py-3">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex size-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white"
                    >
                      {{ initials }}
                    </span>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-slate-900">
                        {{ userStore.displayName }}
                      </p>
                      <p class="truncate text-xs text-slate-500">
                        {{ userStore.authenticatedUser?.email }}
                      </p>
                    </div>
                  </div>
                </div>
                <nav class="p-1.5">
                  <NuxtLink
                    v-for="link in profileLinks"
                    :key="link.label"
                    :to="link.to"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    @click="isProfileOpen = false"
                  >
                    <component :is="link.icon" class="size-4 text-slate-400" />
                    {{ link.label }}
                  </NuxtLink>
                  <NuxtLink
                    v-if="isAdmin"
                    to="/admin"
                    class="mt-1 flex items-center gap-3 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                    @click="isProfileOpen = false"
                  >
                    <Squares2X2Icon class="size-4 text-violet-600" />
                    Admin dashboard
                  </NuxtLink>
                </nav>
                <div class="border-t border-slate-100 p-1.5">
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    @click="handleLogout"
                  >
                    <ArrowRightStartOnRectangleIcon class="size-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav bar -->
    <div class="border-b border-slate-200 bg-white">
      <div class="container flex items-center gap-4 py-2">
        <div class="relative" ref="categoriesRef">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            @click="toggleCategories()"
            :aria-expanded="isCategoriesOpen"
            aria-haspopup="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            SHOP BY CATEGORY
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m6 9 6 6 6-6"
              />
            </svg>
          </button>
          <div
            v-if="isCategoriesOpen"
            class="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white py-2 shadow-xl"
          >
            <NuxtLink
              v-for="category in featuredCategories"
              :key="category.id"
              :to="`/categories/${category.slug}`"
              class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
              @click="isCategoriesOpen = false"
            >
              <img
                :src="resolve(category.image)"
                :alt="category.name"
                width="32"
                height="32"
                class="h-8 w-8 rounded-lg object-cover"
                loading="lazy"
              />
              <span class="font-medium">{{ category.name }}</span>
            </NuxtLink>
            <NuxtLink
              to="/shop"
              class="mt-1 block border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
              @click="isCategoriesOpen = false"
            >
              View all categories
            </NuxtLink>
          </div>
        </div>

        <nav class="hidden items-center gap-1 lg:flex">
          <NuxtLink
            to="/shop"
            class="rounded px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700"
            active-class="text-violet-700 bg-violet-50"
          >
            Shop
          </NuxtLink>
          <NuxtLink
            to="/categories"
            class="rounded px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700"
            active-class="text-violet-700 bg-violet-50"
          >
            Categories
          </NuxtLink>
          <NuxtLink
            to="/blog"
            class="rounded px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700"
            active-class="text-violet-700 bg-violet-50"
          >
            Blog
          </NuxtLink>
          <NuxtLink
            to="/faq"
            class="rounded px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700"
            active-class="text-violet-700 bg-violet-50"
          >
            FAQ
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-2 lg:hidden">
          <button
            type="button"
            class="inline-flex rounded p-2 text-slate-700 transition hover:bg-slate-100"
            @click="uiStore.toggleSidebar(true)"
            aria-label="Open menu"
          >
            <Bars3Icon class="size-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile search -->
    <div class="border-b border-slate-100 bg-white px-4 py-2 lg:hidden">
      <div class="relative">
        <input
          type="text"
          placeholder="Search for products.."
          class="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
          @focus="router.push('/shop')"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
    </div>
  </header>

  <ShoppingCart />
  <SidebarDrawer />
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  HeartIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  MapPinIcon,
} from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "~/stores/cart";
import { useFavoriteStore } from "~/stores/favorite";
import { useCatalogStore } from "~/stores/catalog";
import { useUIStore } from "~/stores/ui";
import { useUserStore } from "~/stores/user";
import { useClickOutside } from "~/composables/useClickOutside";

const { resolve } = useImageUrl();

const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();
const catalogStore = useCatalogStore();
const userStore = useUserStore();
const uiStore = useUIStore();
const route = useRoute();
const router = useRouter();
catalogStore.hydrate();

const { items: favoriteItems } = storeToRefs(favoriteStore);
const { totalItems: cartTotalItems } = storeToRefs(cartStore);
const { categories } = storeToRefs(catalogStore);

if (typeof window !== "undefined") {
  favoriteStore.loadFavorites();
  cartStore.loadCartFromLocalStorage();
  userStore.loadAuthenticatedUser();
}

const isAuthenticated = computed(() => !!userStore.authenticatedUser);
const isAdmin = computed(() => {
  const role = userStore.authenticatedUser?.role;
  return (
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "MANAGER" ||
    role === "STAFF"
  );
});
const initials = computed(() => {
  const name =
    userStore.authenticatedUser?.name?.trim() ||
    (userStore.authenticatedUser?.email || "").split("@")[0];
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
});
const profileLinks = computed(() => [
  { label: "My profile", to: "/profile", icon: UserCircleIcon },
  {
    label: "My orders",
    to: "/profile?tab=orders",
    icon: ClipboardDocumentListIcon,
  },
  { label: "Saved addresses", to: "/profile?tab=addresses", icon: MapPinIcon },
  { label: "Settings", to: "/profile?tab=settings", icon: Cog6ToothIcon },
]);

const featuredCategories = computed(() => categories.value.slice(0, 8));

const isCategoriesOpen = ref(false);
const categoriesRef = ref<HTMLElement | null>(null);

const isProfileOpen = ref(false);
const profileRef = ref<HTMLElement | null>(null);

const toggleCategories = (value?: boolean) => {
  if (typeof value === "boolean") {
    isCategoriesOpen.value = value;
    return;
  }
  isCategoriesOpen.value = !isCategoriesOpen.value;
};

const toggleProfile = (value?: boolean) => {
  if (typeof value === "boolean") {
    isProfileOpen.value = value;
    return;
  }
  isProfileOpen.value = !isProfileOpen.value;
};

const handleLogout = () => {
  userStore.logoutUser();
  isProfileOpen.value = false;
  router.push("/");
};

useClickOutside(categoriesRef, () => {
  isCategoriesOpen.value = false;
});

useClickOutside(profileRef, () => {
  isProfileOpen.value = false;
});

watch(
  () => route.fullPath,
  () => {
    isCategoriesOpen.value = false;
    isProfileOpen.value = false;
  },
);
</script>
