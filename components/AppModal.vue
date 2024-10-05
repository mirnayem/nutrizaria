<template>
  <div
    v-if="isOpen"
    class="fixed bg-orange-200 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-lg shadow-lg max-w-[600px] w-full p-6">
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
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
