<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
        @click="handleBackdrop"
      >
        <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" @click.stop>
          <div class="text-center">
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              :class="variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'"
            >
              <svg v-if="variant === 'danger'" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <svg v-else class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ title }}</h3>
            <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
          </div>
          <div class="mt-6 flex gap-3">
            <button
              @click="emit('cancel')"
              class="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {{ cancelText }}
            </button>
            <button
              @click="emit('confirm')"
              class="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white"
              :class="variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  variant: { type: String, default: 'danger' },
});

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const handleBackdrop = () => emit('cancel');
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
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
