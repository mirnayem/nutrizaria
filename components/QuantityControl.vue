<template>
  <div
    v-if="checkProductExist() === 0"
    class="add-to-cart bg-orange-600 text-white rounded-lg max-w-40 h-12 flex-mid cursor-pointer"
    @click="addToCart"
  >
    Add to Cart
  </div>
  <div
    v-else
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
import { ref, onMounted } from "vue";
const quantity = ref(0);
const props = defineProps(["product"]);
import { useCartStore } from "~/stores/cart";

const cartStore = useCartStore();
const { product } = props;
const { items } = cartStore;
const addToCart = () => {
  cartStore.addToCart(product);
  quantity.value = 1;
};
const increment = () => {
  cartStore.updateCartItem(product.id, "INC");
  quantity.value += 1;
};
const decrement = () => {
  if (quantity.value > 1) {
    cartStore.updateCartItem(product.id, "DEC");
    quantity.value -= 1;
  }
};

const checkProductExist = () => {
  let exist = items.find((item) => item.id === product.id);
  return exist ? exist.quantity : 0;
};

onMounted(() => {
  quantity.value = checkProductExist();
});
</script>
