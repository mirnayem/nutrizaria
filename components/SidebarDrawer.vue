<template>
  <transition name="drawer-fade">
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-[60] flex lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        class="absolute inset-0 bg-slate-900/60"
        aria-label="Close menu overlay"
        @click="closeDrawer"
      ></button>
      <transition name="drawer-slide">
        <aside
          v-if="isSidebarOpen"
          ref="panelRef"
          tabindex="-1"
          class="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-hidden bg-white shadow-2xl focus:outline-none"
          :style="safeAreaStyle"
        >
          <header class="flex items-center justify-between border-b border-slate-100 px-5 pb-4">
            <div class="flex items-center gap-3">
              <img src="/nutri.png" alt="NutriZaria" class="h-10 w-10 rounded-full object-cover" />
              <div>
                <p class="text-base font-semibold text-slate-900">NutriZaria</p>
                <p class="text-xs text-slate-500">Authentic pure food resources</p>
              </div>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-violet-700"
              @click="closeDrawer"
              aria-label="Close menu drawer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                <path
                  fill-rule="evenodd"
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto px-5 py-6">
            <SearchProduct class="mb-6 w-full" />
            <section class="space-y-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigate</p>
              <nav class="space-y-2">
                <NuxtLink
                  v-for="link in navLinks"
                  :key="link.to"
                  :to="link.to"
                  :aria-current="isActive(link) ? 'page' : undefined"
                  class="flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium transition"
                  :class="
                    isActive(link)
                      ? 'border-violet-100 bg-violet-50 text-violet-700'
                      : 'border-slate-100 text-slate-700 hover:border-violet-100 hover:bg-violet-50 hover:text-violet-700'
                  "
                  @click="closeDrawer"
                >
                  {{ link.label }}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="size-4"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
                  </svg>
                </NuxtLink>
              </nav>
            </section>

            <section class="mt-8">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quick access
              </p>
              <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <NuxtLink
                  v-for="action in quickActions"
                  :key="action.to"
                  :to="action.to"
                  class="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                  @click="closeDrawer"
                >
                  {{ action.label }}
                </NuxtLink>
              </div>
            </section>

            <section class="mt-8">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Popular categories
              </p>
              <div class="mt-3 grid grid-cols-2 gap-3">
                <NuxtLink
                  v-for="category in featuredCategories"
                  :key="category.id"
                  :to="`/categories/${category.slug}`"
                  class="flex items-center gap-3 rounded-2xl border border-slate-100 p-2 text-sm text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                  @click="closeDrawer"
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
            </section>
          </div>

          <footer class="border-t border-slate-100 px-5 pt-5">
            <div class="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Need help?</p>
              <div class="flex items-center justify-between text-slate-700">
                <div>
                  <p class="font-medium text-slate-900">Live concierge</p>
                  <p>WhatsApp: +880 1730-901063</p>
                </div>
                <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700">
                  24/7
                </span>
              </div>
              <div>
                <p class="font-medium text-slate-900">Order hotline</p>
                <p>Sat - Thu, 9am – 10pm</p>
              </div>
              <NuxtLink
                to="/contact"
                class="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                @click="closeDrawer"
              >
                Contact support
              </NuxtLink>
            </div>
          </footer>
        </aside>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useCatalogStore } from "~/stores/catalog";
import { useUIStore } from "~/stores/ui";

type NavLink = {
  label: string;
  to: string;
  match?: string;
};

const navLinks: NavLink[] = [
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories/vegetables", match: "/categories" },
  { label: "Favorite", to: "/favorite" },
  { label: "Checkout", to: "/checkout" },
  { label: "FAQ", to: "/faq" },
];
const quickActions = [
  { label: "Favorites", to: "/favorite" },
  { label: "Checkout", to: "/checkout" },
];

const catalogStore = useCatalogStore();
catalogStore.hydrate();
const { categories } = storeToRefs(catalogStore);

const uiStore = useUIStore();
const { isSidebarOpen } = storeToRefs(uiStore);
const closeDrawer = () => uiStore.closeSidebar();
const panelRef = ref<HTMLElement | null>(null);

const featuredCategories = computed(() => categories.value.slice(0, 6));

const route = useRoute();
const safeAreaStyle = computed(() => ({
  paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)",
  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
  height: "100dvh",
  maxHeight: "100dvh",
}));

const isActive = (link: NavLink) => {
  const target = link.match ?? link.to;
  return route.path === target || route.path.startsWith(`${target}/`);
};

watch(
  () => route.fullPath,
  () => {
    if (isSidebarOpen.value) {
      closeDrawer();
    }
  }
);

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isSidebarOpen.value) {
    closeDrawer();
  }
};

const lockScroll = (shouldLock: boolean) => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = shouldLock ? "hidden" : "";
};

watch(isSidebarOpen, (value) => {
  lockScroll(value);
  if (value) {
    requestAnimationFrame(() => {
      panelRef.value?.focus();
    });
  }
});

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
  lockScroll(false);
});
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
