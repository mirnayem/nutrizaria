<script setup lang="ts">
useSeo({
  title: "About Us",
  description:
    "NutriZaria brings authentic Bangladeshi daily essentials to your door — sourced from trusted growers, curated for freshness, and delivered nationwide.",
  type: "website",
  jsonld: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NutriZaria",
    url: "https://nutrizaria.com",
    description:
      "Authentic Bangladeshi daily essentials — sourced from trusted growers and delivered nationwide.",
    sameAs: [
      "https://www.facebook.com/nutrizaria/",
      "https://instagram.com/nutrizaria",
      "https://www.youtube.com/@nutrizaria",
    ],
  },
});

const values = [
  {
    title: "Quality",
    text: "Every product is checked for freshness and purity before it reaches your basket.",
  },
  {
    title: "Sourcing",
    text: "We work directly with trusted growers to bring authentic, local daily essentials to your home.",
  },
  {
    title: "Convenience",
    text: "A simple, reliable ordering and delivery experience — order from anywhere.",
  },
];

const stats = [
  { value: "50+", label: "Products" },
  { value: "28+", label: "Cities served" },
  { value: "24/7", label: "Support" },
];
</script>

<template>
  <div class="space-y-12">
    <section
      class="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-10 text-white shadow-xl"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
        About NutriZaria
      </p>
      <h1 class="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
        Authentic daily essentials, sourced and delivered with care.
      </h1>
      <p class="mt-4 max-w-xl text-white/80">
        NutriZaria brings trusted Bangladeshi produce and staples from growers to
        households nationwide. We curate quality, support local sourcing, and make
        everyday essentials easy to order online.
      </p>
      <div class="mt-6 flex flex-wrap gap-4">
        <NuxtLink
          to="/shop"
          class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg transition hover:-translate-y-0.5"
        >
          Browse the shop
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Contact us
        </NuxtLink>
      </div>
    </section>

    <section class="rounded-3xl bg-white p-8 shadow-sm">
      <h2 class="text-2xl font-semibold text-slate-900">Our story</h2>
      <p class="mt-4 text-slate-600">
        NutriZaria started with a simple goal: make authentic Bangladeshi food
        staples easier to find and trust. Today we curate a focused range of
        products sourced from growers we know, and deliver them reliably to
        households across the country. Every order is driven by the same promise —
        quality you can count on, delivered without fuss.
      </p>
    </section>

    <section class="grid gap-6 md:grid-cols-3">
      <div
        v-for="value in values"
        :key="value.title"
        class="rounded-3xl bg-white p-6 shadow-sm"
      >
        <h3 class="text-lg font-semibold text-slate-900">{{ value.title }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ value.text }}</p>
      </div>
    </section>

    <section class="rounded-3xl bg-slate-950 p-8 text-white">
      <div class="grid gap-6 text-sm sm:grid-cols-3">
        <div v-for="stat in stats" :key="stat.label">
          <p class="text-3xl font-semibold">{{ stat.value }}</p>
          <p class="mt-1 text-white/70">{{ stat.label }}</p>
        </div>
      </div>
    </section>
  </div>
</template>