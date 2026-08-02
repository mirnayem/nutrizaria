<script setup lang="ts">
import type { LegalSection } from "~/components/LegalDocument.vue";

useSeo({
  title: "Privacy Policy",
  description:
    "How NutriZaria collects, uses, and protects your personal information when you shop with us.",
  type: "website",
  jsonld: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    url: "https://nutrizaria.com/privacy",
    isPartOf: { "@type": "WebSite", name: "NutriZaria", url: "https://nutrizaria.com" },
  },
});

const sections: LegalSection[] = [
  {
    heading: "Information we collect",
    body: "We collect information you provide directly — such as your name, delivery address, phone number, email, and payment details — along with order history and basic usage data collected automatically when you browse our store.",
  },
  {
    heading: "How we use your information",
    body: "We use your information to process and deliver orders, provide customer support, send order updates, improve our store, and — with your consent — share relevant offers and promotions.",
  },
  {
    heading: "How we share information",
    body: "We only share your information with trusted partners who help us operate, such as payment processors and delivery services, and only to the extent needed to complete your order. We never sell your personal data.",
  },
  {
    heading: "Data security",
    body: "We take reasonable measures to protect your information from unauthorised access, alteration, or loss. Payment details are handled by PCI-compliant payment providers and are never stored in plain text.",
  },
  {
    heading: "Your rights",
    body: "You may request access to, correction of, or deletion of your personal information at any time. You can also opt out of marketing communications whenever you like.",
    list: [
      "Access a copy of the data we hold about you",
      "Correct inaccurate or outdated information",
      "Request deletion of your account and data",
      "Opt out of promotional messages",
    ],
  },
  {
    heading: "Contact us",
    body: "For any privacy-related questions or requests, reach out to us at nutrizaria@gmail.com or call +880 1820999820.",
  },
];
</script>

<template>
  <LegalDocument
    eyebrow="Legal"
    title="Privacy Policy"
    updatedAt="2 August 2026"
    :sections="sections"
  />
</template>
