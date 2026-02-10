import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Get animation counts for each character
    const charactersWithCounts = await Promise.all(
      characters.map(async (character) => {
        const animations = await ctx.db
          .query("animations")
          .withIndex("by_characterId", (q) => q.eq("characterId", character._id))
          .collect();

        return {
          ...character,
          animationCount: animations.length,
        };
      })
    );

    return charactersWithCounts;
  },
});

export const get = query({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const character = await ctx.db.get(args.id);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return character;
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    sourceImageId: v.optional(v.id("_storage")),
    animalType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const characterId = await ctx.db.insert("characters", {
      projectId: args.projectId,
      userId: identity.subject,
      name: args.name,
      sourceImageId: args.sourceImageId,
      animalType: args.animalType,
    });

    return characterId;
  },
});

export const update = mutation({
  args: {
    id: v.id("characters"),
    name: v.optional(v.string()),
    sourceImageId: v.optional(v.id("_storage")),
    cleanImageId: v.optional(v.id("_storage")),
    depthMapId: v.optional(v.id("_storage")),
    animalType: v.optional(v.string()),
    metadata: v.optional(v.any()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const character = await ctx.db.get(args.id);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.sourceImageId !== undefined) updates.sourceImageId = args.sourceImageId;
    if (args.cleanImageId !== undefined) updates.cleanImageId = args.cleanImageId;
    if (args.depthMapId !== undefined) updates.depthMapId = args.depthMapId;
    if (args.animalType !== undefined) updates.animalType = args.animalType;
    if (args.metadata !== undefined) updates.metadata = args.metadata;
    if (args.thumbnailUrl !== undefined) updates.thumbnailUrl = args.thumbnailUrl;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const character = await ctx.db.get(args.id);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
