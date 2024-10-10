<script setup></script>
<template>
  <section
    class="search-product flex items-center gap-2 border-[1px] border-slate-300 rounded pl-2 h-10 relative"
  >
    <div class="select-category flex items-center justify-between gap-5 sm:w-1/4 w-1/3">
      <p class="font-light md:text-base text-xs">All Categories</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1"
        stroke="currentColor"
        class="size-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>
    </div>
    <div class="h-6 border-l border-slate-300"></div>
    <div class="search-input sm:w-1/2 w-2/3">
      <input
        type="text"
        class="w-full h-full focus:outline-none"
        placeholder="search your product..."
      />
    </div>
    <div class="absolute right-0 search-button sm:w-1/4 w-1/6 h-[42px] flex-mid bg-orange-500 text-white">
      Search
    </div>
  </section>
</template>
