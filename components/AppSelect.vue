<template>
  <div ref="rootRef" class="relative">
    <button
      ref="triggerRef"
      type="button"
      :id="id"
      :name="name"
      :disabled="disabled"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-activedescendant="activeDescendant"
      :aria-label="ariaLabel"
      class="inline-flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
      :class="{ 'border-violet-400 ring-2 ring-violet-100': isOpen }"
      @click="toggleMenu"
      @keydown="handleKeydown"
      @blur="handleBlur"
    >
      <span class="truncate">{{ displayLabel }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4 shrink-0 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="app-select">
        <ul
          v-if="isOpen"
          ref="menuRef"
          :id="listboxId"
          role="listbox"
          tabindex="-1"
          class="fixed z-50 overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 scrollbar-slim"
          :style="menuStyle"
          @keydown="handleKeydown"
          @click="handleOptionClick"
        >
          <li
            v-for="(option, index) in options"
            :key="option.value"
            :id="optionId(index)"
            :data-index="index"
            role="option"
            :aria-selected="option.value === modelValue"
            :aria-disabled="option.disabled || undefined"
            class="flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
            :class="[
              option.disabled
                ? 'cursor-not-allowed text-slate-300'
                : index === activeIndex
                  ? 'bg-violet-50 text-violet-700'
                  : option.value === modelValue
                    ? 'font-semibold text-slate-800'
                    : 'text-slate-600',
              !option.disabled && index !== activeIndex ? 'hover:bg-slate-50 hover:text-slate-800' : '',
            ]"
            @mouseenter="onOptionHover(index)"
          >
            <span class="truncate">{{ option.label }}</span>
            <svg
              v-if="option.value === modelValue && !option.disabled"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-4 shrink-0 text-violet-600"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

export interface AppSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    options: AppSelectOption[];
    modelValue?: string | number | null;
    placeholder?: string;
    ariaLabel?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
  }>(),
  {
    modelValue: null,
    placeholder: "Select…",
    ariaLabel: undefined,
    disabled: false,
    id: undefined,
    name: undefined,
  }
);

const emit = defineEmits<{
  change: [value: string | number];
  "update:modelValue": [value: string | number | null];
}>();

const isClient = typeof window !== "undefined";
const uid = `app-select-${Math.random().toString(36).slice(2, 8)}`;
const listboxId = props.id ? `${props.id}-listbox` : `${uid}-listbox`;

const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

const isOpen = ref(false);
const activeIndex = ref(-1);
const triggerWidth = ref(0);
const menuTop = ref(0);
const menuLeft = ref(0);
const menuMaxHeight = ref(256);

const selectedIndex = computed(() =>
  props.options.findIndex((option) => option.value === props.modelValue)
);

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
);

const displayLabel = computed(() =>
  selectedOption.value ? selectedOption.value.label : props.placeholder
);

const activeDescendant = computed(() =>
  isOpen.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined
);

const menuStyle = computed(() => ({
  minWidth: `${triggerWidth.value}px`,
  top: `${menuTop.value}px`,
  left: `${menuLeft.value}px`,
  maxHeight: `${menuMaxHeight.value}px`,
}));

const optionId = (index: number) => `${listboxId}-option-${index}`;

const openMenu = () => {
  if (!triggerRef.value || !isClient) return;
  const rect = triggerRef.value.getBoundingClientRect();
  triggerWidth.value = rect.width;

  const spaceBelow = window.innerHeight - rect.bottom;
  const maxBelow = Math.max(120, spaceBelow - 12);
  const maxAbove = Math.max(120, rect.top - 12);
  const placeBelow = spaceBelow >= maxAbove;

  menuMaxHeight.value = Math.min(320, placeBelow ? maxBelow : maxAbove);
  menuTop.value = placeBelow ? rect.bottom + 6 : Math.max(8, rect.top - menuMaxHeight.value - 6);
  menuLeft.value = Math.max(8, Math.min(rect.left, window.innerWidth - triggerWidth.value - 8));

  activeIndex.value = selectedIndex.value;
  isOpen.value = true;
};

const closeMenu = () => {
  if (!isOpen.value) return;
  isOpen.value = false;
  activeIndex.value = -1;
};

const toggleMenu = () => {
  if (props.disabled) return;
  if (isOpen.value) closeMenu();
  else openMenu();
};

const selectOption = (option: AppSelectOption) => {
  if (option.disabled || !isOpen.value) return;
  if (option.value !== props.modelValue) {
    emit("update:modelValue", option.value);
    emit("change", option.value);
  }
  closeMenu();
  triggerRef.value?.focus();
};

const firstEnabled = () => {
  const index = props.options.findIndex((option) => !option.disabled);
  return index >= 0 ? index : -1;
};

const lastEnabled = () => {
  const index = props.options.findLastIndex((option) => !option.disabled);
  return index >= 0 ? index : -1;
};

const moveActive = (direction: number) => {
  const total = props.options.length;
  if (!total) return;
  let index = activeIndex.value;
  if (index < 0) index = direction > 0 ? -1 : total;
  for (let step = 0; step < total; step++) {
    index = (index + direction + total) % total;
    if (!props.options[index].disabled) {
      activeIndex.value = index;
      return;
    }
  }
};

const onOptionHover = (index: number) => {
  if (isOpen.value && !props.options[index].disabled) {
    activeIndex.value = index;
  }
};

const handleOptionClick = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[role='option']");
  if (!target) return;
  const index = Number(target.dataset.index);
  if (!Number.isNaN(index)) selectOption(props.options[index]);
};

const handleBlur = () => {
  if (!isOpen.value) return;
  window.setTimeout(() => {
    if (menuRef.value?.contains(document.activeElement)) return;
    if (!rootRef.value?.contains(document.activeElement)) closeMenu();
  }, 0);
};

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (!isOpen.value) openMenu();
      else moveActive(1);
      break;
    case "ArrowUp":
      event.preventDefault();
      if (!isOpen.value) openMenu();
      else moveActive(-1);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      if (!isOpen.value) openMenu();
      else if (activeIndex.value >= 0) selectOption(props.options[activeIndex.value]);
      break;
    case "Home":
      event.preventDefault();
      if (isOpen.value) activeIndex.value = firstEnabled();
      break;
    case "End":
      event.preventDefault();
      if (isOpen.value) activeIndex.value = lastEnabled();
      break;
    case "Escape":
      event.preventDefault();
      closeMenu();
      break;
    case "Tab":
      closeMenu();
      break;
  }
};

const handleDocumentPointerDown = (event: PointerEvent) => {
  if (!isOpen.value) return;
  const target = event.target as Node;
  if (rootRef.value?.contains(target) || menuRef.value?.contains(target)) return;
  closeMenu();
};

const handleScroll = () => {
  if (isOpen.value) closeMenu();
};

watch(activeIndex, async (index) => {
  if (!isOpen.value || index < 0) return;
  await nextTick();
  document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" });
});

watch(
  () => props.options,
  () => {
    if (isOpen.value && activeIndex.value < 0) activeIndex.value = selectedIndex.value;
  }
);

onMounted(() => {
  if (!isClient) return;
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
  window.addEventListener("resize", handleScroll);
});

onBeforeUnmount(() => {
  if (!isClient) return;
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  window.removeEventListener("scroll", handleScroll, { capture: true } as EventListenerOptions);
  window.removeEventListener("resize", handleScroll);
});
</script>

<style scoped>
.app-select-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.app-select-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.app-select-enter-from,
.app-select-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
.app-select-enter-to,
.app-select-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
