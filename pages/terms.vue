<script setup lang="ts">
import type { LegalSection } from "~/components/LegalDocument.vue";

useSeo({
  title: "Terms & Conditions",
  description:
    "The terms and conditions that govern your use of the NutriZaria store and its services.",
  type: "website",
  jsonld: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms & Conditions",
    url: "https://nutrizaria.com/terms",
    isPartOf: { "@type": "WebSite", name: "NutriZaria", url: "https://nutrizaria.com" },
  },
});

const sections: LegalSection[] = [
  {
    heading: "Agreement to terms",
    body: "By accessing the NutriZaria website or placing an order, you agree to these Terms & Conditions. Please read them carefully before using our services.",
  },
  {
    heading: "Accounts & eligibility",
    body: "You are responsible for keeping your account credentials confidential and for all activity that occurs under your account. You must be at least 18 years old, or shop with the consent of a parent or guardian.",
  },
  {
    heading: "Orders & payment",
    body: "All orders are subject to availability and confirmation. We may refuse or cancel any order, including where pricing or product information is incorrect. Payment is collected when your order is confirmed.",
    list: [
      "Prices are displayed in BDT and include applicable taxes unless stated otherwise",
      "We accept the payment methods shown at checkout",
      "Orders are confirmed by email or SMS after payment is verified",
    ],
  },
  {
    heading: "Pricing & availability",
    body: "We make every effort to keep pricing and stock information accurate, but errors may occasionally occur. We reserve the right to correct any error and to adjust prices without notice.",
  },
  {
    heading: "Delivery",
    body: "We aim to deliver within the estimated timeframe shown at checkout. Delivery times may vary due to weather, traffic, or other factors outside our control. Risk of loss passes to you upon delivery.",
  },
  {
    heading: "Returns & refunds",
    body: "If a product arrives damaged, defective, or incorrect, please contact us within the return window and we will replace it or issue a refund. Refunds are issued to the original payment method.",
  },
  {
    heading: "Limitation of liability",
    body: "To the fullest extent permitted by law, NutriZaria is not liable for any indirect, incidental, or consequential damages arising from your use of the store or its products.",
  },
  {
    heading: "Changes to these terms",
    body: "We may update these Terms & Conditions from time to time. The latest version will always be available on this page, and continued use of the store constitutes acceptance of the updated terms.",
  },
  {
    heading: "Contact us",
    body: "If you have any questions about these terms, contact us at nutrizaria@gmail.com or call +880 1820999820.",
  },
];
</script>

<template>
  <LegalDocument
    eyebrow="Legal"
    title="Terms & Conditions"
    updatedAt="2 August 2026"
    :sections="sections"
  />
</template>
