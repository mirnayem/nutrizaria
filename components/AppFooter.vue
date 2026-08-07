<template>
  <footer class="border-t border-slate-800 bg-slate-950">
    <div class="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-14 lg:pt-16">
      <div class="grid gap-12 lg:grid-cols-[1.6fr,1fr,1fr,1fr]">
        <section class="space-y-5" aria-labelledby="brand-heading">
          <h2 id="brand-heading" class="sr-only">NutriZaria</h2>
          <NuxtLink to="/" class="flex items-center gap-2.5" aria-label="NutriZaria home">
            <span class="flex size-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
              NZ
            </span>
            <span class="text-lg font-semibold text-white">NutriZaria</span>
          </NuxtLink>
          <p class="max-w-xs text-sm leading-relaxed text-slate-400">
            Bangladesh's trusted destination for authentic, farm-fresh daily essentials.
            Lab-tested, traceable, and delivered nationwide.
          </p>
          <ul class="flex flex-wrap items-center gap-2" aria-label="Social links">
            <li
              v-for="social in socials"
              :key="social.label"
            >
              <a
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex size-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-violet-500 hover:bg-violet-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                :aria-label="social.label"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  class="size-4"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :d="social.icon"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="shop-heading">
          <h3 id="shop-heading" class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Shop</h3>
          <nav aria-label="Shop links">
            <ul class="space-y-3">
              <li v-for="link in shopLinks" :key="link.to">
                <NuxtLink
                  :to="link.to"
                  class="text-sm text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </section>

        <section aria-labelledby="help-heading">
          <h3 id="help-heading" class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Help</h3>
          <nav aria-label="Help links">
            <ul class="space-y-3">
              <li v-for="link in helpLinks" :key="link.to">
                <NuxtLink
                  :to="link.to"
                  class="text-sm text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </section>

        <section aria-labelledby="company-heading">
          <h3 id="company-heading" class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
          <nav aria-label="Company links">
            <ul class="space-y-3">
              <li v-for="link in companyLinks" :key="link.to">
                <NuxtLink
                  :to="link.to"
                  class="text-sm text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
              <li v-if="isAdmin">
                <NuxtLink
                  to="/admin"
                  class="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 transition hover:text-violet-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                  Admin panel
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </section>
      </div>

      <div class="mt-12 border-t border-slate-800 pt-8">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <p class="text-xs text-slate-500">
            &copy; {{ new Date().getFullYear() }} NutriZaria. All rights reserved.
          </p>
          <nav class="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Legal links">
            <NuxtLink
              v-for="link in legalLinks"
              :key="link.to"
              :to="link.to"
              class="text-xs text-slate-500 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span class="sr-only">Supported payment methods</span>
            <span>Payments:</span>
            <div class="flex items-center gap-2">
              <img
                v-for="logo in paymentLogos"
                :key="logo"
                :src="logo"
                :alt="paymentLogoAlt(logo)"
                class="h-6 w-auto rounded bg-white px-1.5 opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
if (typeof window !== "undefined") {
  userStore.loadAuthenticatedUser();
}
const isAdmin = computed(() => {
  const role = userStore.authenticatedUser?.role;
  return (
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "MANAGER" ||
    role === "STAFF"
  );
});

const shopLinks = [
  { label: 'All products', to: '/shop' },
  { label: 'Categories', to: '/categories' },
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
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/nutrizaria/',
    icon: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.77-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/nutrizaria',
    icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@nutrizaria',
    icon: 'M23 7.2s-.22-1.55-.9-2.23c-.85-.9-1.8-.9-2.24-.95C16.74 3.75 12 3.75 12 3.75h-.01s-4.73 0-7.86.27c-.43.05-1.38.05-2.23.95-.68.68-.9 2.23-.9 2.23S1 8.98 1 10.75v1.5C1 14.02 1.22 15.8 1.22 15.8s.22 1.55.9 2.23c.85.9 1.97.87 2.47.96 1.79.17 7.41.27 7.41.27s4.74-.01 7.86-.28c.44-.05 1.39-.05 2.24-.95.68-.68.9-2.23.9-2.23S23 14.02 23 12.25v-1.5C23 8.98 23 7.2 23 7.2ZM9.75 14.85V9.1l5.7 2.88-5.7 2.87Z',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/8801820999820',
    icon: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.29Z',
  },
];

const paymentLogos = [
  '/images/bkash.svg',
  '/images/sslcommerz.svg',
  '/images/card-payment.webp',
  '/images/cod.jpg',
];

const paymentLogoAlt = (src: string) => {
  const name = src.split('/').pop()?.split('.')[0] ?? 'payment';
  return name.replace(/-/g, ' ');
};
</script>