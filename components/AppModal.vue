<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10 sm:py-16"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click="handleBackdropClick"
      >
        <div
          :class="[
            'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl',
            maxWidthClass,
          ]"
          @click.stop
        >
          <header class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
            <button
              @click="closeModal"
              class="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>
          <div class="flex-1 overflow-y-auto px-6 py-6">
            <slot></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue";

let openCount = 0;

const isClient = typeof window !== "undefined";

const emit = defineEmits(["handleModal"]);

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: "max-w-6xl",
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
});

const maxWidthClass = computed(() => props.maxWidth);

const closeModal = () => {
  emit("handleModal", false);
};
const handleBackdropClick = () => {
  closeModal();
};

const lockBody = () => {
  if (!isClient) return;
  openCount++;
  document.body.style.overflow = "hidden";
};

const unlockBody = () => {
  if (!isClient) return;
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    document.body.style.overflow = "";
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.closeOnEsc && props.isOpen) {
    closeModal();
  }
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isClient) return;
    if (isOpen) lockBody();
    else unlockBody();
  },
  { immediate: true }
);

onMounted(() => {
  if (!isClient) return;
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  if (!isClient) return;
  window.removeEventListener("keydown", handleKeyDown);
  if (props.isOpen) unlockBody();
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
