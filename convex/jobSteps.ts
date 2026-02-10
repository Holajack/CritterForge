import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const steps = await ctx.db
      .query("jobSteps")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .collect();

    return steps.sort((a, b) => a.stepOrder - b.stepOrder);
  },
});

export const create = mutation({
  args: {
    jobId: v.id("jobs"),
    stepName: v.string(),
    stepOrder: v.number(),
    status: v.string(),
    provider: v.optional(v.string()),
    modelId: v.optional(v.string()),
    inputParams: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const stepId = await ctx.db.insert("jobSteps", {
      jobId: args.jobId,
      stepName: args.stepName,
      stepOrder: args.stepOrder,
      status: args.status,
      provider: args.provider,
      modelId: args.modelId,
      inputParams: args.inputParams,
    });

    return stepId;
  },
});

export const update = mutation({
  args: {
    id: v.id("jobSteps"),
    status: v.optional(v.string()),
    output: v.optional(v.any()),
    durationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const step = await ctx.db.get(args.id);
    if (!step) {
      throw new Error("Job step not found");
    }

    const job = await ctx.db.get(step.jobId);
    if (!job || job.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: any = {};
    if (args.status !== undefined) updates.status = args.status;
    if (args.output !== undefined) updates.output = args.output;
    if (args.durationMs !== undefined) updates.durationMs = args.durationMs;

    await ctx.db.patch(args.id, updates);
  },
});
