<template>
  <div class="relative">
    <div class="skeleton-loader" v-if="isLoading">
      <div class="flex gap-x-5 justify-center md:min-h-64 sm:min-h-96">
        <div
          v-for="i in skeletonCount"
          :key="i"
          class="lg:w-1/4 md:w-1/3 sm:w-1/2 w-full"
        >
          <div class="border rounded-lg shadow-lg p-4 w-full">
            <div class="animate-pulse">
              <div class="md:h-44 h-64 bg-gray-300 rounded"></div>
            </div>
            <div class="animate-pulse mt-6">
              <div class="h-10 bg-gray-300 rounded w-40 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Swiper
      v-if="!isLoading"
      :modules="modules"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 3000, reverseDirection: false }"
      :speed="1000"
      :observer="true"
      :observe-parents="true"
      :loop="true"
      :breakpoints="breakpoints"
      :navigation="{
        nextEl: '.custom-next',
        prevEl: '.custom-prev',
      }"
      class="h-fit"
    >
      <SwiperSlide
        v-for="(item, index) in categoriesFav"
        :key="index"
        class="!flex items-center justify-center bg-orange-200 text-black"
      >
        <NuxtLink
          :to="`/categories/${item.slug}`"
          class="inner-content w-full relative rounded"
        >
          <NuxtImg
            :src="`/images/${item.image}`"
            :alt="item.name"
            loading="lazy"
            format="webp"
            sizes="lg:600px md:500px 400px"
            height="500"
            width="500"
            class="rounded-md aspect-square object-center object-cover"
          />

          <div
            class="absolute left-1/2 w-3/4 flex-mid bottom-5 bg-white px-4 py-1 rounded transform -translate-x-1/2"
          >
            {{ item.name }}
          </div>
        </NuxtLink>
      </SwiperSlide>
    </Swiper>
    <button
      aria-label="Previous Slide"
      class="custom-prev absolute xl:left-[-40px] left-[calc(50%-40px)] xl:top-1/2 xl:bottom-0 -bottom-12 transform xl:-translate-y-1/2 translate-y-0 xl:translate-x-0 -translate-x-1/2 rounded-full bg-slate-100 h-8 w-8 flex-mid hover:bg-orange-700 hover:text-white transition-colors duration-1000 ease-in-out"
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
      class="custom-next absolute xl:right-[-40px] right-[calc(50%-40px)] xl:top-1/2 xl:bottom-0 -bottom-12 transform xl:-translate-y-1/2 translate-y-0 xl:translate-x-0 -translate-x-1/2 rounded-full bg-slate-100 h-8 w-8 flex-mid hover:bg-orange-700 hover:text-white transition-colors duration-1000 ease-in-out"
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

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";

import "swiper/css";
import "swiper/css/navigation";

import { Autoplay, Navigation } from "swiper/modules";
import { ref, onMounted } from "vue";
import { categories } from "~/stores/data";
const modules = [Autoplay, Navigation];
const breakpoints = {
  0: {
    slidesPerView: 2,
    spaceBetween: 10,
  },

  1024: {
    slidesPerView: 3,
    spaceBetween: 30,
  },
  1280: {
    slidesPerView: 4,
    spaceBetween: 40,
  },
};

const isLoading = ref(true);
const skeletonCount = ref(0);

const categoriesFav = ref([]);

const simulateDataLoading = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const items = categories;
      resolve(items);
    }, 500);
  });
};

onMounted(async () => {
  categoriesFav.value = await simulateDataLoading();
  isLoading.value = false;
});

const setSkeletonCount = () => {
  const width = window.innerWidth;
  if (width >= 1080) {
    skeletonCount.value = 4;
  } else if (width >= 768) {
    skeletonCount.value = 3;
  } else if (width >= 480) {
    setSkeletonCount.value = 2;
  } else {
    skeletonCount.value = 1;
  }
};

onMounted(() => {
  setSkeletonCount();

  window.addEventListener("resize", setSkeletonCount);
});
</script>
