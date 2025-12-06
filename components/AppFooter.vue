<template>
  <footer class="bg-slate-950 text-slate-300">
    <div class="container grid gap-10 py-16 text-sm lg:grid-cols-[2fr,1fr,1fr]">
      <section class="space-y-4">
        <div class="flex items-center gap-3 text-white">
          <span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-xl font-semibold">
            NZ
          </span>
          <div>
            <p class="text-base font-semibold">NutriZaria</p>
            <p class="text-xs text-slate-400">Authentic pure food resources</p>
          </div>
        </div>
        <p class="text-slate-400">
          NutriZaria curates premium pantry staples, seasonal harvests, and wellness essentials for
          conscious households across Bangladesh. We obsess about freshness, transparent sourcing,
          and delightful delivery.
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

      <section>
        <h2 class="text-base font-semibold text-white">Navigate</h2>
        <div class="mt-4 grid gap-2">
          <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="transition hover:text-white">
            {{ link.label }}
          </NuxtLink>
        </div>
      </section>

      <section>
        <h2 class="text-base font-semibold text-white">Get updates</h2>
        <p class="mt-4 text-slate-400">
          Join our weekly digest for new arrivals, community stories, and exclusive offers.
        </p>
        <form class="mt-4 flex rounded-full border border-white/10 bg-white/5 p-1" @submit.prevent>
          <input
            type="email"
            placeholder="Email address"
            class="w-full bg-transparent px-3 text-sm text-white placeholder:text-slate-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            class="rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-violet-500"
          >
            Subscribe
          </button>
        </form>
        <div class="mt-6">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Payments</p>
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
  { label: "FAQ", to: "/faq" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const socials = [
  { label: "Facebook", href: "https://www.facebook.com/nutrizaria/", icon: "/images/facebook.png" },
  { label: "Instagram", href: "https://instagram.com", icon: "/images/instagram.png" },
  { label: "YouTube", href: "https://www.youtube.com/@nutrizaria", icon: "/images/youtube.png" },
  { label: "WhatsApp", href: "https://wa.me/8801730901063", icon: "/images/play.png" },
];

const paymentLogos = ["/images/bkash.svg", "/images/nagad.png", "/images/card-payment.webp", "/images/cod.jpg"];
</script>
