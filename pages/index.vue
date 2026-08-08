<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const modules = [Navigation];
const heroModules = [Pagination];
const catModules = [Navigation, Pagination];
const productModules = [Pagination];

const productBreakpoints = {
  0: { slidesPerView: 2.2, spaceBetween: 12 },
  480: { slidesPerView: 3.2, spaceBetween: 12 },
  768: { slidesPerView: 4.2, spaceBetween: 12 },
  1024: { slidesPerView: 5.2, spaceBetween: 12 },
  1280: { slidesPerView: 5.5, spaceBetween: 12 },
};

const catalog = useCatalogStore();
await catalog.hydrate();
const { products, categories, featuredProducts, bestSellingProducts } = storeToRefs(catalog);

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
  const fullCategoryList = categories.value ?? [];
  const parents = fullCategoryList.filter((c) => !c.parentId);
  return parents
    .map((category) => {
      const childSlugs = (category.children || []).map((ch) => ch.slug);
      const accepted = new Set([category.slug, ...childSlugs]);
      const items = productList.filter((product) =>
        accepted.has(product.category),
      );
      return {
        category,
        items,
      };
    })
    .filter((group) => group.items.length);
});

const featuredItems = computed(() => featuredProducts.value.slice(0, 10));
const bestSellingItems = computed(() => bestSellingProducts.value.slice(0, 10));

const saleProducts = computed(() => catalog.saleProducts.slice(0, 10));

const parentCategories = computed(() =>
  (categories.value ?? []).filter((c) => !c.parentId)
);

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

const categoryColumns = computed(() => {
  // One category per slide: the slider shows as many items as fit the screen,
  // while navigation (pagination dots) steps 4 slides at a time.
  return parentCategories.value.map((c) => [c]);
});

const categoryBreakpoints = {
  0: { slidesPerView: 4, spaceBetween: 10, slidesPerGroup: 4 },
  480: { slidesPerView: 4.5, spaceBetween: 10, slidesPerGroup: 4 },
  768: { slidesPerView: 6, spaceBetween: 12, slidesPerGroup: 4 },
  1024: { slidesPerView: 7.5, spaceBetween: 14, slidesPerGroup: 4 },
  1280: { slidesPerView: 9, spaceBetween: 14, slidesPerGroup: 4 },
};
</script>

<template>
  <div class="flex">
    <!-- Sidebar -->
    <SkeletonSidebar v-if="isCatalogLoading" class="hidden lg:block" />
    <CategorySidebar v-else class="hidden lg:block" />

    <!-- Main Content -->
    <main class="min-w-0 flex-1 space-y-8 p-4 sm:p-6">
      <!-- Hero Banner -->
      <section class="relative">
        <!-- Mobile swiper -->
        <div class="sm:hidden">
          <ClientOnly>
            <Swiper
              :modules="heroModules"
              :slides-per-view="1"
              :space-between="0"
              :loop="true"
              :speed="600"
              :pagination="{ clickable: true }"
              class="hero-swiper"
            >
            <SwiperSlide
              v-for="(slide, i) in bannerSlides"
              :key="i"
            >
              <NuxtLink
                :to="slide.href"
                :class="[
                  'group relative block overflow-hidden rounded-2xl',
                  `bg-gradient-to-br ${slide.bg}`,
                ]"
              >
                <div class="flex items-center gap-4 p-5">
                  <div class="flex-1 space-y-2">
                    <p :class="['text-xs font-semibold uppercase tracking-wider', slide.accent]">
                      {{ slide.subtitle }}
                    </p>
                    <h2 class="text-lg font-bold text-slate-900">
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
                  <div class="w-28 shrink-0">
                    <img
                      :src="slide.image"
                      :alt="slide.title"
                      loading="lazy"
                      class="h-28 w-28 rounded-xl object-cover shadow-md transition duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              </NuxtLink>
            </SwiperSlide>
          </Swiper>
          <template #fallback>
            <div class="grid gap-3 sm:hidden">
              <div v-for="i in 3" :key="i" class="h-40 animate-pulse rounded-2xl bg-slate-100"></div>
            </div>
          </template>
        </ClientOnly>
        </div>

        <!-- Desktop grid -->
        <div class="hidden grid-cols-2 gap-3 sm:grid lg:grid-cols-3">
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
        </div>
      </section>

      <!-- Loading Skeleton -->
      <template v-if="isCatalogLoading">
        <!-- Featured / Sale row -->
        <section
          v-for="i in 3"
          :key="i"
          class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div class="h-6 w-48 animate-pulse rounded-full bg-slate-200"></div>
            <div class="h-4 w-20 animate-pulse rounded-full bg-slate-200"></div>
          </div>
          <div class="flex gap-3 overflow-hidden">
            <SkeletonProductCard
              v-for="j in 5"
              :key="j"
              class="w-44 shrink-0"
            />
          </div>
        </section>

        <!-- Explore Categories -->
        <section class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm">
          <div class="h-6 w-48 animate-pulse rounded-full bg-slate-200"></div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <div v-for="i in 8" :key="i" class="animate-pulse">
              <div class="aspect-square rounded-xl bg-slate-100"></div>
              <div class="mx-auto mt-2 h-3 w-16 rounded-full bg-slate-200"></div>
            </div>
          </div>
        </section>

        <!-- Category product rows -->
        <section
          v-for="i in 2"
          :key="`cat-${i}`"
          class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div class="h-6 w-40 animate-pulse rounded-full bg-slate-200"></div>
            <div class="h-4 w-16 animate-pulse rounded-full bg-slate-200"></div>
          </div>
          <div class="flex gap-3 overflow-hidden">
            <SkeletonProductCard
              v-for="j in 5"
              :key="j"
              class="w-44 shrink-0"
            />
          </div>
        </section>
      </template>

      <!-- Best Selling Products -->
      <section
        v-if="bestSellingItems.length"
        class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
            <span class="mr-1">🔥</span> Best Selling Products
          </h2>
          <NuxtLink
            to="/shop"
            class="hidden text-sm font-medium text-violet-600 transition hover:text-violet-700 sm:inline-block"
          >
            See All
          </NuxtLink>
        </div>
        <ClientOnly>
          <Swiper
            :modules="productModules"
            :breakpoints="productBreakpoints"
            :space-between="12"
            :pagination="{ clickable: true }"
            class="!pb-6 product-swiper"
          >
            <SwiperSlide
              v-for="product in bestSellingItems"
              :key="product.id"
            >
              <SingleProduct :product="product" />
            </SwiperSlide>
          </Swiper>
          <template #fallback>
            <div class="flex gap-3 overflow-hidden">
              <div
                v-for="j in 5"
                :key="j"
                class="h-64 w-44 shrink-0 animate-pulse rounded-xl bg-slate-100"
              ></div>
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Featured Products -->
      <section
        v-if="featuredItems.length"
        class="space-y-4 rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-5 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
            <span class="mr-1 text-amber-500">★</span> Featured Products
          </h2>
          <NuxtLink
            to="/featured"
            class="hidden text-sm font-medium text-amber-600 transition hover:text-amber-700 sm:inline-block"
          >
            See All
          </NuxtLink>
        </div>
        <ClientOnly>
          <Swiper
            :modules="productModules"
            :breakpoints="productBreakpoints"
            :space-between="12"
            :pagination="{ clickable: true }"
            class="!pb-6 product-swiper"
          >
            <SwiperSlide
              v-for="product in featuredItems"
              :key="product.id"
            >
              <SingleProduct :product="product" />
            </SwiperSlide>
          </Swiper>
          <template #fallback>
            <div class="flex gap-3 overflow-hidden">
              <div
                v-for="j in 5"
                :key="j"
                class="h-64 w-44 shrink-0 animate-pulse rounded-xl bg-slate-100"
              ></div>
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Sale & Offers -->
      <section
        v-if="saleProducts.length"
        class="space-y-4 rounded-xl border border-red-100 bg-red-50/50 px-4 py-5 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
            <span class="mr-1 text-red-600">%</span> Sale & Offers
          </h2>
          <NuxtLink
            to="/sale"
            class="hidden text-sm font-medium text-red-600 transition hover:text-red-700 sm:inline-block"
          >
            See All
          </NuxtLink>
        </div>
        <ClientOnly>
          <Swiper
            :modules="productModules"
            :breakpoints="productBreakpoints"
            :space-between="12"
            :pagination="{ clickable: true }"
            class="!pb-6 product-swiper"
          >
            <SwiperSlide
              v-for="product in saleProducts"
              :key="product.id"
            >
              <SingleProduct :product="product" />
            </SwiperSlide>
          </Swiper>
          <template #fallback>
            <div class="flex gap-3 overflow-hidden">
              <div
                v-for="j in 5"
                :key="j"
                class="h-64 w-44 shrink-0 animate-pulse rounded-xl bg-slate-100"
              ></div>
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Explore Categories -->
      <section
        v-if="categoryColumns.length"
        class="space-y-4 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-sm"
      >
        <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
          Explore Categories
        </h2>

        <ClientOnly>
          <Swiper
            :modules="catModules"
            :breakpoints="categoryBreakpoints"
            :space-between="12"
            :pagination="{ clickable: true }"
            class="!overflow-hidden !pb-6 cat-swiper"
          >
            <SwiperSlide
              v-for="(column, colIdx) in categoryColumns"
              :key="`${colIdx}-${column[0]?.id}`"
              class="!h-auto"
            >
              <NuxtLink
                v-for="category in column"
                :key="category.id"
                :to="`/categories/${category.slug}`"
                class="group flex flex-col items-center gap-1 rounded-lg border border-slate-100 bg-slate-50/60 p-1 transition hover:border-violet-200 hover:bg-white hover:shadow-md"
              >
                <div class="aspect-square w-full overflow-hidden rounded-md bg-slate-100">
                  <img
                    :src="resolve(category.image)"
                    :alt="category.name"
                    loading="lazy"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />
                </div>
                <p
                  class="w-full truncate px-0.5 text-center text-[10px] font-semibold leading-tight text-slate-700 transition group-hover:text-violet-700 sm:text-[11px]"
                >
                  {{ category.name }}
                </p>
              </NuxtLink>
            </SwiperSlide>
          </Swiper>
          <template #fallback>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              <div v-for="i in 8" :key="i" class="aspect-square animate-pulse rounded-xl bg-slate-100"></div>
            </div>
          </template>
        </ClientOnly>
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
            class="hidden text-sm font-medium text-violet-600 transition hover:text-violet-700 sm:inline-block"
          >
            See All
          </NuxtLink>
        </div>
        <ClientOnly>
          <Swiper
            :modules="productModules"
            :breakpoints="productBreakpoints"
            :space-between="12"
            :pagination="{ clickable: true }"
            class="!pb-6 product-swiper"
          >
            <SwiperSlide
              v-for="product in group.items.slice(0, 12)"
              :key="product.id"
            >
              <SingleProduct :product="product" />
            </SwiperSlide>
          </Swiper>
          <template #fallback>
            <div class="flex gap-3 overflow-hidden">
              <div
                v-for="j in 5"
                :key="j"
                class="h-64 w-44 shrink-0 animate-pulse rounded-xl bg-slate-100"
              ></div>
            </div>
          </template>
        </ClientOnly>
      </section>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hero swiper pagination */
.hero-swiper {
  position: relative;
}
.hero-swiper :deep(.swiper-pagination) {
  bottom: 8px;
}
.hero-swiper :deep(.swiper-pagination-bullet) {
  width: 6px;
  height: 6px;
  background: rgba(100, 116, 139, 0.4);
  opacity: 1;
  transition: all 0.25s ease;
}
.hero-swiper :deep(.swiper-pagination-bullet-active) {
  width: 18px;
  border-radius: 3px;
  background: rgb(124, 58, 237);
}

/* Category swiper pagination */
.cat-swiper {
  position: relative;
}
.cat-swiper :deep(.swiper-pagination) {
  bottom: 0;
}
.cat-swiper :deep(.swiper-pagination-bullet) {
  width: 6px;
  height: 6px;
  background: rgba(100, 116, 139, 0.4);
  opacity: 1;
  transition: all 0.25s ease;
}
.cat-swiper :deep(.swiper-pagination-bullet-active) {
  width: 18px;
  border-radius: 3px;
  background: rgb(124, 58, 237);
}

/* Product swiper pagination */
.product-swiper {
  position: relative;
}
.product-swiper :deep(.swiper-pagination) {
  bottom: 0;
}
.product-swiper :deep(.swiper-pagination-bullet) {
  width: 6px;
  height: 6px;
  background: rgba(100, 116, 139, 0.4);
  opacity: 1;
  transition: all 0.25s ease;
}
.product-swiper :deep(.swiper-pagination-bullet-active) {
  width: 18px;
  border-radius: 3px;
  background: rgb(124, 58, 237);
}

/* Ensure all product cards have same height */
.product-swiper :deep(.swiper-wrapper) {
  align-items: stretch;
}
.product-swiper :deep(.swiper-slide) {
  height: auto;
}
</style>
