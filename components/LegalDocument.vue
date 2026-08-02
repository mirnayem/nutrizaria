<script setup lang="ts">
export interface LegalSection {
  heading: string;
  body: string;
  list?: string[];
}

withDefaults(
  defineProps<{
    eyebrow: string;
    title: string;
    updatedAt: string;
    sections: LegalSection[];
  }>(),
  {}
);
</script>

<template>
  <div class="space-y-10">
    <section
      class="rounded-3xl border border-slate-100 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-8 text-white shadow-lg sm:p-10"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
        {{ eyebrow }}
      </p>
      <h1 class="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
        {{ title }}
      </h1>
      <p class="mt-4 text-sm text-white/80">Last updated: {{ updatedAt }}</p>
    </section>

    <section class="space-y-8">
      <article
        v-for="(section, index) in sections"
        :key="section.heading"
        class="rounded-3xl bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 class="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <span
            class="flex size-7 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-600"
          >
            {{ index + 1 }}
          </span>
          {{ section.heading }}
        </h2>
        <p class="mt-4 text-sm leading-relaxed text-slate-600">
          {{ section.body }}
        </p>
        <ul v-if="section.list?.length" class="mt-4 space-y-2">
          <li
            v-for="item in section.list"
            :key="item"
            class="flex items-start gap-3 text-sm text-slate-600"
          >
            <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500"></span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>
