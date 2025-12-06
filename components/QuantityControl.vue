<template>
  <div
    v-if="!currentQuantity"
    class="add-to-cart flex-mid h-12 max-w-40 cursor-pointer rounded-lg bg-violet-600 text-white"
    @click="addToCart"
  >
    Add to Cart
  </div>
  <div
    v-else
    class="quantity-control flex h-12 max-w-fit items-center gap-6 rounded-lg border px-4"
  >
    <button
      type="button"
      :class="[
        'transition',
        currentQuantity > 1 ? 'cursor-pointer text-slate-900' : 'cursor-not-allowed text-slate-400',
      ]"
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
    </button>
    <div class="border-l border-gray-300 h-6"></div>
    <div class="min-w-[32px] text-center font-semibold text-slate-800">
      {{ currentQuantity }}
    </div>
    <div class="border-l border-gray-300 h-6"></div>
    <button type="button" class="text-violet-700" @click="increment">
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
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCartStore } from "~/stores/cart";
import type { Product } from "~/types/product";

const props = defineProps<{ product: Product }>();
const cartStore = useCartStore();
const { items } = storeToRefs(cartStore);

const currentQuantity = computed(() => {
  const match = items.value.find((item) => item.id === props.product.id);
  return match?.quantity ?? 0;
});

const addToCart = () => {
  cartStore.addToCart(props.product);
};

const increment = () => {
  cartStore.updateCartItem(props.product.id, "INC");
};

const decrement = () => {
  if (currentQuantity.value > 1) {
    cartStore.updateCartItem(props.product.id, "DEC");
  }
};
</script>
