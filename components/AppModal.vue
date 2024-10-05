<template>
  <transition name="modal">
    <div
      v-if="isOpen"
      class="fixed bg-orange-200 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="handleBackdropClick"
    >
      <div
        class="bg-white rounded-lg shadow-lg max-w-[700px] w-full px-10 py-6"
        @click.stop
      >
        <header class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">{{ title }}</h2>
          <button @click="closeModal" class="text-gray-600 hover:text-gray-800">
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
        <div class="mt-4">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
const emit = defineEmits(["handleModal"]);

const props = defineProps({
  title: {
    type: String,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const closeModal = () => {
  emit("handleModal", false);
};
const handleBackdropClick = () => {
  closeModal();
};
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
