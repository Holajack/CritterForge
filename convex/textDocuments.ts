import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    fileName: v.string(),
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db.insert("textDocuments", {
      projectId: args.projectId,
      userId: identity.subject,
      fileName: args.fileName,
      fileId: args.fileId,
      status: "uploaded",
    });
  },
});

export const get = query({
  args: { id: v.id("textDocuments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) return null;

    return doc;
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("textDocuments")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const updateParsedScenes = mutation({
  args: {
    id: v.id("textDocuments"),
    parsedScenes: v.array(v.object({
      name: v.string(),
      description: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) {
      throw new Error("Not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      parsedScenes: args.parsedScenes,
      status: "parsed",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("textDocuments"),
    status: v.string(),
    sceneIds: v.optional(v.array(v.id("parallaxScenes"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) {
      throw new Error("Not found or unauthorized");
    }

    const updates: Record<string, unknown> = { status: args.status };
    if (args.sceneIds) updates.sceneIds = args.sceneIds;

    await ctx.db.patch(args.id, updates);
  },
});
