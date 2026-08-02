<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Orders</h2>
        <p class="text-sm text-slate-500">{{ orders.length }} orders total</p>
      </div>
      <div class="flex gap-2">
        <select v-model="statusFilter" class="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500">
          <option value="">All Status</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <input v-model="search" type="search" placeholder="Search orders..." class="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
      </div>
    </div>

    <div v-if="loading" aria-label="Loading orders">
      <SkeletonTable :rows="5" :columns="7" />
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Order</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Customer</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Total</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Payment</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <p class="text-sm font-medium text-slate-900">{{ order.orderNumber }}</p>
              <p class="text-xs text-slate-500">{{ order.items?.length || 0 }} items</p>
            </td>
            <td class="px-4 py-3">
              <p class="text-sm text-slate-900">{{ order.shippingName }}</p>
              <p class="text-xs text-slate-500">{{ order.shippingEmail }}</p>
            </td>
            <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ currencySymbol }}{{ order.total.toFixed(2) }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="paymentClass(order.paymentStatus)">
                {{ order.paymentStatus }}
              </span>
            </td>
            <td class="px-4 py-3">
              <select
                :value="order.status"
                @change="updateStatus(order.id, $event.target.value)"
                class="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium outline-none focus:border-violet-500"
                :class="statusClass(order.status)"
              >
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </td>
            <td class="px-4 py-3 text-xs text-slate-500">{{ new Date(order.createdAt).toLocaleDateString() }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="viewOrder(order)" class="text-sm text-violet-600 hover:text-violet-700">View</button>
            </td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">No orders found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900">Order {{ selectedOrder.orderNumber }}</h3>
          <button @click="selectedOrder = null" class="text-slate-400 hover:text-slate-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 mb-6">
          <div>
            <p class="text-xs font-medium uppercase text-slate-500">Customer</p>
            <p class="text-sm text-slate-900">{{ selectedOrder.shippingName }}</p>
            <p class="text-sm text-slate-600">{{ selectedOrder.shippingEmail }}</p>
            <p class="text-sm text-slate-600">{{ selectedOrder.shippingPhone }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-slate-500">Shipping Address</p>
            <p class="text-sm text-slate-900">{{ selectedOrder.shippingAddress }}</p>
            <p class="text-sm text-slate-600">{{ selectedOrder.shippingCity }}, {{ selectedOrder.shippingCountry }}</p>
          </div>
        </div>

        <div class="mb-6">
          <p class="text-xs font-medium uppercase text-slate-500 mb-2">Items</p>
          <div class="space-y-2">
            <div v-for="item in selectedOrder.items" :key="item.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div>
                <p class="text-sm font-medium text-slate-900">{{ item.name }}</p>
                <p class="text-xs text-slate-500">{{ item.quantity }} x {{ currencySymbol }}{{ item.price }}</p>
              </div>
              <p class="text-sm font-semibold text-slate-900">{{ currencySymbol }}{{ (item.quantity * item.price).toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-slate-50 p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Subtotal</span>
            <span class="text-slate-900">{{ currencySymbol }}{{ selectedOrder.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Shipping</span>
            <span class="text-slate-900">{{ currencySymbol }}{{ selectedOrder.shippingCost.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
            <span class="text-slate-900">Total</span>
            <span class="text-slate-900">{{ currencySymbol }}{{ selectedOrder.total.toFixed(2) }}</span>
          </div>
        </div>

        <div class="mt-6 flex gap-3">
          <button @click="markAsPaid(selectedOrder.id)" class="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700" :disabled="selectedOrder.paymentStatus === 'PAID'">
            {{ selectedOrder.paymentStatus === 'PAID' ? 'Already Paid' : 'Mark as Paid' }}
          </button>
          <button @click="selectedOrder = null" class="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || 'Tk';

const orders = ref<any[]>([]);
const search = ref('');
const statusFilter = ref('');
const selectedOrder = ref<any>(null);
const loading = ref(false);

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const filteredOrders = computed(() => {
  let result = orders.value;
  if (statusFilter.value) {
    result = result.filter(o => o.status === statusFilter.value);
  }
  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.shippingName.toLowerCase().includes(q) ||
      o.shippingEmail.toLowerCase().includes(q)
    );
  }
  return result;
});

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    CONFIRMED: 'bg-blue-50 text-blue-700',
    PROCESSING: 'bg-indigo-50 text-indigo-700',
    SHIPPED: 'bg-purple-50 text-purple-700',
    DELIVERED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-red-50 text-red-700',
    REFUNDED: 'bg-slate-50 text-slate-700',
  };
  return classes[status] || '';
};

const paymentClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-slate-100 text-slate-700',
  };
  return classes[status] || 'bg-slate-100 text-slate-700';
};

const updateStatus = async (id: string, status: string) => {
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { status },
    });
    await loadOrders();
  } catch (e) {
    console.error('Failed to update status', e);
  }
};

const markAsPaid = async (id: string) => {
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/orders/${id}/payment`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { status: 'PAID' },
    });
    selectedOrder.value = null;
    await loadOrders();
  } catch (e) {
    console.error('Failed to mark as paid', e);
  }
};

const viewOrder = (order: any) => {
  selectedOrder.value = order;
};

const loadOrders = async () => {
  loading.value = true;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    const res = await $fetch(`${apiBase}/admin/orders?limit=200`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    orders.value = res?.data?.items || res?.items || [];
  } catch (e) {
    console.error('Failed to load orders', e);
  }
  finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>
