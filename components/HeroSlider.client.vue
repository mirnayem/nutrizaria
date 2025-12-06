<template>
  <div class="relative">
    <Swiper
      :modules="modules"
      :lazy="{ loadPrevNext: true }"
      :slides-per-view="1"
      effect="fade"
      :autoplay="{ delay: 3500, disableOnInteraction: false }"
      :loop="true"
      :speed="900"
      :allow-touch-move="true"
      :navigation="{
        nextEl: '.hero-slider-next',
        prevEl: '.hero-slider-prev',
      }"
      :pagination="{ clickable: true }"
      class="hero-swiper rounded-2xl bg-white/10 shadow-lg"
    >
      <SwiperSlide
        v-for="(slide, index) in slides"
        :key="`${slide.slug ?? index}`"
        class="group !grid min-h-[320px] gap-0 rounded-2xl bg-white/5 text-white ring-1 ring-white/10 lg:min-h-[400px] lg:grid-cols-[1.05fr,0.95fr]"
      >
        <div class="flex flex-col justify-between gap-4 p-6 lg:p-8">
          <div class="space-y-3">
            <p
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80"
            >
              <span class="size-2 rounded-full bg-emerald-300"></span>
              {{ slide.badge }}
            </p>
            <p class="text-2xl font-semibold">{{ slide.name }}</p>
            <p class="text-sm text-white/80">{{ slide.description }}</p>
            <ul v-if="slide.features" class="flex flex-wrap gap-2 text-xs text-white/70">
              <li
                v-for="feature in slide.features"
                :key="feature"
                class="rounded-full border border-white/20 px-3 py-1 backdrop-blur"
              >
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <NuxtLink
              :to="slide.href"
              class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-white/25"
            >
              Explore
              <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                <path
                  fill-rule="evenodd"
                  d="M15.78 10.53a.75.75 0 0 0 0-1.06L9.824 3.515a.75.75 0 0 0-1.06 1.06l4.686 4.688H4a.75.75 0 0 0 0 1.5h9.45l-4.685 4.688a.75.75 0 1 0 1.06 1.06l5.955-5.955Z"
                  clip-rule="evenodd"
                />
              </svg>
            </NuxtLink>
            <span>{{ slide.cta }}</span>
          </div>
        </div>
        <div class="relative h-full w-full overflow-hidden rounded-2xl">
          <img
            :src="`/images/${slide.image}`"
            :alt="slide.name"
            loading="lazy"
            class="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        </div>
      </SwiperSlide>
    </Swiper>

    <button
      aria-label="Previous hero slide"
      class="hero-slider-prev absolute left-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-violet-700 shadow-lg transition hover:bg-white lg:flex"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
        <path
          fill-rule="evenodd"
          d="M15.53 5.47a.75.75 0 0 1 0 1.06L10.06 12l5.47 5.47a.75.75 0 0 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <button
      aria-label="Next hero slide"
      class="hero-slider-next absolute right-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-violet-700 shadow-lg transition hover:bg-white lg:flex"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
        <path
          fill-rule="evenodd"
          d="M8.47 18.53a.75.75 0 0 1 0-1.06L13.94 12 8.47 6.53a.75.75 0 1 1 1.06-1.06l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 0 1-1.06 0Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

type HeroSlide = {
  name: string;
  description: string;
  image: string;
  badge: string;
  href: string;
  cta: string;
  slug?: string;
  features?: string[];
};

defineProps<{
  slides: HeroSlide[];
}>();

const modules = [Autoplay, EffectFade, Navigation, Pagination];
</script>
