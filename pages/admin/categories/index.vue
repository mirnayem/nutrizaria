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

    <div v-else class="space-y-4">
      <!-- Parent Categories -->
      <div v-for="parent in parentCategories" :key="parent.id" class="rounded-xl border border-slate-200 bg-white">
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center gap-3">
            <img v-if="parent.image" :src="resolve(parent.image)" :alt="parent.name" class="h-12 w-12 rounded-lg object-cover" @error="$event.target.src = '/placeholder.svg'" />
            <div v-else class="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ parent.name }}</p>
              <p class="text-xs text-slate-500">{{ parent.totalProductCount || parent._count?.products || 0 }} products</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap" :class="parent.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
              {{ parent.isActive ? 'Active' : 'Inactive' }}
            </span>
            <AdminRowActions
              :entity="parent.name"
              :actions="[
                { label: 'Add Subcategory', icon: 'plus', handler: () => openCreateModal(parent) },
                { label: 'Edit', icon: 'edit', handler: () => editCategory(parent) },
                { label: 'Delete', icon: 'delete', handler: () => confirmDelete(parent), className: 'hover:border-red-300 hover:bg-red-50 hover:text-red-600' },
              ]"
            />
          </div>
        </div>

        <!-- Subcategories -->
        <div v-if="parent.children?.length" class="border-t border-slate-100 bg-slate-50/50 p-4 pl-12">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Subcategories</p>
          <div class="space-y-2">
            <div v-for="child in parent.children" :key="child.id" class="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-200">
              <div class="flex items-center gap-3">
                <img v-if="child.image" :src="resolve(child.image)" :alt="child.name" class="h-10 w-10 rounded-lg object-cover" @error="$event.target.src = '/placeholder.svg'" />
                <div v-else class="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-900">{{ child.name }}</p>
                  <p class="text-xs text-slate-500">{{ child._count?.products || 0 }} products</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap" :class="child.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                  {{ child.isActive ? 'Active' : 'Inactive' }}
                </span>
                <AdminRowActions
                  :entity="child.name"
                  :actions="[
                    { label: 'Edit', icon: 'edit', handler: () => editCategory(child) },
                    { label: 'Delete', icon: 'delete', handler: () => confirmDelete(child), className: 'hover:border-red-300 hover:bg-red-50 hover:text-red-600' },
                  ]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppModal :isOpen="showModal" :title="editing ? 'Edit Category' : (editingParent ? 'Add Subcategory' : 'Add Category')" maxWidth="max-w-md" @handleModal="closeModal">
      <form @submit.prevent="saveCategory" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input v-model="form.name" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
        </div>
        <div v-if="!editing">
          <label class="block text-sm font-medium text-slate-700 mb-1">Parent Category</label>
          <select v-model="form.parentId" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500">
            <option value="">None (Top-level category)</option>
            <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
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
import { ref, reactive, computed, onMounted } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const token = useCookie('auth_token');
const { resolve } = useImageUrl();
const categories = ref<any[]>([]);
const loadingCategories = ref(false);
const showModal = ref(false);
const editing = ref<any>(null);
const editingParent = ref<any>(null);
const saving = ref(false);

const form = reactive({ name: '', image: '', description: '', sortOrder: 0, isActive: true, parentId: '' });
const confirmModal = reactive({
  isOpen: false, title: '', message: '', confirmText: 'Delete',
  resolve: null as ((val: boolean) => void) | null,
});

const parentCategories = computed(() => categories.value.filter((c: any) => !c.parentId));

const openCreateModal = (parent?: any) => {
  editing.value = null;
  editingParent.value = parent || null;
  resetForm();
  if (parent) {
    form.parentId = parent.id;
  }
  showModal.value = true;
};

const editCategory = (cat: any) => {
  editing.value = cat;
  editingParent.value = null;
  form.name = cat.name;
  form.image = cat.image || '';
  form.description = cat.description || '';
  form.sortOrder = cat.sortOrder || 0;
  form.isActive = cat.isActive;
  form.parentId = cat.parentId || '';
  showModal.value = true;
};

const resetForm = () => {
  form.name = ''; form.image = ''; form.description = ''; form.sortOrder = 0; form.isActive = true; form.parentId = '';
};

const closeModal = () => {
  showModal.value = false;
  editing.value = null;
  editingParent.value = null;
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
    const body = { ...form };
    if (!body.parentId) delete body.parentId;
    await $fetch(endpoint, { method, headers: { Authorization: `Bearer ${token.value}` }, body });
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
      if (c.children) {
        for (const ch of c.children) {
          if (ch.image) {
            const s = String(ch.image).trim();
            ch.image = /^https?:\/\/localhost:\d+\//.test(s) ? new URL(s).pathname : s;
          }
        }
      }
    }
    categories.value = items;
  } catch (e) { console.error('Failed to load categories', e); }
  finally { loadingCategories.value = false; }
};

onMounted(() => { loadCategories(); });
</script>
