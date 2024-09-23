<template>
  <footer class="bg-gray-800 text-white py-8">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <!-- Footer Logo / Title -->
        <div class="mb-4 md:mb-0 text-lg font-bold">
          <NuxtLink to="/" class="hover:text-blue-400">Nutriʾakl</NuxtLink>
        </div>

        <!-- Footer Navigation Links -->
        <ul class="flex space-x-4 mb-4 md:mb-0">
          <li>
            <NuxtLink to="/" class="hover:text-blue-400">Home</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/about" class="hover:text-blue-400">About</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/services" class="hover:text-blue-400"
              >Services</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/contact" class="hover:text-blue-400"
              >Contact</NuxtLink
            >
          </li>
        </ul>

        <!-- Social Media Icons -->
        <div class="flex space-x-4">
          <a href="#" class="hover:text-blue-400">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="#" class="hover:text-blue-400">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="#" class="hover:text-blue-400">
            <i class="fab fa-instagram"></i>
          </a>
        </div>
      </div>

      <!-- Copyright Section -->
      <div class="text-center mt-8 text-gray-400">
        &copy; {{ new Date().getFullYear() }} MyApp. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup>
// No specific logic is needed in this case
</script>

<style scoped>
/* Custom styles if needed */
</style>
