<template>
  <div class="space-y-10">
    <section
      class="rounded-3xl border border-slate-100 bg-white/80 p-8 text-center shadow-sm"
    >
      <p
        class="text-xs font-semibold uppercase tracking-[0.35em] text-violet-600"
      >
        Help center
      </p>
      <h1 class="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
        Frequently Asked Questions
      </h1>
      <p class="mt-3 text-sm text-slate-500 sm:text-base">
        We gathered the most common questions from NutriZaria customers. Still
        need help? Our team is always a chat away.
      </p>
      <div
        class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm"
      >
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-white shadow transition hover:bg-violet-500"
        >
          Contact support
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.25 6.75 21 10.5l-3.75 3.75M21 10.5H3"
            />
          </svg>
        </NuxtLink>
        <a
          href="mailto:nutrizaria@gmail.com"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
        >
          nutrizaria@gmail.com
        </a>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
      <div class="space-y-4">
        <article
          v-for="(faq, index) in faqs"
          :key="index"
          class="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm transition hover:border-violet-100 hover:shadow-md"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 text-left"
            @click="handleFaqOpen(index)"
            :aria-expanded="faqIndex === index"
          >
            <div class="flex items-start gap-3">
              <div class="rounded-full bg-violet-50 p-2 text-violet-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <h2 class="text-base font-semibold text-slate-900">
                {{ faq.question }}
              </h2>
            </div>
            <span
              class="rounded-full border border-slate-200 p-2 text-slate-500 transition"
              :class="{
                'rotate-180 border-violet-200 text-violet-700':
                  faqIndex === index,
              }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </button>
          <div
            v-if="faqIndex === index"
            class="mt-4 flex items-start gap-3 text-sm text-slate-600"
          >
            <span class="mt-1 size-1.5 rounded-full bg-violet-500"></span>
            <p class="leading-relaxed">
              {{ faq.answer }}
            </p>
          </div>
        </article>
      </div>

      <aside
        class="rounded-3xl border border-slate-100 bg-gradient-to-br from-violet-600 to-fuchsia-500 p-6 text-white shadow-lg"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.3em] text-white/70"
        >
          Concierge help
        </p>
        <h3 class="mt-3 text-2xl font-semibold">Need a human?</h3>
        <p class="mt-2 text-sm text-white/80">
          Our nutritionists and logistics team are ready to guide you through
          bulk orders, substitutions, and delivery preferences.
        </p>
        <div class="mt-6 space-y-4 text-sm">
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-white/70">Hotline</p>
            <p class="text-lg font-semibold">+880 1820999820</p>
            <p class="text-white/70">Sat - Thu, 9am – 10pm</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-white/70">
              WhatsApp
            </p>
            <p class="text-lg font-semibold">+880 1820999820</p>
            <p class="text-white/70">Instant order updates</p>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useCatalogStore } from "~/stores/catalog";

const faqIndex = ref(0);
const handleFaqOpen = (index: number): void => {
  faqIndex.value = faqIndex.value === index ? -1 : index;
};

const catalog = useCatalogStore();
catalog.hydrate();
const { faqs } = storeToRefs(catalog);
</script>
