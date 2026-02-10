import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const createSpriteJob = internalMutation({
  args: {
    characterId: v.id("characters"),
    inputParams: v.any(),
    creditsCharged: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    return await ctx.db.insert("jobs", {
      userId: character.userId,
      jobType: "sprite-generation",
      status: "queued",
      progress: 0,
      entityId: args.characterId,
      entityType: "character",
      inputParams: args.inputParams,
      creditsCharged: args.creditsCharged ?? 0,
    });
  },
});

export const createParallaxJob = internalMutation({
  args: {
    sceneId: v.id("parallaxScenes"),
    inputParams: v.any(),
  },
  handler: async (ctx, args) => {
    const scene = await ctx.db.get(args.sceneId);
    if (!scene) {
      throw new Error("Scene not found");
    }

    return await ctx.db.insert("jobs", {
      userId: scene.userId,
      jobType: "parallax-generation",
      status: "queued",
      progress: 0,
      entityId: args.sceneId,
      entityType: "parallaxScene",
      inputParams: args.inputParams,
      creditsCharged: 30,
    });
  },
});

export const updateJobProgress = internalMutation({
  args: {
    jobId: v.id("jobs"),
    progress: v.number(),
    currentStep: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      progress: args.progress,
      currentStep: args.currentStep,
      status: args.status,
    };

    const job = await ctx.db.get(args.jobId);
    if (args.status === "processing" && job && !job.startedAt) {
      updates.startedAt = Date.now();
    }

    await ctx.db.patch(args.jobId, updates);
  },
});

export const createJobStep = internalMutation({
  args: {
    jobId: v.id("jobs"),
    stepName: v.string(),
    stepOrder: v.number(),
    status: v.string(),
    provider: v.optional(v.string()),
    modelId: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    output: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("jobSteps", {
      jobId: args.jobId,
      stepName: args.stepName,
      stepOrder: args.stepOrder,
      status: args.status,
      provider: args.provider,
      modelId: args.modelId,
      durationMs: args.durationMs,
      output: args.output,
    });
  },
});

export const completeJob = internalMutation({
  args: {
    jobId: v.id("jobs"),
    result: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "completed",
      progress: 100,
      result: args.result,
      completedAt: Date.now(),
    });
  },
});

export const failJob = internalMutation({
  args: {
    jobId: v.id("jobs"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      completedAt: Date.now(),
    });
  },
});

export const handleReplicateWebhook = internalMutation({
  args: {
    predictionId: v.string(),
    status: v.string(),
    output: v.any(),
    error: v.any(),
  },
  handler: async (ctx, args) => {
    // Find the job step that references this prediction
    const steps = await ctx.db.query("jobSteps").collect();
    const step = steps.find(
      (s) =>
        s.output &&
        typeof s.output === "object" &&
        (s.output as Record<string, unknown>).predictionId === args.predictionId
    );

    if (!step) {
      console.log(`No job step found for prediction ${args.predictionId}`);
      return;
    }

    if (args.status === "succeeded") {
      await ctx.db.patch(step._id, {
        status: "completed",
        output: { ...((step.output as Record<string, unknown>) || {}), result: args.output },
      });
    } else if (args.status === "failed") {
      await ctx.db.patch(step._id, {
        status: "failed",
        output: { ...((step.output as Record<string, unknown>) || {}), error: args.error },
      });
    }
  },
});

export const getJobStatus = internalMutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    return job?.status ?? "failed";
  },
});

export const storeFileFromUrl = internalMutation({
  args: {
    storageId: v.id("_storage"),
    characterId: v.id("characters"),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {};
    updates[args.field] = args.storageId;
    await ctx.db.patch(args.characterId, updates);
  },
});
