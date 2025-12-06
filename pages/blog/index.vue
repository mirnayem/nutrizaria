<template>
  <div class="space-y-16">
    <section
      v-if="featuredPost"
      class="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-8 text-white shadow-xl"
    >
      <div class="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
        <div class="space-y-6">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Latest insights
          </p>
          <h1 class="text-3xl font-semibold leading-tight sm:text-4xl">
            {{ featuredPost.title }}
          </h1>
          <p class="text-white/80">
            {{ useTruncate(featuredPost.content, 45, false) }}
          </p>
          <div class="flex flex-wrap gap-4 text-sm text-white/80">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
              {{ featuredPost.category }}
            </span>
            <span>{{ featuredPost.writer }}</span>
            <span>{{ useDateFormatter(featuredPost.date) }}</span>
          </div>
          <NuxtLink
            :to="`/blog/${featuredPost.slug}`"
            class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-violet-700 shadow-lg transition hover:-translate-y-0.5"
          >
            Read full story
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
              <path
                fill-rule="evenodd"
                d="M15.78 10.53a.75.75 0 0 0 0-1.06L9.824 3.515a.75.75 0 0 0-1.06 1.06l4.686 4.688H4a.75.75 0 0 0 0 1.5h9.45l-4.685 4.688a.75.75 0 1 0 1.06 1.06l5.955-5.955Z"
                clip-rule="evenodd"
              />
            </svg>
          </NuxtLink>
        </div>
        <div class="grid gap-4">
          <img
            :src="featuredPost.image"
            :alt="featuredPost.title"
            class="h-56 w-full rounded-2xl object-cover object-center md:h-full"
            loading="lazy"
          />
          <div
            v-if="secondaryPosts.length"
            class="rounded-2xl bg-white/10 p-4 backdrop-blur"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Editor's picks
            </p>
            <div class="mt-3 space-y-3">
              <NuxtLink
                v-for="post in secondaryPosts"
                :key="post.id"
                :to="`/blog/${post.slug}`"
                class="block rounded-xl bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <p class="text-xs uppercase tracking-wide text-white/70">
                  {{ post.category }} • {{ useDateFormatter(post.date) }}
                </p>
                <p class="text-sm font-medium">{{ post.title }}</p>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="category in filterCategories"
            :key="category"
            type="button"
            class="rounded-full border px-4 py-1.5 text-sm transition"
            :class="selectedCategory === category ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:border-violet-200 hover:text-violet-700'"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
        <label class="flex w-full items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-500 lg:w-80">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search articles..."
            class="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
          />
        </label>
      </div>

      <div
        v-if="remainingPosts.length"
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="post in remainingPosts"
          :key="post.id"
          class="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          <img
            :src="post.image"
            :alt="post.title"
            class="h-48 w-full object-cover"
            loading="lazy"
          />
          <div class="flex flex-1 flex-col gap-4 p-5">
            <p class="text-xs uppercase tracking-wide text-slate-400">
              {{ post.category }} • {{ useDateFormatter(post.date) }}
            </p>
            <NuxtLink
              :to="`/blog/${post.slug}`"
              class="text-lg font-semibold text-slate-900 transition hover:text-violet-700"
            >
              {{ post.title }}
            </NuxtLink>
            <p class="text-sm text-slate-600">
              {{ useTruncate(post.content, 28, false) }}
            </p>
            <div class="mt-auto flex items-center justify-between text-sm text-slate-500">
              <span>By {{ post.writer }}</span>
              <NuxtLink
                :to="`/blog/${post.slug}`"
                class="inline-flex items-center gap-2 text-violet-700"
              >
                Read
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                  <path
                    fill-rule="evenodd"
                    d="M15.78 10.53a.75.75 0 0 0 0-1.06L9.824 3.515a.75.75 0 0 0-1.06 1.06l4.686 4.688H4a.75.75 0 0 0 0 1.5h9.45l-4.685 4.688a.75.75 0 1 0 1.06 1.06l5.955-5.955Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
      <div
        v-else-if="!filteredPosts.length"
        class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500"
      >
        No articles found for this filter. Please adjust your category or search query.
      </div>
    </section>

    <section class="rounded-3xl bg-slate-50 p-8">
      <div class="grid gap-6 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Published</p>
          <p class="text-3xl font-semibold text-slate-900">{{ blogStats.totalPosts }}</p>
          <p class="mt-1 text-sm">Stories curated for mindful foodies</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Categories</p>
          <p class="text-3xl font-semibold text-slate-900">{{ blogStats.uniqueCategories }}</p>
          <p class="mt-1 text-sm">Topics across wellness, sourcing, and lifestyle</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Last updated</p>
          <p class="text-3xl font-semibold text-slate-900">{{ blogStats.lastUpdated }}</p>
          <p class="mt-1 text-sm">Fresh reads added weekly</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useBlogStore } from "~/stores/blog";
import { useDateFormatter } from "~/composables/dateFormater";
import { useTruncate } from "~/composables/useTruncate";
import type { Post } from "~/types/product";

const store = useBlogStore();
store.hydrate();
const { posts: blogPosts } = storeToRefs(store);

const selectedCategory = ref("All");
const searchQuery = ref("");

const normalizedPosts = computed(() =>
  [...blogPosts.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
);

const filterCategories = computed(() => {
  const unique = Array.from(new Set(blogPosts.value.map((post) => post.category)));
  return ["All", ...unique];
});

const filteredPosts = computed(() =>
  normalizedPosts.value.filter((post) => {
    const matchesCategory =
      selectedCategory.value === "All" ||
      post.category.toLowerCase() === selectedCategory.value.toLowerCase();
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  })
);

const featuredPost = computed<Post | null>(() => filteredPosts.value[0] ?? normalizedPosts.value[0] ?? null);
const secondaryPosts = computed(() => filteredPosts.value.slice(1, 3));
const remainingPosts = computed(() => filteredPosts.value.slice(3));

const blogStats = computed(() => {
  const uniqueCategories = new Set(blogPosts.value.map((post) => post.category)).size;
  const lastUpdated = normalizedPosts.value[0]
    ? useDateFormatter(normalizedPosts.value[0].date)
    : "N/A";
  return {
    totalPosts: blogPosts.value.length,
    uniqueCategories,
    lastUpdated,
  };
});

watchEffect(() => {
  if (!featuredPost.value && normalizedPosts.value.length) {
    store.setSelectedBlog(normalizedPosts.value[0]);
  }
});
</script>
