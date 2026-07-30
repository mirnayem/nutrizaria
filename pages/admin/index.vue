<template>
  <div class="space-y-6">
    <div v-if="loading" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
          <div class="h-3 w-20 rounded bg-slate-200"></div>
          <div class="mt-3 h-7 w-28 rounded bg-slate-200"></div>
          <div class="mt-2 h-3 w-24 rounded bg-slate-200"></div>
        </div>
      </div>
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
          <div class="h-5 w-36 rounded bg-slate-200"></div>
          <div class="mt-6 h-48 rounded bg-slate-100"></div>
        </div>
        <div class="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
          <div class="h-5 w-28 rounded bg-slate-200"></div>
          <div class="mt-6 h-48 rounded bg-slate-100"></div>
        </div>
      </div>
    </div>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ stat.label }}</p>
            <span v-if="stat.trend !== undefined" class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium" :class="stat.trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
              <svg v-if="stat.trend >= 0" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              <svg v-else class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              {{ Math.abs(stat.trend) }}%
            </span>
          </div>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ stat.value }}</p>
          <p v-if="stat.sub" class="mt-1 text-xs text-slate-500">{{ stat.sub }}</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-7">
        <div class="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-slate-900">Revenue</h2>
            <select v-model="revenuePeriod" class="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-violet-500" @change="loadAnalytics">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div class="relative" style="height: 260px">
            <Line v-if="revenueChartData" :data="revenueChartData" :options="revenueChartOptions" />
            <p v-else class="flex h-full items-center justify-center text-sm text-slate-400">No revenue data</p>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-3">
          <h2 class="text-base font-semibold text-slate-900 mb-4">Orders by Status</h2>
          <div class="relative" style="height: 200px">
            <Doughnut v-if="orderChartData" :data="orderChartData" :options="orderChartOptions" />
            <p v-else class="flex h-full items-center justify-center text-sm text-slate-400">No order data</p>
          </div>
          <div class="mt-4 flex flex-wrap gap-3 justify-center">
            <span v-for="item in orderLegend" :key="item.label" class="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
              {{ item.label }} ({{ item.count }})
            </span>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h2 class="text-base font-semibold text-slate-900">Recent Orders</h2>
          <div class="mt-4 space-y-3">
            <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-slate-900 truncate">{{ order.orderNumber || order.id?.slice(0, 8) }}</p>
                <p class="text-xs text-slate-500 truncate">{{ order.shippingName || order.customerEmail || order.email }} &middot; {{ currencySymbol }}{{ (order.total || 0).toFixed(2) }}</p>
              </div>
              <span class="ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusClass(order.status)">
                {{ order.status }}
              </span>
            </div>
            <p v-if="recentOrders.length === 0" class="text-sm text-slate-500 text-center py-4">No orders yet</p>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h2 class="text-base font-semibold text-slate-900">Top Products</h2>
          <div class="mt-4 space-y-3">
            <div v-for="product in topProducts" :key="product.id" class="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
              <img :src="product.image || '/placeholder.svg'" :alt="product.name" class="h-10 w-10 rounded-lg object-cover" @error="$event.target.src = '/placeholder.svg'" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 truncate">{{ product.name }}</p>
                <p class="text-xs text-slate-500">{{ product.totalSold || product._sum?.quantity || 0 }} sold</p>
              </div>
              <p class="text-sm font-semibold text-slate-900 shrink-0">{{ currencySymbol }}{{ product.price || product.totalRevenue || 0 }}</p>
            </div>
            <p v-if="topProducts.length === 0" class="text-sm text-slate-500 text-center py-4">No sales data yet</p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h2 class="text-base font-semibold text-slate-900">Orders by Status</h2>
          <div class="mt-4 space-y-2">
            <div v-for="(count, status) in ordersByStatus" :key="status" class="flex items-center justify-between">
              <span class="text-sm text-slate-600 capitalize">{{ status }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ count }}</span>
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h2 class="text-base font-semibold text-slate-900">Payment Methods</h2>
          <div class="mt-4 space-y-2">
            <div v-for="(count, method) in ordersByPayment" :key="method" class="flex items-center justify-between">
              <span class="text-sm text-slate-600 capitalize">{{ method }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Line, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || 'Tk';
const apiBase = config.public.apiBase;
const token = useCookie('auth_token');

const loading = ref(true);
const dashboardData = ref<any>(null);
const analyticsData = ref<any>(null);
const revenuePeriod = ref('month');

const stats = computed(() => {
  if (!dashboardData.value) return [];
  const o = dashboardData.value.overview;
  return [
    { label: 'Total Revenue', value: `${currencySymbol}${(o.totalRevenue || 0).toFixed(0)}`, sub: `This month: ${currencySymbol}${(o.monthRevenue || 0).toFixed(0)}`, trend: o.revenueTrend },
    { label: 'Total Orders', value: o.totalOrders || 0, sub: `${o.pendingOrders || 0} pending`, trend: o.ordersTrend },
    { label: 'Products', value: o.activeProducts || 0, sub: `${o.totalProducts || 0} total`, trend: o.productsTrend },
    { label: 'Customers', value: o.totalUsers || 0, sub: `${o.newUsersThisMonth || 0} new this month`, trend: o.usersTrend },
  ];
});

const recentOrders = computed(() => dashboardData.value?.recentOrders || []);
const topProducts = computed(() => dashboardData.value?.topProducts || []);
const ordersByStatus = computed(() => dashboardData.value?.ordersByStatus || {});
const ordersByPayment = computed(() => dashboardData.value?.ordersByPayment || {});

const revenueChartData = computed(() => {
  const data = analyticsData.value;
  if (!data?.revenueByDay?.length) return null;
  const days = data.revenueByDay.map((r: any) => {
    const d = new Date(r.createdAt);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  });
  const values = data.revenueByDay.map((r: any) => r.total || 0);
  return {
    labels: days,
    datasets: [{
      label: 'Revenue',
      data: values,
      borderColor: '#7c3aed',
      backgroundColor: (ctx: any) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
        g.addColorStop(1, 'rgba(124, 58, 237, 0)');
        return g;
      },
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointBackgroundColor: '#7c3aed',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 2.5,
    }],
  };
});

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleFont: { size: 12 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 8 } },
  scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } }, y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 }, color: '#94a3b8', callback: (v: any) => `${currencySymbol}${v}` } } },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#6366f1',
  SHIPPED: '#a855f7', DELIVERED: '#10b981', CANCELLED: '#ef4444', REFUNDED: '#64748b',
};

const orderChartData = computed(() => {
  const data = ordersByStatus.value;
  const entries = Object.entries(data) as [string, number][];
  if (!entries.length) return null;
  return {
    labels: entries.map(([s]) => s),
    datasets: [{
      data: entries.map(([, c]) => c),
      backgroundColor: entries.map(([s]) => STATUS_COLORS[s] || '#94a3b8'),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };
});

const orderChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', bodyFont: { size: 12 }, padding: 10, cornerRadius: 8, callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.parsed}` } } },
};

const orderLegend = computed(() => {
  const data = ordersByStatus.value;
  return Object.entries(data).map(([label, count]) => ({
    label, count, color: STATUS_COLORS[label] || '#94a3b8',
  }));
});

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-indigo-100 text-indigo-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-slate-100 text-slate-700',
  };
  return classes[status] || 'bg-slate-100 text-slate-700';
};

const loadAnalytics = async () => {
  try {
    const res = await $fetch(`${apiBase}/admin/analytics?period=${revenuePeriod.value}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    analyticsData.value = res?.data || res;
  } catch (e) {
    console.error('Failed to load analytics', e);
  }
};

onMounted(async () => {
  try {
    if (apiBase && token.value) {
      const [dashRes, analyticsRes] = await Promise.all([
        $fetch(`${apiBase}/admin/dashboard`, { headers: { Authorization: `Bearer ${token.value}` } }),
        $fetch(`${apiBase}/admin/analytics?period=month`, { headers: { Authorization: `Bearer ${token.value}` } }),
      ]);
      const data: any = dashRes?.data || dashRes;
      if (data?.topProducts) {
        for (const p of data.topProducts) {
          if (p.image) {
            const s = String(p.image).trim();
            p.image = /^https?:\/\/localhost:\d+\//.test(s) ? new URL(s).pathname : s;
          }
        }
      }
      dashboardData.value = data;
      analyticsData.value = analyticsRes?.data || analyticsRes;
    }
  } catch (e) {
    console.error('Failed to load dashboard', e);
  } finally {
    loading.value = false;
  }
});
</script>
