import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Called by the Stripe webhook to add credits after a successful checkout
export const fulfillCredits = internalMutation({
  args: {
    userId: v.string(),
    credits: v.number(),
    stripePaymentId: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate fulfillment (same stripePaymentId)
    const existing = await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("stripePaymentId"), args.stripePaymentId))
      .first();

    if (existing) {
      console.log(`Duplicate fulfillment skipped for payment ${args.stripePaymentId}`);
      return;
    }

    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      // Create profile if it doesn't exist yet
      const profileId = await ctx.db.insert("profiles", {
        userId: args.userId,
        displayName: "User",
        creditsBalance: 100, // default starter credits
      });
      profile = await ctx.db.get(profileId);
    }

    if (!profile) {
      throw new Error("Failed to get or create profile");
    }

    const newBalance = profile.creditsBalance + args.credits;

    await ctx.db.patch(profile._id, {
      creditsBalance: newBalance,
    });

    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: args.credits,
      balanceAfter: newBalance,
      transactionType: "purchase",
      stripePaymentId: args.stripePaymentId,
      description: args.description,
    });
  },
});
