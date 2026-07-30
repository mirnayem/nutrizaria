<template>
  <section class="rounded-2xl border border-slate-200 bg-white/70 shadow-sm">
    <header class="border-b border-slate-100 px-6 py-4">
      <p class="text-base font-medium text-slate-800">Payment method</p>
    </header>

    <div class="px-6 py-6">
      <div class="grid gap-3 sm:grid-cols-3">
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

      <div class="mt-6 space-y-3">
        <p v-if="paymentMethod === 'bkash'" class="text-sm text-slate-600">
          Send the total to <strong>01XXXXXXXXX</strong> (bKash) and share the transaction ID below.
        </p>
        <p v-else-if="paymentMethod === 'nagad'" class="text-sm text-slate-600">
          Send the total to <strong>01XXXXXXXXX</strong> (Nagad) and share the reference ID below.
        </p>
        <p v-else class="text-sm text-slate-600">
          Pay the exact amount when your order arrives.
        </p>

        <label v-if="paymentMethod !== 'cod'" class="block text-sm font-medium text-slate-700">
          Transaction / reference ID
          <input
            v-model="paymentNote"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            placeholder="e.g. BKASH-ABC123"
          />
        </label>
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
import { ref } from "vue";
import { BanknotesIcon, WalletIcon } from "@heroicons/vue/24/outline";
import type { PaymentMethod, PaymentSummary } from "~/types/product";

const props = defineProps<{ amount: number }>();

const emit = defineEmits<{ (e: "payment:status", summary: PaymentSummary): void }>();

const paymentMethod = ref<PaymentMethod>("cod");
const paymentNote = ref("");
const processing = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const methods = [
  { id: "bkash" as const, label: "bKash", helper: "Manual verification", icon: WalletIcon },
  { id: "nagad" as const, label: "Nagad", helper: "Manual verification", icon: WalletIcon },
  { id: "cod" as const, label: "Cash on Delivery", helper: "Pay on arrival", icon: BanknotesIcon },
];

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
    reference: paymentNote.value ? paymentNote.value.trim() : undefined,
    provider: paymentMethod.value,
  };

  if (paymentMethod.value === "cod") {
    successMessage.value = "Cash on delivery selected.";
  } else {
    if (!summary.reference) {
      summary.reference = `${paymentMethod.value.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    }
    successMessage.value = "We will verify the payment shortly.";
  }

  emit("payment:status", summary);
  processing.value = false;
  return summary;
};

defineExpose({ processPayment, processing });
</script>
