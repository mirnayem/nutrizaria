<template>
  <ClientOnly>
    <main class="py-6 sm:py-12">
      <div v-if="placedOrder" class="mx-auto max-w-2xl">
        <div class="text-center">
          <div class="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100">
            <svg
              class="checkmark size-10 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 class="mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Thank you for your order!
          </h1>
          <p class="mx-auto mt-2 max-w-md text-sm text-slate-500 sm:text-base">
            Your order has been placed successfully. A confirmation has been sent to
            <span class="font-medium text-slate-700">{{ placedOrder.email }}</span>.
          </p>
        </div>

        <div class="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Order number</p>
              <p class="mt-0.5 text-base font-bold text-slate-900">
                {{ placedOrder.orderNumber }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Placed on</p>
              <p class="mt-0.5 text-sm font-medium text-slate-700">{{ formatDate(placedOrder.createdAt) }}</p>
            </div>
          </div>

          <div class="divide-y divide-slate-100 px-6">
            <div
              v-for="item in placedOrder.items"
              :key="item.productId || item.id"
              class="flex items-center gap-4 py-4"
            >
              <img
                :src="itemImage(item)"
                :alt="item.name"
                width="56"
                height="56"
                class="size-14 rounded-xl object-cover"
                loading="lazy"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-800">{{ item.name }}</p>
                <p class="text-xs text-slate-500">
                  {{ item.quantity }} × {{ currencySymbol }}{{ item.price }}
                </p>
              </div>
              <div class="text-sm font-semibold text-slate-900">
                {{ currencySymbol }}{{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="space-y-3 border-t border-slate-100 bg-slate-50/40 px-6 py-5 text-sm text-slate-600">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>{{ currencySymbol }}{{ placedOrder.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Delivery</span>
              <span>
                {{
                  placedOrder.delivery === 0
                    ? "Free"
                    : currencySymbol + placedOrder.delivery.toFixed(2)
                }}
              </span>
            </div>
            <div class="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
              <span>Total paid</span>
              <span>{{ currencySymbol }}{{ placedOrder.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Delivery to
            </p>
            <p class="mt-2 text-sm font-medium text-slate-800">
              {{ placedOrder.shipping.fullName }}
            </p>
            <p class="mt-1 text-xs leading-relaxed text-slate-500">
              {{ placedOrder.shipping.address }}<br />
              {{ placedOrder.shipping.phone }}
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Payment method
            </p>
            <p class="mt-2 text-sm font-medium capitalize text-slate-800">
              {{ paymentLabel }}
            </p>
            <p class="mt-1 text-xs text-slate-500">
              {{
                placedOrder.paymentStatus === "paid" || placedOrder.paymentMethod !== "cod"
                  ? "Payment received"
                  : "Pay on delivery"
              }}
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              What's next
            </p>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              We'll confirm your order and keep you updated until it arrives at your doorstep.
            </p>
          </div>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <NuxtLink
            to="/profile?tab=orders"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
          >
            Track your order
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="/shop"
            class="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
          >
            Continue shopping
          </NuxtLink>
        </div>

        <p class="mt-6 text-center text-sm text-slate-400">
          Redirecting to your orders in
          <span class="font-semibold text-slate-600">{{ redirectCountdown }}</span>s
        </p>
      </div>

      <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section class="space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
            <header class="border-b border-slate-100 px-6 py-4">
              <h1 class="text-xl font-semibold text-slate-800">Delivery details</h1>
            </header>
            <form class="space-y-4 px-6 py-6" @submit.prevent="placeOrder">
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

              <fieldset>
                <legend class="block text-sm font-medium text-slate-700">
                  Delivery area <span class="text-red-500">*</span>
                </legend>
                <div class="mt-2 grid gap-3 sm:grid-cols-2">
                  <label
                    v-for="option in deliveryOptions"
                    :key="option.id"
                    class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all"
                    :class="
                      shipping.area === option.id
                        ? 'border-violet-500 bg-violet-50/80'
                        : 'border-slate-200 hover:border-slate-300'
                    "
                  >
                    <input
                      v-model="shipping.area"
                      type="radio"
                      name="delivery-area"
                      :value="option.id"
                      class="accent-violet-600"
                    />
                    <div class="flex-1">
                      <p class="text-sm font-medium text-slate-800">{{ option.label }}</p>
                      <p class="text-xs text-slate-500">
                        {{ option.fee === 0 ? "Free" : currencySymbol + option.fee + " fee" }}
                      </p>
                    </div>
                  </label>
                </div>
              </fieldset>
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
        </section>

        <aside class="h-fit rounded-2xl border border-slate-200 bg-white/90 shadow-sm lg:sticky lg:top-24">
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
              <span v-if="isBusy" class="inline-flex items-center gap-2">
                <svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
              <span v-else>Place order</span>
            </button>
          </div>
        </aside>
      </div>
    </main>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PaymentMethod from "~/components/PaymentMethod.vue";
import { useCartStore } from "~/stores/cart";
import { useCatalogStore } from "~/stores/catalog";
import { useUserStore } from "~/stores/user";
import type { PaymentSummary } from "~/types/product";
import { useRuntimeConfig } from "#app";

definePageMeta({ middleware: "auth" });

useSeo({
  title: "Checkout",
  noindex: true,
});

const cartStore = useCartStore();
const catalogStore = useCatalogStore();
const userStore = useUserStore();
const router = useRouter();
await catalogStore.hydrate();

const currencySymbol = useRuntimeConfig().public.currencySymbol || "Tk";

const { resolve } = useImageUrl();
function imgSrc(url: string | null | undefined): string {
  return resolve(url) || "/nutri.png";
}

const shipping = ref({ fullName: "", phone: "", address: "", area: "inside" });
const paymentRef = ref<InstanceType<typeof PaymentMethod> | null>(null);
const formError = ref("");
const placingOrder = ref(false);
const isBusy = computed(() => placingOrder.value);

const deliveryConfig = ref({
  insideDhakaFee: 80,
  outsideDhakaFee: 150,
  freeDeliveryThreshold: 2000,
});

const deliveryOptions = computed(() => {
  const { insideDhakaFee, outsideDhakaFee, freeDeliveryThreshold } = deliveryConfig.value;
  const subtotal = cartStore.totalPrice;
  return [
    { id: "inside", label: "Inside Dhaka", fee: subtotal >= freeDeliveryThreshold ? 0 : insideDhakaFee },
    { id: "outside", label: "Outside Dhaka", fee: subtotal >= freeDeliveryThreshold ? 0 : outsideDhakaFee },
  ];
});

const totals = computed(() => {
  const subtotal = cartStore.totalPrice;
  const area = shipping.value.area === "outside" ? "outsideDhakaFee" : "insideDhakaFee";
  const { freeDeliveryThreshold } = deliveryConfig.value;
  const delivery = subtotal >= freeDeliveryThreshold ? 0 : deliveryConfig.value[area];
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

type PlacedOrder = {
  orderNumber: string;
  createdAt: string;
  email: string;
  items: any[];
  subtotal: number;
  delivery: number;
  total: number;
  shipping: { fullName: string; address: string; phone: string };
  paymentMethod: string;
  paymentStatus?: string;
};

const placedOrder = ref<PlacedOrder | null>(null);
const redirectCountdown = ref(10);
let redirectTimer: ReturnType<typeof setInterval> | null = null;

const trackPurchase = (items: any[], total: number, orderNumber: string) => {
  const { track } = useMetaPixel();
  track("Purchase", {
    value: total,
    currency: "BDT",
    transaction_id: orderNumber,
    content_ids: items.map((i) => String(i.id)),
    num_items: items.length,
  });
};

const startRedirectCountdown = () => {
  redirectCountdown.value = 10;
  redirectTimer = setInterval(() => {
    redirectCountdown.value -= 1;
    if (redirectCountdown.value <= 0) {
      if (redirectTimer) clearInterval(redirectTimer);
      router.push("/profile?tab=orders");
    }
  }, 1000);
};

const itemImage = (item: any) => {
  if (item.image) return resolve(item.image) || "/nutri.png";
  const product = catalogStore.productById(item.productId || item.id);
  return resolve(product?.image) || "/nutri.png";
};

const paymentLabel = computed(() => {
  if (!placedOrder.value) return "";
  const method = String(placedOrder.value.paymentMethod || "").toUpperCase();
  const labels: Record<string, string> = {
    COD: "Cash on delivery",
    CARD: "Card",
    BKASH: "bKash",
    SSLCOMMERZ: "SSLCommerz",
    BANK_TRANSFER: "Bank transfer",
  };
  return labels[method] || method.replace(/_/g, " ");
});

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const placeOrder = async () => {
  formError.value = "";
  placedOrder.value = null;

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

    // Online gateways (SSLCommerz / bKash): create order + hosted session,
    // then redirect the customer to the secure gateway.
    if (catalogStore.useApi && summary.method !== "cod") {
      const api = useApi();
      const initiate =
        summary.method === "bkash" ? api.initiateBkash : api.initiateSslcommerz;
      const result = await initiate({
        shippingName: shipping.value.fullName,
        shippingEmail: userStore.authenticatedUser?.email,
        shippingPhone: shipping.value.phone,
        shippingAddress: shipping.value.address,
        shippingCity: "",
        shippingCountry: "Bangladesh",
        deliveryArea: shipping.value.area,
        items: cartStore.items.map((item: any) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
        })),
      });
      const session = result?.data ?? result;
      if (!session?.gatewayUrl) {
        throw new Error(
          `${summary.method === "bkash" ? "bKash" : "SSLCommerz"} could not start your payment. Please try again.`,
        );
      }
      window.location.href = session.gatewayUrl;
      return;
    }

    const purchasedItems = [...cartStore.items];
    const purchaseTotal = totals.value.grandTotal;

    if (catalogStore.useApi) {
      const api = useApi();
      const result = await api.createOrder({
        shippingName: shipping.value.fullName,
        shippingEmail: userStore.authenticatedUser?.email,
        shippingPhone: shipping.value.phone,
        shippingAddress: shipping.value.address,
        shippingCity: "",
        deliveryArea: shipping.value.area,
        paymentMethod: summary.method.toUpperCase(),
        paymentRef: summary.reference,
        notes: summary.notes,
        items: cartStore.items.map((item: any) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
        })),
      });
      const order = result?.data ?? result;
      placedOrder.value = {
        orderNumber: order.orderNumber || "NZR-PENDING",
        createdAt: order.createdAt || new Date().toISOString(),
        email: order.shippingEmail || userStore.authenticatedUser?.email || "",
        items: order.items?.length ? order.items : purchasedItems,
        subtotal: order.subtotal ?? totals.value.subtotal,
        delivery: order.shippingCost ?? totals.value.delivery,
        total: order.total ?? purchaseTotal,
        shipping: {
          fullName: order.shippingName || shipping.value.fullName,
          address: order.shippingAddress || shipping.value.address,
          phone: order.shippingPhone || shipping.value.phone,
        },
        paymentMethod: order.paymentMethod || summary.method,
        paymentStatus: order.paymentStatus,
      };
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
      placedOrder.value = {
        orderNumber: order.id,
        createdAt: order.createdAt,
        email: userStore.authenticatedUser?.email || "",
        items: order.items,
        subtotal: totals.value.subtotal,
        delivery: totals.value.delivery,
        total: order.total,
        shipping: {
          fullName: shipping.value.fullName,
          address: shipping.value.address,
          phone: shipping.value.phone,
        },
        paymentMethod: summary.method,
        paymentStatus: summary.status,
      };
    }

    cartStore.clearCart();
    trackPurchase(purchasedItems, purchaseTotal, placedOrder.value.orderNumber);
    startRedirectCountdown();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : "Unable to process your order. Please try again.";
  } finally {
    placingOrder.value = false;
  }
};

const handleSslReturn = async () => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const gatewayMethod = params.get("payment");
  if (gatewayMethod !== "sslcommerz" && gatewayMethod !== "bkash") return;

  const status = params.get("status");
  const orderNumber = params.get("order") || "";

  if (status === "failed" || status === "cancelled") {
    const { track } = useMetaPixel();
    track("InitiateCheckout", {
      num_items: cartStore.items.length,
      value: totals.value.grandTotal,
      currency: "BDT",
    });
    formError.value =
      status === "cancelled"
        ? "Payment cancelled. Your order was not placed."
        : "Payment failed. Please try again.";
    return;
  }

  if (status === "success" && orderNumber && catalogStore.useApi) {
    try {
      const api = useApi();
      const result = await api.getOrderByNumber(orderNumber);
      const order = result?.data ?? result;
      if (!order?.orderNumber) return;

      const purchasedItems = [...cartStore.items];
      const purchaseTotal = order.total ?? totals.value.grandTotal;

      placedOrder.value = {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt || new Date().toISOString(),
        email: order.shippingEmail || userStore.authenticatedUser?.email || "",
        items: order.items?.length ? order.items : purchasedItems,
        subtotal: order.subtotal ?? totals.value.subtotal,
        delivery: order.shippingCost ?? totals.value.delivery,
        total: order.total ?? purchaseTotal,
        shipping: {
          fullName: order.shippingName || shipping.value.fullName,
          address: order.shippingAddress || shipping.value.address,
          phone: order.shippingPhone || shipping.value.phone,
        },
        paymentMethod: order.paymentMethod || params.get("payment") === "bkash" ? "BKASH" : "SSLCOMMERZ",
        paymentStatus: order.paymentStatus,
      };

      if (cartStore.items.length) cartStore.clearCart();
      trackPurchase(purchasedItems, purchaseTotal, orderNumber);
      startRedirectCountdown();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      formError.value = "Payment was completed, but we could not load your order. Please try again.";
    }
  }
};

onMounted(async () => {
  handleSslReturn();
  const { fetchConfig } = useDeliveryConfig();
  const cfg = await fetchConfig();
  if (cfg) deliveryConfig.value = cfg;
});

onBeforeUnmount(() => {
  if (redirectTimer) clearInterval(redirectTimer);
});
</script>

<style scoped>
.checkmark {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: draw 0.6s ease-out forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
