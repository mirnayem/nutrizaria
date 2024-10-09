<template>
  <div class="contact-form mt-6">
    <form @submit.prevent="handleSubmit" class="grid grid-cols-12 gap-x-4">
      <div class="col-span-6 relative">
        <input
          v-model="form.firstName"
          type="text"
          id="first-name"
          name="first-name"
          class="peer w-full my-5 border-b-2 focus:outline-none pb-2 focus:border-indigo-400 transition-colors duration-500 ease-in-out placeholder-transparent"
          placeholder=""
        />
        <label
          for="first-name"
          :class="{ 'top-0 text-indigo-500 text-sm': form.firstName }"
          class="absolute left-0 top-2 text-gray-500 transition-all duration-300 ease-in-out peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-indigo-500 peer-focus:text-sm"
        >
          Full Name
        </label>
      </div>

      <div class="col-span-6 relative">
        <input
          v-model="form.lastName"
          type="text"
          id="last-name"
          name="last-name"
          class="peer w-full my-5 border-b-2 focus:outline-none pb-2 focus:border-indigo-400 transition-colors duration-500 ease-in-out placeholder-transparent"
          placeholder=""
        />
        <label
          for="last-name"
          class="absolute left-0 top-2 text-gray-500 transition-all duration-300 ease-in-out peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-indigo-500 peer-focus:text-sm"
          :class="{ 'top-0 text-indigo-500 text-sm': form.lastName }"
        >
          Last Name
        </label>
      </div>

      <div class="col-span-6 relative">
        <input
          v-model="form.email"
          type="email"
          id="email"
          name="email"
          class="peer w-full my-5 border-b-2 focus:outline-none pb-2 focus:border-indigo-400 transition-colors duration-500 ease-in-out placeholder-transparent"
          placeholder="Email"
        />
        <label
          for="email"
          :class="{ 'top-0 text-indigo-500 text-sm': form.email }"
          class="absolute left-0 top-2 text-gray-500 transition-all duration-300 ease-in-out peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-indigo-500 peer-focus:text-sm"
        >
          Email
        </label>
      </div>

      <div class="col-span-6 relative">
        <input
          v-model="form.phone"
          type="tel"
          id="phone"
          name="phone"
          class="peer w-full my-5 border-b-2 focus:outline-none pb-2 focus:border-indigo-400 transition-colors duration-500 ease-in-out placeholder-transparent"
          placeholder=""
        />
        <label
          for="phone"
          :class="{ 'top-0 text-indigo-500 text-sm': form.phone }"
          class="absolute left-0 top-2 text-gray-500 transition-all duration-300 ease-in-out peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-indigo-500 peer-focus:text-sm"
        >
          Phone
        </label>
      </div>

      <div class="col-span-12 relative">
        <textarea
          v-model="form.message"
          id="message"
          name="message"
          rows="4"
          class="peer w-full my-5 border-b-2 focus:outline-none pb-2 focus:border-indigo-400 transition-colors duration-500 ease-in-out placeholder-transparent"
          placeholder=""
        ></textarea>
        <label
          for="message"
          :class="{ 'top-0 text-indigo-500 text-sm': form.message }"
          class="absolute left-0 top-2 text-gray-500 transition-all duration-300 ease-in-out peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-indigo-500 peer-focus:text-sm"
        >
          Message
        </label>
      </div>

      <div class="col-span-12 mx-auto">
        <button
          type="submit"
          class="w-full my-5 max-w-72 mx-auto bg-orange-600 text-white px-10 py-2 rounded"
        >
          Send Message
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
});

const handleSubmit = () => {
  console.log("Form Data:", form);
};
</script>
