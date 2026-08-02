<template>
  <footer class="bg-slate-950 text-slate-400 border-t border-slate-800">
    <div class="container py-12 lg:py-16">
      <div class="grid gap-10 lg:grid-cols-[2fr,1fr,1fr,1fr]">
        <section class="space-y-6" aria-labelledby="brand-heading">
          <h2 id="brand-heading" class="sr-only">NutriZaria</h2>
          <div class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
              NZ
            </span>
            <span class="text-lg font-semibold text-white">NutriZaria</span>
          </div>
          <p class="text-sm text-slate-400 max-w-xs">
            Authentic Bangladeshi pantry staples — sourced from trusted growers and delivered nationwide.
          </p>
          <div class="flex flex-wrap gap-4" role="list" aria-label="Social links">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-medium text-slate-300 transition hover:text-violet-300"
              :aria-label="social.label"
            >
              {{ social.label }}
            </a>
          </div>
        </section>

        <section aria-labelledby="shop-heading">
          <h3 id="shop-heading" class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
          <nav aria-label="Shop links">
            <ul class="space-y-3">
              <li v-for="link in shopLinks" :key="link.to">
                <NuxtLink :to="link.to" class="text-sm transition hover:text-white">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </section>

        <section aria-labelledby="help-heading">
          <h3 id="help-heading" class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Help</h3>
          <nav aria-label="Help links">
            <ul class="space-y-3">
              <li v-for="link in helpLinks" :key="link.to">
                <NuxtLink :to="link.to" class="text-sm transition hover:text-white">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </section>

        <section aria-labelledby="company-heading">
          <h3 id="company-heading" class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
          <nav aria-label="Company links">
            <ul class="space-y-3">
              <li v-for="link in companyLinks" :key="link.to">
                <NuxtLink :to="link.to" class="text-sm transition hover:text-white">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </section>
      </div>

      <div class="mt-10 pt-8 border-t border-slate-800">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs text-slate-500">
            &copy; {{ new Date().getFullYear() }} NutriZaria. All rights reserved.
          </p>
          <nav class="flex flex-wrap items-center gap-4" aria-label="Legal links">
            <NuxtLink
              v-for="link in legalLinks"
              :key="link.to"
              :to="link.to"
              class="text-xs text-slate-500 transition hover:text-white"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span>Payments:</span>
            <div class="flex items-center gap-2">
              <img
                v-for="logo in paymentLogos"
                :key="logo"
                :src="logo"
                alt=""
                class="h-5 w-auto opacity-60"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const shopLinks = [
  { label: 'All products', to: '/shop' },
  { label: 'Categories', to: '/categories/vegetables' },
  { label: 'Favorites', to: '/favorite' },
  { label: 'New arrivals', to: '/shop?sort=new' },
];

const helpLinks = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact us', to: '/contact' },
];

const companyLinks = [
  { label: 'About us', to: '/about' },
  { label: 'Blog', to: '/blog' },
];

const legalLinks = [
  { label: 'Privacy policy', to: '/privacy' },
  { label: 'Terms of service', to: '/terms' },
  { label: 'Cookie policy', to: '/cookies' },
];

const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/nutrizaria/' },
  { label: 'Instagram', href: 'https://instagram.com/nutrizaria' },
  { label: 'YouTube', href: 'https://www.youtube.com/@nutrizaria' },
  { label: 'WhatsApp', href: 'https://wa.me/8801820999820' },
];

const paymentLogos = [
  '/images/bkash.svg',
  '/images/sslcommerz.svg',
  '/images/card-payment.webp',
  '/images/cod.jpg',
];
</script>