<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
const emit = defineEmits(["handleModal"]);
const closeModal = () => {
  emit("handleModal", false);
};
// State for shipping form fields
const shippingAddress = ref({
  fullName: "",
  address: "",
  city: "",
  country: "",
  phone: "",
});

// Watch the form and update localStorage whenever the form changes
watch(
  shippingAddress,
  (newVal) => {
    localStorage.setItem("shippingAddress", JSON.stringify(newVal));
  },
  { deep: true }
);

// Load the saved shipping address from localStorage when the page is mounted
onMounted(() => {
  const savedAddress = localStorage.getItem("shippingAddress");
  if (savedAddress) {
    shippingAddress.value = JSON.parse(savedAddress);
  }
});

const handleSubmit = () => {
  console.log("Shipping address submitted:", shippingAddress.value);
};
</script>

<template>
  <div class="max-w-[600px]">
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-light mb-2"
          >Full Name</label
        >
        <input
          v-model="shippingAddress.fullName"
          type="text"
          placeholder="Enter full name"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Address -->
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-light mb-2"
          >Address</label
        >
        <input
          v-model="shippingAddress.address"
          type="text"
          placeholder="Enter address"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- City -->
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-light mb-2">City</label>
        <input
          v-model="shippingAddress.city"
          type="text"
          placeholder="Enter city"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Phone -->
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-light mb-2">Phone</label>
        <input
          v-model="shippingAddress.phone"
          type="text"
          placeholder="Enter your number"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Country -->
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-light mb-2"
          >Country</label
        >
        <input
          v-model="shippingAddress.country"
          type="text"
          placeholder="Enter country"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Submit Button -->
      <div class="mt-6">
        <button
          @click="closeModal"
          type="submit"
          class="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Address
        </button>
      </div>
    </form>
  </div>
</template>
