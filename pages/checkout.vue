<template>
  <ClientOnly>
    <div class="py-6">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section class="space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
            <header class="border-b border-slate-100 px-6 py-4">
              <h1 class="text-xl font-semibold text-slate-800">
                Delivery & contact
              </h1>
              <p class="text-sm text-slate-500">
                We’ll use this information to keep you posted about your order.
              </p>
            </header>
            <form class="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <label class="text-sm font-medium text-slate-700 sm:col-span-2">
                Full name
                <input
                  v-model="shipping.fullName"
                  type="text"
                  class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="e.g. Sadia Rahman"
                />
              </label>
              <label class="text-sm font-medium text-slate-700">
                Email
                <input
                  v-model="contactEmail"
                  type="email"
                  class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="you@example.com"
                />
              </label>
              <label class="text-sm font-medium text-slate-700">
                Phone
                <input
                  v-model="shipping.phone"
                  type="tel"
                  class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="01XXXXXXXXX"
                />
              </label>
              <label class="text-sm font-medium text-slate-700 sm:col-span-2">
                Address
                <input
                  v-model="shipping.address"
                  type="text"
                  class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Street, area, building"
                />
              </label>
              <label class="text-sm font-medium text-slate-700">
                City
                <input
                  v-model="shipping.city"
                  type="text"
                  class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Dhaka"
                />
              </label>
              <label class="text-sm font-medium text-slate-700">
                Country
                <input
                  v-model="shipping.country"
                  type="text"
                  class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Bangladesh"
                />
              </label>
            </form>
          </div>

          <PaymentMethod
            ref="paymentRef"
            :amount="totals.grandTotal"
            :email="contactEmail"
            :currency-symbol="currencySymbol"
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
            Order {{ orderId }} saved. You will receive a confirmation shortly.
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
import { ref, computed, onMounted, watch } from "vue";
import PaymentMethod from "~/components/PaymentMethod.vue";
import { useCartStore } from "~/stores/cart";
import { useCatalogStore } from "~/stores/catalog";
import type { PaymentSummary, ShippingAddress } from "~/types/product";
import { useRuntimeConfig } from "#app";

definePageMeta({
  middleware: "auth",
  title: "Checkout",
});

const SHIPPING_STORAGE_KEY = "nutrizaria.shipping";

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

const shipping = ref<ShippingAddress>({
  fullName: "",
  address: "",
  city: "",
  country: "",
  phone: "",
});
const contactEmail = ref("");
const paymentRef = ref<InstanceType<typeof PaymentMethod> | null>(null);
const paymentSummary = ref<PaymentSummary | null>(null);
const orderSuccess = ref(false);
const orderId = ref("");
const formError = ref("");
const placingOrder = ref(false);
const isBusy = computed(
  () =>
    placingOrder.value ||
    Boolean(paymentRef.value?.processing && paymentRef.value.processing.value)
);

const totals = computed(() => {
  const subtotal = cartStore.totalPrice;
  const delivery = subtotal >= 2000 ? 0 : 80;
  return {
    subtotal,
    delivery,
    grandTotal: subtotal + delivery,
  };
});

const onPaymentStatus = (summary: PaymentSummary) => {
  paymentSummary.value = summary;
};

const persistShipping = () => {
  if (typeof window === "undefined") return;
  const snapshot = {
    shipping: shipping.value,
    email: contactEmail.value,
  };
  localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(snapshot));
};

onMounted(() => {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(SHIPPING_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.shipping) {
        shipping.value = parsed.shipping;
      }
      if (parsed.email) {
        contactEmail.value = parsed.email;
      }
    } catch (error) {
      console.warn("Unable to hydrate shipping info", error);
    }
  }
});

watch([shipping, contactEmail], persistShipping, { deep: true });

const validateForm = () => {
  if (!shipping.value.fullName || !shipping.value.address) {
    return "Name and address are required.";
  }
  if (!shipping.value.phone) {
    return "Phone number is required.";
  }
  if (!contactEmail.value) {
    return "Please provide an email so we can send updates.";
  }
  if (cartStore.items.length === 0) {
    return "Add at least one product to your cart before checking out.";
  }
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

  try {
    placingOrder.value = true;
    const summary = await paymentRef.value?.processPayment();
    if (!summary) {
      throw new Error("Payment gateway did not return a result.");
    }

    if (catalogStore.useApi) {
      const api = useApi();
      await api.createOrder({
        shippingName: shipping.value.fullName,
        shippingEmail: contactEmail.value,
        shippingPhone: shipping.value.phone,
        shippingAddress: shipping.value.address,
        shippingCity: shipping.value.city,
        shippingCountry: shipping.value.country,
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
        shipping: shipping.value,
        payment: summary,
        customerEmail: contactEmail.value,
        total: totals.value.grandTotal,
      });
      orderId.value = order.id;
    }

    orderSuccess.value = true;
    paymentSummary.value = summary;
    cartStore.clearCart();
  } catch (error) {
    if (error instanceof Error) {
      formError.value = error.message;
    } else {
      formError.value = "Unable to process your order. Please try again.";
    }
  } finally {
    placingOrder.value = false;
  }
};
</script>
