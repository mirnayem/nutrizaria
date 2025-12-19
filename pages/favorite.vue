<template>
  <main class="min-h-[70vh] bg-slate-50 py-12">
    <div class="container mx-auto max-w-6xl space-y-10 px-4">
      <section
        class="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm backdrop-blur-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600">
          Saved for later
        </p>
        <div class="mt-2 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-semibold text-slate-900">Your favorite picks</h1>
            <p class="mt-2 text-sm text-slate-500">
              {{ items.length ? `You have ${items.length} products bookmarked for quick access.` : "Mark products as favorite from the catalog to keep them here." }}
            </p>
          </div>
          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
          >
            Continue shopping
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12l-7.5 7.5m7.5-7.5H3" />
            </svg>
          </NuxtLink>
        </div>
      </section>

      <section v-if="items.length" class="space-y-4 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900">Favorite products</h2>
          <p class="text-sm text-slate-500">{{ items.length }} item(s)</p>
        </div>
        <Products :products="items" />
      </section>

      <section v-else class="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center shadow-inner">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div>
        <h3 class="mt-6 text-2xl font-semibold text-slate-900">No favorites yet</h3>
        <p class="mt-2 text-sm text-slate-500">
          Browse products and tap the heart icon to add them to your favorites list for quick access.
        </p>
        <NuxtLink
          to="/categories/vegetables"
          class="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-200 px-5 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-400"
        >
          Explore categories
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
          </svg>
        </NuxtLink>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFavoriteStore } from "~/stores/favorite";

const favorite = useFavoriteStore();
const { items } = storeToRefs(favorite);
</script>
