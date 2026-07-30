<template>
  <ClientOnly>
    <div class="py-6">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section class="space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
            <header class="border-b border-slate-100 px-6 py-4">
              <h1 class="text-xl font-semibold text-slate-800">Delivery details</h1>
            </header>
            <form class="space-y-4 px-6 py-6">
              <label class="block text-sm font-medium text-slate-700">
                Full name <span class="text-red-500">*</span>
                <input
                  v-model="shipping.fullName"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="e.g. Sadia Rahman"
                />
              </label>
              <label class="block text-sm font-medium text-slate-700">
                Phone <span class="text-red-500">*</span>
                <input
                  v-model="shipping.phone"
                  type="tel"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="01XXXXXXXXX"
                />
              </label>
              <label class="block text-sm font-medium text-slate-700">
                Address <span class="text-red-500">*</span>
                <input
                  v-model="shipping.address"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Street, area, city"
                />
              </label>
            </form>
          </div>

          <PaymentMethod
            ref="paymentRef"
            :amount="totals.grandTotal"
            @payment:status="onPaymentStatus"
          />

          <p
            v-if="formError"
            class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {{ formError }}
          </p>
          <p
            v-if="orderSuccess"
            class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            Order {{ orderId }} placed. You will receive a confirmation shortly.
          </p>
        </section>

        <aside class="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
          <header class="border-b border-slate-100 px-6 py-4">
            <h2 class="text-lg font-semibold text-slate-800">Order summary</h2>
          </header>
          <div class="px-6 py-6">
            <ul class="space-y-4">
              <li
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex items-center gap-4 text-sm text-slate-700"
              >
                <NuxtImg
                  :src="imgSrc(item.image)"
                  :alt="item.name"
                  class="h-14 w-14 rounded-lg object-cover"
                />
                <div class="flex-1">
                  <p class="font-medium">{{ item.name }}</p>
                  <p class="text-xs text-slate-500">
                    {{ item.quantity }} × {{ currencySymbol }}{{ item.price }}
                  </p>
                </div>
                <div class="font-semibold">
                  {{ currencySymbol }}{{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </li>
            </ul>

            <div class="mt-6 space-y-3 text-sm text-slate-600">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>{{ currencySymbol }}{{ totals.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Delivery</span>
                <span>
                  {{ totals.delivery === 0 ? "Free" : currencySymbol + totals.delivery.toFixed(2) }}
                </span>
              </div>
              <div class="flex justify-between font-semibold text-slate-800">
                <span>Total</span>
                <span>{{ currencySymbol }}{{ totals.grandTotal.toFixed(2) }}</span>
              </div>
            </div>

            <button
              class="mt-8 w-full rounded-xl bg-violet-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-slate-400"
              :disabled="isBusy || cartStore.items.length === 0"
              @click="placeOrder"
            >
              <span v-if="isBusy">Processing...</span>
              <span v-else>Place order</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import PaymentMethod from "~/components/PaymentMethod.vue";
import { useCartStore } from "~/stores/cart";
import { useCatalogStore } from "~/stores/catalog";
import type { PaymentSummary } from "~/types/product";
import { useRuntimeConfig } from "#app";

definePageMeta({ middleware: "auth", title: "Checkout" });

const cartStore = useCartStore();
const catalogStore = useCatalogStore();
catalogStore.hydrate();

const currencySymbol = useRuntimeConfig().public.currencySymbol || "Tk";

function imgSrc(url: string | null | undefined): string {
  if (!url) return "/nutri.png";
  const s = String(url).trim();
  if (s.includes("://")) return s;
  if (s.startsWith("/uploads/") || s.startsWith("/images/")) return s;
  if (s.startsWith("/")) return s;
  return `/images/${s}`;
}

const shipping = ref({ fullName: "", phone: "", address: "" });
const paymentRef = ref<InstanceType<typeof PaymentMethod> | null>(null);
const orderSuccess = ref(false);
const orderId = ref("");
const formError = ref("");
const placingOrder = ref(false);
const isBusy = computed(() => placingOrder.value);

const totals = computed(() => {
  const subtotal = cartStore.totalPrice;
  const delivery = subtotal >= 2000 ? 0 : 80;
  return { subtotal, delivery, grandTotal: subtotal + delivery };
});

const onPaymentStatus = (_summary: PaymentSummary) => {};

const validateForm = () => {
  if (!shipping.value.fullName?.trim()) return "Full name is required.";
  if (!shipping.value.phone?.trim()) return "Phone number is required.";
  if (!shipping.value.address?.trim()) return "Address is required.";
  if (cartStore.items.length === 0) return "Your cart is empty.";
  return "";
};

const placeOrder = async () => {
  formError.value = "";
  orderSuccess.value = false;

  const validationMessage = validateForm();
  if (validationMessage) {
    formError.value = validationMessage;
    return;
  }

  const { track } = useMetaPixel();
  track("InitiateCheckout", {
    num_items: cartStore.items.length,
    value: totals.value.grandTotal,
    currency: "BDT",
    content_ids: cartStore.items.map((i) => String(i.id)),
  });

  try {
    placingOrder.value = true;
    const summary = await paymentRef.value?.processPayment();
    if (!summary) throw new Error("Payment gateway did not return a result.");

    if (catalogStore.useApi) {
      const api = useApi();
      await api.createOrder({
        shippingName: shipping.value.fullName,
        shippingPhone: shipping.value.phone,
        shippingAddress: shipping.value.address,
        paymentMethod: summary.method.toUpperCase(),
        paymentRef: summary.reference,
        notes: summary.notes,
        items: cartStore.items.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });
      orderId.value = "API-ORDER";
    } else {
      const order = catalogStore.recordOrder({
        items: cartStore.items,
        shipping: {
          fullName: shipping.value.fullName,
          address: shipping.value.address,
          phone: shipping.value.phone,
          city: "",
          country: "",
        },
        payment: summary,
        total: totals.value.grandTotal,
      });
      orderId.value = order.id;
    }

    orderSuccess.value = true;
    const purchasedItems = [...cartStore.items];
    const purchaseTotal = totals.value.grandTotal;
    cartStore.clearCart();
    track("Purchase", {
      value: purchaseTotal,
      currency: "BDT",
      transaction_id: orderId.value,
      content_ids: purchasedItems.map((i) => String(i.id)),
      num_items: purchasedItems.length,
    });
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : "Unable to process your order. Please try again.";
  } finally {
    placingOrder.value = false;
  }
};
</script>
