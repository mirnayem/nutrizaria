<template>
  <article
    class="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
  >
    <NuxtLink :to="`/blog/${post.slug}`" class="focus:outline-none">
      <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          v-if="imageSrc"
          :src="imageSrc"
          :alt="post.title"
          width="640"
          height="400"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <span class="text-sm font-medium text-slate-500">NutriZaria</span>
        </div>
        <span
          v-if="post.category"
          class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur"
        >
          {{ post.category }}
        </span>
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-3 p-6">
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <span>{{ useDateFormatter(post.date) }}</span>
        <span class="size-1 rounded-full bg-slate-300" aria-hidden="true"></span>
        <span class="inline-flex items-center gap-1">
          <ClockIcon class="size-3.5" aria-hidden="true" />
          {{ readingTime }} min read
        </span>
      </div>

      <h3 class="text-lg font-semibold leading-snug text-slate-900">
        <NuxtLink
          :to="`/blog/${post.slug}`"
          class="transition group-hover:text-violet-700"
        >
          {{ post.title }}
        </NuxtLink>
      </h3>

      <p class="line-clamp-3 text-sm leading-relaxed text-slate-600">
        {{ excerpt }}
      </p>

      <div class="mt-auto flex items-center gap-3 pt-3">
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700"
          aria-hidden="true"
        >
          {{ initials }}
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-800">{{ post.writer }}</p>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ClockIcon } from "@heroicons/vue/16/solid";
import { useDateFormatter } from "~/composables/dateFormater";
import type { Post } from "~/types/product";

const props = defineProps<{
  post: Post;
}>();

const { resolve } = useImageUrl();

const imageSrc = computed(() => resolve(props.post.image));
const excerpt = computed(() => {
  const content = props.post.excerpt || props.post.content || "";
  return content.length > 160 ? `${content.slice(0, 160)}…` : content;
});
const initials = computed(() => {
  const name = props.post.writer || "NutriZaria";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
});
const readingTime = computed(() => {
  const words = (props.post.content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});
</script>