<template>
  <section class="rounded-2xl border border-slate-200 bg-white/70 shadow-sm">
    <header
      class="flex flex-col gap-1 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-base font-medium text-slate-800">Payment</p>
        <p class="text-sm text-slate-500">
          Secure checkout powered by Stripe & regional wallets.
        </p>
      </div>
      <div class="text-right text-sm font-semibold text-slate-700">
        Total due: {{ currencySymbol }}{{ formattedAmount }}
      </div>
    </header>

    <div class="px-6 py-6">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          v-for="method in methods"
          :key="method.id"
          type="button"
          class="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
          :class="[
            paymentMethod === method.id
              ? 'border-violet-500 bg-violet-50/80 shadow-inner'
              : 'border-slate-200 hover:border-slate-300',
          ]"
          @click="setMethod(method.id)"
        >
          <component :is="method.icon" class="size-6 text-violet-600" />
          <div>
            <p class="text-sm font-medium text-slate-800">{{ method.label }}</p>
            <p class="text-xs text-slate-500">{{ method.helper }}</p>
          </div>
        </button>
      </div>

      <transition name="fade-slide" mode="out-in">
        <div v-if="paymentMethod === 'card'" key="card" class="mt-6 space-y-3">
          <p class="text-sm font-medium text-slate-700">Card details</p>
          <div
            id="nutri-card-element"
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner"
          />
          <p class="text-xs text-slate-500">
            Cards are processed securely by Stripe. Your details are never stored on our
            servers.
          </p>
        </div>

        <div v-else-if="paymentMethod === 'bkash'" key="bkash" class="mt-6 space-y-3">
          <p class="text-sm font-medium text-slate-700">How to pay with bKash</p>
          <ul class="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Send the total amount to <strong>01XXXXXXXXX</strong>.</li>
            <li>Add the transaction ID in the note below.</li>
            <li>We will mark the order as paid once verified.</li>
          </ul>
        </div>

        <div v-else-if="paymentMethod === 'nagad'" key="nagad" class="mt-6 space-y-3">
          <p class="text-sm font-medium text-slate-700">Pay with Nagad</p>
          <ul class="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Transfer to <strong>01XXXXXXXXX</strong>.</li>
            <li>Keep the reference ID handy and share it in the note.</li>
            <li>Orders move to processing as soon as we verify.</li>
          </ul>
        </div>

        <div v-else key="cod" class="mt-6 space-y-3">
          <p class="text-sm font-medium text-slate-700">Cash on delivery</p>
          <p class="text-sm text-slate-600">
            Pay the exact amount to our delivery partner. Large orders may require a confirmation
            call before dispatch.
          </p>
        </div>
      </transition>

      <label class="mt-6 block text-sm font-medium text-slate-700">
        Payment note / reference
        <textarea
          v-model="paymentNote"
          rows="2"
          class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          placeholder="Optional reference, e.g., last 4 digits or wallet transaction ID"
        />
      </label>

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

    <footer class="rounded-b-2xl border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-xs text-slate-500">
      SPG mode active — inspired by spg-nutrizaria. Stripe handles card details; local wallets are
      verified manually.
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { BanknotesIcon, CreditCardIcon, WalletIcon } from "@heroicons/vue/24/outline";
import { usePaymentGateway } from "~/composables/usePaymentGateway";
import type { PaymentMethod, PaymentSummary } from "~/types/product";

const props = defineProps<{
  amount: number;
  email?: string;
  currencySymbol?: string;
}>();

const emit = defineEmits<{
  (e: "payment:status", summary: PaymentSummary): void;
}>();

const paymentMethod = ref<PaymentMethod>("card");
const paymentNote = ref("");
const processing = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const gateway = usePaymentGateway();

const currencySymbol = computed(() => props.currencySymbol ?? "৳");
const formattedAmount = computed(() =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(props.amount)
);

const methods = [
  {
    id: "card",
    label: "Card",
    helper: "Visa / MasterCard",
    icon: CreditCardIcon,
  },
  {
    id: "bkash",
    label: "bKash",
    helper: "Manual confirmation",
    icon: WalletIcon,
  },
  {
    id: "nagad",
    label: "Nagad",
    helper: "Instant transfer",
    icon: WalletIcon,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    helper: "Pay on arrival",
    icon: BanknotesIcon,
  },
] as const;

const setMethod = (method: PaymentMethod) => {
  paymentMethod.value = method;
};

const mountCard = async () => {
  try {
    await gateway.mountCardElement("#nutri-card-element");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to set up card field.";
  }
};

watch(paymentMethod, (value) => {
  errorMessage.value = "";
  successMessage.value = "";
  if (value === "card") {
    mountCard();
  } else {
    gateway.teardownCard();
  }
});

onMounted(() => {
  if (paymentMethod.value === "card") {
    mountCard();
  }
});

const createSummary = (status: PaymentSummary["status"]): PaymentSummary => ({
  method: paymentMethod.value,
  status,
  reference: paymentNote.value ? paymentNote.value.trim() : undefined,
});

const processPayment = async (): Promise<PaymentSummary> => {
  if (!props.amount || props.amount <= 0) {
    throw new Error("Cart total must be greater than zero.");
  }

  processing.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const summary = createSummary(
    paymentMethod.value === "cod" ? "pending" : "processing"
  );

  try {
    if (paymentMethod.value === "card") {
      const intent = await gateway.createPaymentIntent(props.amount, props.email);
      const paymentIntent = await gateway.confirmCardPayment(intent.clientSecret, {
        name: props.email || "NutriZaria customer",
        email: props.email,
      });
      summary.reference = paymentIntent?.id ?? intent.paymentIntentId;
      summary.status =
        paymentIntent?.status === "succeeded" ? "paid" : "processing";
      summary.provider = "stripe";
      successMessage.value = "Payment confirmed. Thank you!";
    } else if (paymentMethod.value === "bkash" || paymentMethod.value === "nagad") {
      summary.status = "processing";
      successMessage.value =
        "Wallet instructions sent. We will verify the transfer shortly.";
      if (!summary.reference) {
        summary.reference = `${paymentMethod.value.toUpperCase()}-${Date.now()
          .toString()
          .slice(-6)}`;
      }
      summary.provider = paymentMethod.value;
    } else {
      summary.status = "pending";
      successMessage.value = "Cash on delivery selected.";
      summary.provider = "cod";
    }

    emit("payment:status", summary);
    return summary;
  } catch (error) {
    summary.status = "failed";
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to process payment.";
    emit("payment:status", summary);
    throw error;
  } finally {
    processing.value = false;
  }
};

defineExpose({ processPayment, processing });
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
