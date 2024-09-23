<template>
  <header class="bg-white shadow-md">
    <nav class="container mx-auto p-4 flex justify-between items-center">
      <!-- Logo -->
      <div class="text-xl font-bold">
        <NuxtLink to="/" class="text-blue-600">Nutriʾakl</NuxtLink>
      </div>

      <!-- Navigation Links -->
      <ul class="flex space-x-4">
        <li>
          <NuxtLink to="/" class="hover:text-blue-600">Home</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/about" class="hover:text-blue-600">About</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/services" class="hover:text-blue-600"
            >Services</NuxtLink
          >
        </li>
        <li>
          <NuxtLink to="/contact" class="hover:text-blue-600">Contact</NuxtLink>
        </li>
      </ul>

      <!-- Action Button -->
      <div>
        <NuxtLink
          to="/signup"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Sign Up
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup>
// You can add specific logic if needed here
</script>

<style scoped>
/* You can add custom styles here if necessary */
</style>
