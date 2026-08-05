<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900">Brands</h2>
      <button @click="openCreateModal" class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">Add Brand</button>
    </div>

    <div v-if="loadingBrands" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-lg bg-slate-200"></div>
            <div class="space-y-2">
              <div class="h-4 w-24 rounded bg-slate-200"></div>
              <div class="h-3 w-16 rounded bg-slate-200"></div>
            </div>
          </div>
          <div class="h-5 w-16 rounded-full bg-slate-200"></div>
        </div>
        <div class="mt-4 flex gap-2">
          <div class="h-8 flex-1 rounded-lg bg-slate-200"></div>
          <div class="h-8 flex-1 rounded-lg bg-slate-200"></div>
        </div>
      </div>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="brand in brands" :key="brand.id" class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <img v-if="brand.image" :src="resolve(brand.image)" :alt="brand.name" class="h-12 w-12 rounded-lg object-cover" @error="$event.target.src = '/placeholder.svg'" />
            <div v-else class="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ brand.name }}</p>
              <p class="text-xs text-slate-500">{{ brand._count?.products || 0 }} products</p>
            </div>
          </div>
          <span class="rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap" :class="brand.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
            {{ brand.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="mt-4 border-t border-slate-100 pt-3 flex justify-end">
          <AdminRowActions
            :entity="brand.name"
            :actions="[
              { label: 'Edit', icon: 'edit', handler: () => editBrand(brand) },
              { label: 'Delete', icon: 'delete', handler: () => confirmDelete(brand), className: 'hover:border-red-300 hover:bg-red-50 hover:text-red-600' },
            ]"
          />
        </div>
      </div>
    </div>

    <AppModal :isOpen="showModal" :title="editing ? 'Edit Brand' : 'Add Brand'" maxWidth="max-w-md" @handleModal="closeModal">
      <form @submit.prevent="saveBrand" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input v-model="form.name" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Image</label>
          <ImageUploader :images="form.image ? [form.image] : []" @update:images="onImageUpload" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="2" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
          <input v-model.number="form.sortOrder" type="number" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.isActive" type="checkbox" class="rounded border-slate-300" />
          <span class="text-sm text-slate-700">Active</span>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="submit" class="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" @click="closeModal" class="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
        </div>
      </form>
    </AppModal>

    <AppConfirmModal
      :isOpen="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      confirmText="Delete"
      variant="danger"
      @confirm="executeConfirm"
      @cancel="confirmModal.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const token = useCookie('auth_token');
const { resolve } = useImageUrl();
const brands = ref<any[]>([]);
const loadingBrands = ref(false);
const showModal = ref(false);
const editing = ref<any>(null);
const saving = ref(false);

const form = reactive({ name: '', image: '', description: '', sortOrder: 0, isActive: true });
const confirmModal = reactive({
  isOpen: false, title: '', message: '', confirmText: 'Delete',
  resolve: null as ((val: boolean) => void) | null,
});

const openCreateModal = () => {
  editing.value = null;
  resetForm();
  showModal.value = true;
};

const editBrand = (brand: any) => {
  editing.value = brand;
  form.name = brand.name;
  form.image = brand.image || '';
  form.description = brand.description || '';
  form.sortOrder = brand.sortOrder || 0;
  form.isActive = brand.isActive;
  showModal.value = true;
};

const resetForm = () => {
  form.name = ''; form.image = ''; form.description = ''; form.sortOrder = 0; form.isActive = true;
};

const closeModal = () => {
  showModal.value = false;
  editing.value = null;
  resetForm();
};

const onImageUpload = (urls: string[]) => {
  form.image = urls[0] || '';
};

const saveBrand = async () => {
  saving.value = true;
  try {
    const endpoint = editing.value ? `${apiBase}/admin/brands/${editing.value.id}` : `${apiBase}/admin/brands`;
    const method = editing.value ? 'PUT' : 'POST';
    await $fetch(endpoint, { method, headers: { Authorization: `Bearer ${token.value}` }, body: form });
    closeModal();
    await loadBrands();
  } catch (e) { console.error('Failed to save brand', e); }
  finally { saving.value = false; }
};

const confirmDelete = (brand: any) => {
  confirmModal.title = 'Delete Brand';
  confirmModal.message = `Are you sure you want to delete "${brand.name}"? Products in this brand will have their brand removed.`;
  confirmModal.confirmText = 'Delete';
  confirmModal.isOpen = true;
  confirmModal.resolve = async (confirmed: boolean) => {
    if (!confirmed) return;
    try {
      await $fetch(`${apiBase}/admin/brands/${brand.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` } });
      await loadBrands();
    } catch (e) { console.error('Failed to delete brand', e); }
  };
};

const executeConfirm = () => {
  if (confirmModal.resolve) confirmModal.resolve(true);
  confirmModal.isOpen = false;
  confirmModal.resolve = null;
};

const loadBrands = async () => {
  loadingBrands.value = true;
  try {
    const res = await $fetch(`${apiBase}/admin/brands`, { headers: { Authorization: `Bearer ${token.value}` } });
    const items: any[] = res?.data || res || [];
    for (const b of items) {
      if (b.image) {
        const s = String(b.image).trim();
        b.image = /^https?:\/\/localhost:\d+\//.test(s) ? new URL(s).pathname : s;
      }
    }
    brands.value = items;
  } catch (e) { console.error('Failed to load brands', e); }
  finally { loadingBrands.value = false; }
};

onMounted(() => { loadBrands(); });
</script>
