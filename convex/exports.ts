import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import JSZip from "jszip";
import {
  generateUnityAtlas,
  generateGodotResource,
  generateAtlasMetadata,
} from "./lib/spritePacker";

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }

    return await ctx.db
      .query("exports")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("exports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const exportRecord = await ctx.db.get(args.id);
    if (!exportRecord || exportRecord.userId !== identity.subject) {
      throw new Error("Export not found or unauthorized");
    }

    return exportRecord;
  },
});

export const getDownloadUrl = query({
  args: { id: v.id("exports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const exportRecord = await ctx.db.get(args.id);
    if (!exportRecord || exportRecord.userId !== identity.subject) {
      throw new Error("Export not found or unauthorized");
    }

    if (!exportRecord.fileId) return null;
    return await ctx.storage.getUrl(exportRecord.fileId);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    exportFormat: v.string(),
    metadataJson: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }

    return await ctx.db.insert("exports", {
      userId: identity.subject,
      projectId: args.projectId,
      exportFormat: args.exportFormat,
      metadataJson: args.metadataJson,
      status: "pending",
    });
  },
});

export const updateStatus = mutation({
  args: {
    exportId: v.id("exports"),
    status: v.string(),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.exportId, {
      status: args.status,
      ...(args.fileId ? { fileId: args.fileId } : {}),
    });
  },
});

export const generateExport = action({
  args: {
    projectId: v.id("projects"),
    exportFormat: v.union(
      v.literal("unity"),
      v.literal("godot"),
      v.literal("generic")
    ),
  },
  handler: async (ctx, args): Promise<{ exportId: string; downloadUrl: string | null }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Create export record
    const exportId: Id<"exports"> = await ctx.runMutation(
      api.exports.create,
      {
        projectId: args.projectId,
        exportFormat: args.exportFormat,
      }
    );

    try {
      // Get all characters in this project
      const characters = await ctx.runQuery(
        api.characters.listByProject,
        { projectId: args.projectId }
      );

      if (!characters || (characters as unknown[]).length === 0) {
        throw new Error("No characters found in project");
      }

      const zip = new JSZip();

      for (const character of characters as Array<{
        _id: Id<"characters">;
        name: string;
      }>) {
        const charFolder = zip.folder(
          character.name.toLowerCase().replace(/\s+/g, "_")
        );
        if (!charFolder) continue;

        // Get all animations for this character
        const animations = await ctx.runQuery(
          api.animations.listByCharacter,
          { characterId: character._id }
        );

        for (const anim of animations as Array<{
          _id: Id<"animations">;
          action: string;
          direction: string;
          frameCount: number;
          fps: number;
          spriteSheetId?: Id<"_storage">;
          metadata?: { style?: string; imageWidth?: number; imageHeight?: number };
        }>) {
          if (!anim.spriteSheetId) continue;

          const sheetUrl = await ctx.storage.getUrl(anim.spriteSheetId);
          if (!sheetUrl) continue;

          const response = await fetch(sheetUrl);
          const sheetBuffer = await response.arrayBuffer();

          const baseName = `${anim.action}_${anim.direction}`;
          const animFolder = charFolder.folder(baseName);
          if (!animFolder) continue;

          // Add spritesheet PNG
          animFolder.file(`${baseName}.png`, sheetBuffer);

          // Generate metadata based on export format
          const style = anim.metadata?.style || "walking_and_idle";
          const imageWidth = anim.metadata?.imageWidth || 512;
          const imageHeight = anim.metadata?.imageHeight || 256;

          const atlasMetadata = generateAtlasMetadata({
            imageWidth,
            imageHeight,
            style,
            animationAction: anim.action,
            fps: anim.fps,
          });

          if (args.exportFormat === "unity") {
            const unityAtlas = generateUnityAtlas(atlasMetadata, baseName);
            animFolder.file(
              `${baseName}.json`,
              JSON.stringify(unityAtlas, null, 2)
            );
          } else if (args.exportFormat === "godot") {
            const godotRes = generateGodotResource(atlasMetadata, baseName);
            animFolder.file(`${baseName}.tres`, godotRes);
          }

          // Always include generic metadata
          animFolder.file(
            `atlas.json`,
            JSON.stringify(atlasMetadata, null, 2)
          );
        }
      }

      // Generate ZIP buffer
      const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
      const blob = new Blob([zipBuffer], { type: "application/zip" });

      // Store in Convex storage
      const fileId = await ctx.storage.store(blob);

      // Update export record
      await ctx.runMutation(api.exports.updateStatus, {
        exportId,
        status: "completed",
        fileId,
      });

      // Get download URL to return directly
      const downloadUrl = await ctx.storage.getUrl(fileId);

      return { exportId, downloadUrl };
    } catch (error) {
      await ctx.runMutation(api.exports.updateStatus, {
        exportId,
        status: "failed",
      });
      throw error;
    }
  },
});

// Layer name mapping for export file names
const LAYER_NAMES = [
  "sky",
  "mountains",
  "hills",
  "midground",
  "trees",
  "foreground",
  "ground",
  "close_foreground",
];

// Calculate scroll duration based on depth (matching devicePresets.ts)
function calculateScrollDuration(depth: number): number {
  if (depth === 0) return 0;
  const baseDuration = 6000;
  const maxDuration = 30000;
  if (depth >= 1) return baseDuration;
  return Math.min(Math.round(baseDuration / depth), maxDuration);
}

// Calculate layer height percentages
function calculateLayerHeightPercent(index: number, layerCount: number): number {
  if (index === 0) return 0.35; // Sky
  if (index === layerCount - 1) return 0.35; // Foreground
  return 0.5; // Mid layers
}

export const generateParallaxExport = action({
  args: {
    sceneId: v.id("parallaxScenes"),
  },
  handler: async (ctx, args): Promise<{ downloadUrl: string | null }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Fetch scene with layer URLs
    const scene = await ctx.runQuery(api.parallaxScenes.getWithUrls, {
      id: args.sceneId,
    });

    if (!scene) {
      throw new Error("Scene not found");
    }

    const layersWithUrls = scene.layersWithUrls as Array<{
      index: number;
      depth: number;
      imageUrl: string | null;
    }>;

    if (!layersWithUrls || layersWithUrls.length === 0) {
      throw new Error("No layers found in scene");
    }

    const zip = new JSZip();
    const sceneName = scene.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const sceneFolder = zip.folder(sceneName);
    if (!sceneFolder) throw new Error("Failed to create scene folder");

    const layersFolder = sceneFolder.folder("layers");
    if (!layersFolder) throw new Error("Failed to create layers folder");

    // Sort layers by index
    const sortedLayers = [...layersWithUrls].sort((a, b) => a.index - b.index);

    // Build layer metadata
    const layerMetadata: Array<{
      index: number;
      name: string;
      filename: string;
      depth: number;
      scrollDuration: number;
      heightPercent: number;
    }> = [];

    // Download and add each layer to ZIP
    for (const layer of sortedLayers) {
      if (!layer.imageUrl) continue;

      const layerName = LAYER_NAMES[Math.min(layer.index, LAYER_NAMES.length - 1)];
      const filename = `layer_${layer.index}_${layerName}.png`;

      const response = await fetch(layer.imageUrl);
      if (!response.ok) {
        console.error(`Failed to fetch layer ${layer.index}`);
        continue;
      }

      const imageBuffer = await response.arrayBuffer();
      layersFolder.file(filename, imageBuffer);

      layerMetadata.push({
        index: layer.index,
        name: layerName,
        filename,
        depth: layer.depth,
        scrollDuration: calculateScrollDuration(layer.depth),
        heightPercent: calculateLayerHeightPercent(layer.index, sortedLayers.length),
      });
    }

    // Create metadata.json
    const metadata = {
      sceneName: scene.name,
      layerCount: sortedLayers.length,
      device: {
        width: scene.deviceWidth || 1170,
        height: scene.deviceHeight || 2532,
        orientation: scene.orientation || "portrait",
      },
      mode: scene.mode || "upload-split",
      generatedAt: new Date().toISOString(),
      layers: layerMetadata,
    };
    sceneFolder.file("metadata.json", JSON.stringify(metadata, null, 2));

    // Create scroll_speeds.json for easy parsing
    const scrollSpeeds = layerMetadata.map((layer) => ({
      layer: layer.index,
      name: layer.name,
      duration: layer.scrollDuration,
      depth: layer.depth,
    }));
    sceneFolder.file("scroll_speeds.json", JSON.stringify(scrollSpeeds, null, 2));

    // Create README.txt
    const readme = `ParallaxForge Export
====================

Scene: ${scene.name}
Layers: ${sortedLayers.length}
Device: ${metadata.device.width}x${metadata.device.height} (${metadata.device.orientation})
Generated: ${metadata.generatedAt}

Layer Files:
${layerMetadata.map((l) => `  - ${l.filename} (depth: ${l.depth.toFixed(2)}, scroll: ${l.scrollDuration}ms)`).join("\n")}

Usage:
------
1. Import all layer images from the layers/ folder
2. Stack layers from index 0 (back) to highest (front)
3. Apply scroll animations based on scroll_speeds.json:
   - duration: 0 means static (no scroll)
   - lower duration = faster scroll
   - Layer width should be 2x device width for seamless looping

Recommended Implementation:
---------------------------
- Use CSS animations or requestAnimationFrame for scrolling
- Apply translateX animation based on scroll duration
- Loop seamlessly by resetting position when reaching halfway point
- Layer 0 (sky) is typically static
- Foreground layers move fastest

Files:
------
- layers/          - Individual layer PNG files
- metadata.json    - Full scene and layer metadata
- scroll_speeds.json - Scroll timing for each layer
- README.txt       - This file

For implementation examples and documentation, visit:
https://parallaxforge.com/docs

Generated by ParallaxForge
`;
    sceneFolder.file("README.txt", readme);

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
    const blob = new Blob([zipBuffer], { type: "application/zip" });

    // Store in Convex storage
    const fileId = await ctx.storage.store(blob);
    const downloadUrl = await ctx.storage.getUrl(fileId);

    return { downloadUrl };
  },
});
