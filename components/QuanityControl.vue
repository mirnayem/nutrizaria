<template>
  <div
    class="quantity-control flex items-center justify-center max-w-fit rounded-lg gap-6 border px-4 h-12"
  >
    <div
      :class="`decrement + ${
        quantity > 1 ? 'cursor-pointer' : 'cursor-not-allowed'
      }`"
      @click="decrement"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
      </svg>
    </div>
    <div class="border-l border-gray-400 h-full"></div>
    <div class="quantity">{{ quantity }}</div>
    <div class="border-l h-full border-gray-400"></div>
    <div class="increment cursor-pointer" @click="increment">
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
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
const quantity = ref(1);
const increment = () => {
  quantity.value++;
};
const decrement = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};
</script>
