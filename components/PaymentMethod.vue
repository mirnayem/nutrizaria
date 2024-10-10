<template>
  <ClientOnly>
    <div class="p-6 bg-white shadow-md rounded">
      <h2 class="text-xl font-light">Choose Payment Method</h2>

      <div class="flex items-center gap-3 min-h-32">
        <div
          class="w-24 h-24 flex items-center rounded shadow-lg"
          :class="{
            'ring-2 ring-orange-400 rounded': paymentMethod == 'card',
          }"
        >
          <input
            type="radio"
            id="card"
            value="card"
            v-model="paymentMethod"
            class="hidden"
          />
          <label for="card" class="ml-2">
            <img
              src="/images/card-payment.webp"
              alt="card"
              class="object-cover"
            />
          </label>
        </div>

        <div
          class="w-24 h-24 flex items-center rounded shadow-lg"
          :class="{
            'ring-2 ring-orange-400 rounded': paymentMethod == 'bkash',
          }"
        >
          <input
            type="radio"
            id="bkash"
            value="bkash"
            v-model="paymentMethod"
            class="hidden"
          />
          <label for="bkash" class="ml-2">
            <img src="/images/bkash.svg" alt="bkash" class="object-cover" />
          </label>
        </div>

        <div
          class="w-24 h-24 flex items-center rounded shadow-lg"
          :class="{
            'ring-2 ring-orange-400 rounded': paymentMethod == 'nagad',
          }"
        >
          <input
            type="radio"
            id="nagad"
            value="nagad"
            v-model="paymentMethod"
            class="hidden"
          />
          <label for="nagad" class="ml-2">
            <img src="/images/nagad.png" alt="nagad" class="object-cover" />
          </label>
        </div>

        <div
          class="w-24 h-24 flex items-center rounded shadow-lg"
          :class="{
            'ring-2 ring-orange-400 rounded': paymentMethod == 'cod',
          }"
        >
          <input
            type="radio"
            id="cod"
            value="cod"
            v-model="paymentMethod"
            class="hidden"
          />
          <label for="cod" class="ml-2">
            <img src="/images/cod.jpg" alt="cod" class="object-cover" />
          </label>
        </div>
      </div>

      <div v-if="paymentMethod === 'card'" class="mt-4">
        <h3 class="text-lg font-light">Card Details</h3>
        <form @submit.prevent="submitCardPayment" class="mt-5">
          <div id="card-element" class=""></div>
          <button
            type="submit"
            class="mt-6 bg-blue-600 text-white py-2 px-4 rounded"
          >
            Pay Now
          </button>
        </form>
      </div>

      <div v-if="paymentMethod === 'bkash'" class="mt-4">
        <h3 class="text-lg font-light">bKash Payment</h3>
        <p>Send payment to the following bKash number: 01XXXXXXXXX</p>
      </div>

      <div v-if="paymentMethod === 'nagad'" class="mt-4">
        <h3 class="text-lg font-light">Nagad Payment</h3>
        <p>Send payment to the following Nagad number: 01XXXXXXXXX</p>
      </div>

      <div v-if="paymentMethod === 'cod'" class="mt-4">
        <h3 class="text-lg font-light">Cash on Delivery</h3>
        <p>Our agent will collect the payment at the time of delivery.</p>
      </div>

      <button
        @click="processPayment"
        class="mt-6 bg-blue-600 text-white py-2 px-4 rounded"
      >
        Proceed to Payment
      </button>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import { useRuntimeConfig } from "#app";

const config = useRuntimeConfig();

const paymentMethod = ref("card");
const stripe = ref(null);
const cardElement = ref(null);

onMounted(async () => {
  stripe.value = await loadStripe(config.public.stripePublishableKey);
  const elements = stripe.value.elements();
  cardElement.value = elements.create("card");
  cardElement.value.mount("#card-element");
});

watch(paymentMethod, async (newValue, oldValue) => {
  if (newValue === "card") {
    stripe.value = await loadStripe(config.public.stripePublishableKey);
    const elements = stripe.value.elements();
    cardElement.value = elements.create("card");
    cardElement.value.mount("#card-element");
  }
});
const submitCardPayment = async () => {
  const { token, error } = await stripe.value.createToken(cardElement.value);
  if (error) {
    console.error("Stripe error:", error);
  } else {
    console.log("Stripe token:", token);
  }
};

const processPayment = () => {
  switch (paymentMethod.value) {
    case "card":
      submitCardPayment();
      break;
    case "bkash":
      console.log("Processing bKash payment");
      break;
    case "nagad":
      console.log("Processing Nagad payment");
      break;
    case "cod":
      console.log("Processing Cash on Delivery");
      break;
    default:
      console.error("Unknown payment method");
  }
};
</script>
