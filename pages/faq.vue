<template>
  <div class="faq max-w-3xl mx-auto">
    <h1 class="text-center text-3xl font-light mb-2">
      Frequently Asked Questions (FAQ)
    </h1>
    <p class="text-center font-thin">
      These are the most commonly asked questions about Nutriakl
    </p>
    <p class="text-center font-thin">
      Can't find what you are looking for? Chat to our friendly support team.
    </p>
    <div class="faqs grid gap-4 mt-6">
      <div
        class="faq-single grid gap-2 shadow hover:shadow-md p-4 rounded"
        v-for="(faq, index) in faqs"
        :key="index"
      >
        <div
          class="question text-lg flex flex-wrap items-center gap-2 relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
            />
          </svg>
          {{ faq.question }}
          <svg
            @click="handleFaqOpen(index)"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4 absolute right-3 cursor-pointer transition-transform duration-300 ease"
            :class="{ '-rotate-180': faqIndex === index }"
            :style="faqIndex !== index ? 'transition: none' : ''"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
        <div
          v-if="faqIndex === index"
          class="answer text-sm font-extralight flex gap-2 pl-8 max-w-[85%]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4 mt-0.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
            />
          </svg>
          <p>{{ faq.answer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { faqs } from "~/stores/data";
import { ref } from "vue";
const faqIndex = ref(0);
const handleFaqOpen = (index: number): void => {
  faqIndex.value = index;
};
</script>
