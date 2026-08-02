<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Users</h2>
        <p class="text-sm text-slate-500">{{ users.length }} users total</p>
      </div>
      <div class="flex gap-2">
        <select v-model="roleFilter" class="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500">
          <option value="">All Roles</option>
          <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
        </select>
        <input v-model="search" type="search" placeholder="Search users..." class="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
        <button @click="showCreateModal = true" class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">Add User</button>
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
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700">
                  {{ (user.name || user.email)[0].toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-900">{{ user.name || 'No name' }}</p>
                  <p class="text-xs text-slate-500">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <select
                :value="user.role"
                @change="updateUserRole(user.id, $event.target.value)"
                class="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium outline-none focus:border-violet-500"
              >
                <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
              </select>
            </td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
              <span v-if="user.lockedUntil" class="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Locked</span>
            </td>
            <td class="px-4 py-3 text-xs text-slate-500">{{ user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never' }}</td>
            <td class="px-4 py-3 text-sm text-slate-600">{{ user._count?.orders || 0 }}</td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="toggleActive(user)" class="text-sm" :class="user.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'">
                {{ user.isActive ? 'Deactivate' : 'Activate' }}
              </button>
              <button v-if="user.lockedUntil" @click="unlockUser(user.id)" class="text-sm text-blue-600 hover:text-blue-700">Unlock</button>
              <button @click="resetPassword(user.id)" class="text-sm text-violet-600 hover:text-violet-700">Reset PW</button>
              <button @click="deleteUser(user.id)" class="text-sm text-red-600 hover:text-red-700">Delete</button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">No users found</td>
          </tr>
        </tbody>
      </table>
    </div>

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
import { ref, computed, onMounted, reactive } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const users = ref<any[]>([]);
const search = ref('');
const roleFilter = ref('');
const showCreateModal = ref(false);
const saving = ref(false);
const loading = ref(false);
const roles = ['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];

const form = reactive({ name: '', email: '', password: '', role: 'CUSTOMER' });

const filteredUsers = computed(() => {
  let result = users.value;
  if (roleFilter.value) result = result.filter(u => u.role === roleFilter.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }
  return result;
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

const loadUsers = async () => {
  loading.value = true;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    const res = await $fetch(`${apiBase}/admin/users?limit=200`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    users.value = res?.data?.items || res?.items || [];
  } catch (e) { console.error('Failed to load users', e); }
  finally { loading.value = false; }
};

onMounted(() => { loadUsers(); });
</script>
