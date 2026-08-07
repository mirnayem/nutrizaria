<template>
  <div>
    <header
      class="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white"
    >
    <!-- Top row -->
    <div class="bg-white">
      <div
        class="mx-auto flex w-full max-w-[1600px] items-center gap-4 px-4 py-3 sm:py-4"
      >
        <NuxtLink
          to="/"
          class="flex shrink-0 items-center gap-2.5 text-lg font-bold text-slate-900 transition"
          aria-label="NutriZaria home"
        >
          <img
            src="/nutri.png"
            alt=""
            width="40"
            height="40"
            class="h-10 w-10 rounded-full object-cover"
          />
          <span class="hidden sm:inline">NutriZaria</span>
        </NuxtLink>

        <div class="hidden flex-1 justify-center px-2 lg:flex">
          <form
            class="relative w-full max-w-xl"
            role="search"
            @submit.prevent="submitSearch"
          >
            <label for="desktop-search" class="sr-only">Search products</label>
            <input
              id="desktop-search"
              v-model="headerSearch"
              type="search"
              placeholder="Search for products..."
              class="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/30"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <button
              type="submit"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-slate-800 p-2 text-white transition hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              aria-label="Search"
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
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </form>
        </div>

        <div class="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <NuxtLink
            to="/favorite"
            class="relative inline-flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            aria-label="View favorites"
          >
            <HeartIcon class="size-5" aria-hidden="true" />
            <ClientOnly>
              <span
                v-if="favoriteItems.length"
                class="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
              >
                {{ favoriteItems.length }}
              </span>
            </ClientOnly>
          </NuxtLink>

          <button
            type="button"
            class="relative inline-flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            @click="cartStore.toggleCart()"
            aria-label="Open shopping cart"
          >
            <ShoppingBagIcon class="size-5" aria-hidden="true" />
            <ClientOnly>
              <span
                v-if="cartTotalItems"
                class="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white"
              >
                {{ cartTotalItems }}
              </span>
            </ClientOnly>
          </button>

          <div class="relative" ref="profileRef">
            <ClientOnly>
              <button
                v-if="!isAuthenticated"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:px-3"
                @click="router.push('/login')"
                aria-label="Sign in to your account"
              >
                <UserIcon class="size-5 text-slate-500" aria-hidden="true" />
                <span class="hidden sm:inline">Sign In</span>
              </button>

              <button
                v-else
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:px-3"
                @click="toggleProfile()"
                :aria-expanded="isProfileOpen"
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <UserIcon class="size-5 text-slate-500" aria-hidden="true" />
                <span class="hidden max-w-24 truncate sm:inline">{{ userStore.displayName?.split(' ')[0] || 'Account' }}</span>
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
                class="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
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
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    @click="isProfileOpen = false"
                  >
                    <component :is="link.icon" class="size-4 text-slate-400" aria-hidden="true" />
                    {{ link.label }}
                  </NuxtLink>
                  <NuxtLink
                    v-if="isAdmin"
                    to="/admin"
                    class="mt-1 flex items-center gap-3 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    @click="isProfileOpen = false"
                  >
                    <Squares2X2Icon class="size-4 text-violet-600" aria-hidden="true" />
                    Admin dashboard
                  </NuxtLink>
                </nav>
                <div class="border-t border-slate-100 p-1.5">
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    @click="handleLogout"
                  >
                    <ArrowRightStartOnRectangleIcon class="size-4" aria-hidden="true" />
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
    <nav class="border-t border-slate-100 bg-white" aria-label="Main">
      <div
        class="mx-auto flex w-full max-w-[1600px] items-center gap-1 px-4 py-1.5"
      >
        <div class="relative" ref="categoriesRef">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
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
              class="size-4 text-violet-600"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            Shop by category
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-3 text-slate-400"
              :class="isCategoriesOpen ? 'rotate-180' : ''"
              aria-hidden="true"
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
            class="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
          >
            <NuxtLink
              v-for="category in featuredCategories"
              :key="category.id"
              :to="`/categories/${category.slug}`"
              class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
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
              class="mt-1 flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              @click="isCategoriesOpen = false"
            >
              View all categories
            </NuxtLink>
          </div>
        </div>

        <div class="hidden items-center gap-1 lg:flex">
          <NuxtLink
            to="/shop"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            active-class="text-violet-700 bg-violet-50"
          >
            Shop
          </NuxtLink>
          <NuxtLink
            to="/categories"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            active-class="text-violet-700 bg-violet-50"
          >
            Categories
          </NuxtLink>
          <NuxtLink
            to="/blog"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            active-class="text-violet-700 bg-violet-50"
          >
            Blog
          </NuxtLink>
          <NuxtLink
            to="/faq"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            active-class="text-violet-700 bg-violet-50"
          >
            FAQ
          </NuxtLink>
        </div>

        <div class="ml-auto flex items-center gap-2 lg:hidden">
          <button
            type="button"
            class="inline-flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            @click="uiStore.toggleSidebar(true)"
            aria-label="Open menu"
          >
            <Bars3Icon class="size-5" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile search -->
    <div class="border-b border-slate-100 bg-white lg:hidden">
      <div class="mx-auto w-full max-w-[1600px] px-4 py-2">
      <form
        class="relative"
        role="search"
        @submit.prevent="submitSearch"
      >
        <input
          v-model="headerSearch"
          type="search"
          placeholder="Search for products.."
          class="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
        />
        <button
          type="submit"
          aria-label="Search"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-violet-600"
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
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </form>
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

const headerSearch = ref("");

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

const submitSearch = () => {
  const term = headerSearch.value.trim();
  if (!term) return;
  router.push(`/search/${encodeURIComponent(term)}`);
};

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
