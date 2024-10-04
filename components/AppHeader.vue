<template>
  <header class="bg-white shadow-md">
    <TopNavBar />
    <nav class="container mx-auto h-24 flex justify-between items-center">
      <div class="text-xl font-bold">
        <NuxtLink to="/" class="text-orange-600 font-black uppercase">Nutriʾakl</NuxtLink>
      </div>

      <ul class="flex space-x-4">
        <li>
          <NuxtLink to="/" class="hover:text-orange-500 font-bold uppercase">shop</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/about" class="hover:text-orange-500 font-bold uppercase">contact</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/services" class="hover:text-orange-500 font-bold uppercase"
            >blog</NuxtLink
          >
        </li>
        <li>
          <NuxtLink to="/contact" class="hover:text-orange-500 font-bold uppercase">faq</NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-3">
        <div class="favorite mt-1">
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
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </div>
        <div class="cart-bag">
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
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
        <div class="total">item: $150.00</div>
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
