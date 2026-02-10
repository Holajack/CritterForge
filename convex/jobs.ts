import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    let jobs = await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    if (args.status) {
      jobs = jobs.filter((j) => j.status === args.status);
    }

    return jobs;
  },
});

export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const job = await ctx.db.get(args.id);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return job;
  },
});

export const getProgress = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const job = await ctx.db.get(args.id);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return {
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      error: job.error,
    };
  },
});

export const create = mutation({
  args: {
    jobType: v.string(),
    entityId: v.optional(v.string()),
    entityType: v.optional(v.string()),
    inputParams: v.optional(v.any()),
    creditsCharged: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const jobId = await ctx.db.insert("jobs", {
      userId: identity.subject,
      jobType: args.jobType,
      status: "queued",
      progress: 0,
      entityId: args.entityId,
      entityType: args.entityType,
      inputParams: args.inputParams,
      creditsCharged: args.creditsCharged,
    });

    return jobId;
  },
});

export const updateProgress = mutation({
  args: {
    id: v.id("jobs"),
    progress: v.number(),
    currentStep: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const job = await ctx.db.get(args.id);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: any = {
      progress: args.progress,
    };

    if (args.currentStep !== undefined) {
      updates.currentStep = args.currentStep;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    if (args.status === "processing" && !job.startedAt) {
      updates.startedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const complete = mutation({
  args: {
    id: v.id("jobs"),
    result: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const job = await ctx.db.get(args.id);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      status: "completed",
      progress: 100,
      result: args.result,
      completedAt: Date.now(),
    });
  },
});

export const fail = mutation({
  args: {
    id: v.id("jobs"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const job = await ctx.db.get(args.id);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      status: "failed",
      error: args.error,
      completedAt: Date.now(),
    });
  },
});

export const cancel = mutation({
  args: {
    id: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const job = await ctx.db.get(args.id);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Only cancel jobs that are still in progress
    if (job.status !== "queued" && job.status !== "processing") {
      return { alreadyDone: true };
    }

    await ctx.db.patch(args.id, {
      status: "cancelled",
      error: "Cancelled by user",
      completedAt: Date.now(),
    });

    // Refund credits if any were charged
    if (job.creditsCharged > 0) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .first();

      if (profile) {
        const newBalance = profile.creditsBalance + job.creditsCharged;
        await ctx.db.patch(profile._id, {
          creditsBalance: newBalance,
        });

        await ctx.db.insert("creditTransactions", {
          userId: identity.subject,
          amount: job.creditsCharged,
          balanceAfter: newBalance,
          transactionType: "refund",
          jobId: args.id,
          description: "Credits refunded - job cancelled by user",
        });
      }
    }

    return { cancelled: true };
  },
});
