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
      class="md:h-64 h-96"
    >
      <SwiperSlide
        v-for="(item, index) in categories"
        :key="index"
        class="!flex items-center justify-center bg-orange-200 text-black"
      >
        <div class="inner-content w-full md:h-64 h-96 relative rounded">
          <img
            class="w-full h-full object-cover object-center"
            :src="`/images/${item.image}`"
            :alt="item.name"
          />
          <div
            class="absolute left-1/2 w-3/4 flex-mid bottom-5 bg-white px-4 py-1 rounded transform -translate-x-1/2"
          >
            {{ item.name }}
          </div>
        </div>
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

const modules = [Autoplay, Navigation];
const breakpoints = {
  640: {
    slidesPerView: 1,
    spaceBetween: 10,
  },

  768: {
    slidesPerView: 2,
    spaceBetween: 20,
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

const categories = ref([]);

const simulateDataLoading = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const items = [
        { name: "Premium Dates", image: "dates2.avif" },
        { name: "Fresh Fruits", image: "fruit2.avif" },
        { name: "Pure Honey", image: "honey2.avif" },
        { name: "Fresh Meat", image: "meat.avif" },
        { name: "Nuts", image: "nuts2.avif" },
        { name: "Spices", image: "spices2.avif" },
        { name: "Vegetable", image: "tomato.avif" },
        { name: "Delicious Cake", image: "cake.avif" },
      ];
      resolve(items);
    }, 2000);
  });
};

onMounted(async () => {
  categories.value = await simulateDataLoading();
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
