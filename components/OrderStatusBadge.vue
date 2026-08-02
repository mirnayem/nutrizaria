<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
    :class="badge.classes"
  >
    <span class="size-1.5 rounded-full" :class="badge.dot"></span>
    {{ badge.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ status: string }>();

type BadgeStyle = {
  label: string;
  classes: string;
  dot: string;
};

const STYLES: Record<string, BadgeStyle> = {
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    classes: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  PROCESSING: {
    label: "Processing",
    classes: "bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  SHIPPED: {
    label: "Shipped",
    classes: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  DELIVERED: {
    label: "Delivered",
    classes: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  PAID: {
    label: "Paid",
    classes: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  FULFILLED: {
    label: "Fulfilled",
    classes: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  REFUNDED: {
    label: "Refunded",
    classes: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  FAILED: {
    label: "Payment failed",
    classes: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

const badge = computed<BadgeStyle>(() => {
  const key = String(props.status || "").toUpperCase();
  return STYLES[key] || {
    label: props.status || "Unknown",
    classes: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };
});
</script>
