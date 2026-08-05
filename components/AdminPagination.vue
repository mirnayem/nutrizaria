<template>
  <nav v-if="visible" class="flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label="Pagination">
    <p class="text-sm text-slate-500">
      <span class="font-medium text-slate-700">{{ rangeLabel }}</span>
      <template v-if="total"> of {{ total }} </template>
    </p>

    <div class="flex items-center gap-1.5">
      <button
        type="button"
        class="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!hasPrev"
        :aria-label="'Previous page'"
        @click="goPrev"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        <span class="hidden sm:inline">Prev</span>
      </button>

      <button
        v-for="number in pageNumbers"
        :key="number"
        type="button"
        class="hidden h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition sm:inline-flex"
        :class="
          number === current
            ? 'bg-violet-600 text-white shadow-sm'
            : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
        "
        :aria-label="`Page ${number}`"
        :aria-current="number === current ? 'page' : undefined"
        @click="goPage(number)"
      >
        {{ number }}
      </button>

      <span v-if="truncated" class="hidden px-1 text-sm text-slate-400 sm:inline">…</span>

      <button
        type="button"
        class="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!hasNext"
        :aria-label="'Next page'"
        @click="goNext"
      >
        <span class="hidden sm:inline">Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface PaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  prevCursor?: string | null;
}

const props = withDefaults(
  defineProps<{
    meta: PaginationMeta;
    mode?: "auto" | "offset" | "cursor";
    loading?: boolean;
    pageSize?: number;
  }>(),
  {
    mode: "auto",
    loading: false,
    pageSize: 10,
  }
);

const emit = defineEmits<{
  page: [page: number];
  cursor: [cursor: string | null];
}>();

const activeMode = computed<"offset" | "cursor">(() => {
  if (props.mode !== "auto") return props.mode;
  return props.meta?.total !== undefined && props.meta?.totalPages !== undefined
    ? "offset"
    : "cursor";
});

const total = computed(() => props.meta?.total ?? 0);
const totalPages = computed(() => props.meta?.totalPages ?? 1);
const current = computed(() => props.meta?.page ?? 1);
const limit = computed(() => props.meta?.limit ?? props.pageSize);

const hasNext = computed(() => {
  if (activeMode.value === "cursor") return !!props.meta?.hasMore;
  return current.value < totalPages.value;
});

const hasPrev = computed(() => {
  if (activeMode.value === "cursor") return !!props.meta?.prevCursor;
  return current.value > 1;
});

const visible = computed(() => {
  if (props.loading) return false;
  return total.value > 0 || !!props.meta?.hasMore;
});

const rangeLabel = computed(() => {
  const start = total.value === 0 ? 0 : (current.value - 1) * limit.value + 1;
  const end = Math.min(current.value * limit.value, total.value || limit.value);
  return `${start}–${end}`;
});

const windowSize = 2;
const truncated = computed(() => totalPages.value > windowSize * 2 + 1);

const pageNumbers = computed<number[]>(() => {
  if (activeMode.value === "cursor") return [];
  const totalPg = Math.max(1, totalPages.value);
  if (!truncated.value) {
    return Array.from({ length: totalPg }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPg, current.value]);
  for (let i = 1; i <= windowSize; i++) {
    pages.add(current.value - i);
    pages.add(current.value + i);
  }
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPg)
    .sort((a, b) => a - b);
});

const goPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === current.value || props.loading) return;
  emit("page", page);
};

const goPrev = () => {
  if (props.loading) return;
  if (activeMode.value === "cursor") {
    emit("cursor", props.meta?.prevCursor ?? null);
  } else if (current.value > 1) {
    emit("page", current.value - 1);
  }
};

const goNext = () => {
  if (props.loading || !hasNext.value) return;
  if (activeMode.value === "cursor") {
    emit("cursor", props.meta?.nextCursor ?? null);
  } else {
    emit("page", current.value + 1);
  }
};
</script>
