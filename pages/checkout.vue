<template>
  <ClientOnly>
    <div class="shipping-checkout grid grid-cols-12 gap-10">
      <div class="add-address col-span-8">
        <AppModal
          title="Shipping Address"
          :isOpen="openModal"
          @handleModal="closeModal"
        >
          <Shipping @handleModal="closeModal" />
        </AppModal>
        <h1 v-if="userAddress" class="pb-2 text-lg font-semibold">
          Select Your Shipping Address
        </h1>
        <div
          class="user-address flex items-center p-5 border-2 rounded cursor-pointer"
          :class="{ 'bg-orange-100': selectedAddress }"
          v-if="userAddress"
          @click="selectAddress"
        >
          <div class="select w-[100px] flex justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-10"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <div class="details">
            <div class="name">{{ userAddress.fullName }}</div>
            <div class="address">{{ userAddress.address }}</div>
            <div class="city">
              {{ userAddress.city + "," + userAddress.country }}
            </div>
            <div class="phone">{{ userAddress.phone }}</div>
          </div>
        </div>
        <button
          @click="toggleModal"
          class="flex items-center mt-5 border-2 px-5 py-2 w-full justify-center gap-5 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
            />
          </svg>
          <p>Add New Address</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>

        <div class="payment-method w-full mt-10">
          <PaymentMethod />
        </div>
      </div>

      <div class="summary col-span-4 shadow-lg pt-4 mt-5 pb-20">
        <div class="summary-heading text-2xl font-normal pb-3 px-4">
          Summary
        </div>
        <div
          class="total-items flex justify-between items-center bg-slate-400 text-white px-4 py-2"
        >
          <p>Total Items</p>
          <p>{{ cartStore.totalItems }}</p>
        </div>
        <div class="items px-4 grid gap-4 mt-4">
          <div
            class="single-item flex-center-between"
            v-for="item in cartStore.items"
            :key="item.id"
          >
            <div class="item-name">
              {{ item.name + "(" + item.quantity + ")" }}
            </div>
            <div class="price">{{ item.price }}</div>
          </div>
        </div>
        <div class="total-price flex-center-between px-4 py-2 mt-10 font-bold">
          <p>Total</p>
          <p>${{ cartStore.totalPrice }}</p>
        </div>
        <div class="agreement px-4">
          <input
            id="terms"
            type="checkbox"
            class="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
          />
          <label for="terms">
            I agree to Nutri'akl
            <span class="text-blue-600">terms & conditions</span> and
            <span class="text-blue-600">privacy policy</span>
          </label>
        </div>
        <div class="place-order">
          <button class="nutri-btn mx-auto mt-20 w-64">Place Order</button>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
<script setup>
import { ref, onMounted } from "vue";
import Shipping from "~/components/Shipping.vue";
import { useCartStore } from "~/stores/cart";

const cartStore = useCartStore();
const openModal = ref(false);
const userAddress = ref(null);
const selectedAddress = ref(null);

const closeModal = () => {
  openModal.value = false;
  const savedValue = localStorage.getItem("shippingAddress");
  if (savedValue !== null) {
    userAddress.value = JSON.parse(savedValue);
  }
};
const toggleModal = () => {
  openModal.value = !openModal.value;
};
const selectAddress = () => {
  selectedAddress.value = userAddress.value;
};
onMounted(() => {
  const savedValue = localStorage.getItem("shippingAddress");
  if (savedValue !== null) {
    userAddress.value = JSON.parse(savedValue);
  }
});
</script>
