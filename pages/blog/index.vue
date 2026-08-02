<template>
  <div class="space-y-14">
    <section class="space-y-4">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-600">
        Journal
      </p>
      <h1 class="max-w-2xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
        Stories, guides &amp; insights for mindful kitchens
      </h1>
      <p class="max-w-xl text-slate-600">
        Practical advice on sourcing, cooking, and eating well — curated by the
        NutriZaria team.
      </p>
    </section>

    <div
      v-if="loading"
      class="grid gap-6 md:grid-cols-2"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm"
      >
        <div class="aspect-[16/10] animate-pulse bg-slate-100"></div>
        <div class="space-y-3 p-6">
          <div class="h-3 w-1/3 animate-pulse rounded bg-slate-100"></div>
          <div class="h-5 w-3/4 animate-pulse rounded bg-slate-100"></div>
          <div class="h-4 w-full animate-pulse rounded bg-slate-100"></div>
          <div class="h-4 w-2/3 animate-pulse rounded bg-slate-100"></div>
        </div>
      </div>
    </div>

    <template v-else>
      <article
        v-if="featuredPost"
        class="group grid overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition duration-300 hover:shadow-xl hover:shadow-slate-200/60 lg:grid-cols-[1.1fr,1fr]"
      >
        <NuxtLink
          :to="`/blog/${featuredPost.slug}`"
          class="relative block aspect-[16/10] overflow-hidden bg-slate-100 lg:aspect-auto"
          :aria-label="featuredPost.title"
        >
          <img
            v-if="featuredImage"
            :src="featuredImage"
            :alt="featuredPost.title"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center"
          >
            <span class="text-sm font-medium text-slate-400">NutriZaria</span>
          </div>
        </NuxtLink>
        <div class="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span class="rounded-full bg-violet-50 px-3 py-1 font-semibold text-violet-700">
              {{ featuredPost.category }}
            </span>
            <span>{{ useDateFormatter(featuredPost.date) }}</span>
            <span class="inline-flex items-center gap-1">
              <ClockIcon class="size-3.5" aria-hidden="true" />
              {{ featuredReadingTime }} min read
            </span>
          </div>
          <h2 class="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
            <NuxtLink
              :to="`/blog/${featuredPost.slug}`"
              class="transition group-hover:text-violet-700"
            >
              {{ featuredPost.title }}
            </NuxtLink>
          </h2>
          <p class="line-clamp-3 text-slate-600">
            {{ featuredExcerpt }}
          </p>
          <div class="flex items-center gap-3 pt-2">
            <span
              class="flex size-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700"
              aria-hidden="true"
            >
              {{ featuredInitials }}
            </span>
            <p class="text-sm font-medium text-slate-800">{{ featuredPost.writer }}</p>
          </div>
          <div class="pt-2">
            <NuxtLink
              :to="`/blog/${featuredPost.slug}`"
              class="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:gap-3"
            >
              Read article
              <ArrowRightIcon class="size-4" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </article>

      <section class="space-y-8">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in filterCategories"
              :key="category"
              type="button"
              class="rounded-full border px-4 py-1.5 text-sm transition"
              :class="selectedCategory === category
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'"
              @click="selectedCategory = category"
            >
              {{ category }}
            </button>
          </div>
          <label
            class="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-500 focus-within:border-slate-400 lg:w-72"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              class="size-4"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search articles"
              class="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
            />
          </label>
        </div>

        <div v-if="remainingPosts.length" class="grid gap-6 md:grid-cols-2">
          <BlogCard v-for="post in remainingPosts" :key="post.id" :post="post" />
        </div>

        <div
          v-else
          class="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center"
        >
          <p class="text-sm font-medium text-slate-500">
            No articles found.
          </p>
          <p class="mt-1 text-sm text-slate-400">
            Try a different category or search term.
          </p>
          <button
            type="button"
            class="mt-4 text-sm font-semibold text-violet-700 hover:underline"
            @click="resetFilters"
          >
            Clear filters
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ArrowRightIcon, ClockIcon } from "@heroicons/vue/16/solid";
import { useBlogStore } from "~/stores/blog";
import { useDateFormatter } from "~/composables/dateFormater";
import BlogCard from "~/components/BlogCard.vue";
import type { Post } from "~/types/product";

useSeo({
  title: "Blog",
  description:
    "Stories, guides and insights for mindful kitchens — practical advice on sourcing, cooking, and eating well from NutriZaria.",
  type: "website",
});

const store = useBlogStore();
await store.hydrate();
const { posts: blogPosts, loading } = storeToRefs(store);
const { resolve } = useImageUrl();
const route = useRoute();

const selectedCategory = ref(
  typeof route.query.category === "string" ? route.query.category : "All"
);
const searchQuery = ref("");

watch(
  () => route.query.category,
  (value) => {
    if (typeof value === "string" && value) {
      selectedCategory.value = value;
    }
  }
);

const normalizedPosts = computed(() =>
  [...blogPosts.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
);

const filterCategories = computed(() => {
  const unique = Array.from(new Set(blogPosts.value.map((post) => post.category).filter(Boolean)));
  return ["All", ...unique];
});

const filteredPosts = computed(() =>
  normalizedPosts.value.filter((post) => {
    const matchesCategory =
      selectedCategory.value === "All" ||
      post.category?.toLowerCase() === selectedCategory.value.toLowerCase();
    const matchesSearch =
      !searchQuery.value ||
      post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  })
);

const featuredPost = computed<Post | null>(() => filteredPosts.value[0] ?? normalizedPosts.value[0] ?? null);
const featuredImage = computed(() => featuredPost.value?.image ? resolve(featuredPost.value.image) : null);
const featuredExcerpt = computed(() => {
  const content = featuredPost.value?.excerpt || featuredPost.value?.content || "";
  return content.length > 180 ? `${content.slice(0, 180)}…` : content;
});
const featuredInitials = computed(() => {
  const name = featuredPost.value?.writer || "NutriZaria";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
});
const featuredReadingTime = computed(() => {
  const words = (featuredPost.value?.content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

const remainingPosts = computed(() => filteredPosts.value.slice(1));

const resetFilters = () => {
  selectedCategory.value = "All";
  searchQuery.value = "";
};
</script>