<script setup lang="ts">
import ContactForm from "~/components/ContactForm.vue";
import OurLocation from "~/components/OurLocation.vue";
import SocialIcons from "~/components/SocialIcons.vue";

useSeo({
  title: "Contact",
  description:
    "Reach the NutriZaria team for orders, support, or partnerships.",
  type: "website",
});

const contactChannels = [
  {
    label: "Phone",
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
</script>

<template>
  <div class="space-y-12">
    <section
      class="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-10 text-white shadow-xl"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
        Contact
      </p>
      <h1 class="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
        We're here to help.
      </h1>
      <p class="mt-4 max-w-xl text-white/80">
        Questions about an order, a product, or delivery? Reach out and our team
        will get back to you.
      </p>
    </section>

    <section class="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
      <div class="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-semibold text-slate-900">Get in touch</h2>
        <ul class="space-y-4">
          <li
            v-for="channel in contactChannels"
            :key="channel.label"
            class="rounded-2xl border border-slate-100 p-4"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {{ channel.label }}
            </p>
            <a
              :href="channel.href"
              class="block text-lg font-semibold text-slate-900"
            >
              {{ channel.value }}
            </a>
            <p class="text-sm text-slate-500">{{ channel.note }}</p>
          </li>
        </ul>
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Follow
          </p>
          <SocialIcons class="mt-3" direction="flex" />
        </div>
      </div>

      <div class="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-semibold text-slate-900">Send us a message</h2>
        <p class="text-sm text-slate-500">
          Tell us how we can help and we'll reply within a business day.
        </p>
        <ContactForm />
      </div>
    </section>

    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <OurLocation />
    </section>
  </div>
</template>