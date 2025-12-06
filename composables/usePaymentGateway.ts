import {
  loadStripe,
  type Stripe,
  type StripeCardElement,
  type StripeElements,
} from "@stripe/stripe-js";
import { useRuntimeConfig } from "#app";
import { ref } from "vue";

type CreateIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  status: string;
};

export const usePaymentGateway = () => {
  const config = useRuntimeConfig();
  const publishableKey = config.public.stripePublishableKey;
  const currency = config.public.checkoutCurrency || "usd";

  const stripeRef = ref<Stripe | null>(null);
  const elementsRef = ref<StripeElements | null>(null);
  const cardElementRef = ref<StripeCardElement | null>(null);

  const ensureStripe = async () => {
    if (!publishableKey) {
      throw new Error(
        "Stripe publishable key is not configured. Please add STRIPE_PUBLISHABLE_KEY to your environment."
      );
    }

    if (!stripeRef.value) {
      stripeRef.value = await loadStripe(publishableKey);
    }

    if (!elementsRef.value && stripeRef.value) {
      elementsRef.value = stripeRef.value.elements();
    }

    return { stripe: stripeRef.value, elements: elementsRef.value };
  };

  const mountCardElement = async (elementId: string) => {
    const { elements } = await ensureStripe();
    if (!elements) {
      throw new Error("Unable to initialize Stripe elements.");
    }
    if (cardElementRef.value) {
      cardElementRef.value.unmount();
    }
    cardElementRef.value = elements.create("card", {
      hidePostalCode: true,
      style: {
        base: {
          fontSize: "16px",
          color: "#0f172a",
          "::placeholder": {
            color: "#94a3b8",
          },
        },
      },
    });

    cardElementRef.value.mount(elementId);
    return cardElementRef.value;
  };

  const createPaymentIntent = async (amount: number, email?: string) => {
    const payload = await $fetch<CreateIntentResponse>("/api/payments/intent", {
      method: "POST",
      body: {
        amount: Math.round(amount * 100),
        currency,
        email,
      },
    });
    return payload;
  };

  const confirmCardPayment = async (
    clientSecret: string,
    billingDetails: { name: string; email?: string }
  ) => {
    const { stripe } = await ensureStripe();
    if (!stripe || !cardElementRef.value) {
      throw new Error("Card element not ready.");
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElementRef.value,
        billing_details: billingDetails,
      },
    });

    if (result.error) {
      throw result.error;
    }

    return result.paymentIntent;
  };

  const teardownCard = () => {
    if (cardElementRef.value) {
      cardElementRef.value.destroy();
      cardElementRef.value = null;
    }
  };

  return {
    mountCardElement,
    createPaymentIntent,
    confirmCardPayment,
    teardownCard,
  };
};
