<template>
  <div v-if="loading" class="space-y-8">
    <div class="space-y-4">
      <div class="h-3 w-24 animate-pulse rounded bg-slate-100"></div>
      <div class="h-8 w-3/4 animate-pulse rounded bg-slate-100 sm:h-10"></div>
      <div class="h-4 w-1/3 animate-pulse rounded bg-slate-100"></div>
    </div>
    <div class="aspect-[16/9] animate-pulse rounded-3xl bg-slate-100"></div>
    <div class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-4 animate-pulse rounded bg-slate-100"></div>
    </div>
  </div>

  <article v-else-if="blog" class="mx-auto max-w-3xl space-y-10">
    <div class="space-y-6">
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-700"
      >
        <ArrowLeftIcon class="size-4" aria-hidden="true" />
        Back to journal
      </NuxtLink>

      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span class="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {{ blog.category }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <CalendarIcon class="size-4" aria-hidden="true" />
            {{ useDateFormatter(blog.date) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <ClockIcon class="size-4" aria-hidden="true" />
            {{ readingTime }} min read
          </span>
        </div>
        <h1 class="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          {{ blog.title }}
        </h1>
        <div class="flex items-center gap-3">
          <span
            class="flex size-10 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700"
            aria-hidden="true"
          >
            {{ authorInitials }}
          </span>
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ blog.writer }}</p>
            <p class="text-xs text-slate-500">NutriZaria Editorial</p>
          </div>
        </div>
      </div>
    </div>

    <div class="aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100">
      <img
        v-if="blogImage"
        :src="blogImage"
        :alt="blog.title"
        width="1280"
        height="720"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <span class="text-sm font-medium text-slate-400">NutriZaria</span>
      </div>
    </div>

    <div class="space-y-6 text-[17px] leading-relaxed text-slate-700">
      <p v-if="blog.excerpt" class="text-lg font-medium text-slate-800">
        {{ blog.excerpt }}
      </p>
      <p v-for="(paragraph, index) in paragraphs" :key="index">
        {{ paragraph }}
      </p>
    </div>

    <div class="flex flex-col gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
      <ShareButton :title="blog.title" :url="currentUrl" label="Share this article" />
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <span>Category:</span>
        <button
          type="button"
          class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          @click="goToCategory"
        >
          {{ blog.category }}
        </button>
      </div>
    </div>
  </article>

  <div v-else class="mx-auto max-w-3xl rounded-3xl border border-slate-200/70 bg-white p-12 text-center shadow-sm">
    <p class="text-lg font-semibold text-slate-900">Article not found</p>
    <p class="mt-2 text-sm text-slate-500">
      The article you're looking for may have been moved or removed.
    </p>
    <NuxtLink
      to="/blog"
      class="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      Browse the journal
      <ArrowRightIcon class="size-4" aria-hidden="true" />
    </NuxtLink>
  </div>

  <section v-if="blog && relatedPosts.length" class="mx-auto mt-16 max-w-5xl space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900">More from the journal</h2>
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 transition hover:gap-2.5"
      >
        View all
        <ArrowRightIcon class="size-4" aria-hidden="true" />
      </NuxtLink>
    </div>
    <div class="grid gap-6 md:grid-cols-2">
      <BlogCard v-for="post in relatedPosts" :key="post.id" :post="post" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, ClockIcon } from "@heroicons/vue/16/solid";
import { useBlogStore } from "~/stores/blog";
import { useDateFormatter } from "~/composables/dateFormater";
import { chunkParagraph } from "~/composables/chunkParagraph";
import BlogCard from "~/components/BlogCard.vue";
import ShareButton from "~/components/ShareButton.vue";
import type { Post } from "~/types/product";

const route = useRoute();
const store = useBlogStore();
await store.hydrate();
const { resolve } = useImageUrl();
const api = useApi();

const slug = computed(() => String(route.params.slug));

const blog = ref<Post | undefined>(store.postBySlug(slug.value));

const loading = computed(() => store.loading && !store.hydrated);

const normalizeApiPost = (post: any): Post => ({
  id: String(post.id),
  title: post.title,
  category: post.category ?? "General",
  writer: post.author ?? "NutriZaria Team",
  date: post.publishedAt ?? post.createdAt ?? new Date().toISOString(),
  image: post.image || post.image,
  content: post.content ?? "",
  slug: blogSlugFromTitle(post.title) || cleanBackendSlug(post.slug || "") || String(post.id),
  rawSlug: post.slug,
  excerpt: post.excerpt || undefined,
  views: post.views ?? 0,
});

const resolvePost = async () => {
  const fromStore = store.postBySlug(slug.value);
  if (fromStore) blog.value = fromStore;
  try {
    const res = await api.getBlog(slug.value);
    const item = res?.data ?? res;
    if (item?.id) {
      blog.value = normalizeApiPost(item);
      store.setSelectedBlog(blog.value);
    }
  } catch (error) {
    if (!fromStore) {
      blog.value = store.postBySlug(slug.value) ?? undefined;
    }
  }
};

await resolvePost();

const blogImage = computed(() => (blog.value?.image ? resolve(blog.value.image) : null));
const authorInitials = computed(() => {
  const name = blog.value?.writer || "NutriZaria";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
});

const paragraphs = computed(() => {
  const content = blog.value?.content || "";
  const lines = content.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return chunkParagraph(content, 6);
});

const readingTime = computed(() => {
  const words = (blog.value?.content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

const relatedPosts = computed(() =>
  store.posts
    .filter((post) => post.slug !== slug.value)
    .slice(0, 2)
);

const currentUrl = computed(() =>
  typeof window !== "undefined" ? window.location.href : ""
);

const goToCategory = () => {
  navigateTo({ path: "/blog", query: blog.value?.category ? { category: blog.value.category } : {} });
};

const seo = useSeo({
  title: () => (blog.value ? blog.value.title : "Blog"),
  description: () => blog.value?.excerpt || blog.value?.content?.slice(0, 160),
  image: () => blog.value?.image ?? null,
  type: "article",
  noindex: () => !blog.value,
  canonicalPath: () => (blog.value ? `/blog/${blog.value.slug}` : undefined),
  jsonld: () => {
    if (!blog.value) return null;
    const post = blog.value;
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      image: [seo.toAbsolute(seo.toResolved(post.image))],
      datePublished: post.date,
      dateModified: post.date,
      author: {
        "@type": "Person",
        name: post.writer,
      },
      publisher: {
        "@type": "Organization",
        name: "NutriZaria",
        logo: {
          "@type": "ImageObject",
          url: `${seo.base}/nutri.png`,
        },
      },
      mainEntityOfPage: seo.toAbsolute(`/blog/${post.slug}`),
    };
  },
});
</script>