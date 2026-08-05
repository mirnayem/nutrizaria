<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <CookieConsent />
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const base = (config.public.siteUrl || "https://nutrizaria.com").replace(/\/+$/, "");

useHead({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        name: "NutriZaria",
        url: base,
        logo: `${base}/nutri.png`,
        description:
          "Authentic, pure food resources for Bangladeshi kitchens — fresh produce, daily essentials and more.",
        email: "nutrizaria@gmail.com",
        telephone: "+8801820999820",
        sameAs: [],
      }),
    },
  ],
});
</script>
