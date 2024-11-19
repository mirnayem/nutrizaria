<template>
  <div class="blog-details grid grid-cols-12">
    <section class="col-span-9">
      <NuxtImg
        class="w-full max-w-[1200px] h-[400px] object-cover"
        format="webp"
        :src="blog.image"
        sizes="md:1200px sm:700px 450px"
        :alt="blog.title"
      />
      <div class="md:px-20 px-0 mt-10">
        <h1 class="text-4xl font-bold">{{ blog.title }}</h1>
        <p class="flex gap-10 items-center mt-4 text-slate-400">
          <span class="flex gap-2 items-center"
            ><PencilSquareIcon class="w-5 h-5" /> {{ blog.writer }}</span
          >
          <span class="flex gap-2 items-center"
            ><ClockIcon class="w-5 h-5" />
            {{ useDateFormatter(blog.date) }}</span
          >
        </p>
        <div class="w-full h-0.5 mt-4 bg-slate-300"></div>
        <p class="mt-10 text-slate-700">{{ blog.content }}</p>
        <p v-for="(item, index) in paragraphs" key="index" class="grid py-6">
          {{ item }}
        </p>
      </div>
    </section>
    <aside class="col-span-3"></aside>
  </div>
</template>
<script setup lang="ts">
import { ClockIcon, PencilSquareIcon } from "@heroicons/vue/16/solid";
import { ref, onMounted } from "vue";
import { useBlogStore } from "~/stores/blog";
import type { Post } from "~/types/product";
import { chunkParagraph } from "~/composables/chunkParagraph";
import { useHead } from "#imports";
import { useRoute } from "vue-router";
const route = useRoute();
useHead({
  title: "The Future of Organic Food in E-Commerce",
  meta: [
    { name: "og:title", content: "The Future of Organic Food in E-Commerce" },
    {
      name: "og:description",
      content: "Exploring the future of organic food...",
    },
    {
      name: "og:url",
      content: `https://nutri-akl.vercel.app/blog/${route.params.slug}`,
    },
    {
      name: "og:image",
      content: "https://nutri-akl.vercel.app/images/blogs/organic-food.avif",
    },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});

const store = useBlogStore();
const selectedBlog = store.selectedBlog;

const blog = ref<Post>(selectedBlog);

const paragraph = `'Food is an essential part of human life, not just as a source of
          sustenance but as a powerful cultural and emotional cornerstone.
          Across the world, food plays a central role in celebrations,
          traditions, and daily routines, connecting people through shared
          experiences and flavors. From the tangy and spicy curries of South
          Asia to the rich, creamy pasta dishes of Italy, the diversity of food
          mirrors the variety of human cultures and environments. Historically,
          food has shaped civilizations. The domestication of plants and animals
          marked the advent of agriculture and allowed humans to settle in one
          place, leading to the development of societies and the rise of cities.
          Staples like wheat, rice, and maize became the foundation of diets,
          supporting populations and fostering trade routes such as the Silk
          Road. These routes not only facilitated the exchange of goods but also
          the sharing of culinary traditions, introducing spices, techniques,
          and ingredients to new regions. For instance, tomatoes, originally
          native to the Americas, became integral to Italian cuisine, while
          spices from India transformed European dishes. In modern times, the
          way we produce and consume food has undergone significant
          transformations. The industrialization of agriculture has made food
          production more efficient, enabling the feeding of large populations.
          However, this has also led to challenges such as environmental
          degradation, loss of biodiversity, and ethical concerns around animal
          farming. The rise of processed foods and fast food chains has changed
          dietary patterns, often leading to health concerns like obesity and
          diabetes. Amidst these challenges, there is a growing movement towards
          healthier and more sustainable food practices. Organic farming,
          plant-based diets, and farm-to-table initiatives are gaining traction
          as people become more conscious of the impact their food choices have
          on their health and the planet. The popularity of superfoods like
          quinoa, kale, and avocados highlights a shift towards nutrient-rich,
          wholesome ingredients. Moreover, technology is playing an increasingly
          significant role in the food industry, with innovations like lab-grown
          meat and vertical farming offering solutions to food security and
          environmental issues. Food is also a profound form of expression and
          identity. For many, it serves as a link to their heritage, a way to
          preserve traditions, and a means to share their culture with others.
          The ritual of preparing and sharing meals fosters community and brings
          families together, creating memories that last a lifetime. Cooking
          shows, food blogs, and social media platforms have turned food into an
          art form, inspiring people to experiment with recipes and
          presentation. The future of food is both exciting and uncertain. As
          the global population continues to grow, finding ways to feed billions
          sustainably will be crucial. Advances in biotechnology and artificial
          intelligence may revolutionize agriculture and food production, while
          traditional practices like foraging and fermentation are being
          rediscovered for their environmental benefits. Ultimately, food is
          more than just fuel for the body. It is a universal language that
          transcends borders, telling stories of tradition, innovation, and
          humanity's relationship with nature. As we navigate the complexities
          of modern life, the choices we make about what we eat and how we
          produce it will shape not just our health but the future of our
          planet.'`;

const paragraphs = chunkParagraph(paragraph, 3);
onMounted(() => {
  const dataLocal = localStorage.getItem("selectedBlog");
  if (dataLocal) {
    blog.value = JSON.parse(dataLocal);
  }
});
</script>
