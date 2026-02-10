import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhooks/replicate",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      const predictionId = payload.id as string;
      const status = payload.status as string;
      const output = payload.output;
      const error = payload.error;

      console.log(
        `Replicate webhook: prediction=${predictionId} status=${status}`
      );

      if (status === "succeeded" || status === "failed") {
        await ctx.runMutation(internal.generateHelpers.handleReplicateWebhook, {
          predictionId,
          status,
          output: output ?? null,
          error: error ?? null,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
      });
    } catch (error) {
      console.error("Error processing Replicate webhook:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: new Headers({ "Content-Type": "application/json" }),
        }
      );
    }
  }),
});

http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const signature = request.headers.get("stripe-signature");
      if (!signature) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing stripe-signature header" }),
          {
            status: 400,
            headers: new Headers({ "Content-Type": "application/json" }),
          }
        );
      }

      const payload = await request.text();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET not configured");
        return new Response(
          JSON.stringify({ success: false, error: "Webhook secret not configured" }),
          { status: 500, headers: new Headers({ "Content-Type": "application/json" }) }
        );
      }

      // Verify webhook signature using Stripe SDK
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      let event: import("stripe").Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } catch (err) {
        console.error("Stripe signature verification failed:", err);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid signature" }),
          { status: 400, headers: new Headers({ "Content-Type": "application/json" }) }
        );
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as import("stripe").Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || "0", 10);
        const paymentId = session.payment_intent as string;

        if (userId && credits > 0) {
          await ctx.runMutation(internal.stripeHelpers.fulfillCredits, {
            userId,
            credits,
            stripePaymentId: paymentId,
            description: `${session.metadata?.packId || "unknown"} pack (${credits} credits)`,
          });
          console.log(`Stripe: fulfilled ${credits} credits for ${userId}`);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
      });
    } catch (error) {
      console.error("Error processing Stripe webhook:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: new Headers({ "Content-Type": "application/json" }),
        }
      );
    }
  }),
});

export default http;
