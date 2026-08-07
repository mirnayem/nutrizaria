<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Products</h2>
        <p class="text-sm text-slate-500">{{ meta.total ?? products.length }} products total</p>
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
                    <p class="text-sm font-medium text-slate-900">
                      {{ product.name }}
                      <span v-if="product.variants?.length > 0" class="ml-1 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">Variant</span>
                    </p>
                    <p class="text-xs text-slate-500">{{ product.brand?.name }}{{ product.brand?.name && product.unit ? ' • ' : '' }}{{ product.unit }}</p>
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
              <td class="px-4 py-3">
                <AdminRowActions
                  :entity="product.name"
                  :actions="[
                    { label: 'Edit', icon: 'edit', handler: () => editProduct(product) },
                    { label: 'Delete', icon: 'delete', handler: () => confirmDelete(product), className: 'hover:border-red-300 hover:bg-red-50 hover:text-red-600' },
                  ]"
                />
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0 && !loadingProducts">
              <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">No products found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminPagination
      :meta="meta"
      :loading="loadingProducts"
      :page-size="pageSize"
      @page="onPageChange"
      @cursor="onCursorChange"
    />

    <AppModal :isOpen="showModal" :title="editingProduct ? 'Edit Product' : 'Add Product'" maxWidth="max-w-6xl" @handleModal="closeModal">
      <form @submit.prevent="saveProduct" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input v-model="form.name" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Slug</label>
          <input v-model="form.slug" type="text" placeholder="auto-generated from name" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          <p class="mt-1 text-xs text-slate-500">Used in the product URL. Leave empty to auto-generate.</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Product Type</label>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              @click="productType = 'single'"
              class="rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition"
              :class="productType === 'single' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
            >
              <span class="flex items-center gap-2">
                <span class="flex h-4 w-4 items-center justify-center rounded-full border" :class="productType === 'single' ? 'border-violet-600' : 'border-slate-300'">
                  <span v-if="productType === 'single'" class="h-2 w-2 rounded-full bg-violet-600"></span>
                </span>
                Non-variant product
              </span>
              <span class="mt-1 block text-xs font-normal text-slate-500">Own price, unit and images</span>
            </button>
            <button
              type="button"
              @click="productType = 'variant'"
              class="rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition"
              :class="productType === 'variant' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
            >
              <span class="flex items-center gap-2">
                <span class="flex h-4 w-4 items-center justify-center rounded-full border" :class="productType === 'variant' ? 'border-violet-600' : 'border-slate-300'">
                  <span v-if="productType === 'variant'" class="h-2 w-2 rounded-full bg-violet-600"></span>
                </span>
                Variant product
              </span>
              <span class="mt-1 block text-xs font-normal text-slate-500">Price, unit and images set per variant</span>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Brand <span class="font-normal text-slate-400">(optional)</span></label>
          <select v-model="form.brandSlug" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500">
            <option value="">No brand</option>
            <option v-for="b in brands" :key="b.id" :value="b.slug">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-slate-500 mb-1">Parent Category</label>
              <select v-model="selectedParentCategory" @change="onParentCategoryChange" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500">
                <option value="">Select parent</option>
                <option v-for="cat in parentCategories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Subcategory (optional)</label>
              <select v-model="form.categorySlug" :disabled="!selectedParentCategory" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50 disabled:text-slate-400">
                <option value="">{{ selectedParentCategory ? 'Select subcategory' : 'Select parent first' }}</option>
                <option v-for="sub in availableSubcategories" :key="sub.id" :value="sub.slug">{{ sub.name }}</option>
              </select>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">Choose a parent category, then optionally select a subcategory. If no subcategory, the product goes to the parent.</p>
        </div>
        <template v-if="productType === 'single'">
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
          <label class="block text-sm font-medium text-slate-700 mb-1">Main Image</label>
          <ImageUploader :images="form.image ? [form.image] : []" @update:images="onMainImageUpload" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Additional Images</label>
          <ImageUploader :multiple="true" :images="form.images" @update:images="onAdditionalImagesUpload" />
        </div>
        </template>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="productType === 'single'">
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

        <div v-if="productType === 'variant'" class="border-t border-slate-200 pt-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-medium text-slate-900">Product Variants</h3>
              <p class="text-xs text-slate-500 mt-0.5">Each variant holds its own price, weight, stock and image.</p>
            </div>
            <button type="button" @click="addVariant" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Variant
            </button>
          </div>
          
          <div v-if="form.variants.length === 0" class="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <div class="mx-auto w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p class="text-sm font-medium text-slate-700">No variants added yet</p>
            <p class="mt-1 text-xs text-slate-500">Add at least one variant with a weight, unit and price to save.</p>
            <button type="button" @click="addVariant" class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add First Variant
            </button>
          </div>
          
          <div v-else class="space-y-4">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200">
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">#</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Image</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Label</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Weight *</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Unit *</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Price *</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Compare Price</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Sort Order</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Active</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(variant, index) in form.variants" :key="variant.id || index" class="hover:bg-slate-50">
                    <td class="px-3 py-2 font-medium text-slate-700">{{ index + 1 }}</td>
                    <td class="px-3 py-2">
                      <ImageUploader :images="variant.image ? [variant.image] : []" @update:images="urls => variant.image = urls[0] || ''" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model="variant.label" type="text" placeholder="Optional — e.g., 250g" class="w-full max-w-xs rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                    </td>
                    <td class="px-3 py-2">
                      <div class="flex items-center gap-1">
                        <input v-model.number="variant.weight" type="number" min="0" step="0.01" required class="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                        <select v-model="variant.unit" class="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                          <option value="pcs">pcs</option>
                        </select>
                      </div>
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="variant.price" type="number" min="0" step="0.01" required class="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="variant.comparePrice" type="number" min="0" step="0.01" class="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" placeholder="Optional" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="variant.stock" type="number" min="0" class="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model="variant.sku" type="text" class="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" placeholder="Optional" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="variant.sortOrder" type="number" min="0" class="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                    </td>
                    <td class="px-3 py-2">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="variant.isActive" type="checkbox" class="rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                        <span class="text-xs text-slate-600">Active</span>
                      </label>
                    </td>
                    <td class="px-3 py-2">
                      <button type="button" @click="removeVariant(index)" class="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        <span class="hidden sm:inline">Remove</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="flex items-center gap-2 pt-4 border-t border-slate-200">
              <span class="text-xs text-slate-500 flex-1">* Required fields</span>
              <button type="button" @click="addVariant" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Another Variant
              </button>
            </div>
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
import { ref, computed, onMounted, reactive, watch } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const currencySymbol = config.public.currencySymbol || 'Tk';
const { resolve } = useImageUrl();

const apiBase = config.public.apiBase || 'http://localhost:4000/api';
const token = useCookie('auth_token');

const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const brands = ref<any[]>([]);
const search = ref('');
const selectedIds = ref<string[]>([]);
const showModal = ref(false);
const editingProduct = ref<any>(null);
const saving = ref(false);
const loadingProducts = ref(false);
const saveError = ref('');
const productType = ref<'single' | 'variant'>('single');
const pageSize = 20;
const meta = ref<any>({});
const selectedParentCategory = ref('');
let activeCursor: string | null = null;

const form = reactive({
  name: '',
  slug: '',
  brandSlug: '',
  price: 0,
  unit: '',
  categorySlug: '',
  image: '',
  images: [] as string[],
  description: '',
  stock: 100,
  isActive: true,
  variants: [] as any[],
});

const confirmModal = reactive({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Delete',
  resolve: null as ((val: boolean) => void) | null,
});

const slugify = (str: string): string =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'product';

watch(
  () => form.name,
  (name) => {
    if (!form.slug.trim()) form.slug = slugify(name);
  }
);

const parentCategories = computed(() => categories.value.filter((c: any) => !c.parentId));

const availableSubcategories = computed(() => {
  if (!selectedParentCategory.value) return [];
  const parent = categories.value.find((c: any) => c.slug === selectedParentCategory.value);
  return parent?.children || [];
});

const onParentCategoryChange = () => {
  form.categorySlug = '';
  if (!selectedParentCategory.value) return;
  const parent = categories.value.find((c: any) => c.slug === selectedParentCategory.value);
  if (parent && !parent.children?.length) {
    form.categorySlug = parent.slug;
  }
};

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
  productType.value = 'single';
  resetForm();
  selectedParentCategory.value = '';
  showModal.value = true;
};

const editProduct = (product: any) => {
  editingProduct.value = product;
  productType.value = (product.variants && product.variants.length > 0) ? 'variant' : 'single';
  form.name = product.name;
  form.slug = product.slug || '';
  form.brandSlug = product.brand?.slug || '';
  form.price = product.price;
  form.unit = product.unit;
  const catSlug = product.category?.slug || product.category;
  const cat = categories.value.find((c: any) => c.slug === catSlug);
  if (cat?.parentId) {
    const parent = categories.value.find((c: any) => c.id === cat.parentId);
    selectedParentCategory.value = parent?.slug || '';
    form.categorySlug = catSlug;
  } else {
    selectedParentCategory.value = catSlug;
    form.categorySlug = cat?.children?.length ? '' : catSlug;
  }
  form.image = product.image || '';
  form.images = product.images || [];
  form.description = product.description || '';
  form.stock = product.stock ?? 100;
  form.isActive = product.isActive ?? true;
  form.variants = (product.variants || []).map((v: any) => ({
    id: v.id,
    label: v.label,
    weight: v.weight,
    unit: v.unit,
    price: v.price,
    comparePrice: v.comparePrice,
    stock: v.stock,
    sku: v.sku,
    image: v.image,
    sortOrder: v.sortOrder,
    isActive: v.isActive ?? true,
  }));
  showModal.value = true;
};

const addVariant = () => {
  form.variants.push({
    label: '',
    weight: 0,
    unit: 'g',
    price: 0,
    comparePrice: undefined,
    stock: 0,
    sku: '',
    image: '',
    sortOrder: form.variants.length,
    isActive: true,
    _isNew: true, // flag to track new variants
  });
};

const removeVariant = (index: number) => {
  form.variants.splice(index, 1);
  // Re-index sortOrder
  form.variants.forEach((v, i) => { v.sortOrder = i; });
};

const resetForm = () => {
  form.name = '';
  form.slug = '';
  form.brandSlug = '';
  form.price = 0;
  form.unit = '';
  form.categorySlug = '';
  form.image = '';
  form.images = [];
  form.description = '';
  form.stock = 100;
  form.isActive = true;
  form.variants = [];
  selectedParentCategory.value = '';
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
    // Filter variants to only include valid ones with required fields
    const validVariants = (form.variants || [])
      .filter((v: any) => v.weight > 0 && v.unit?.trim() && v.price > 0)
      .map((v: any, index: number) => ({
        label: v.label?.trim() || undefined,
        weight: v.weight,
        unit: v.unit,
        price: v.price,
        comparePrice: v.comparePrice && v.comparePrice > 0 ? v.comparePrice : undefined,
        stock: v.stock || 0,
        sku: v.sku?.trim() || undefined,
        image: v.image?.trim() || undefined,
        sortOrder: v.sortOrder ?? index,
      }));

    const payload: any = JSON.parse(JSON.stringify({ ...form }));

    if (productType.value === 'variant') {
      if (validVariants.length === 0) {
        saveError.value = 'Add at least one complete variant (weight, unit and price).';
        saving.value = false;
        return;
      }
      // Variant product: derive display fields from the cheapest variant so the
      // storefront cards and listings keep working.
      const sorted = [...validVariants].sort((a, b) => a.price - b.price);
      const cheapest = sorted[0];
      const variantImgs = validVariants.map((v: any) => v.image).filter(Boolean);
      payload.price = cheapest.price;
      payload.unit = cheapest.unit;
      payload.image = cheapest.image || variantImgs[0] || '';
      payload.images = variantImgs;
      payload.stock = validVariants.reduce((s: number, v: any) => s + (v.stock || 0), 0);
      payload.variants = validVariants;
    } else {
      // Non-variant product: no variants allowed (removes any existing ones).
      payload.variants = [];
    }

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
    const params: any = { limit: pageSize };
    if (activeCursor) params.cursor = activeCursor;
    else params.page = meta.value.page || 1;
    if (search.value.trim()) params.search = search.value.trim();

    const res = await $fetch(`${apiBase}/admin/products`, {
      params,
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = res?.data || res || {};
    const items: any[] = data?.items || data || [];
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
    meta.value = data.meta || {};
    selectedIds.value = [];
  } catch (e) {
    console.error('Failed to load products', e);
  } finally {
    loadingProducts.value = false;
  }
};

const onPageChange = (page: number) => {
  activeCursor = null;
  meta.value = { ...meta.value, page };
  loadProducts();
};

const onCursorChange = (cursor: string | null) => {
  activeCursor = cursor;
  if (!cursor) meta.value = { ...meta.value, page: 1 };
  loadProducts();
};

watch(search, () => {
  activeCursor = null;
  meta.value = { ...meta.value, page: 1 };
  loadProducts();
});

const loadCategories = async () => {
  try {
    const res = await $fetch(`${apiBase}/categories`);
    categories.value = res?.data || res || [];
  } catch (e) {
    console.error('Failed to load categories', e);
  }
};

const loadBrands = async () => {
  try {
    const res = await $fetch(`${apiBase}/brands`);
    brands.value = res?.data || res || [];
  } catch (e) {
    console.error('Failed to load brands', e);
  }
};

onMounted(() => {
  loadProducts();
  loadCategories();
  loadBrands();
});
</script>
