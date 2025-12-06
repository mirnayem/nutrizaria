<template>
  <ClientOnly>
    <div class="space-y-10 py-8">
      <section
        v-if="needsPassphrase && !isUnlocked"
        class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm"
      >
        <h1 class="text-xl font-semibold text-slate-800">Admin access</h1>
        <p class="mt-2 text-sm text-slate-500">
          Enter the passphrase configured via <code>ADMIN_PASSPHRASE</code> to manage your catalog.
        </p>
        <input
          v-model="passcode"
          type="password"
          class="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          placeholder="••••••"
        />
        <button
          class="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          @click="unlock"
        >
          Unlock dashboard
        </button>
        <p v-if="unlockError" class="mt-3 text-sm text-rose-600">{{ unlockError }}</p>
      </section>

      <section v-else class="space-y-10">
        <div class="grid gap-6 lg:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-500">Products</p>
            <p class="mt-3 text-3xl font-semibold text-slate-900">{{ products.length }}</p>
            <p class="text-xs text-slate-500">Active in storefront</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-500">Total revenue</p>
            <p class="mt-3 text-3xl font-semibold text-slate-900">
              {{ currencySymbol }}{{ orderStats.totalRevenue.toFixed(2) }}
            </p>
            <p class="text-xs text-slate-500">Based on recorded orders</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-500">Pending orders</p>
            <p class="mt-3 text-3xl font-semibold text-amber-600">{{ orderStats.pending }}</p>
            <p class="text-xs text-slate-500">Awaiting payment</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-500">Fulfilled</p>
            <p class="mt-3 text-3xl font-semibold text-emerald-600">{{ orderStats.fulfilled }}</p>
            <p class="text-xs text-slate-500">Delivered orders</p>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <header class="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-lg font-semibold text-slate-900">Add a product</p>
              <p class="text-sm text-slate-500">
                Items are stored in localStorage so you can experiment without a backend.
              </p>
            </div>
            <button
              class="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
              @click="resetDraft"
            >
              Reset form
            </button>
          </header>
          <form class="grid gap-4 py-6 sm:grid-cols-2" @submit.prevent="submitProduct">
            <label class="text-sm font-medium text-slate-700">
              Product name
              <input
                v-model="productDraft.name"
                type="text"
                required
                class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label class="text-sm font-medium text-slate-700">
              Category
              <select
                v-model="productDraft.category"
                class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                <option v-for="category in categories" :key="category.slug" :value="category.slug">
                  {{ category.name }}
                </option>
              </select>
            </label>
            <label class="text-sm font-medium text-slate-700">
              Price
              <input
                v-model.number="productDraft.price"
                type="number"
                min="0"
                required
                class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label class="text-sm font-medium text-slate-700">
              Unit
              <input
                v-model="productDraft.unit"
                type="text"
                class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label class="text-sm font-medium text-slate-700 sm:col-span-2">
              Image filename
              <input
                v-model="productDraft.image"
                type="text"
                placeholder="e.g. premium-dates.avif"
                class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label class="text-sm font-medium text-slate-700 sm:col-span-2">
              Short description
              <textarea
                v-model="productDraft.description"
                rows="2"
                class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <div class="sm:col-span-2">
              <label class="text-sm font-medium text-slate-700">
                Benefits
                <div class="mt-2 flex gap-2">
                  <input
                    v-model="benefitInput"
                    type="text"
                    class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="Add benefit & press Enter"
                    @keyup.enter.prevent="addBenefit"
                  />
                  <button
                    class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
                    type="button"
                    @click="addBenefit"
                  >
                    Add
                  </button>
                </div>
              </label>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="(benefit, index) in productDraft.benefits"
                  :key="benefit + index"
                  class="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700"
                >
                  {{ benefit }}
                  <button type="button" @click="removeBenefit(index)">×</button>
                </span>
              </div>
            </div>
            <div class="sm:col-span-2">
              <button
                type="submit"
                class="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Save product
              </button>
            </div>
            <p v-if="productMessage" class="sm:col-span-2 text-sm text-emerald-600">
              {{ productMessage }}
            </p>
          </form>

          <div class="mt-8 overflow-auto rounded-2xl border border-slate-100">
            <table class="min-w-full divide-y divide-slate-100 text-sm">
              <thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">Name</th>
                  <th class="px-4 py-3">Category</th>
                  <th class="px-4 py-3">Price</th>
                  <th class="px-4 py-3">Unit</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white/60">
                <tr v-for="product in products" :key="product.id">
                  <td class="px-4 py-3 font-medium text-slate-800">{{ product.name }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ product.category }}</td>
                  <td class="px-4 py-3 text-slate-500">
                    {{ currencySymbol }}{{ product.price.toFixed(2) }}
                  </td>
                  <td class="px-4 py-3 text-slate-500">{{ product.unit }}</td>
                  <td class="px-4 py-3 text-right">
                    <button
                      class="text-xs font-semibold text-rose-600"
                      @click="catalogStore.deleteProduct(product.id)"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <header class="mb-6 border-b border-slate-100 pb-4">
            <p class="text-lg font-semibold text-slate-900">Orders</p>
            <p class="text-sm text-slate-500">
              Orders are persisted locally so you can track payment status even without a backend.
            </p>
          </header>
          <div class="overflow-auto rounded-2xl border border-slate-100">
            <table class="min-w-full divide-y divide-slate-100 text-sm">
              <thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">Order</th>
                  <th class="px-4 py-3">Customer</th>
                  <th class="px-4 py-3">Payment</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Update</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white/70">
                <tr v-for="order in orders" :key="order.id">
                  <td class="px-4 py-3">
                    <p class="font-semibold text-slate-800">{{ order.id }}</p>
                    <p class="text-xs text-slate-500">
                      {{ currencySymbol }}{{ order.total.toFixed(2) }} •
                      {{ new Date(order.createdAt).toLocaleString() }}
                    </p>
                  </td>
                  <td class="px-4 py-3">
                    <p class="font-medium text-slate-700">{{ order.shipping.fullName }}</p>
                    <p class="text-xs text-slate-500">{{ order.customerEmail }}</p>
                  </td>
                  <td class="px-4 py-3 text-slate-600">
                    <p class="font-medium capitalize">{{ order.payment.method }}</p>
                    <p class="text-xs text-slate-500">{{ order.payment.status }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <select
                      v-model="order.status"
                      class="rounded-xl border border-slate-200 px-3 py-1 text-xs capitalize focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      @change="catalogStore.updateOrderStatus(order.id, order.status)"
                    >
                      <option v-for="status in orderStatusOptions" :key="status" :value="status">
                        {{ status }}
                      </option>
                    </select>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button
                      class="text-xs font-semibold text-emerald-600"
                      @click="markAsPaid(order.id)"
                    >
                      Mark paid
                    </button>
                  </td>
                </tr>
                <tr v-if="orders.length === 0">
                  <td colspan="5" class="px-4 py-6 text-center text-sm text-slate-500">
                    No orders yet. Complete the checkout flow to seed one.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
            <p class="text-lg font-semibold text-slate-900">Export data</p>
            <p class="text-sm text-slate-500">
              Download your current catalog (products + orders) as JSON so you can commit it or
              share with teammates.
            </p>
            <button
              class="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-violet-500 hover:text-violet-600"
              @click="downloadSnapshot"
            >
              Download snapshot
            </button>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
            <p class="text-lg font-semibold text-slate-900">Import snapshot</p>
            <p class="text-sm text-slate-500">
              Paste a JSON payload that matches <code>stores/catalog</code> snapshot format.
            </p>
            <textarea
              v-model="snapshotInput"
              rows="4"
              class="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              placeholder='{"products":[]}'
            />
            <div class="mt-3 flex gap-2 text-sm">
              <button
                class="flex-1 rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white"
                @click="importSnapshot"
              >
                Import
              </button>
              <button
                class="flex-1 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600"
                @click="snapshotInput = ''"
              >
                Clear
              </button>
            </div>
            <p v-if="snapshotMessage" class="mt-2 text-sm text-emerald-600">
              {{ snapshotMessage }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRuntimeConfig } from "#app";
import { useCatalogStore } from "~/stores/catalog";
import type { OrderStatus, ProductInput } from "~/types/product";

definePageMeta({
  title: "Admin Dashboard",
});

const catalogStore = useCatalogStore();
catalogStore.hydrate();

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || "Tk";

const { products, orders, categories } = storeToRefs(catalogStore);
const orderStats = computed(() => catalogStore.orderStats);

const productDraft = reactive<ProductInput>({
  name: "",
  image: "",
  category: categories.value[0]?.slug || "nuts",
  description: "",
  benefits: [],
  price: 0,
  unit: "1kg",
});
const benefitInput = ref("");
const productMessage = ref("");

const addBenefit = () => {
  const text = benefitInput.value.trim();
  if (!text) return;
  productDraft.benefits.push(text);
  benefitInput.value = "";
};

const removeBenefit = (index: number) => {
  productDraft.benefits.splice(index, 1);
};

const resetDraft = () => {
  productDraft.name = "";
  productDraft.image = "";
  productDraft.description = "";
  productDraft.benefits = [];
  productDraft.price = 0;
  productDraft.unit = "1kg";
  productDraft.category = categories.value[0]?.slug || productDraft.category;
};

const submitProduct = () => {
  if (!productDraft.name || !productDraft.category) return;
  catalogStore.addProduct({
    ...productDraft,
  });
  productMessage.value = "Product saved locally.";
  resetDraft();
  setTimeout(() => (productMessage.value = ""), 2500);
};

const orderStatusOptions: OrderStatus[] = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
];

const markAsPaid = (orderId: string) => {
  catalogStore.recordManualPayment(orderId, "card", "manual");
};

const snapshotInput = ref("");
const snapshotMessage = ref("");

const downloadSnapshot = () => {
  const data = catalogStore.exportSnapshot(true);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nutrizaria-catalog.json";
  link.click();
  URL.revokeObjectURL(url);
};

const importSnapshot = () => {
  try {
    catalogStore.importSnapshot(snapshotInput.value);
    snapshotMessage.value = "Snapshot imported.";
    setTimeout(() => (snapshotMessage.value = ""), 2500);
  } catch (error) {
    snapshotMessage.value = "Import failed. Please check the payload.";
  }
};

const needsPassphrase = computed(() => Boolean(config.public.adminPassphrase));
const passcode = ref("");
const unlockError = ref("");
const isUnlocked = ref(!needsPassphrase.value);

const unlock = () => {
  if (passcode.value === config.public.adminPassphrase) {
    isUnlocked.value = true;
    unlockError.value = "";
  } else {
    unlockError.value = "Incorrect passphrase.";
  }
};
</script>
