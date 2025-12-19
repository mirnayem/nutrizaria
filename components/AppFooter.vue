<template>
  <footer class="bg-slate-950 text-slate-300">
    <div
      class="container grid gap-12 py-16 text-sm lg:grid-cols-[1.6fr,1fr,1fr,1fr]"
    >
      <section class="order-1 space-y-5 lg:order-1">
        <div class="flex items-center gap-3 text-white">
          <span
            class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-xl font-semibold"
          >
            NZ
          </span>
          <div>
            <p class="text-base font-semibold">NutriZaria</p>
            <p class="text-xs text-slate-400">Authentic pure food resources</p>
          </div>
        </div>
        <p class="text-slate-400">
          NutriZaria curates premium pantry staples, seasonal harvests, and
          wellness essentials for conscious households across Bangladesh. We
          obsess about freshness, transparent sourcing, and delightful delivery.
        </p>
        <div class="flex flex-wrap gap-3">
          <a
            v-for="social in socials"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-full border border-white/10 p-2 text-white transition hover:border-violet-500 hover:text-violet-300"
            :aria-label="social.label"
          >
            <img :src="social.icon" :alt="social.label" class="h-5 w-5" />
          </a>
        </div>
        <p class="text-xs text-slate-500">
          &copy; {{ new Date().getFullYear() }} NutriZaria. All rights reserved.
        </p>
      </section>

      <section class="order-3 space-y-3 lg:order-2">
        <h2 class="text-base font-semibold text-white">Navigate</h2>
        <div class="grid gap-2">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="transition hover:text-white"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </section>

      <section class="order-4 space-y-3 lg:order-3">
        <h2 class="text-base font-semibold text-white">Customer care</h2>
        <div class="space-y-2 text-slate-400">
          <p v-for="item in careHighlights" :key="item.title">
            <span class="text-white">{{ item.title }}:</span>
            {{ item.description }}
          </p>
        </div>
        <div class="space-y-2">
          <h3
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Service windows
          </h3>
          <ul class="space-y-1 text-slate-400">
            <li v-for="slot in serviceSlots" :key="slot">{{ slot }}</li>
          </ul>
        </div>
      </section>

      <section class="order-2 space-y-4 lg:order-4">
        <h2 class="text-base font-semibold text-white">Contact</h2>
        <div class="space-y-2 text-slate-400">
          <p><span class="text-white">Phone:</span> +880 1820999820</p>
          <p><span class="text-white">Email:</span> nutrizaria@gmail.com</p>
        </div>
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Payments
          </p>
          <div class="mt-3 flex flex-wrap gap-3">
            <img
              v-for="logo in paymentLogos"
              :key="logo"
              :src="logo"
              alt=""
              class="h-7 w-auto rounded bg-white/10 p-1"
            />
          </div>
        </div>
      </section>
    </div>
  </footer>
</template>

<script setup lang="ts">
const navLinks = [
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories/vegetables" },
  { label: "Favorite", to: "/favorite" },
  { label: "Checkout", to: "/checkout" },
  { label: "FAQ", to: "/faq" },
  { label: "Blog", to: "/blog" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/nutrizaria/",
    icon: "/images/facebook.png",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: "/images/instagram.png",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@nutrizaria",
    icon: "/images/youtube.png",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/8801820999820",
    icon: "/images/whatsapp.svg",
  },
];

const paymentLogos = [
  "/images/bkash.svg",
  "/images/nagad.png",
  "/images/card-payment.webp",
  "/images/cod.jpg",
];

const careHighlights = [
  {
    title: "Bulk sourcing",
    description: "Talk to us for office pantries & gifting",
  },
  {
    title: "Delivery support",
    description: "Same-day delivery inside Dhaka city",
  },
  { title: "Returns", description: "Instant replacements on quality concerns" },
];

const serviceSlots = [
  "Sat - Thu: 9:00 AM – 10:00 PM",
  "Friday: 10:00 AM – 8:00 PM",
];
</script>
