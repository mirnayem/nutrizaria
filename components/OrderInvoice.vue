<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      @click.self="close"
    >
      <div class="mx-auto max-w-[210mm] print:max-w-none">
        <div class="no-print mb-4 flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <h2 class="text-lg font-semibold">Invoice {{ order.orderNumber }}</h2>
            <p class="text-sm text-white/70">Review and print the standard invoice.</p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              @click="close"
            >
              Close
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
              @click="printInvoice"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-3.413-.387m0 0V5.25c0-.621-.504-1.125-1.125-1.125h-5.25c-.621 0-1.125.504-1.125 1.125v1.744a48.055 48.055 0 0 0-3.413.387c-1.07.16-1.837 1.094-1.837 2.175v6.294c0 1.244.746 2.33 1.837 2.55m5.375-7.425h.008v.008h-.008v-.008Z" /></svg>
              Print / Save PDF
            </button>
          </div>
        </div>

        <div id="invoice-print-area" class="rounded-xl bg-white shadow-2xl">
          <!-- Header -->
          <div class="border-b-4 border-violet-600 px-8 py-7 sm:px-12">
            <div class="flex flex-wrap items-start justify-between gap-6">
              <div class="flex items-center gap-4">
                <img src="/nutri.png" alt="NutriZaria logo" class="h-14 w-14 rounded-xl object-contain" />
                <div>
                  <h1 class="text-2xl font-bold tracking-tight text-slate-900">NutriZaria</h1>
                  <p class="text-sm text-slate-500">Fresh &amp; authentic essentials</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-3xl font-black uppercase tracking-widest text-violet-700">Invoice</p>
                <p class="mt-1 text-sm font-semibold text-slate-800">{{ order.orderNumber }}</p>
              </div>
            </div>
          </div>

          <!-- Meta + addresses -->
          <div class="grid gap-8 px-8 py-8 sm:px-12 md:grid-cols-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">From</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">NutriZaria</p>
              <p class="text-xs text-slate-500">Dhaka, Bangladesh</p>
              <p class="text-xs text-slate-500">+880 1820 999 820</p>
              <p class="text-xs text-slate-500">support@nutrizaria.com</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Bill To</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.shippingName }}</p>
              <p class="text-xs text-slate-500">{{ order.shippingPhone }}</p>
              <p class="text-xs text-slate-500">{{ order.shippingEmail }}</p>
              <p class="mt-0.5 text-xs text-slate-500">
                {{ order.shippingAddress }}
              </p>
              <p v-if="order.shippingPostal" class="text-xs text-slate-500">Postal: {{ order.shippingPostal }}</p>
              <p class="text-xs text-slate-500">{{ order.shippingCity }}, {{ order.shippingCountry }}</p>
            </div>
            <div class="md:ml-auto">
              <div class="flex items-center justify-between gap-6 text-sm">
                <span class="text-slate-500">Date</span>
                <span class="font-medium text-slate-800">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="mt-1.5 flex items-center justify-between gap-6 text-sm">
                <span class="text-slate-500">Payment</span>
                <span class="font-medium uppercase text-slate-800">{{ order.paymentMethod }}</span>
              </div>
              <div class="mt-1.5 flex items-center justify-between gap-6 text-sm">
                <span class="text-slate-500">Status</span>
                <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="paymentBadgeClass">{{ order.paymentStatus }}</span>
              </div>
              <div v-if="order.notes" class="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                <span class="font-semibold text-slate-700">Notes:</span>
                <p class="mt-0.5">{{ order.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="px-8 sm:px-12">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-y border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th class="px-3 py-2.5">#</th>
                  <th class="px-3 py-2.5">Item</th>
                  <th class="px-3 py-2.5 text-center">Qty</th>
                  <th class="px-3 py-2.5 text-right">Unit Price</th>
                  <th class="px-3 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, index) in order.items" :key="item.id">
                  <td class="px-3 py-3 text-slate-400">{{ index + 1 }}</td>
                  <td class="px-3 py-3">
                    <p class="font-medium text-slate-800">{{ item.name }}</p>
                    <p v-if="item.variantLabel" class="text-xs text-slate-500">{{ item.variantLabel }}</p>
                  </td>
                  <td class="px-3 py-3 text-center text-slate-700">{{ item.quantity }}</td>
                  <td class="px-3 py-3 text-right text-slate-700">{{ currencySymbol }}{{ toFixed(item.price) }}</td>
                  <td class="px-3 py-3 text-right font-medium text-slate-900">{{ currencySymbol }}{{ toFixed(item.price * item.quantity) }}</td>
                </tr>
                <tr v-if="!order.items || order.items.length === 0">
                  <td colspan="5" class="px-3 py-6 text-center text-slate-400">No items</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="px-8 py-8 sm:px-12">
            <div class="ml-auto w-full max-w-sm space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Subtotal</span>
                <span class="font-medium text-slate-800">{{ currencySymbol }}{{ toFixed(order.subtotal) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Shipping</span>
                <span class="font-medium text-slate-800">{{ currencySymbol }}{{ toFixed(order.shippingCost) }}</span>
              </div>
              <div v-if="order.discount" class="flex items-center justify-between">
                <span class="text-slate-500">Discount</span>
                <span class="font-medium text-emerald-600">− {{ currencySymbol }}{{ toFixed(order.discount) }}</span>
              </div>
              <div class="flex items-center justify-between border-t border-slate-200 pt-2 text-base">
                <span class="font-semibold text-slate-900">Total</span>
                <span class="text-lg font-bold text-violet-700">{{ currencySymbol }}{{ toFixed(order.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Footer + QR -->
          <div class="flex flex-wrap items-end justify-between gap-6 border-t border-slate-200 bg-slate-50 px-8 py-7 sm:px-12">
            <div class="max-w-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Terms &amp; thanks</p>
              <p class="mt-1 text-xs leading-relaxed text-slate-500">
                Thank you for your purchase from NutriZaria. If you have any questions about this
                invoice, contact support at +880 1820 999 820.
              </p>
              <div class="mt-4">
                <p class="text-xs text-slate-400">Authorized signature</p>
                <div class="mt-6 h-px w-40 bg-slate-300"></div>
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <QrCode :value="qrValue" :size="96" :margin="1" alt="Invoice QR" />
              <p class="text-[11px] text-slate-400">Scan to verify invoice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";

const props = defineProps<{
  order: any;
}>();

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || "Tk";

const emit = defineEmits<{ close: [] }>();

const isOpen = computed(() => !!props.order);
const close = () => emit("close");

const qrValue = computed(() => {
  if (!props.order) return "";
  return JSON.stringify({
    type: "invoice",
    order: props.order.orderNumber,
    total: Number(props.order.total).toFixed(2),
    currency: currencySymbol,
    date: props.order.createdAt,
  });
});

const paymentBadgeClass = computed(() => {
  const map: Record<string, string> = {
    PAID: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-slate-100 text-slate-700",
  };
  return map[props.order?.paymentStatus] || "bg-slate-100 text-slate-700";
});

const formatDate = (value: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const toFixed = (value: number) => Number(value || 0).toFixed(2);

const printInvoice = () => {
  window.print();
};
</script>