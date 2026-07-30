<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Skeleton loader while checking auth -->
    <div v-if="isLoadingAuth" class="min-h-screen bg-slate-50 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="h-8 w-8 rounded-full bg-violet-600 animate-pulse"></div>
        <div class="h-4 w-48 rounded bg-slate-200 animate-pulse"></div>
      </div>
    </div>

    <!-- Admin panel - only shown when authenticated -->
    <div v-else-if="isAuthenticated" class="min-h-screen bg-slate-50">
      <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div class="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">NZ</span>
          <span class="text-sm font-semibold text-slate-900">Admin Panel</span>
        </div>
        <nav class="space-y-1 px-3 py-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
            :class="isActive(item.to) ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
            <span v-if="item.badge" class="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {{ item.badge }}
            </span>
          </NuxtLink>
        </nav>
        <div class="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700">
              {{ userInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ userName }}</p>
              <p class="text-xs text-slate-500 truncate">{{ userRole }}</p>
            </div>
            <button @click="handleLogout" class="text-slate-400 hover:text-slate-600" title="Logout">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div class="lg:pl-64">
        <header class="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
          <button @click="mobileMenuOpen = true" class="lg:hidden text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-slate-900">{{ pageTitle }}</h1>
          <div class="ml-auto flex items-center gap-3">
            <!-- Notifications button -->
            <button @click="showNotifications = !showNotifications" class="relative text-slate-600 hover:text-slate-900">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Mobile menu button -->
            <button @click="mobileMenuOpen = true" class="lg:hidden text-slate-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </header>

        <main class="p-6">
          <slot />
        </main>
      </div>

      <!-- Mobile sidebar -->
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-slate-900/50" @click="mobileMenuOpen = false"></div>
        <aside class="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div class="flex h-16 items-center justify-between border-b border-slate-200 px-6">
            <span class="text-sm font-semibold text-slate-900">Admin Panel</span>
            <button @click="mobileMenuOpen = false" class="text-slate-400">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="space-y-1 px-3 py-4">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
              :class="isActive(item.to) ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
              @click="mobileMenuOpen = false"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </NuxtLink>
          </nav>
        </aside>
      </div>

      <!-- Notifications panel -->
      <div v-if="showNotifications" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-slate-900/30" @click="showNotifications = false"></div>
        <div class="relative h-full w-full max-w-sm bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 class="text-lg font-semibold text-slate-900">Notifications</h2>
            <button @click="showNotifications = false" class="text-slate-400 hover:text-slate-600">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="overflow-y-auto p-4" style="max-height: calc(100vh - 80px)">
            <p v-if="notifications.length === 0" class="text-center text-sm text-slate-500 py-8">No notifications</p>
            <div v-for="n in notifications" :key="n.id" class="mb-3 rounded-lg border p-3" :class="n.isRead ? 'border-slate-200 bg-white' : 'border-violet-200 bg-violet-50'">
              <p class="text-sm font-medium text-slate-900">{{ n.title }}</p>
              <p class="mt-1 text-xs text-slate-600">{{ n.message }}</p>
              <p class="mt-2 text-xs text-slate-400">{{ new Date(n.createdAt).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Auth required message -->
    <div v-else class="min-h-screen bg-slate-50 flex items-center justify-center">
      <div class="text-center p-8">
        <svg class="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v-6m6 6v-6m-6 6H6m6-6h6m6 6H6" />
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-slate-900">Admin Access Required</h2>
        <p class="mt-2 text-slate-600">Please log in with an admin account to access the admin panel.</p>
        <NuxtLink to="/login" class="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-violet-500">
          Go to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { useRoute, useRouter, useRuntimeConfig } from 'nuxt/app';
import { useCookie } from 'nuxt/app';
import { useUserStore } from '~/stores/user';
import { useAdminApi } from '~/composables/useAdminApi';

definePageMeta({ layout: false });

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const userStore = useUserStore();
const adminApi = useAdminApi();

const isLoadingAuth = ref(true);
const mobileMenuOpen = ref(false);
const showNotifications = ref(false);
const notifications = ref<any[]>([]);
const unreadCount = ref(0);

const userName = computed(() => userStore.authenticatedUser?.name || 'Admin');
const userRole = computed(() => userStore.authenticatedUser?.role || 'ADMIN');
const userInitials = computed(() => {
  const name = userName.value;
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

const isAuthenticated = computed(() => !!userStore.authenticatedUser);

const pageTitle = computed(() => {
  const path = route.path;
  if (path === '/admin') return 'Dashboard';
  if (path.startsWith('/admin/products')) return 'Products';
  if (path.startsWith('/admin/categories')) return 'Categories';
  if (path.startsWith('/admin/orders')) return 'Orders';
  if (path.startsWith('/admin/users')) return 'Users';
  if (path.startsWith('/admin/blog')) return 'Blog';
  if (path.startsWith('/admin/faqs')) return 'FAQs';
  if (path.startsWith('/admin/settings')) return 'Settings';
  if (path.startsWith('/admin/logs')) return 'Activity Logs';
  return 'Admin';
});

const iconDashboard = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z' })]) };
const iconProducts = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'm20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z' })]) };
const iconCategories = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z' })]) };
const iconOrders = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z' })]) };
const iconUsers = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' })]) };
const iconBlog = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z' })]) };
const iconFaqs = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z' })]) };
const iconSettings = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z' })]) };
const iconLogs = { render: () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' })]) };

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: iconDashboard },
  { label: 'Products', to: '/admin/products', icon: iconProducts },
  { label: 'Categories', to: '/admin/categories', icon: iconCategories },
  { label: 'Orders', to: '/admin/orders', icon: iconOrders },
  { label: 'Users', to: '/admin/users', icon: iconUsers },
  { label: 'Blog', to: '/admin/blog', icon: iconBlog },
  { label: 'FAQs', to: '/admin/faqs', icon: iconFaqs },
  { label: 'Settings', to: '/admin/settings', icon: iconSettings },
  { label: 'Activity Logs', to: '/admin/logs', icon: iconLogs },
];

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin';
  return route.path.startsWith(path);
};

const handleLogout = () => {
  userStore.logoutUser();
  router.push('/login');
};

onMounted(async () => {
  // Check authentication on mount
  if (process.client) {
    const token = useCookie('auth_token').value;
    if (!token) {
      isLoadingAuth.value = false;
      return;
    }

    try {
      // Restore user from localStorage
      userStore.loadAuthenticatedUser();

      const config = useRuntimeConfig();
      const apiBase = config.public.apiBase;
      if (apiBase && token) {
        const res = await $fetch(`${apiBase}/admin/notifications?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.data) {
          notifications.value = res.data.notifications || [];
          unreadCount.value = res.data.unreadCount || 0;
        }
      }
    } catch (e) {
      // Ignore errors
    } finally {
      isLoadingAuth.value = false;
    }
  }
});
</script>