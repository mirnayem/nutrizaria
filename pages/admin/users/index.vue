<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Users</h2>
        <p class="text-sm text-slate-500">{{ meta.total ?? users.length }} users total</p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 15.75 4.5 4.5M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" />
          </svg>
          <input v-model="search" type="search" placeholder="Search name, email or phone..." :title="`Search ${meta.total ?? 0} users`" class="rounded-lg border border-slate-200 py-2 pl-9 pr-9 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" />
          <button v-if="search" @click="search = ''" aria-label="Clear search" class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <select v-model="roleFilter" class="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20">
          <option value="">All Roles</option>
          <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
        </select>
        <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add User
        </button>
      </div>
    </div>

    <div v-if="loading" aria-label="Loading users">
      <SkeletonTable :rows="5" :columns="6" />
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">User</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Role</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Last Login</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Orders</th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="user in filteredUsers" :key="user.id" class="group hover:bg-slate-50/70">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img v-if="user.avatar && user._avatarOk !== false" :src="resolve(user.avatar)" :alt="user.name || 'User avatar'" class="flex h-10 w-10 flex-shrink-0 rounded-full object-cover" @error="user._avatarOk = false" />
                <div v-else class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  :class="avatarClass(user)">
                  {{ initials(user) }}
                  <span v-if="user.isActive" class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
                </div>
                <div class="min-w-0">
                  <p class="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    <span class="truncate">{{ user.name || 'No name' }}</span>
                    <span v-if="user.emailVerified" title="Email verified">
                      <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" /></svg>
                    </span>
                  </p>
                  <div class="mt-0.5 flex flex-col gap-0.5 text-xs text-slate-500">
                    <p class="flex items-center gap-1.5 truncate" :title="user.email">
                      <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                      <span class="truncate">{{ user.email || 'No email' }}</span>
                    </p>
                    <a v-if="user.phone" :href="`tel:${user.phone}`" class="flex items-center gap-1.5 transition hover:text-violet-600" :title="`Call ${user.phone}`">
                      <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                      <span class="truncate">{{ formatPhone(user.phone) }}</span>
                      <span v-if="!user.phoneVerified" title="Phone not verified" class="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-px text-[10px] font-medium text-amber-600">Unverified</span>
                    </a>
                    <p v-else-if="!user.phone" class="text-xs italic text-slate-300">No phone</p>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <select
                :value="user.role"
                :disabled="isSystemAdmin(user.email)"
                :title="isSystemAdmin(user.email) ? 'System administrator accounts cannot have their role changed' : `Change role for ${user.name || user.email}`"
                class="rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none transition focus:ring-2 focus:ring-violet-200"
                :class="[roleClass(user.role), { 'cursor-not-allowed opacity-70': isSystemAdmin(user.email), 'cursor-pointer': !isSystemAdmin(user.email) }]"
                @change="updateUserRole(user.id, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
              </select>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium" :class="user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'" :title="user.isActive ? 'Account active' : 'Account inactive'">
                <span class="size-1.5 rounded-full" :class="user.isActive ? 'bg-emerald-500' : 'bg-red-500'"></span>
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
              <span v-if="user.lockedUntil" class="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                Locked
              </span>
            </td>
            <td class="px-4 py-3 text-xs text-slate-500" :title="user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never logged in'">
              {{ user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never' }}
            </td>
            <td class="px-4 py-3">
              <span :title="`${user._count?.orders || 0} orders`" class="inline-flex min-w-7 items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">{{ user._count?.orders || 0 }}</span>
            </td>
            <td class="px-4 py-3">
              <AdminRowActions
                :entity="user.email"
                :actions="[
                  { label: user.isActive ? 'Deactivate' : 'Activate', icon: user.isActive ? 'deactivate' : 'activate', handler: () => toggleActive(user), show: !isSystemAdmin(user.email), className: user.isActive ? 'hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600' : 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600' },
                  { label: 'Reset password', icon: 'key', handler: () => resetPassword(user.id), show: true },
                  { label: 'Unlock', icon: 'unlock', handler: () => unlockUser(user.id), show: !!user.lockedUntil, className: 'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600' },
                  { label: 'Delete', icon: 'delete', handler: () => deleteUser(user.id), show: !isSystemAdmin(user.email), className: 'hover:border-red-300 hover:bg-red-50 hover:text-red-600' },
                ]"
              />
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">No users found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminPagination
      :meta="meta"
      :loading="loading"
      :page-size="pageSize"
      @page="onPageChange"
      @cursor="onCursorChange"
    />

    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-slate-900">Add User</h3>
        <form @submit.prevent="createUser" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input v-model="form.name" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input v-model="form.email" type="email" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input v-model="form.password" type="password" required minlength="6" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select v-model="form.role" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700" :disabled="saving">
              {{ saving ? 'Creating...' : 'Create' }}
            </button>
            <button type="button" @click="showCreateModal = false" class="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const users = ref<any[]>([]);
const search = ref('');
const roleFilter = ref('');
const showCreateModal = ref(false);
const saving = ref(false);
const loading = ref(false);
const roles = ['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];
const pageSize = 20;
const meta = ref<any>({});
let activeCursor: string | null = null;

const form = reactive({ name: '', email: '', password: '', role: 'CUSTOMER' });

const filteredUsers = computed(() => users.value);

const { resolve } = useImageUrl();

const isSystemAdmin = (email: string) => (email || '').toLowerCase().includes('nutrizaria.com');

const initials = (user: any) => {
  const source = user.name || user.email || '?';
  return source
    .split(/\s+/)
    .map((part: string) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
};

const avatarColors = [
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
];

const avatarClass = (user: any) => {
  const seed = (user.id || user.email || user.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[seed % avatarColors.length];
};

const roleClass = (role: string) => {
  const classes: Record<string, string> = {
    CUSTOMER: 'bg-slate-100 text-slate-600',
    STAFF: 'bg-sky-100 text-sky-700',
    MANAGER: 'bg-amber-100 text-amber-700',
    ADMIN: 'bg-violet-100 text-violet-700',
    SUPER_ADMIN: 'bg-rose-100 text-rose-700',
  };
  return classes[role] || 'bg-slate-100 text-slate-600';
};

const formatPhone = (phone: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `+880 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 13 && digits.startsWith('880')) {
    const local = digits.slice(3);
    return `+880 ${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return phone;
};


const loadUsers = async () => {
  loading.value = true;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    const params: any = { limit: pageSize };
    if (activeCursor) params.cursor = activeCursor;
    else params.page = meta.value.page || 1;
    if (search.value.trim()) params.search = search.value.trim();
    if (roleFilter.value) params.role = roleFilter.value;
    const res = await $fetch(`${apiBase}/admin/users`, {
      params,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = res?.data || res || {};
    users.value = data?.items || data || [];
    meta.value = data.meta || {};
  } catch (e) { console.error('Failed to load users', e); }
  finally { loading.value = false; }
};

const onPageChange = (page: number) => {
  activeCursor = null;
  meta.value = { ...meta.value, page };
  loadUsers();
};

const onCursorChange = (cursor: string | null) => {
  activeCursor = cursor;
  if (!cursor) meta.value = { ...meta.value, page: 1 };
  loadUsers();
};

watch([search, roleFilter], () => {
  activeCursor = null;
  meta.value = { ...meta.value, page: 1 };
  loadUsers();
});

const createUser = async () => {
  saving.value = true;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: form,
    });
    showCreateModal.value = false;
    form.name = ''; form.email = ''; form.password = ''; form.role = 'CUSTOMER';
    await loadUsers();
  } catch (e) { console.error('Failed to create user', e); }
  finally { saving.value = false; }
};

const updateUserRole = async (id: string, role: string) => {
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/users/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { role },
    });
    await loadUsers();
  } catch (e) { console.error('Failed to update role', e); }
};

const toggleActive = async (user: any) => {
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { isActive: !user.isActive },
    });
    await loadUsers();
  } catch (e) { console.error('Failed to toggle active', e); }
};

const unlockUser = async (id: string) => {
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/users/${id}/unlock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
    });
    await loadUsers();
  } catch (e) { console.error('Failed to unlock user', e); }
};

const resetPassword = async (id: string) => {
  const newPassword = prompt('Enter new password (min 6 characters):');
  if (!newPassword || newPassword.length < 6) return;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { password: newPassword },
    });
    alert('Password reset successfully');
  } catch (e) { console.error('Failed to reset password', e); }
};

const deleteUser = async (id: string) => {
  if (!confirm('Delete this user? This cannot be undone.')) return;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
    });
    await loadUsers();
  } catch (e) { console.error('Failed to delete user', e); }
};

onMounted(() => { loadUsers(); });
</script>
