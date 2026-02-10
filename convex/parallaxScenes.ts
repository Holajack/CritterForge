import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";

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

    const scenes = await ctx.db
      .query("parallaxScenes")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return scenes;
  },
});

export const get = query({
  args: { id: v.id("parallaxScenes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const scene = await ctx.db.get(args.id);
    if (!scene) {
      throw new Error("Scene not found");
    }

    if (scene.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return scene;
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    layerCount: v.number(),
    scenePrompt: v.optional(v.string()),
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

    const sceneId = await ctx.db.insert("parallaxScenes", {
      projectId: args.projectId,
      userId: identity.subject,
      name: args.name,
      layerCount: args.layerCount,
      scenePrompt: args.scenePrompt,
      status: "pending",
    });

    return sceneId;
  },
});

export const update = mutation({
  args: {
    id: v.id("parallaxScenes"),
    name: v.optional(v.string()),
    layerCount: v.optional(v.number()),
    scenePrompt: v.optional(v.string()),
    layers: v.optional(v.any()),
    previewId: v.optional(v.id("_storage")),
    status: v.optional(v.string()),
    deviceWidth: v.optional(v.number()),
    deviceHeight: v.optional(v.number()),
    orientation: v.optional(v.string()),
    mode: v.optional(v.string()),
    sourceImageId: v.optional(v.id("_storage")),
    depthMapId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const scene = await ctx.db.get(args.id);
    if (!scene) {
      throw new Error("Scene not found");
    }

    if (scene.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.layerCount !== undefined) updates.layerCount = args.layerCount;
    if (args.scenePrompt !== undefined) updates.scenePrompt = args.scenePrompt;
    if (args.layers !== undefined) updates.layers = args.layers;
    if (args.previewId !== undefined) updates.previewId = args.previewId;
    if (args.status !== undefined) updates.status = args.status;
    if (args.deviceWidth !== undefined) updates.deviceWidth = args.deviceWidth;
    if (args.deviceHeight !== undefined) updates.deviceHeight = args.deviceHeight;
    if (args.orientation !== undefined) updates.orientation = args.orientation;
    if (args.mode !== undefined) updates.mode = args.mode;
    if (args.sourceImageId !== undefined) updates.sourceImageId = args.sourceImageId;
    if (args.depthMapId !== undefined) updates.depthMapId = args.depthMapId;

    await ctx.db.patch(args.id, updates);
  },
});

export const updateLayers = mutation({
  args: {
    id: v.id("parallaxScenes"),
    layers: v.array(
      v.object({
        index: v.number(),
        depth: v.number(),
        imageId: v.id("_storage"),
      })
    ),
    depthMapId: v.optional(v.id("_storage")),
    sourceImageId: v.optional(v.id("_storage")),
    mode: v.optional(v.string()),
    deviceWidth: v.optional(v.number()),
    deviceHeight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const scene = await ctx.db.get(args.id);
    if (!scene) {
      throw new Error("Scene not found");
    }

    if (scene.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: Record<string, unknown> = {
      layers: args.layers,
      status: "completed",
    };

    if (args.depthMapId !== undefined) updates.depthMapId = args.depthMapId;
    if (args.sourceImageId !== undefined) updates.sourceImageId = args.sourceImageId;
    if (args.mode !== undefined) updates.mode = args.mode;
    if (args.deviceWidth !== undefined) updates.deviceWidth = args.deviceWidth;
    if (args.deviceHeight !== undefined) updates.deviceHeight = args.deviceHeight;

    await ctx.db.patch(args.id, updates);
  },
});

export const getWithUrls = query({
  args: { id: v.id("parallaxScenes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const scene = await ctx.db.get(args.id);
    if (!scene) {
      throw new Error("Scene not found");
    }

    if (scene.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Get URLs for all layer images
    const layers = scene.layers as
      | Array<{ index: number; depth: number; imageId: string }>
      | undefined;

    if (!layers || layers.length === 0) {
      return { ...scene, layersWithUrls: [] };
    }

    const layersWithUrls = await Promise.all(
      layers.map(async (layer) => {
        const url = await ctx.storage.getUrl(layer.imageId as never);
        return {
          ...layer,
          imageUrl: url,
        };
      })
    );

    return {
      ...scene,
      layersWithUrls,
    };
  },
});

// ── Delete mutations ──

export const deleteScene = mutation({
  args: { id: v.id("parallaxScenes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const scene = await ctx.db.get(args.id);
    if (!scene) {
      throw new Error("Scene not found");
    }

    if (scene.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Delete stored files
    await deleteSceneStorage(ctx, scene);

    // Delete the scene record
    await ctx.db.delete(args.id);
  },
});

export const deleteAllByProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const scenes = await ctx.db
      .query("parallaxScenes")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const scene of scenes) {
      await deleteSceneStorage(ctx, scene);
      await ctx.db.delete(scene._id);
    }

    return { deleted: scenes.length };
  },
});

async function deleteSceneStorage(
  ctx: { storage: { delete: (id: any) => Promise<void> } },
  scene: Record<string, any>
) {
  // Delete layer images
  const layers = scene.layers as
    | Array<{ index: number; depth: number; imageId: string }>
    | undefined;
  if (layers) {
    for (const layer of layers) {
      try {
        await ctx.storage.delete(layer.imageId);
      } catch {
        // File may already be deleted
      }
    }
  }

  // Delete preview image
  if (scene.previewId) {
    try {
      await ctx.storage.delete(scene.previewId);
    } catch {
      // File may already be deleted
    }
  }

  // Delete source image
  if (scene.sourceImageId) {
    try {
      await ctx.storage.delete(scene.sourceImageId);
    } catch {
      // File may already be deleted
    }
  }

  // Delete depth map
  if (scene.depthMapId) {
    try {
      await ctx.storage.delete(scene.depthMapId);
    } catch {
      // File may already be deleted
    }
  }
}

// ── Internal queries/mutations for server-side use (no auth required) ──

export const internalGetWithUrls = internalQuery({
  args: { id: v.id("parallaxScenes") },
  handler: async (ctx, args) => {
    const scene = await ctx.db.get(args.id);
    if (!scene) {
      throw new Error("Scene not found");
    }

    const layers = scene.layers as
      | Array<{ index: number; depth: number; imageId: string }>
      | undefined;

    if (!layers || layers.length === 0) {
      return { ...scene, layersWithUrls: [] };
    }

    const layersWithUrls = await Promise.all(
      layers.map(async (layer) => {
        const url = await ctx.storage.getUrl(layer.imageId as never);
        return {
          ...layer,
          imageUrl: url,
        };
      })
    );

    return {
      ...scene,
      layersWithUrls,
    };
  },
});

export const internalUpdatePreview = internalMutation({
  args: {
    id: v.id("parallaxScenes"),
    previewId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { previewId: args.previewId });
  },
});

export const internalUpdateStatus = internalMutation({
  args: {
    id: v.id("parallaxScenes"),
    status: v.string(),
    jobId: v.optional(v.id("jobs")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    if (args.jobId !== undefined) updates.jobId = args.jobId;
    if (args.error !== undefined) updates.error = args.error;
    // Clear error when retrying (status goes back to processing)
    if (args.status === "processing") updates.error = undefined;
    await ctx.db.patch(args.id, updates);
  },
});

export const listByProjectWithPreviews = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      return [];
    }

    const scenes = await ctx.db
      .query("parallaxScenes")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const scenesWithPreviews = await Promise.all(
      scenes.map(async (scene) => {
        let previewUrl: string | null = null;
        if (scene.previewId) {
          previewUrl = await ctx.storage.getUrl(scene.previewId);
        }
        return { ...scene, previewUrl };
      })
    );

    return scenesWithPreviews;
  },
});
