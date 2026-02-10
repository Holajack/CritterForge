import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    // Get scene counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const scenes = await ctx.db
          .query("parallaxScenes")
          .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
          .collect();

        return {
          ...project,
          sceneCount: scenes.length,
        };
      })
    );

    return projectsWithCounts;
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return project;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const projectId = await ctx.db.insert("projects", {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    gameView: v.optional(
      v.union(
        v.literal("side-scroller"),
        v.literal("top-down-8dir"),
        v.literal("isometric-8dir")
      )
    ),
    stylePack: v.optional(v.string()),
    frameSize: v.optional(
      v.object({
        width: v.number(),
        height: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.gameView !== undefined) updates.gameView = args.gameView;
    if (args.stylePack !== undefined) updates.stylePack = args.stylePack;
    if (args.frameSize !== undefined) updates.frameSize = args.frameSize;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
