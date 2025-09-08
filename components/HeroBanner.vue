<template>
  <div class="relative">
    <Swiper
      :modules="modules"
      :lazy="{ loadPrevNext: true }"
      :slides-per-view="1"
      effect="fade"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 4000, reverseDirection: false }"
      :speed="2000"
      :loop="true"
      class="h-fit h-96"
    >
      <SwiperSlide
        v-for="(item, index) in items"
        v-show="item"
        :key="index"
        class="!flex items-center justify-center text-black"
      >
        <div class="inner-content w-full h-fit max-h-[480px] relative rounded">
          <div class="relative w-full h-full max-h-[480px] bg-gray-200">
            <img
              :src="`/images/${item.image}`"
              :alt="item.name"
              class="object-cover w-full h-full"
              loading="eager"
            />
          </div>

          <NuxtLink
            :to="`/categories/${item.slug}`"
            class="absolute left-20 bottom-10"
          >
            <div class="name text-3xl font-light text-violet-800">
              {{ item.name }}
            </div>
            <div class="description">{{ item.description }}</div>
            <button class="nutri-btn my-2">Shop Now</button>
          </NuxtLink>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { Autoplay, EffectFade } from "swiper/modules";
import { onMounted, ref } from "vue";

const modules = [Autoplay, EffectFade];

const items = ref([
  {
    name: "Premium Dates",
    image: "dates2.avif",
    slug: "dates",
    description: "Fresh and premium collection",
  },
  {
    name: "Fresh Fruits",
    image: "fruit2.avif",
    slug: "fruit",
    description: "Ensures fully safe",
  },
  {
    name: "Pure Honey",
    image: "honey2.avif",
    slug: "honey",
    description: "100% organic and natural",
  },
]);
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
</script>

<style></style>
