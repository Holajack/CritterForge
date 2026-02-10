import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByAnimation = query({
  args: { animationId: v.id("animations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const animation = await ctx.db.get(args.animationId);
    if (!animation) {
      throw new Error("Animation not found");
    }

    if (animation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const frames = await ctx.db
      .query("frames")
      .withIndex("by_animationId", (q) => q.eq("animationId", args.animationId))
      .collect();

    return frames.sort((a, b) => a.frameIndex - b.frameIndex);
  },
});

export const create = mutation({
  args: {
    animationId: v.id("animations"),
    frameIndex: v.number(),
    imageId: v.id("_storage"),
    isRegenerated: v.boolean(),
    bbox: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
      })
    ),
    pivot: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const animation = await ctx.db.get(args.animationId);
    if (!animation) {
      throw new Error("Animation not found");
    }

    if (animation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const frameId = await ctx.db.insert("frames", {
      animationId: args.animationId,
      frameIndex: args.frameIndex,
      imageId: args.imageId,
      isRegenerated: args.isRegenerated,
      bbox: args.bbox,
      pivot: args.pivot,
    });

    return frameId;
  },
});

export const updateBatch = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("frames"),
        bbox: v.optional(
          v.object({
            x: v.number(),
            y: v.number(),
            width: v.number(),
            height: v.number(),
          })
        ),
        pivot: v.optional(
          v.object({
            x: v.number(),
            y: v.number(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    for (const update of args.updates) {
      const frame = await ctx.db.get(update.id);
      if (!frame) {
        throw new Error(`Frame ${update.id} not found`);
      }

      const animation = await ctx.db.get(frame.animationId);
      if (!animation || animation.userId !== identity.subject) {
        throw new Error("Unauthorized");
      }

      const patches: any = {};
      if (update.bbox !== undefined) patches.bbox = update.bbox;
      if (update.pivot !== undefined) patches.pivot = update.pivot;

      await ctx.db.patch(update.id, patches);
    }
  },
});
