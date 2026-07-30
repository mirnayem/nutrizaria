<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-slate-900">Settings</h2>

    <div class="rounded-xl border border-slate-200 bg-white p-6">
      <h3 class="text-base font-semibold text-slate-900 mb-4">General Settings</h3>
      <form @submit.prevent="saveSettings" class="space-y-4">
        <div v-for="setting in settings" :key="setting.key" class="grid grid-cols-3 gap-4 items-center">
          <label class="text-sm font-medium text-slate-700">{{ formatKey(setting.key) }}</label>
          <div class="col-span-2">
            <input
              v-if="setting.type === 'boolean'"
              type="checkbox"
              :checked="setting.value === 'true'"
              @change="setting.value = ($event.target as HTMLInputElement).checked ? 'true' : 'false'"
              class="rounded border-slate-300"
            />
            <input
              v-else-if="setting.type === 'number'"
              v-model="setting.value"
              type="number"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
            <input
              v-else
              v-model="setting.value"
              type="text"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
          </div>
        </div>
        <div class="pt-4">
          <button type="submit" class="rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6">
      <h3 class="text-base font-semibold text-slate-900 mb-4">Role Permissions</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">Permission</th>
              <th v-for="role in roles" :key="role" class="px-4 py-2 text-center text-xs font-medium uppercase text-slate-500">{{ role }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="perm in allPermissions" :key="perm">
              <td class="px-4 py-2 text-sm text-slate-700">{{ formatKey(perm) }}</td>
              <td v-for="role in roles" :key="role" class="px-4 py-2 text-center">
                <span v-if="rolePermissions[role]?.includes(perm)" class="text-emerald-600">&#10003;</span>
                <span v-else class="text-slate-300">&mdash;</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const settings = ref<any[]>([]);
const saving = ref(false);
const roles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'];
const allPermissions = [
  'VIEW_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_CATEGORIES', 'MANAGE_ORDERS',
  'MANAGE_USERS', 'MANAGE_BLOGS', 'MANAGE_FAQS', 'MANAGE_SETTINGS',
  'VIEW_REPORTS', 'VIEW_ACTIVITY_LOGS', 'MANAGE_ROLES', 'BULK_OPERATIONS'
];
const rolePermissions = ref<Record<string, string[]>>({});

const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const saveSettings = async () => {
  saving.value = true;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/settings/bulk`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { settings: settings.value.map(s => ({ key: s.key, value: s.value, type: s.type })) },
    });
    alert('Settings saved successfully');
  } catch (e) { console.error('Failed to save settings', e); }
  finally { saving.value = false; }
};

const loadSettings = async () => {
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    const res = await $fetch(`${apiBase}/admin/settings`, { headers: { Authorization: `Bearer ${token.value}` } });
    settings.value = res?.data || res || [];
  } catch (e) { console.error('Failed to load settings', e); }
};

const loadPermissions = async () => {
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    const res = await $fetch(`${apiBase}/admin/permissions`, { headers: { Authorization: `Bearer ${token.value}` } });
    const data = res?.data || res || [];
    for (const item of data) {
      rolePermissions.value[item.role] = item.permissions;
    }
  } catch (e) { console.error('Failed to load permissions', e); }
};

onMounted(() => { loadSettings(); loadPermissions(); });
</script>
