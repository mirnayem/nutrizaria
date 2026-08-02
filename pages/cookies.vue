<script setup lang="ts">
import type { LegalSection } from "~/components/LegalDocument.vue";

useSeo({
  title: "Cookie Policy",
  description:
    "How NutriZaria uses cookies and similar technologies to improve your shopping experience.",
  type: "website",
  jsonld: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cookie Policy",
    url: "https://nutrizaria.com/cookies",
    isPartOf: { "@type": "WebSite", name: "NutriZaria", url: "https://nutrizaria.com" },
  },
});

const sections: LegalSection[] = [
  {
    heading: "What are cookies?",
    body: "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how it is used.",
  },
  {
    heading: "How we use cookies",
    body: "We use cookies to keep you signed in, remember items in your cart, personalise content, and analyse traffic so we can improve the store.",
  },
  {
    heading: "Types of cookies we use",
    body: "The cookies we use fall into a few categories:",
    list: [
      "Essential — required for core features like sign-in and your shopping cart",
      "Functional — remember your preferences and settings",
      "Analytics — help us understand how visitors use the site",
      "Marketing — help us deliver relevant offers, only where enabled",
    ],
  },
  {
    heading: "Managing cookies",
    body: "You can control cookies through your browser settings, or withdraw your consent at any time. Please note that disabling essential cookies may affect how the store works.",
  },
  {
    heading: "Contact us",
    body: "For questions about this Cookie Policy, contact us at nutrizaria@gmail.com or call +880 1820999820.",
  },
];
</script>

<template>
  <LegalDocument
    eyebrow="Legal"
    title="Cookie Policy"
    updatedAt="2 August 2026"
    :sections="sections"
  />
</template>
