<template>
  <article v-if="blog" class="space-y-12">
    <section class="overflow-hidden rounded-3xl bg-slate-950 text-white">
      <div class="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <div class="space-y-4 p-8">
          <p class="text-xs uppercase tracking-[0.3em] text-white/60">
            {{ blog.category }}
          </p>
          <h1 class="text-4xl font-semibold leading-tight">{{ blog.title }}</h1>
          <p class="flex flex-wrap gap-4 text-sm text-white/70">
            <span class="inline-flex items-center gap-2">
              <PencilSquareIcon class="size-4" />
              {{ blog.writer }}
            </span>
            <span class="inline-flex items-center gap-2">
              <ClockIcon class="size-4" />
              {{ useDateFormatter(blog.date) }}
            </span>
            <span>{{ readingTime }} min read</span>
          </p>
          <div class="flex gap-3">
            <NuxtLink
              to="/blog"
              class="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm text-white/90 transition hover:bg-white/10"
            >
              ← Back to blog
            </NuxtLink>
          </div>
        </div>
        <img :src="resolve(blog.image)" :alt="blog.title" class="h-full w-full object-cover" loading="lazy" />
      </div>
    </section>

    <section class="grid gap-10 lg:grid-cols-[2.2fr,0.8fr]">
      <div class="space-y-8 rounded-3xl bg-white p-8 shadow-sm">
        <p class="text-lg leading-relaxed text-slate-700">
          {{ blog.content }}
        </p>
        <div class="space-y-6 text-slate-700">
          <p v-for="(item, index) in paragraphs" :key="index">
            {{ item }}
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
          <p class="font-semibold text-slate-900">Key takeaway</p>
          <p class="mt-2">
            Sustainable sourcing and mindful eating habits allow NutriZaria customers to enjoy
            premium staples without compromising on freshness or ethics.
          </p>
        </div>
      </div>

      <aside class="space-y-6">
        <div class="rounded-3xl bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">More stories</h3>
          <ul class="mt-4 space-y-3">
            <li
              v-for="related in relatedPosts"
              :key="related.id"
              class="rounded-2xl border border-slate-100 p-3 text-sm text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
            >
              <NuxtLink :to="`/blog/${related.slug}`">{{ related.title }}</NuxtLink>
              <p class="text-xs text-slate-400">
                {{ related.category }} • {{ useDateFormatter(related.date) }}
              </p>
            </li>
          </ul>
        </div>
        <div class="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Share insight
          </p>
          <p class="mt-2">Copy the link below and share with your community.</p>
          <button
            type="button"
            class="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-left text-xs text-slate-500 transition hover:border-violet-200 hover:text-violet-700"
            @click="copyLink"
          >
            {{ currentUrl }}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
              <path
                fill-rule="evenodd"
                d="M15 4.25a2.25 2.25 0 0 0-2.25-2.25H4.25A2.25 2.25 0 0 0 2 4.25v8.5A2.25 2.25 0 0 0 4.25 15h8.5A2.25 2.25 0 0 0 15 12.75v-8.5ZM4.25 3A1.25 1.25 0 0 0 3 4.25v8.5A1.25 1.25 0 0 0 4.25 14h8.5A1.25 1.25 0 0 0 14 12.75v-8.5A1.25 1.25 0 0 0 12.75 3h-8.5Z"
                clip-rule="evenodd"
              />
              <path
                d="M6 17a.75.75 0 0 1 .75-.75h8A1.25 1.25 0 0 0 16 15V6.75a.75.75 0 0 1 1.5 0V15a2.75 2.75 0 0 1-2.75 2.75h-8A.75.75 0 0 1 6 17Z"
              />
            </svg>
          </button>
          <p v-if="copied" class="mt-2 text-xs text-emerald-600">Link copied to clipboard</p>
        </div>
      </aside>
    </section>
  </article>

  <div v-else class="rounded-xl bg-white p-10 text-center shadow-sm">
    <p class="text-slate-600">
      Blog post not found. Please return to the
      <NuxtLink to="/blog" class="text-violet-700 underline">blog page</NuxtLink
      >.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ClockIcon, PencilSquareIcon } from "@heroicons/vue/16/solid";
import { useHead } from "#imports";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { chunkParagraph } from "~/composables/chunkParagraph";
import { useDateFormatter } from "~/composables/dateFormater";
import { useBlogStore } from "~/stores/blog";
import type { Post } from "~/types/product";

const route = useRoute();
const store = useBlogStore();
store.hydrate();
const { resolve } = useImageUrl();

const slug = computed(() => String(route.params.slug));
const blog = computed<Post | undefined>(() => {
  const fromSlug = store.postBySlug(slug.value);
  if (fromSlug) {
    store.setSelectedBlog(fromSlug);
    return fromSlug;
  }
  return store.selectedBlog ?? undefined;
});

const relatedPosts = computed(() =>
  store.posts.filter((post) => post.slug !== slug.value).slice(0, 4)
);

useHead(() => ({
  title: blog.value ? `${blog.value.title} | NutriZaria` : "Blog | NutriZaria",
  meta: [
    {
      name: "og:title",
      content: blog.value?.title ?? "NutriZaria Blog",
    },
    {
      name: "og:description",
      content:
        blog.value?.content ??
        "Dive into NutriZaria insights, healthy eating, and product guides.",
    },
    {
      name: "og:url",
      content: `https://nutri-akl.vercel.app/blog/${slug.value}`,
    },
    {
      name: "og:image",
      content: blog.value?.image
        ? `https://nutri-akl.vercel.app${blog.value.image}`
        : "https://nutri-akl.vercel.app/nutri.png",
    },
    { name: "twitter:card", content: "summary_large_image" },
  ],
}));

const paragraph = `'Food is an essential part of human life, not just as a source of sustenance but as a powerful cultural and emotional cornerstone. Across the world, food plays a central role in celebrations, traditions, and daily routines, connecting people through shared experiences and flavors. From the tangy and spicy curries of South Asia to the rich, creamy pasta dishes of Italy, the diversity of food mirrors the variety of human cultures and environments. Historically, food has shaped civilizations. The domestication of plants and animals marked the advent of agriculture and allowed humans to settle in one place, leading to the development of societies and the rise of cities. Staples like wheat, rice, and maize became the foundation of diets, supporting populations and fostering trade routes such as the Silk Road. These routes not only facilitated the exchange of goods but also the sharing of culinary traditions, introducing spices, techniques, and ingredients to new regions. For instance, tomatoes, originally native to the Americas, became integral to Italian cuisine, while spices from India transformed European dishes. In modern times, the way we produce and consume food has undergone significant transformations. The industrialization of agriculture has made food production more efficient, enabling the feeding of large populations. However, this has also led to challenges such as environmental degradation, loss of biodiversity, and ethical concerns around animal farming. The rise of processed foods and fast food chains has changed dietary patterns, often leading to health concerns like obesity and diabetes. Amidst these challenges, there is a growing movement towards healthier and more sustainable food practices. Organic farming, plant-based diets, and farm-to-table initiatives are gaining traction as people become more conscious of the impact their food choices have on their health and the planet. The popularity of superfoods like quinoa, kale, and avocados highlights a shift towards nutrient-rich, wholesome ingredients. Moreover, technology is playing an increasingly significant role in the food industry, with innovations like lab-grown meat and vertical farming offering solutions to food security and environmental issues. Food is also a profound form of expression and identity. For many, it serves as a link to their heritage, a way to preserve traditions, and a means to share their culture with others. The ritual of preparing and sharing meals fosters community and brings families together, creating memories that last a lifetime. Cooking shows, food blogs, and social media platforms have turned food into an art form, inspiring people to experiment with recipes and presentation. The future of food is both exciting and uncertain. As the global population continues to grow, finding ways to feed billions sustainably will be crucial. Advances in biotechnology and artificial intelligence may revolutionize agriculture and food production, while traditional practices like foraging and fermentation are being rediscovered for their environmental benefits. Ultimately, food is more than just fuel for the body. It is a universal language that transcends borders, telling stories of tradition, innovation, and humanity's relationship with nature. As we navigate the complexities of modern life, the choices we make about what we eat and how we produce it will shape not just our health but the future of our planet.'`;

const paragraphs = chunkParagraph(paragraph, 3);
const readingTime = computed(() => {
  if (!blog.value) return 4;
  const words = blog.value.content.split(" ").length + paragraph.split(" ").length;
  return Math.max(4, Math.ceil(words / 180));
});

const currentUrl = computed(() =>
  typeof window !== "undefined" ? window.location.href : ""
);
const copied = ref(false);
const copyLink = async () => {
  if (!currentUrl.value || typeof navigator === "undefined") return;
  try {
    await navigator.clipboard.writeText(currentUrl.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2500);
  } catch (error) {
    copied.value = false;
  }
};
</script>
