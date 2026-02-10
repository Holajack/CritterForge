import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const getCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    return profile?.creditsBalance ?? 0;
  },
});

export const getTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});

export const deductCredits = mutation({
  args: {
    amount: v.number(),
    jobId: v.optional(v.id("jobs")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) {
      const newProfileId = await ctx.db.insert("profiles", {
        userId: identity.subject,
        displayName: identity.name || "Anonymous",
        avatarUrl: identity.pictureUrl,
        creditsBalance: 100,
      });
      profile = await ctx.db.get(newProfileId);
    }

    if (!profile) {
      throw new Error("Failed to create profile");
    }

    if (profile.creditsBalance < args.amount) {
      throw new Error("Insufficient credits");
    }

    const newBalance = profile.creditsBalance - args.amount;

    await ctx.db.patch(profile._id, {
      creditsBalance: newBalance,
    });

    await ctx.db.insert("creditTransactions", {
      userId: identity.subject,
      amount: -args.amount,
      balanceAfter: newBalance,
      transactionType: "deduction",
      jobId: args.jobId,
      description: args.description || "Credits deducted",
    });

    return newBalance;
  },
});

export const addCredits = mutation({
  args: {
    amount: v.number(),
    stripePaymentId: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) {
      const newProfileId = await ctx.db.insert("profiles", {
        userId: identity.subject,
        displayName: identity.name || "Anonymous",
        avatarUrl: identity.pictureUrl,
        creditsBalance: 100,
      });
      profile = await ctx.db.get(newProfileId);
    }

    if (!profile) {
      throw new Error("Failed to create profile");
    }

    const newBalance = profile.creditsBalance + args.amount;

    await ctx.db.patch(profile._id, {
      creditsBalance: newBalance,
    });

    await ctx.db.insert("creditTransactions", {
      userId: identity.subject,
      amount: args.amount,
      balanceAfter: newBalance,
      transactionType: "purchase",
      stripePaymentId: args.stripePaymentId,
      description: args.description || "Credits purchased",
    });

    return newBalance;
  },
});

// One-time internal mutation to add test credits to a specific user.
// Run from Convex dashboard: internal.billing.addTestCredits({ userId: "user_xxx", amount: 500 })
export const addTestCredits = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      const profileId = await ctx.db.insert("profiles", {
        userId: args.userId,
        displayName: "Admin",
        creditsBalance: 100,
      });
      profile = await ctx.db.get(profileId);
    }

    if (!profile) {
      throw new Error("Failed to create profile");
    }

    const newBalance = profile.creditsBalance + args.amount;

    await ctx.db.patch(profile._id, {
      creditsBalance: newBalance,
    });

    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: args.amount,
      balanceAfter: newBalance,
      transactionType: "purchase",
      description: `Test credits added (${args.amount})`,
    });

    return { userId: args.userId, newBalance };
  },
});

export const refundCredits = mutation({
  args: {
    amount: v.number(),
    jobId: v.id("jobs"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== identity.subject) {
      throw new Error("Job not found or unauthorized");
    }

    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const newBalance = profile.creditsBalance + args.amount;

    await ctx.db.patch(profile._id, {
      creditsBalance: newBalance,
    });

    await ctx.db.insert("creditTransactions", {
      userId: identity.subject,
      amount: args.amount,
      balanceAfter: newBalance,
      transactionType: "refund",
      jobId: args.jobId,
      description: args.description || "Credits refunded for failed job",
    });

    return newBalance;
  },
});
