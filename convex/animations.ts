import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByCharacter = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const animations = await ctx.db
      .query("animations")
      .withIndex("by_characterId", (q) => q.eq("characterId", args.characterId))
      .collect();

    return animations;
  },
});

export const get = query({
  args: { id: v.id("animations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const animation = await ctx.db.get(args.id);
    if (!animation) {
      throw new Error("Animation not found");
    }

    if (animation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return animation;
  },
});

export const create = mutation({
  args: {
    characterId: v.id("characters"),
    action: v.string(),
    direction: v.string(),
    frameCount: v.number(),
    fps: v.number(),
    loopEnforced: v.boolean(),
    status: v.string(),
    spriteSheetId: v.optional(v.id("_storage")),
    previewGifUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const animationId = await ctx.db.insert("animations", {
      characterId: args.characterId,
      userId: identity.subject,
      action: args.action,
      direction: args.direction,
      frameCount: args.frameCount,
      fps: args.fps,
      loopEnforced: args.loopEnforced,
      status: args.status,
      spriteSheetId: args.spriteSheetId,
      previewGifUrl: args.previewGifUrl,
      metadata: args.metadata,
    });

    return animationId;
  },
});

export const listByCharacterWithUrls = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const animations = await ctx.db
      .query("animations")
      .withIndex("by_characterId", (q) => q.eq("characterId", args.characterId))
      .collect();

    // Get URLs for each animation's spritesheet
    const animationsWithUrls = await Promise.all(
      animations.map(async (anim) => {
        let spriteSheetUrl: string | null = null;
        if (anim.spriteSheetId) {
          spriteSheetUrl = await ctx.storage.getUrl(anim.spriteSheetId);
        }
        return {
          ...anim,
          spriteSheetUrl,
        };
      })
    );

    return animationsWithUrls;
  },
});

export const update = mutation({
  args: {
    id: v.id("animations"),
    action: v.optional(v.string()),
    direction: v.optional(v.string()),
    frameCount: v.optional(v.number()),
    fps: v.optional(v.number()),
    loopEnforced: v.optional(v.boolean()),
    status: v.optional(v.string()),
    spriteSheetId: v.optional(v.id("_storage")),
    previewGifUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const animation = await ctx.db.get(args.id);
    if (!animation) {
      throw new Error("Animation not found");
    }

    if (animation.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: any = {};
    if (args.action !== undefined) updates.action = args.action;
    if (args.direction !== undefined) updates.direction = args.direction;
    if (args.frameCount !== undefined) updates.frameCount = args.frameCount;
    if (args.fps !== undefined) updates.fps = args.fps;
    if (args.loopEnforced !== undefined) updates.loopEnforced = args.loopEnforced;
    if (args.status !== undefined) updates.status = args.status;
    if (args.spriteSheetId !== undefined) updates.spriteSheetId = args.spriteSheetId;
    if (args.previewGifUrl !== undefined) updates.previewGifUrl = args.previewGifUrl;
    if (args.metadata !== undefined) updates.metadata = args.metadata;

    await ctx.db.patch(args.id, updates);
  },
});
