<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";
import type { Category } from "~/types/product";

const catalog = useCatalogStore();
const { categories } = storeToRefs(catalog);

const { resolve } = useImageUrl();

const expandedCategories = ref<Set<string>>(new Set());

const parentCategories = computed(() =>
  (categories.value ?? []).filter((c) => !c.parentId)
);

const toggleExpand = (categoryId: string) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
};

const isExpanded = (categoryId: string) =>
  expandedCategories.value.has(categoryId);

const hasChildren = (category: Category) =>
  category.children && category.children.length > 0;

const getCategoryCount = (category: Category) => {
  return category.productCount ?? 0;
};
</script>

<template>
  <aside class="w-64 shrink-0 border-r border-slate-200 bg-white">
    <nav
      class="sticky top-[105px] max-h-[calc(100vh-125px)] overflow-y-auto p-3 scrollbar-slim"
      aria-label="Shop by category"
    >
      <p class="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Browse
      </p>

      <NuxtLink
        to="/shop"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-5 text-slate-400"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
        Shop all products
      </NuxtLink>

      <NuxtLink
        to="/shop?offers=true"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-5 text-slate-400"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 6h.008v.008H6V6Z"
          />
        </svg>
        Special offers
      </NuxtLink>

      <div class="my-3 border-t border-slate-100"></div>

      <p class="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Categories
      </p>

      <ul class="space-y-0.5">
        <li v-for="category in parentCategories" :key="category.id">
          <div
            class="flex items-center rounded-lg pr-1.5 transition hover:bg-slate-50"
          >
            <NuxtLink
              :to="`/categories/${category.slug}`"
              class="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <img
                v-if="category.image"
                :src="resolve(category.image)"
                :alt="category.name"
                class="h-6 w-6 shrink-0 rounded-md object-cover"
                loading="lazy"
              />
              <span class="truncate">{{ category.name }}</span>
            </NuxtLink>
            <div class="flex shrink-0 items-center gap-1">
              <span
                class="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500"
              >
                {{ getCategoryCount(category) }}
              </span>
              <button
                v-if="hasChildren(category)"
                type="button"
                class="flex size-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-violet-100 hover:text-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                @click.stop="toggleExpand(category.id)"
                :aria-expanded="isExpanded(category.id)"
                aria-label="Toggle subcategories"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="size-3.5 transition-transform duration-150"
                  :class="isExpanded(category.id) ? 'rotate-90' : ''"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          <ul
            v-if="hasChildren(category) && isExpanded(category.id)"
            class="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-3"
          >
            <li v-for="child in category.children" :key="child.id">
              <NuxtLink
                :to="`/categories/${child.slug}`"
                class="group flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <span class="truncate">{{ child.name }}</span>
                <span
                  class="ml-2 text-xs tabular-nums text-slate-400 group-hover:text-violet-500"
                >
                  {{ child.productCount ?? 0 }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.scrollbar-slim {
  scrollbar-width: thin;
  scrollbar-color: rgb(226 232 240) transparent;
}
.scrollbar-slim::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-slim::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background-color: rgb(226 232 240);
}
</style>
