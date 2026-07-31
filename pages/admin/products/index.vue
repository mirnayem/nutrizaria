<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Products</h2>
        <p class="text-sm text-slate-500">{{ products.length }} products total</p>
      </div>
      <div class="flex gap-2">
        <input
          v-model="search"
          type="search"
          placeholder="Search products..."
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
        <button @click="openCreateModal" class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
          Add Product
        </button>
      </div>
    </div>

    <div v-if="selectedIds.length > 0" class="flex items-center gap-3 rounded-lg bg-violet-50 px-4 py-3">
      <span class="text-sm font-medium text-violet-700">{{ selectedIds.length }} selected</span>
      <button @click="confirmBulkDelete" class="text-sm font-medium text-red-600 hover:text-red-700">Delete Selected</button>
      <button @click="bulkActivate" class="text-sm font-medium text-emerald-600 hover:text-emerald-700">Activate</button>
      <button @click="bulkDeactivate" class="text-sm font-medium text-amber-600 hover:text-amber-700">Deactivate</button>
      <button @click="selectedIds = []" class="text-sm text-slate-500 hover:text-slate-700">Clear</button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div v-if="loadingProducts" class="p-4">
        <div v-for="i in 5" :key="i" class="animate-pulse space-y-3">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-slate-200"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-3/4 rounded bg-slate-200"></div>
              <div class="h-3 w-1/2 rounded bg-slate-200"></div>
            </div>
            <div class="w-32 h-6 rounded bg-slate-200"></div>
            <div class="w-20 h-5 rounded bg-slate-200"></div>
            <div class="w-24 h-5 rounded bg-slate-200"></div>
          </div>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left"><input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="rounded border-slate-300" /></th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Product</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Price</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Stock</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-slate-50">
              <td class="px-4 py-3"><input type="checkbox" :checked="selectedIds.includes(product.id)" @change="toggleSelect(product.id)" class="rounded border-slate-300" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="resolve(product.image) || '/placeholder.svg'" :alt="product.name" class="h-10 w-10 rounded-lg object-cover" @error="$event.target.src = '/placeholder.svg'" />
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ product.name }}</p>
                    <p class="text-xs text-slate-500">{{ product.unit }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 capitalize">{{ product.category?.name || product.category }}</td>
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ currencySymbol }}{{ product.price }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ product.stock }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                  {{ product.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button @click="editProduct(product)" class="text-sm text-violet-600 hover:text-violet-700 mr-3">Edit</button>
                <button @click="confirmDelete(product)" class="text-sm text-red-600 hover:text-red-700">Delete</button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0 && !loadingProducts">
              <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">No products found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :isOpen="showModal" :title="editingProduct ? 'Edit Product' : 'Add Product'" maxWidth="max-w-lg" @handleModal="closeModal">
      <form @submit.prevent="saveProduct" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input v-model="form.name" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Price</label>
            <input v-model.number="form.price" type="number" min="0" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Unit</label>
            <input v-model="form.unit" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select v-model="form.categorySlug" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500">
            <option value="">Select category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Main Image</label>
          <ImageUploader :images="form.image ? [form.image] : []" @update:images="onMainImageUpload" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Additional Images</label>
          <ImageUploader :multiple="true" :images="form.images" @update:images="onAdditionalImagesUpload" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Stock</label>
            <input v-model.number="form.stock" type="number" min="0" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </div>
          <div class="flex items-end pb-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.isActive" type="checkbox" class="rounded border-slate-300" />
              <span class="text-sm text-slate-700">Active</span>
            </label>
          </div>
        </div>
        <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
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
      :confirmText="confirmModal.confirmText"
      variant="danger"
      @confirm="executeConfirm"
      @cancel="confirmModal.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || 'Tk';
const { resolve } = useImageUrl();

const apiBase = config.public.apiBase || 'http://localhost:4000/api';
const token = useCookie('auth_token');

const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const search = ref('');
const selectedIds = ref<string[]>([]);
const showModal = ref(false);
const editingProduct = ref<any>(null);
const saving = ref(false);
const loadingProducts = ref(false);
const saveError = ref('');

const form = reactive({
  name: '',
  price: 0,
  unit: '',
  categorySlug: '',
  image: '',
  images: [] as string[],
  description: '',
  stock: 100,
  isActive: true,
});

const confirmModal = reactive({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Delete',
  resolve: null as ((val: boolean) => void) | null,
});

const filteredProducts = computed(() => {
  if (!search.value) return products.value;
  const q = search.value.toLowerCase();
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category?.name || '').toLowerCase().includes(q)
  );
});

const allSelected = computed(() =>
  filteredProducts.value.length > 0 &&
  filteredProducts.value.every(p => selectedIds.value.includes(p.id))
);

const toggleSelect = (id: string) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx > -1) selectedIds.value.splice(idx, 1);
  else selectedIds.value.push(id);
};

const toggleSelectAll = () => {
  if (allSelected.value) selectedIds.value = [];
  else selectedIds.value = filteredProducts.value.map(p => p.id);
};

const openCreateModal = () => {
  editingProduct.value = null;
  resetForm();
  showModal.value = true;
};

const editProduct = (product: any) => {
  editingProduct.value = product;
  form.name = product.name;
  form.price = product.price;
  form.unit = product.unit;
  form.categorySlug = product.category?.slug || product.category;
  form.image = product.image || '';
  form.images = product.images || [];
  form.description = product.description || '';
  form.stock = product.stock ?? 100;
  form.isActive = product.isActive ?? true;
  showModal.value = true;
};

const resetForm = () => {
  form.name = '';
  form.price = 0;
  form.unit = '';
  form.categorySlug = '';
  form.image = '';
  form.images = [];
  form.description = '';
  form.stock = 100;
  form.isActive = true;
};

const closeModal = () => {
  showModal.value = false;
  editingProduct.value = null;
  resetForm();
};

const onMainImageUpload = (urls: string[]) => {
  form.image = urls[0] || '';
};

const onAdditionalImagesUpload = (urls: string[]) => {
  form.images = urls;
};

const saveProduct = async () => {
  saving.value = true;
  saveError.value = '';
  try {
    const payload = JSON.parse(JSON.stringify(form));
    const endpoint = editingProduct.value
      ? `${apiBase}/admin/products/${editingProduct.value.id}`
      : `${apiBase}/admin/products`;
    const method = editingProduct.value ? 'PUT' : 'POST';
    await $fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
      body: payload,
    });
    closeModal();
    await loadProducts();
  } catch (e: any) {
    saveError.value = e?.data?.message || e?.message || 'Failed to save product';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (product: any) => {
  confirmModal.title = 'Delete Product';
  confirmModal.message = `Are you sure you want to delete "${product.name}"? This action cannot be undone.`;
  confirmModal.confirmText = 'Delete';
  confirmModal.isOpen = true;
  confirmModal.resolve = async (confirmed: boolean) => {
    if (!confirmed) return;
    try {
      await $fetch(`${apiBase}/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` },
      });
      await loadProducts();
    } catch (e) {
      console.error('Failed to delete product', e);
    }
  };
};

const confirmBulkDelete = () => {
  confirmModal.title = 'Delete Products';
  confirmModal.message = `Are you sure you want to delete ${selectedIds.value.length} products? This action cannot be undone.`;
  confirmModal.confirmText = 'Delete All';
  confirmModal.isOpen = true;
  confirmModal.resolve = async (confirmed: boolean) => {
    if (!confirmed) return;
    try {
      for (const id of selectedIds.value) {
        await $fetch(`${apiBase}/admin/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token.value}` },
        });
      }
      selectedIds.value = [];
      await loadProducts();
    } catch (e) {
      console.error('Bulk delete failed', e);
    }
  };
};

const executeConfirm = () => {
  if (confirmModal.resolve) {
    confirmModal.resolve(true);
  }
  confirmModal.isOpen = false;
  confirmModal.resolve = null;
};

const bulkActivate = async () => {
  try {
    for (const id of selectedIds.value) {
      await $fetch(`${apiBase}/admin/products/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token.value}` },
        body: { isActive: true },
      });
    }
    selectedIds.value = [];
    await loadProducts();
  } catch (e) {
    console.error('Bulk activate failed', e);
  }
};

const bulkDeactivate = async () => {
  try {
    for (const id of selectedIds.value) {
      await $fetch(`${apiBase}/admin/products/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token.value}` },
        body: { isActive: false },
      });
    }
    selectedIds.value = [];
    await loadProducts();
  } catch (e) {
    console.error('Bulk deactivate failed', e);
  }
};

const loadProducts = async () => {
  loadingProducts.value = true;
  try {
    const res = await $fetch(`${apiBase}/admin/products?limit=200`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const items: any[] = res?.data?.items || res?.items || [];
    for (const p of items) {
      if (p.image) {
        const s = String(p.image).trim();
        p.image = /^https?:\/\/localhost:\d+\//.test(s) ? new URL(s).pathname : s;
      }
      if (p.images) {
        p.images = p.images.map((u: string) => {
          const s = String(u).trim();
          return /^https?:\/\/localhost:\d+\//.test(s) ? new URL(s).pathname : s;
        });
      }
    }
    products.value = items;
  } catch (e) {
    console.error('Failed to load products', e);
  } finally {
    loadingProducts.value = false;
  }
};

const loadCategories = async () => {
  try {
    const res = await $fetch(`${apiBase}/categories`);
    categories.value = res?.data || res || [];
  } catch (e) {
    console.error('Failed to load categories', e);
  }
};

onMounted(() => {
  loadProducts();
  loadCategories();
});
</script>
