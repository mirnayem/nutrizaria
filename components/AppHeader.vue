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
        <img
          src="/nutri.png"
          alt="NutriZaria Logo"
          class="h-10 w-10 rounded-full"
        />
        NutriZaria
      </NuxtLink>

      <nav class="hidden items-center gap-6 ml-4 lg:flex">
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m6 9 6 6 6-6"
              />
            </svg>
          </button>
          <div
            v-if="isCategoriesOpen"
            class="absolute left-1/2 top-full mt-3 w-[min(85vw,720px)] -translate-x-1/2 rounded-3xl border border-slate-100 bg-white/95 p-6 text-sm text-slate-600 shadow-2xl backdrop-blur"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600"
                >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  class="size-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m9 5 7 7-7 7"
                  />
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
                  :src="resolve(category.image)"
                  :alt="category.name"
                  class="h-12 w-12 rounded-xl object-cover"
                  loading="lazy"
                />
                <div>
                  <p class="font-semibold text-slate-900">
                    {{ category.name }}
                  </p>
                  <p class="text-xs text-slate-500">
                    Shop {{ category.name.toLowerCase() }}
                  </p>
                </div>
              </NuxtLink>
            </div>
            <div
              class="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500"
            >
              <p class="font-semibold text-slate-700">Need help choosing?</p>
              <p>
                Chat with our concierge for substitution tips before checkout.
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div class="hidden flex-1 justify-center px-6 lg:flex">
        <SearchProduct class="w-full max-w-xl" />
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/favorite"
          class="relative rounded-full bg-white/90 p-2 shadow"
        >
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

        <div class="relative" ref="profileRef">
          <ClientOnly>
            <button
              v-if="!isAuthenticated"
              type="button"
              class="inline-flex rounded-full bg-white/90 p-2 shadow transition hover:text-violet-700"
              @click="router.push('/login')"
              aria-label="Sign in to your account"
            >
              <UserIcon class="size-5 text-slate-600" />
            </button>

            <button
              v-else
              type="button"
              class="relative flex items-center gap-1 rounded-full bg-white/90 p-1.5 pr-2 shadow transition hover:text-violet-700"
              @click="toggleProfile()"
              :aria-expanded="isProfileOpen"
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <span
                class="flex size-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white"
              >
                {{ initials }}
              </span>
              <ChevronDownIcon
                class="size-3.5 text-slate-500 transition"
                :class="isProfileOpen ? 'rotate-180' : ''"
              />
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
              class="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-2xl backdrop-blur"
            >
              <div class="border-b border-slate-100 px-5 py-4">
                <div class="flex items-center gap-3">
                  <span
                    class="flex size-11 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white"
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
              <nav class="p-2">
                <NuxtLink
                  v-for="link in profileLinks"
                  :key="link.label"
                  :to="link.to"
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                  @click="isProfileOpen = false"
                >
                  <component :is="link.icon" class="size-5 text-slate-400" />
                  {{ link.label }}
                </NuxtLink>
                <NuxtLink
                  v-if="isAdmin"
                  to="/admin"
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                  @click="isProfileOpen = false"
                >
                  <Squares2X2Icon class="size-5 text-slate-400" />
                  Admin dashboard
                </NuxtLink>
              </nav>
              <div class="border-t border-slate-100 p-2">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  @click="handleLogout"
                >
                  <ArrowRightStartOnRectangleIcon class="size-5" />
                  Sign out
                </button>
              </div>
            </div>
          </transition>
        </div>

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
    <!-- <nav
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
    </nav> -->

    <ShoppingCart />
    <SidebarDrawer />
  </header>
</template>

<script setup lang="ts">
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  HeartIcon,
  MapPinIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UserIcon,
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

const mobileLinks = [
  { label: "Shop", to: "/shop", icon: ShoppingBagIcon },
  { label: "Favorite", to: "/favorite", icon: HeartIcon },
  { label: "Profile", to: "/profile", icon: UserCircleIcon },
  { label: "FAQ", to: "/faq", icon: QuestionMarkCircleIcon },
];
const cartStore = useCartStore();
const favoriteStore = useFavoriteStore();
const catalogStore = useCatalogStore();
const userStore = useUserStore();
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
  return role === "ADMIN" || role === "SUPER_ADMIN";
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
