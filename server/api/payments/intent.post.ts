import { createError, defineEventHandler, readBody } from "h3";
import Stripe from "stripe";

type CreateIntentBody = {
  amount: number;
  currency?: string;
  description?: string;
  email?: string;
  metadata?: Record<string, string>;
};

const STRIPE_API_VERSION: Stripe.StripeConfig["apiVersion"] = "2024-09-30";

const getStripeClient = () => {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Stripe secret key is not configured.",
    });
  }

  return new Stripe(secret, {
    apiVersion: STRIPE_API_VERSION,
  });
};

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as CreateIntentBody;

  if (!body || typeof body.amount !== "number" || body.amount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "A positive amount is required.",
    });
  }

  const currency = body.currency ?? "usd";
  const description = body.description ?? "NutriZaria order";
  const stripe = getStripeClient();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(body.amount),
      currency,
      description,
      receipt_email: body.email,
      metadata: {
        platform: "nutrizaria",
        ...body.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error("[payments] Failed to create PaymentIntent", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Unable to create payment intent.",
    });
  }
});
