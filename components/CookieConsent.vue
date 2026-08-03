<template>
  <ClientOnly>
    <div
      v-if="consent === null"
      role="region"
      aria-label="Cookie consent"
      class="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
    >
      <div class="flex flex-col gap-4">
        <div class="space-y-1.5">
          <p class="text-sm font-semibold text-slate-900">
            We care about your privacy
          </p>
          <p class="text-xs leading-relaxed text-slate-600">
            We use necessary cookies to make the site work, and optional
            analytics and advertising cookies to improve your experience. You
            can accept or decline the optional cookies below.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="flex-1 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
            @click="accept"
          >
            Accept all
          </button>
          <button
            type="button"
            class="flex-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-500 hover:text-violet-700"
            @click="decline"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useConsent } from "~/composables/useConsent";

const { consent, setConsent } = useConsent();

onMounted(() => {
  consent.value = getStoredConsent();
});

const accept = () => setConsent("accepted");
const decline = () => setConsent("rejected");
</script>
