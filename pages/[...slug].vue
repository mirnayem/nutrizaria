<template>
  <main class="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
    <div class="w-full max-w-lg text-center">
      <div class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <p class="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-violet-600">
        Error 404
      </p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
        Page not found
      </h1>
      <p class="mt-3 text-sm text-slate-500 sm:text-base">
        The page you're looking for doesn't exist or has been moved. Let's get
        you back to something fresh.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
        >
          Go back home
        </NuxtLink>
        <NuxtLink
          to="/shop"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
        >
          Browse the shop
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Page not found | NutriZaria",
  meta: [
    {
      name: "robots",
      content: "noindex",
    },
  ],
});
</script>
