import { v } from "convex/values";
import { action } from "./_generated/server";
import Stripe from "stripe";

const CREDIT_PACKS = {
  starter: { credits: 15, priceInCents: 900, name: "Starter" },
  standard: { credits: 40, priceInCents: 1900, name: "Standard" },
  pro: { credits: 120, priceInCents: 4900, name: "Pro" },
  studio: { credits: 280, priceInCents: 9900, name: "Studio" },
} as const;

export type PackId = keyof typeof CREDIT_PACKS;

export const createCheckoutSession = action({
  args: {
    packId: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const pack = CREDIT_PACKS[args.packId as PackId];
    if (!pack) throw new Error(`Invalid pack: ${args.packId}`);

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("Stripe is not configured. STRIPE_SECRET_KEY env var is missing.");
    }

    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ParallaxForge ${pack.name} Pack`,
              description: `${pack.credits} credits for parallax scene generation`,
            },
            unit_amount: pack.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: identity.subject,
        packId: args.packId,
        credits: pack.credits.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/#pricing`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
  },
});
