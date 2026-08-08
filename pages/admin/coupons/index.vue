<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Coupons &amp; Promo Codes</h2>
        <p class="text-sm text-slate-500">Fixed or percentage discounts applied at checkout.</p>
      </div>
      <button @click="openCreateModal" class="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
        Add Coupon
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <SkeletonRows :count="6" />
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3 font-semibold">Code</th>
            <th class="px-4 py-3 font-semibold">Discount</th>
            <th class="px-4 py-3 font-semibold">Validity</th>
            <th class="px-4 py-3 font-semibold">Uses</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-slate-50/60">
            <td class="px-4 py-3">
              <p class="font-semibold text-slate-900">{{ coupon.code }}</p>
              <p v-if="coupon.description" class="max-w-[220px] truncate text-xs text-slate-500">
                {{ coupon.description }}
              </p>
              <p v-if="coupon.minSubtotal" class="text-xs text-slate-400">
                Min {{ currencySymbol }}{{ coupon.minSubtotal }}
              </p>
            </td>
            <td class="px-4 py-3">
              <span class="font-medium text-emerald-700">
                {{ coupon.type === "PERCENTAGE" ? coupon.value + "%" : currencySymbol + coupon.value }}
              </span>
              <span class="ml-1 text-xs text-slate-400">{{ coupon.type === "PERCENTAGE" ? "off" : "off" }}</span>
            </td>
            <td class="px-4 py-3 text-xs text-slate-600">
              <template v-if="coupon.validFrom || coupon.validUntil">
                <p v-if="coupon.validFrom">{{ formatDateTime(coupon.validFrom) }}</p>
                <p v-if="coupon.validUntil">to {{ formatDateTime(coupon.validUntil) }}</p>
              </template>
              <span v-else class="text-slate-400">No expiry</span>
            </td>
            <td class="px-4 py-3 text-xs text-slate-600">
              {{ coupon.usageCount }}
              <span v-if="coupon.maxUses" class="text-slate-400">/ {{ coupon.maxUses }}</span>
              <span v-else class="text-slate-400">/ unlimited</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium"
                :class="
                  coupon.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                "
              >
                {{ coupon.isActive ? "Active" : "Inactive" }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <AdminRowActions
                :entity="coupon.code"
                :actions="[
                  { label: 'Edit', icon: 'edit', handler: () => editCoupon(coupon) },
                  { label: coupon.isActive ? 'Disable' : 'Activate', icon: 'toggle', handler: () => toggleActive(coupon) },
                  { label: 'Delete', icon: 'delete', handler: () => deleteCoupon(coupon.id), className: 'hover:border-red-300 hover:bg-red-50 hover:text-red-600' },
                ]"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="coupons.length === 0" class="px-4 py-10 text-center text-sm text-slate-500">
        No coupons yet. Click "Add Coupon" to create your first promo code.
      </p>
    </div>

    <div v-if="formError" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ formError }}
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ editing ? `Edit coupon: ${editing.code}` : "Add Coupon" }}
        </h3>
        <form @submit.prevent="saveCoupon" class="mt-4 space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Code *</label>
              <input
                v-model="form.code"
                type="text"
                required
                placeholder="e.g. WELCOME10"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Type *</label>
              <select
                v-model="form.type"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
              >
                <option value="FIXED">Fixed amount</option>
                <option value="PERCENTAGE">Percentage %</option>
              </select>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                Value * <span class="font-normal text-slate-400">({{ form.type === "PERCENTAGE" ? "%" : currencySymbol }})</span>
              </label>
              <input
                v-model.number="form.value"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Min. subtotal (optional)</label>
              <input
                v-model.number="form.minSubtotal"
                type="number"
                min="0"
                step="0.01"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Valid from (optional)</label>
              <input
                v-model="form.validFrom"
                type="datetime-local"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Valid until (optional)</label>
              <input
                v-model="form.validUntil"
                type="datetime-local"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Max uses (optional, leave empty for unlimited)</label>
            <input
              v-model.number="form.maxUses"
              type="number"
              min="1"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input
              v-model="form.description"
              type="text"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div class="flex items-center gap-2">
            <input v-model="form.isActive" type="checkbox" class="rounded border-slate-300" />
            <span class="text-sm text-slate-700">Active</span>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              :disabled="saving"
            >
              {{ saving ? "Saving..." : "Save" }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { Coupon } from "~/types/product";

definePageMeta({ layout: "admin" });

const coupons = ref<Coupon[]>([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editing = ref<Coupon | null>(null);
const formError = ref("");
const currencySymbol = useRuntimeConfig().public.currencySymbol || "Tk";

const form = reactive({
  code: "",
  type: "FIXED" as "FIXED" | "PERCENTAGE",
  value: 0 as number,
  minSubtotal: null as number | null,
  validFrom: "",
  validUntil: "",
  maxUses: null as number | null,
  description: "",
  isActive: true,
});

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const toLocalInput = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const openCreateModal = () => {
  editing.value = null;
  formError.value = "";
  form.code = "";
  form.type = "FIXED";
  form.value = 0;
  form.minSubtotal = null;
  form.validFrom = "";
  form.validUntil = "";
  form.maxUses = null;
  form.description = "";
  form.isActive = true;
  showModal.value = true;
};

const editCoupon = (coupon: Coupon) => {
  editing.value = coupon;
  formError.value = "";
  form.code = coupon.code;
  form.type = coupon.type;
  form.value = coupon.value;
  form.minSubtotal = coupon.minSubtotal ?? null;
  form.validFrom = toLocalInput(coupon.validFrom);
  form.validUntil = toLocalInput(coupon.validUntil);
  form.maxUses = coupon.maxUses ?? null;
  form.description = coupon.description || "";
  form.isActive = coupon.isActive;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editing.value = null;
};

const saveCoupon = async () => {
  formError.value = "";
  saving.value = true;
  const body: any = {
    type: form.type,
    value: form.value,
    minSubtotal: form.minSubtotal ?? undefined,
    validFrom: form.validFrom || undefined,
    validUntil: form.validUntil || undefined,
    maxUses: form.maxUses ?? undefined,
    description: form.description || undefined,
    isActive: form.isActive,
  };
  if (!editing.value) body.code = form.code;
  else if (form.code !== editing.value.code) body.code = form.code;

  try {
    if (editing.value) await useAdminApi().updateCoupon(editing.value.id, body);
    else await useAdminApi().createCoupon(body);
    closeModal();
    await loadCoupons();
  } catch (error: any) {
    formError.value = error?.data?.message || "Failed to save coupon. Please try again.";
  } finally {
    saving.value = false;
  }
};

const toggleActive = async (coupon: Coupon) => {
  try {
    await useAdminApi().updateCoupon(coupon.id, { isActive: !coupon.isActive });
    await loadCoupons();
  } catch (error: any) {
    formError.value = error?.data?.message || "Failed to update coupon.";
  }
};

const deleteCoupon = async (id: string) => {
  if (!confirm("Delete this coupon?")) return;
  try {
    await useAdminApi().deleteCoupon(id);
    await loadCoupons();
  } catch (error: any) {
    formError.value = error?.data?.message || "Failed to delete coupon.";
  }
};

const loadCoupons = async () => {
  loading.value = true;
  try {
    const res = await useAdminApi().getCoupons();
    coupons.value = res?.data || res || [];
  } catch (error: any) {
    formError.value = error?.data?.message || "Failed to load coupons.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadCoupons);
</script>