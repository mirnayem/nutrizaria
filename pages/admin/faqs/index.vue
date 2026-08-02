<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900">FAQs</h2>
      <button @click="showModal = true" class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">Add FAQ</button>
    </div>

    <div v-if="loading" aria-label="Loading FAQs">
      <SkeletonRows :count="6" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="faq in faqs" :key="faq.id" class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-900">{{ faq.question }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ faq.answer }}</p>
          </div>
          <div class="ml-4 flex gap-2">
            <button @click="editFaq(faq)" class="text-sm text-violet-600 hover:text-violet-700">Edit</button>
            <button @click="deleteFaq(faq.id)" class="text-sm text-red-600 hover:text-red-700">Delete</button>
          </div>
        </div>
      </div>
      <p v-if="faqs.length === 0" class="text-center text-sm text-slate-500 py-8">No FAQs yet</p>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-slate-900">{{ editing ? 'Edit FAQ' : 'Add FAQ' }}</h3>
        <form @submit.prevent="saveFaq" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Question</label>
            <input v-model="form.question" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Answer</label>
            <textarea v-model="form.answer" rows="4" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
            <input v-model.number="form.sortOrder" type="number" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.isActive" type="checkbox" class="rounded border-slate-300" />
            <span class="text-sm text-slate-700">Active</span>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button type="button" @click="closeModal" class="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();
const faqs = ref<any[]>([]);
const showModal = ref(false);
const editing = ref<any>(null);
const saving = ref(false);
const loading = ref(false);

const form = reactive({ question: '', answer: '', sortOrder: 0, isActive: true });

const editFaq = (faq: any) => {
  editing.value = faq;
  form.question = faq.question;
  form.answer = faq.answer;
  form.sortOrder = faq.sortOrder || 0;
  form.isActive = faq.isActive;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editing.value = null;
  form.question = ''; form.answer = ''; form.sortOrder = 0; form.isActive = true;
};

const saveFaq = async () => {
  saving.value = true;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    const endpoint = editing.value ? `${apiBase}/admin/faqs/${editing.value.id}` : `${apiBase}/admin/faqs`;
    const method = editing.value ? 'PUT' : 'POST';
    await $fetch(endpoint, { method, headers: { Authorization: `Bearer ${token.value}` }, body: form });
    closeModal();
    await loadFaqs();
  } catch (e) { console.error('Failed to save FAQ', e); }
  finally { saving.value = false; }
};

const deleteFaq = async (id: string) => {
  if (!confirm('Delete this FAQ?')) return;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    await $fetch(`${apiBase}/admin/faqs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` } });
    await loadFaqs();
  } catch (e) { console.error('Failed to delete FAQ', e); }
};

const loadFaqs = async () => {
  loading.value = true;
  try {
    const apiBase = config.public.apiBase;
    const token = useCookie('auth_token');
    const res = await $fetch(`${apiBase}/admin/faqs`, { headers: { Authorization: `Bearer ${token.value}` } });
    faqs.value = res?.data || res || [];
  } catch (e) { console.error('Failed to load FAQs', e); }
  finally { loading.value = false; }
};

onMounted(() => { loadFaqs(); });
</script>
