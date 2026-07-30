<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900">Categories</h2>
      <button @click="openCreateModal" class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">Add Category</button>
    </div>

    <div v-if="loadingCategories" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <div v-for="cat in categories" :key="cat.id" class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <img v-if="cat.image" :src="cat.image" :alt="cat.name" class="h-12 w-12 rounded-lg object-cover" @error="$event.target.src = '/placeholder.svg'" />
            <div v-else class="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ cat.name }}</p>
              <p class="text-xs text-slate-500">{{ cat._count?.products || 0 }} products</p>
            </div>
          </div>
          <span class="rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap" :class="cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
            {{ cat.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="mt-4 flex gap-2">
          <button @click="editCategory(cat)" class="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
          <button @click="confirmDelete(cat)" class="flex-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>
    </div>

    <AppModal :isOpen="showModal" :title="editing ? 'Edit Category' : 'Add Category'" maxWidth="max-w-md" @handleModal="closeModal">
      <form @submit.prevent="saveCategory" class="space-y-4">
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
const categories = ref<any[]>([]);
const loadingCategories = ref(false);
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

const editCategory = (cat: any) => {
  editing.value = cat;
  form.name = cat.name;
  form.image = cat.image || '';
  form.description = cat.description || '';
  form.sortOrder = cat.sortOrder || 0;
  form.isActive = cat.isActive;
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

const saveCategory = async () => {
  saving.value = true;
  try {
    const endpoint = editing.value ? `${apiBase}/admin/categories/${editing.value.id}` : `${apiBase}/admin/categories`;
    const method = editing.value ? 'PUT' : 'POST';
    await $fetch(endpoint, { method, headers: { Authorization: `Bearer ${token.value}` }, body: form });
    closeModal();
    await loadCategories();
  } catch (e) { console.error('Failed to save category', e); }
  finally { saving.value = false; }
};

const confirmDelete = (cat: any) => {
  confirmModal.title = 'Delete Category';
  confirmModal.message = `Are you sure you want to delete "${cat.name}"? Products in this category may become uncategorized.`;
  confirmModal.confirmText = 'Delete';
  confirmModal.isOpen = true;
  confirmModal.resolve = async (confirmed: boolean) => {
    if (!confirmed) return;
    try {
      await $fetch(`${apiBase}/admin/categories/${cat.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` } });
      await loadCategories();
    } catch (e) { console.error('Failed to delete category', e); }
  };
};

const executeConfirm = () => {
  if (confirmModal.resolve) confirmModal.resolve(true);
  confirmModal.isOpen = false;
  confirmModal.resolve = null;
};

const loadCategories = async () => {
  loadingCategories.value = true;
  try {
    const res = await $fetch(`${apiBase}/admin/categories`, { headers: { Authorization: `Bearer ${token.value}` } });
    const items: any[] = res?.data || res || [];
    for (const c of items) {
      if (c.image) {
        const s = String(c.image).trim();
        c.image = /^https?:\/\/localhost:\d+\//.test(s) ? new URL(s).pathname : s;
      }
    }
    categories.value = items;
  } catch (e) { console.error('Failed to load categories', e); }
  finally { loadingCategories.value = false; }
};

onMounted(() => { loadCategories(); });
</script>
