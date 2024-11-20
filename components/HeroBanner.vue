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
        <div class="inner-content w-full h-fit max-h-96 relative rounded">
          <NuxtImg
            :src="`/images/${item.image}`"
            :alt="item.name"
            quality="80"
            format="webp"
            sizes="(min-width: 0px and max-width:450px) 420px (min-width:451px and max-width: 640px) 600px sm:850px md:950px xl:1000px"
            class="object-center object-cover aspect-[3/2]"
            loading="eager"
          />
          <NuxtLink
            :to="`/categories/${item.slug}`"
            class="absolute left-20 bottom-10"
          >
            <div class="name text-3xl font-light text-orange-800">
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
