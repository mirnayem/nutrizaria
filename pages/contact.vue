<script setup lang="ts">
import { useHead } from "@unhead/vue";
import ContactForm from "~/components/ContactForm.vue";
import OurLocation from "~/components/OurLocation.vue";
import SocialIcons from "~/components/SocialIcons.vue";

useHead({
  title: "NutriZaria — Contact",
  meta: [
    {
      name: "description",
      content:
        "Reach the NutriZaria concierge team for orders, partnerships, or support.",
    },
  ],
});

const contactChannels = [
  {
    label: "Concierge hotline",
    value: "+880 1820999820",
    href: "tel:+8801820999820",
    note: "Sat - Thu, 9:00 AM – 10:00 PM",
  },
  {
    label: "Email",
    value: "nutrizaria@gmail.com",
    href: "mailto:nutrizaria@gmail.com",
    note: "We reply within 12 hours",
  },
];

const serviceStats = [
  { label: "Cities served", value: "28" },
  { label: "Avg. response", value: "35 min" },
  { label: "Live chat hours", value: "16 / 7" },
];
</script>

<template>
  <div class="space-y-12">
    <section
      class="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-10 text-white shadow-xl"
    >
      <div class="grid gap-8 lg:grid-cols-[1fr,0.8fr]">
        <div class="space-y-4">
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-white/70"
          >
            Concierge desk
          </p>
          <h1 class="text-3xl font-semibold leading-tight sm:text-4xl">
            We're ready to curate your next pantry drop.
          </h1>
          <p class="text-white/80">
            Call, WhatsApp, or leave a message — a real human will review your
            order needs, substitutions, or gifting requests within minutes.
          </p>
          <div class="flex flex-wrap gap-4">
            <a
              href="tel:+8801820999820"
              class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg transition hover:-translate-y-0.5"
            >
              Talk to concierge
            </a>
            <a
              href="mailto:nutrizaria@gmail.com"
              class="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Email us
            </a>
          </div>
        </div>
        <div class="grid gap-4 rounded-3xl bg-white/10 p-6 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.3em] text-white/60">
            Service stats
          </p>
          <div class="grid grid-cols-3 gap-3 text-center text-white">
            <div v-for="stat in serviceStats" :key="stat.label">
              <p class="text-2xl font-semibold">{{ stat.value }}</p>
              <p class="text-xs text-white/80">{{ stat.label }}</p>
            </div>
          </div>
          <p class="text-sm text-white/80">
            Mobile wallet, card, and cash on delivery support are available
            across all service hours.
          </p>
        </div>
      </div>
    </section>

    <section class="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
      <div class="space-y-6 rounded-3xl bg-slate-950 p-8 text-white">
        <h2 class="text-2xl font-semibold">Concierge access</h2>
        <p class="text-white/80">
          Choose the channel that works best for you. We monitor all inboxes in
          real time.
        </p>
        <ul class="space-y-4">
          <li
            v-for="channel in contactChannels"
            :key="channel.label"
            class="rounded-2xl border border-white/10 p-4"
          >
            <p class="text-xs uppercase tracking-[0.3em] text-white/60">
              {{ channel.label }}
            </p>
            <a
              :href="channel.href"
              class="block text-lg font-semibold text-white"
            >
              {{ channel.value }}
            </a>
            <p class="text-sm text-white/70">{{ channel.note }}</p>
          </li>
        </ul>
        <div class="rounded-2xl bg-white/5 p-4">
          <p class="text-xs uppercase tracking-[0.3em] text-white/60">Follow</p>
          <SocialIcons class="mt-3" direction="flex" />
        </div>
      </div>

      <div class="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
        <p
          class="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600"
        >
          Send a note
        </p>
        <h2 class="text-2xl font-semibold text-slate-900">
          Tell us how we can help
        </h2>
        <p class="text-sm text-slate-500">
          Drop details about your order, dietary preferences, or partnership
          idea. We reply within a business day.
        </p>
        <ContactForm />
      </div>
    </section>

    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <OurLocation />
    </section>
  </div>
</template>
