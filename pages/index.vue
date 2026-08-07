<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

const catalog = useCatalogStore();
await catalog.hydrate();
const { products, categories } = storeToRefs(catalog);

useSeo({
  title: "NutriZaria - Authentic Pure Food Resources",
  description:
    "NutriZaria offers the highest quality natural food resources, ensuring purity and sustainability for healthy living.",
  image: "/nutri.png",
  type: "website",
});

const { resolve } = useImageUrl();

const isCatalogLoading = computed(() => catalog.loading && !catalog.hydrated);

const groupedProducts = computed(() => {
  const productList = products.value ?? [];
  const categoryList = categories.value ?? [];
  return categoryList
    .map((category) => {
      const items = productList.filter(
        (product) => product.category === category.slug,
      );
      return {
        category,
        items,
      };
    })
    .filter((group) => group.items.length);
});

const bestSelling = computed(() => {
  const all = products.value ?? [];
  return all
    .filter((p) => p.isFeatured)
    .sort((a, b) => (b.comparePrice ?? 0) - (a.comparePrice ?? 0))
    .slice(0, 10);
});

const newArrivals = computed(() => {
  const all = products.value ?? [];
  return all.slice(0, 10);
});

const bannerSlides = [
  {
    title: "Pure Honey Collection",
    subtitle: "100% Natural & Lab Tested",
    bg: "from-violet-50 to-fuchsia-100",
    accent: "text-violet-700",
    btn: "bg-violet-600 text-white",
    href: "/categories/honey",
    image: "/images/honey2.avif",
  },
  {
    title: "Fresh Spices & Herbs",
    subtitle: "Farm Direct to Your Kitchen",
    bg: "from-amber-50 to-orange-100",
    accent: "text-amber-700",
    btn: "bg-amber-600 text-white",
    href: "/categories/spices",
    image: "/images/nuts2.avif",
  },
  {
    title: "Premium Cooking Oils",
    subtitle: "Cold Pressed & Unrefined",
    bg: "from-indigo-50 to-violet-100",
    accent: "text-indigo-700",
    btn: "bg-indigo-600 text-white",
    href: "/categories/oil",
    image: "/images/olive-oil.avif",
  },
];
</script>

<template>
  <main class="space-y-8">
    <!-- Hero Banner Grid -->
    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="(slide, i) in bannerSlides"
        :key="i"
        :to="slide.href"
        :class="[
          'group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg',
          i === 0 ? 'sm:col-span-2 lg:col-span-2' : '',
          `bg-gradient-to-br ${slide.bg}`,
        ]"
      >
        <div class="flex items-center gap-4 p-5 sm:p-6">
          <div class="flex-1 space-y-2">
            <p :class="['text-xs font-semibold uppercase tracking-wider', slide.accent]">
              {{ slide.subtitle }}
            </p>
            <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
              {{ slide.title }}
            </h2>
            <span
              :class="[
                'inline-block rounded-full px-4 py-1.5 text-xs font-semibold transition group-hover:scale-105',
                slide.btn,
              ]"
            >
              Shop Now
            </span>
          </div>
          <div class="w-28 shrink-0 sm:w-36">
            <img
              :src="slide.image"
              :alt="slide.title"
              loading="lazy"
              class="h-28 w-28 rounded-xl object-cover shadow-md transition duration-300 group-hover:scale-105 sm:h-36 sm:w-36"
            />
          </div>
        </div>
      </NuxtLink>
    </section>

    <!-- Loading Skeleton -->
    <template v-if="isCatalogLoading">
      <section
        v-for="i in 2"
        :key="i"
        class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="h-5 w-48 animate-pulse rounded-full bg-slate-200"></div>
          <div class="h-4 w-20 animate-pulse rounded-full bg-slate-200"></div>
        </div>
        <div class="flex gap-3 overflow-hidden">
          <div
            v-for="j in 5"
            :key="j"
            class="h-64 w-44 shrink-0 animate-pulse rounded-xl bg-slate-100"
          ></div>
        </div>
      </section>
    </template>

    <!-- Best Selling Items -->
    <section
      v-if="bestSelling.length"
      class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
          <span class="mr-1">🔥</span> Best Selling Items
        </h2>
      </div>
      <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <SingleProduct
          v-for="product in bestSelling"
          :key="product.id"
          :product="product"
          class="w-44 shrink-0 sm:w-48"
        />
      </div>
    </section>

    <!-- Explore Categories -->
    <section
      v-if="categories.length"
      class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm"
    >
      <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
        Explore Categories
      </h2>
      <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/categories/${category.slug}`"
          class="group flex flex-col items-center gap-2"
        >
          <div
            class="aspect-square w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 transition group-hover:border-violet-200 group-hover:shadow-md"
          >
            <img
              :src="resolve(category.image)"
              :alt="category.name"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            />
          </div>
          <p
            class="line-clamp-1 text-center text-xs font-medium text-slate-700 transition group-hover:text-violet-700"
          >
            {{ category.name }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- Category Product Sections -->
    <section
      v-for="group in groupedProducts"
      :key="group.category.id"
      class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
          {{ group.category.name }}
        </h2>
        <NuxtLink
          :to="`/categories/${group.category.slug}`"
          class="text-sm font-medium text-violet-600 transition hover:text-violet-700"
        >
          See All
        </NuxtLink>
      </div>
      <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <SingleProduct
          v-for="product in group.items.slice(0, 12)"
          :key="product.id"
          :product="product"
          class="w-44 shrink-0 sm:w-48"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
