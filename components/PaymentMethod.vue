<template>
  <section class="rounded-2xl border border-slate-200 bg-white/70 shadow-sm">
    <header class="border-b border-slate-100 px-6 py-4">
      <p class="text-base font-medium text-slate-800">Payment method</p>
    </header>

    <div class="px-6 py-6">
      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="m in methods"
          :key="m.id"
          type="button"
          class="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
          :class="[
            paymentMethod === m.id
              ? 'border-violet-500 bg-violet-50/80 shadow-inner'
              : 'border-slate-200 hover:border-slate-300',
          ]"
          @click="paymentMethod = m.id"
        >
          <component :is="m.icon" class="size-6 text-violet-600" />
          <div>
            <p class="text-sm font-medium text-slate-800">{{ m.label }}</p>
            <p class="text-xs text-slate-500">{{ m.helper }}</p>
          </div>
        </button>
      </div>

      <p v-if="errorMessage" class="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </p>
      <p
        v-else-if="successMessage"
        class="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {{ successMessage }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { BanknotesIcon, BoltIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import type { PaymentMethod, PaymentSummary } from "~/types/product";
import { useRuntimeConfig } from "#app";

const props = defineProps<{ amount: number }>();

const emit = defineEmits<{ (e: "payment:status", summary: PaymentSummary): void }>();

const paymentMethod = ref<PaymentMethod>("cod");
const processing = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const showBkash = useRuntimeConfig().public.enableBkash === true;
const showSslcommerz = useRuntimeConfig().public.enableSslcommerz === true;

const methods = computed(() => [
  ...(showBkash
    ? [
        {
          id: "bkash" as const,
          label: "bKash",
          helper: "Secure online gateway",
          icon: BoltIcon,
        },
      ]
    : []),
  ...(showSslcommerz
    ? [
        {
          id: "sslcommerz" as const,
          label: "SSLCommerz",
          helper: "Secure online gateway",
          icon: LockClosedIcon,
        },
      ]
    : []),
  { id: "cod" as const, label: "Cash on Delivery", helper: "Pay on arrival", icon: BanknotesIcon },
]);

const processPayment = async (): Promise<PaymentSummary> => {
  if (!props.amount || props.amount <= 0) {
    throw new Error("Cart total must be greater than zero.");
  }

  processing.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const summary: PaymentSummary = {
    method: paymentMethod.value,
    status: paymentMethod.value === "cod" ? "pending" : "processing",
    provider: paymentMethod.value,
  };

  if (paymentMethod.value === "cod") {
    successMessage.value = "Cash on delivery selected.";
  } else {
    successMessage.value = "Redirecting to the secure payment gateway...";
  }

  emit("payment:status", summary);
  processing.value = false;
  return summary;
};

defineExpose({ processPayment, processing });
</script>