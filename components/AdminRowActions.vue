<template>
  <div class="flex items-center justify-end gap-2" role="group" :aria-label="`Row actions for ${entityLabel}`">
    <button
      v-for="(action, index) in visibleActions"
      :key="index"
      type="button"
      class="group relative inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
      :class="action.className"
      :title="action.label"
      @click="action.handler"
    >
      <component :is="iconFor(action.icon)" class="size-4" />
      <span v-if="action.tooltip" class="pointer-events-none absolute top-full z-20 mt-1 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {{ action.label }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  LockOpenIcon,
  KeyIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  ChevronDoubleRightIcon,
  NoSymbolIcon,
} from "@heroicons/vue/24/outline";

export interface AdminAction {
  label: string;
  icon: string;
  handler: () => void;
  className?: string;
  tooltip?: boolean;
  show?: boolean;
}

const props = withDefaults(
  defineProps<{
    actions: AdminAction[];
    entity?: string;
    showTooltips?: boolean;
  }>(),
  {
    entity: "item",
    showTooltips: true,
  }
);

const entityLabel = computed(() => props.entity);

const visibleActions = computed(() =>
  (props.actions ?? []).filter((action) => action.show !== false).map((action) => ({
    ...action,
    tooltip: action.tooltip ?? props.showTooltips,
  }))
);

const iconMap: Record<string, any> = {
  edit: PencilSquareIcon,
  delete: TrashIcon,
  view: EyeIcon,
  "view-off": EyeSlashIcon,
  refresh: ArrowPathIcon,
  activate: CheckIcon,
  deactivate: XMarkIcon,
  unlock: LockOpenIcon,
  key: KeyIcon,
  external: ArrowTopRightOnSquareIcon,
  list: ClipboardDocumentListIcon,
  print: PrinterIcon,
  download: DocumentArrowDownIcon,
  next: ChevronDoubleRightIcon,
  disable: NoSymbolIcon,
};

const iconFor = (name: string) => iconMap[name] || EyeIcon;
</script>
