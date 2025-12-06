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
        >
        <header class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
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
          <nav class="space-y-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-100 hover:bg-violet-50 hover:text-violet-700"
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

          <div class="mt-8">
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
          </div>

          <div class="mt-8 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Need help?</p>
            <div>
              <p class="font-medium text-slate-800">Live concierge</p>
              <p>WhatsApp: +880 1730-901063</p>
            </div>
            <div>
              <p class="font-medium text-slate-800">Order hotline</p>
              <p>Sat - Thu, 9am – 10pm</p>
            </div>
          </div>
        </div>
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

const navLinks = [
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories/vegetables" },
  { label: "Favorite", to: "/favorite" },
  { label: "Checkout", to: "/checkout" },
  { label: "FAQ", to: "/faq" },
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
