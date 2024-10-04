<template>
  <div>
    <AppHeader />
    <div class="container min-h-screen">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
<script setup>
definePageMeta({
  title: "Nutri'akl - authentic pure food sources",
  meta: [
    {
      name: "description",
      content:
        "Nutriakl is a trusted source for authentic and pure food resources, dedicated to providing high-quality, natural products. We prioritize purity and sustainability in every product, ensuring that you have access to healthy and unadulterated foods.",
    },
  ],
});
</script>
