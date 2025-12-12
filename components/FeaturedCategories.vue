<template>
  <div class="relative">
    <div class="skeleton-loader" v-if="isLoading">
      <div class="flex justify-center gap-5 md:min-h-64 sm:min-h-96">
        <div
          v-for="i in skeletonCount"
          :key="i"
          class="w-full rounded-2xl border border-slate-100 p-4 shadow-sm sm:w-1/2 md:w-1/3 lg:w-1/4"
        >
          <div class="animate-pulse space-y-4">
            <div class="h-48 rounded-2xl bg-slate-200"></div>
            <div class="mx-auto h-4 w-32 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </div>
    </div>
    <Swiper
      v-else
      :lazy="{ loadPrevNext: true }"
      :modules="modules"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 3200 }"
      :speed="900"
      :loop="true"
      :breakpoints="breakpoints"
      :navigation="{
        nextEl: '.custom-next',
        prevEl: '.custom-prev',
      }"
      class="category-swiper"
    >
      <SwiperSlide
        v-for="item in categoriesList"
        :key="item.id"
        class="!flex items-center justify-center bg-transparent text-black"
      >
        <NuxtLink
          :to="`/categories/${item.slug}`"
          class="relative h-fit max-h-60 w-full rounded-2xl bg-gradient-to-br from-white to-violet-50 p-4 md:max-h-96"
        >
          <img
            :src="item.image ? `/images/${item.image}` : '/nutri.png'"
            :alt="item.name + ' ' + item.slug"
            loading="lazy"
            class="aspect-square w-full rounded-2xl object-cover object-center"
          />

          <div
            class="absolute inset-x-1/2 bottom-5 flex -translate-x-1/2 items-center justify-center rounded-full bg-white/90 px-4 py-1 text-sm font-medium text-violet-700 shadow"
          >
            {{ item.name }}
          </div>
        </NuxtLink>
      </SwiperSlide>
    </Swiper>
    <button
      aria-label="Previous Slide"
      class="custom-prev absolute left-[calc(50%-20px)] -bottom-12 h-8 w-8 -translate-x-1/2 rounded-full bg-slate-100 text-slate-600 shadow transition hover:bg-violet-600 hover:text-white xl:left-[-40px] xl:top-1/2 xl:-translate-y-1/2 xl:translate-x-0"
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5 8.25 12l7.5-7.5"
        />
      </svg>
    </button>

    <button
      aria-label="Next Slide"
      class="custom-next absolute right-[calc(50%-50px)] -bottom-12 h-8 w-8 -translate-x-1/2 rounded-full bg-slate-100 text-slate-600 shadow transition hover:bg-violet-600 hover:text-white xl:right-[-40px] xl:top-1/2 xl:-translate-y-1/2 xl:translate-x-0"
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m8.25 4.5 7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

const modules = [Autoplay, Navigation];
const breakpoints = {
  0: {
    slidesPerView: 1.4,
    spaceBetween: 8,
  },
  480: {
    slidesPerView: 2,
    spaceBetween: 10,
  },
  768: {
    slidesPerView: 2.5,
    spaceBetween: 14,
  },
  1024: {
    slidesPerView: 3,
    spaceBetween: 18,
  },
  1280: {
    slidesPerView: 4,
    spaceBetween: 24,
  },
};

const catalog = useCatalogStore();
catalog.hydrate();
const { categories } = storeToRefs(catalog);

const isLoading = ref(true);
const skeletonCount = ref(4);
const categoriesList = computed(() => categories.value ?? []);

watch(
  categoriesList,
  (value) => {
    if (value.length) {
      isLoading.value = false;
    }
  },
  { immediate: true }
);

const updateSkeletonCount = () => {
  const width = window.innerWidth;
  if (width >= 1280) {
    skeletonCount.value = 4;
  } else if (width >= 1024) {
    skeletonCount.value = 3;
  } else if (width >= 640) {
    skeletonCount.value = 2;
  } else {
    skeletonCount.value = 1;
  }
};

onMounted(() => {
  updateSkeletonCount();
  window.addEventListener("resize", updateSkeletonCount);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateSkeletonCount);
});
</script>
