"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Jimp } from "jimp";

export const generateCompositePreview = internalAction({
  args: {
    sceneId: v.id("parallaxScenes"),
  },
  handler: async (ctx, args) => {
    const scene = await ctx.runQuery(
      internal.parallaxScenes.internalGetWithUrls,
      { id: args.sceneId }
    );

    if (!scene || !scene.layersWithUrls || scene.layersWithUrls.length === 0) {
      console.error("[Composite] No layers found for scene", args.sceneId);
      return;
    }

    const layers = scene.layersWithUrls as Array<{
      index: number;
      depth: number;
      imageUrl: string | null;
    }>;

    // Sort layers by index (back to front: sky first, foreground last)
    const sortedLayers = [...layers]
      .filter((l) => l.imageUrl)
      .sort((a, b) => a.index - b.index);

    if (sortedLayers.length === 0) {
      console.error("[Composite] No layers with URLs found");
      return;
    }

    try {
      // Load the background layer
      const baseImage = await Jimp.read(sortedLayers[0].imageUrl!);
      const width = baseImage.width;
      const height = baseImage.height;

      // Use a smaller size for the preview thumbnail
      const previewWidth = Math.min(400, width);
      const previewHeight = Math.round((previewWidth / width) * height);

      // Resize the base layer
      baseImage.resize({ w: previewWidth, h: previewHeight });

      // Composite overlay layers on top
      for (let i = 1; i < sortedLayers.length; i++) {
        const layerImage = await Jimp.read(sortedLayers[i].imageUrl!);
        layerImage.resize({ w: previewWidth, h: previewHeight });
        baseImage.composite(layerImage, 0, 0);
      }

      // Export as PNG buffer
      const pngBuffer = await baseImage.getBuffer("image/png");

      // Store in Convex storage
      const blob = new Blob([new Uint8Array(pngBuffer)], { type: "image/png" });
      const storageId = await ctx.storage.store(blob);

      // Update the scene with the preview ID
      await ctx.runMutation(internal.parallaxScenes.internalUpdatePreview, {
        id: args.sceneId,
        previewId: storageId,
      });

      console.log(`[Composite] Preview generated for scene ${args.sceneId}`);
    } catch (error) {
      console.error("[Composite] Failed to generate preview:", error);
      // Non-critical - don't throw, just log
    }
  },
});
