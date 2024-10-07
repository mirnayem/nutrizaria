<script setup>
definePageMeta({
  title: "My Website Title",
  meta: [
    {
      name: "description",
      content: "A brief description of the page content.",
    },
  ],
});
</script>
<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="categories md:col-span-3 col-span-12">
      <Categories />
    </div>
    <div class="products-section md:col-span-9 col-span-12">
      <Products />
    </div>
  </div>
</template>
