<template>
  <section
    class="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-white shadow-xl"
  >
    <div class="grid gap-8 px-6 py-10 lg:grid-cols-[1fr,1.05fr] lg:px-10">
      <div class="flex flex-col gap-6">
        <div
          class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 ring-1 ring-white/20"
        >
          <span class="size-2 rounded-full bg-emerald-300"></span>
          Fresh harvest • Same-day dispatch
        </div>
        <div class="space-y-4">
          <h1 class="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Eat clean with farm-direct nuts, honey, spices & more.
          </h1>
          <p class="text-base text-white/90 lg:text-lg">
            Build a cart full of premium pantry staples sourced from Bangladesh and beyond. Every
            product is lab-tested, vacuum packed, and delivered in under 48 hours.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            to="/shop"
            class="rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-700 shadow-lg transition hover:-translate-y-0.5"
          >
            Shop curated bundles
          </NuxtLink>
          <NuxtLink
            to="/faq"
            class="rounded-full border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Why NutriZaria?
          </NuxtLink>
        </div>
        <dl class="grid gap-6 text-sm text-white/90 sm:grid-cols-3">
          <div class="space-y-1 rounded-2xl bg-white/5 p-4 shadow-inner shadow-white/5">
            <dt class="text-xs uppercase tracking-widest text-white/60">Product lines</dt>
            <dd class="text-2xl font-semibold">{{ highlightStats.products }}+</dd>
          </div>
          <div class="space-y-1 rounded-2xl bg-white/5 p-4 shadow-inner shadow-white/5">
            <dt class="text-xs uppercase tracking-widest text-white/60">Happy families</dt>
            <dd class="text-2xl font-semibold">{{ highlightStats.customers }}k</dd>
          </div>
          <div class="space-y-1 rounded-2xl bg-white/5 p-4 shadow-inner shadow-white/5">
            <dt class="text-xs uppercase tracking-widest text-white/60">Cities covered</dt>
            <dd class="text-2xl font-semibold">{{ highlightStats.cities }}</dd>
          </div>
        </dl>
        <ul class="grid gap-4 text-sm text-white/80 sm:grid-cols-2">
          <li
            v-for="perk in heroPerks"
            :key="perk.title"
            class="flex items-start gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur"
          >
            <div
              class="mt-0.5 inline-flex size-8 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <component :is="perk.icon" class="size-4" />
            </div>
            <div>
              <p class="font-medium">{{ perk.title }}</p>
              <p class="text-xs text-white/70">{{ perk.description }}</p>
            </div>
          </li>
        </ul>
      </div>

      <ClientOnly>
        <HeroSlider :slides="heroSlides" />
        <template #fallback>
          <div
            class="min-h-[360px] rounded-2xl bg-white/10 shadow-lg ring-1 ring-white/20"
          ></div>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { h, type Component } from "vue";
import HeroSlider from "~/components/HeroSlider.client.vue";

const highlightStats = {
  products: 40,
  customers: 12,
  cities: 28,
};

type HeroPerk = {
  title: string;
  description: string;
  icon: Component;
};

const heroPerks: HeroPerk[] = [
  {
    title: "Cold-chain logistics",
    description: "Refrigerated vans keep delicate orders below 8°C end-to-end.",
    icon: {
      render() {
        return h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "currentColor",
          },
          [
            h("path", {
              d: "M12 2a1 1 0 0 1 1 1v6.586l1.95-1.95a1 1 0 0 1 1.414 1.414L13.414 12l2.95 2.95a1 1 0 0 1-1.414 1.414L13 14.414V21a1 1 0 1 1-2 0v-6.586l-1.95 1.95a1 1 0 1 1-1.414-1.414L10.586 12l-2.95-2.95a1 1 0 1 1 1.414-1.414L11 9.586V3a1 1 0 0 1 1-1Z",
            }),
          ]
        );
      },
    },
  },
  {
    title: "Lab certification",
    description: "Every batch is tested at BSTI-accredited facilities.",
    icon: {
      render() {
        return h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "currentColor",
          },
          [
            h("path", {
              d: "M9 2a1 1 0 0 1 1 1v6.382a4 4 0 0 1-1.172 2.828L7.414 14H16.5a1.5 1.5 0 0 1 1.2 2.4l-2.5 3.333A2 2 0 0 1 13.7 20H6a1 1 0 0 1-.8-1.6l2.678-3.571A2 2 0 0 0 8.5 13h-.086l1.778-1.778A2 2 0 0 0 11 9.382V3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-5v5.382a4 4 0 0 1-1.172 2.828L10.414 14H18a3 3 0 0 1 2.4 4.8l-2.5 3.333A4 4 0 0 1 13.7 22H6a3 3 0 0 1-2.4-4.8l2.678-3.571A4 4 0 0 0 7.5 13h-.086l1.778-1.778A2 2 0 0 0 10 9.382V3a1 1 0 0 1 1-1Z",
            }),
          ]
        );
      },
    },
  },
  {
    title: "Flexible payments",
    description: "Pay via card, mobile wallet, or cash on delivery.",
    icon: {
      render() {
        return h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "currentColor",
          },
          [
            h("path", {
              d: "M3 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H3Zm18 2a1 1 0 0 1 1 1v1H2V8a1 1 0 0 1 1-1h18ZM2 12h20v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4Zm3 3a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2H5Zm11 0a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3Z",
            }),
          ]
        );
      },
    },
  },
  {
    title: "24/7 support",
    description: "Concierge chat helps with substitutions & delivery windows.",
    icon: {
      render() {
        return h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "currentColor",
          },
          [
            h("path", {
              d: "M12 2a9 9 0 0 0-9 9v4a3 3 0 0 0 3 3h1v1a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-4H6a1 1 0 0 1-1-1v-2h6v-2H5.055A7 7 0 1 1 19 11v1h-4v2h4v2a1 1 0 0 1-1 1h-3v4a1 1 0 0 0 1 1h1a3 3 0 0 0 3-3v-1a3 3 0 0 0 3-3v-4a9 9 0 0 0-9-9Z",
            }),
          ]
        );
      },
    },
  },
];

const heroSlides = [
  {
    name: "Stone-pressed olive oils",
    description: "Single-origin oils from the Mediterranean, bottled weekly.",
    image: "olive-oil.avif",
    badge: "Best Seller",
    href: "/categories/oil",
    cta: "Ships in 24h",
    features: ["Cold pressed", "Glass bottled"],
  },
  {
    name: "Raw honey trio",
    description: "Wildflower, lychee blossom & mustard honey packs.",
    image: "honey2.avif",
    badge: "Seasonal Drop",
    href: "/categories/honey",
    cta: "Lab tested",
    features: ["Traceable farms", "No added sugar"],
  },
  {
    name: "Gourmet nuts & dry fruits",
    description: "Cashews, pistachios & almonds sourced from trusted farms.",
    image: "nuts2.avif",
    badge: "Family combo",
    href: "/categories/nuts",
    cta: "Save 15%",
    features: ["Nitrogen flushed", "Family size"],
  },
];
</script>
