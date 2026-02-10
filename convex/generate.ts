import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  getSpriteProvider,
  getSceneProvider,
  getBGRemovalProvider,
  getImg2ImgProvider,
  getDepthProvider,
  getUpscalingProvider,
} from "./lib/providers";
import {
  buildSpritePrompt,
  buildStyleTransferPrompt,
  buildParallaxPrompt,
} from "./lib/prompts";
import { calculateGridLayout } from "./lib/spritePacker";

// Pipeline step names for progress tracking
const PIPELINE_STEPS = [
  "bg-removal",
  "style-transfer",
  "sprite-generation",
  "frame-extraction",
  "alignment",
  "sprite-packing",
  "finalize",
] as const;

type PipelineStep = (typeof PIPELINE_STEPS)[number];

// Progress allocation per step (percentages)
const STEP_PROGRESS: Record<PipelineStep, { start: number; end: number }> = {
  "bg-removal": { start: 0, end: 10 },
  "style-transfer": { start: 10, end: 25 },
  "sprite-generation": { start: 25, end: 60 },
  "frame-extraction": { start: 60, end: 70 },
  alignment: { start: 70, end: 80 },
  "sprite-packing": { start: 80, end: 90 },
  finalize: { start: 90, end: 100 },
};

export const spriteGeneration = action({
  args: {
    characterId: v.id("characters"),
    actions: v.array(v.string()),
    directions: v.array(v.string()),
    stylePack: v.string(),
    fps: v.optional(v.number()),
    gameView: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ jobId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Get character data
    const character = await ctx.runQuery(api.characters.get, {
      id: args.characterId,
    });
    if (!character) throw new Error("Character not found");

    // Get project for gameView
    const project = await ctx.runQuery(api.projects.get, {
      id: character.projectId,
    });
    if (!project) throw new Error("Project not found");

    // Calculate and deduct credits before any generation work
    const CREDITS_PER_ANIMATION = 2;
    const totalAnimations = args.actions.length * args.directions.length;
    const totalCost = totalAnimations * CREDITS_PER_ANIMATION;

    const remainingBalance = await ctx.runMutation(api.billing.deductCredits, {
      amount: totalCost,
      description: `Sprite generation: ${args.actions.length} action(s) × ${args.directions.length} direction(s)`,
    });

    // Create job (with actual cost recorded)
    const jobId: Id<"jobs"> = await ctx.runMutation(
      internal.generateHelpers.createSpriteJob,
      {
        characterId: args.characterId,
        inputParams: {
          actions: args.actions,
          directions: args.directions,
          stylePack: args.stylePack,
          gameView: project.gameView || "side-scroller",
        },
        creditsCharged: totalCost,
      }
    );

    let completedAnimations = 0;
    let stepOrder = 0;

    try {
      // ═══════════════════════════════════════════════════════════════════════
      // STEP 1: Background Removal
      // ═══════════════════════════════════════════════════════════════════════
      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["bg-removal"].start,
        currentStep: "bg-removal",
        status: "processing",
      });

      let cleanImageUrl: string | null = null;

      if (character.sourceImageId) {
        const sourceUrl = await ctx.storage.getUrl(character.sourceImageId);
        if (sourceUrl) {
          const bgProvider = getBGRemovalProvider();
          const startTime = Date.now();
          const bgResult = await bgProvider.removeBackground({
            imageUrl: sourceUrl,
          });
          const durationMs = Date.now() - startTime;

          if (bgResult.output) {
            const outputUrl =
              typeof bgResult.output === "string"
                ? bgResult.output
                : bgResult.output[0];
            cleanImageUrl = outputUrl;

            // Store the clean image
            const response = await fetch(outputUrl);
            const blob = await response.blob();
            const storageId = await ctx.storage.store(blob);
            await ctx.runMutation(api.characters.update, {
              id: args.characterId,
              cleanImageId: storageId,
            });

            await ctx.runMutation(internal.generateHelpers.createJobStep, {
              jobId,
              stepName: "bg-removal",
              stepOrder: stepOrder++,
              status: "completed",
              provider: bgProvider.name,
              modelId: bgProvider.modelId,
              durationMs,
            });
          }
        }
      } else {
        // No source image - mark step as skipped
        await ctx.runMutation(internal.generateHelpers.createJobStep, {
          jobId,
          stepName: "bg-removal",
          stepOrder: stepOrder++,
          status: "completed",
          durationMs: 0,
        });
      }

      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["bg-removal"].end,
        currentStep: "bg-removal",
        status: "processing",
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 2: Style Transfer (if we have a clean image)
      // ═══════════════════════════════════════════════════════════════════════
      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["style-transfer"].start,
        currentStep: "style-transfer",
        status: "processing",
      });

      let styledReferenceUrl: string | null = null;
      const animalType = character.animalType || character.name;

      if (cleanImageUrl) {
        const styleProvider = getImg2ImgProvider();
        const stylePrompt = buildStyleTransferPrompt(animalType, args.stylePack);

        const startTime = Date.now();
        const styledResult = await styleProvider.transform({
          imageUrl: cleanImageUrl,
          prompt: stylePrompt,
          strength: 0.5, // Balance between preserving reference and applying style
        });
        const durationMs = Date.now() - startTime;

        if (styledResult.output) {
          styledReferenceUrl =
            typeof styledResult.output === "string"
              ? styledResult.output
              : styledResult.output[0];

          await ctx.runMutation(internal.generateHelpers.createJobStep, {
            jobId,
            stepName: "style-transfer",
            stepOrder: stepOrder++,
            status: "completed",
            provider: styleProvider.name,
            modelId: styleProvider.modelId,
            durationMs,
          });
        }
      } else {
        // No reference image - mark step as skipped
        await ctx.runMutation(internal.generateHelpers.createJobStep, {
          jobId,
          stepName: "style-transfer",
          stepOrder: stepOrder++,
          status: "completed",
          durationMs: 0,
        });
      }

      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["style-transfer"].end,
        currentStep: "style-transfer",
        status: "processing",
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 3: Sprite Generation
      // ═══════════════════════════════════════════════════════════════════════
      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["sprite-generation"].start,
        currentStep: "sprite-generation",
        status: "processing",
      });

      const spriteProvider = getSpriteProvider();

      // Determine rd-animation style based on game view
      const rdStyle =
        project.gameView === "side-scroller"
          ? "walking_and_idle"
          : "four_angle_walking";

      // Use styled reference if available, otherwise clean image, otherwise no reference
      const referenceImageUrl = styledReferenceUrl || cleanImageUrl || undefined;

      const animationResults: Array<{
        action: string;
        direction: string;
        sheetStorageId: Id<"_storage">;
        gridLayout: { columns: number; rows: number };
        imageWidth: number;
        imageHeight: number;
        prompt: string;
      }> = [];

      for (const animAction of args.actions) {
        for (const direction of args.directions) {
          // Build comprehensive prompt with animal locomotion awareness
          const prompt = buildSpritePrompt({
            animalType,
            action: animAction,
            direction,
            gameView: project.gameView || "side-scroller",
            stylePack: args.stylePack,
          });

          console.log(`[Generation] Prompt for ${animAction}/${direction}:`, prompt);

          const startTime = Date.now();
          const spriteResult = await spriteProvider.generateSpriteSheet({
            prompt,
            imageUrl: referenceImageUrl,
            style: rdStyle,
          });
          const durationMs = Date.now() - startTime;

          if (!spriteResult.output) {
            throw new Error(
              `Sprite generation failed for ${animAction}/${direction}: no output`
            );
          }

          const outputUrl =
            typeof spriteResult.output === "string"
              ? spriteResult.output
              : spriteResult.output[0];

          // Upscale the spritesheet 4x for better quality game sprites
          // rd-animation outputs small sprites (~48x48 per frame), upscaling to ~192x192
          let finalUrl = outputUrl;
          let upscaleSucceeded = false;

          try {
            const upscalingProvider = getUpscalingProvider();
            const upscaleResult = await upscalingProvider.upscale({
              imageUrl: outputUrl,
              scale: 4,
            });

            if (upscaleResult.output) {
              finalUrl = typeof upscaleResult.output === "string"
                ? upscaleResult.output
                : upscaleResult.output[0];
              upscaleSucceeded = true;
              console.log(`[Generation] Upscaled sprite successfully for ${animAction}/${direction}`);
            }
          } catch (upscaleError) {
            console.warn(`[Generation] Upscaling failed for ${animAction}/${direction}, using original sprite:`, upscaleError);
            // Continue with non-upscaled image - finalUrl already set to outputUrl
          }

          // Download and store the spritesheet (upscaled or original)
          const sheetResponse = await fetch(finalUrl);
          const sheetBlob = await sheetResponse.blob();
          const sheetStorageId = await ctx.storage.store(sheetBlob);

          // Get image dimensions - scale factor depends on whether upscaling succeeded
          // rd-animation outputs 512x256 for walking_and_idle, 512x512 for four_angle_walking
          // After 4x upscale: 2048x1024 or 2048x2048
          const baseWidth = 512;
          const baseHeight = rdStyle === "four_angle_walking" ? 512 : 256;
          const scaleFactor = upscaleSucceeded ? 4 : 1;
          const imageWidth = baseWidth * scaleFactor;
          const imageHeight = baseHeight * scaleFactor;

          const gridLayout = calculateGridLayout(
            imageWidth,
            imageHeight,
            rdStyle
          );

          animationResults.push({
            action: animAction,
            direction,
            sheetStorageId,
            gridLayout,
            imageWidth,
            imageHeight,
            prompt,
          });

          await ctx.runMutation(internal.generateHelpers.createJobStep, {
            jobId,
            stepName: `sprite-${animAction}-${direction}`,
            stepOrder: stepOrder++,
            status: "completed",
            provider: spriteProvider.name,
            modelId: spriteProvider.modelId,
            durationMs,
          });

          completedAnimations++;
          const progressRange =
            STEP_PROGRESS["sprite-generation"].end -
            STEP_PROGRESS["sprite-generation"].start;
          const progress =
            STEP_PROGRESS["sprite-generation"].start +
            Math.floor((completedAnimations / totalAnimations) * progressRange);

          await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
            jobId,
            progress,
            currentStep: `sprite-generation`,
            status: "processing",
          });
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 4: Frame Extraction
      // ═══════════════════════════════════════════════════════════════════════
      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["frame-extraction"].start,
        currentStep: "frame-extraction",
        status: "processing",
      });

      // Frame extraction is done client-side for preview, but we log the step
      await ctx.runMutation(internal.generateHelpers.createJobStep, {
        jobId,
        stepName: "frame-extraction",
        stepOrder: stepOrder++,
        status: "completed",
        durationMs: 0,
        output: {
          note: "Frames extracted client-side for preview",
          totalSheets: animationResults.length,
        },
      });

      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["frame-extraction"].end,
        currentStep: "frame-extraction",
        status: "processing",
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 5: Alignment
      // ═══════════════════════════════════════════════════════════════════════
      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["alignment"].start,
        currentStep: "alignment",
        status: "processing",
      });

      // Alignment is implicit in the consistent generation
      await ctx.runMutation(internal.generateHelpers.createJobStep, {
        jobId,
        stepName: "alignment",
        stepOrder: stepOrder++,
        status: "completed",
        durationMs: 0,
        output: { note: "Alignment ensured via consistent prompt constraints" },
      });

      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["alignment"].end,
        currentStep: "alignment",
        status: "processing",
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 6: Sprite Packing
      // ═══════════════════════════════════════════════════════════════════════
      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["sprite-packing"].start,
        currentStep: "sprite-packing",
        status: "processing",
      });

      // Sprite packing: Store animation records with layout metadata
      for (const result of animationResults) {
        await ctx.runMutation(api.animations.create, {
          characterId: args.characterId,
          action: result.action,
          direction: result.direction,
          frameCount: result.gridLayout.columns * result.gridLayout.rows,
          fps: args.fps ?? 12,
          loopEnforced: true,
          status: "completed",
          spriteSheetId: result.sheetStorageId,
          metadata: {
            style: rdStyle,
            imageWidth: result.imageWidth,
            imageHeight: result.imageHeight,
            gridColumns: result.gridLayout.columns,
            gridRows: result.gridLayout.rows,
            prompt: result.prompt,
            provider: spriteProvider.name,
            modelId: spriteProvider.modelId,
            gameView: project.gameView || "side-scroller",
            stylePack: args.stylePack,
          },
        });
      }

      await ctx.runMutation(internal.generateHelpers.createJobStep, {
        jobId,
        stepName: "sprite-packing",
        stepOrder: stepOrder++,
        status: "completed",
        durationMs: 0,
        output: {
          totalAnimations: animationResults.length,
          layouts: animationResults.map((r) => ({
            action: r.action,
            direction: r.direction,
            grid: `${r.gridLayout.columns}x${r.gridLayout.rows}`,
          })),
        },
      });

      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["sprite-packing"].end,
        currentStep: "sprite-packing",
        status: "processing",
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 7: Finalize
      // ═══════════════════════════════════════════════════════════════════════
      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: STEP_PROGRESS["finalize"].start,
        currentStep: "finalize",
        status: "processing",
      });

      await ctx.runMutation(internal.generateHelpers.createJobStep, {
        jobId,
        stepName: "finalize",
        stepOrder: stepOrder++,
        status: "completed",
        durationMs: 0,
      });

      await ctx.runMutation(internal.generateHelpers.completeJob, {
        jobId,
        result: {
          characterId: args.characterId,
          totalAnimations: completedAnimations,
          gameView: project.gameView || "side-scroller",
          stylePack: args.stylePack,
          animations: animationResults.map((r) => ({
            action: r.action,
            direction: r.direction,
            status: "completed",
            frameCount: r.gridLayout.columns * r.gridLayout.rows,
          })),
        },
      });

      return { jobId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Sprite generation failed:", errorMessage);

      await ctx.runMutation(internal.generateHelpers.failJob, {
        jobId,
        error: errorMessage,
      });

      // Refund credits on failure
      try {
        const job = await ctx.runQuery(api.jobs.get, { id: jobId });
        if (job && job.creditsCharged > 0) {
          await ctx.runMutation(api.billing.refundCredits, {
            jobId,
            amount: job.creditsCharged,
          });
        }
      } catch {
        // Best effort refund
      }

      throw error;
    }
  },
});

// ── Non-blocking parallax generation (returns jobId immediately) ──

export const startParallaxGeneration = action({
  args: {
    sceneId: v.id("parallaxScenes"),
    layerCount: v.number(),
    scenePrompt: v.string(),
    artStyle: v.optional(v.union(
      v.literal("pixel-art"),
      v.literal("realistic"),
      v.literal("cartoon"),
      v.literal("watercolor"),
      v.literal("custom")
    )),
    deviceWidth: v.optional(v.number()),
    deviceHeight: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ jobId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const scene = await ctx.runQuery(api.parallaxScenes.get, {
      id: args.sceneId,
    });
    if (!scene) throw new Error("Scene not found");

    const project = await ctx.runQuery(api.projects.get, {
      id: scene.projectId,
    });
    if (!project) throw new Error("Project not found");

    const totalCost = args.layerCount;
    await ctx.runMutation(api.billing.deductCredits, {
      amount: totalCost,
      description: `Parallax generation: ${args.layerCount} layers`,
    });

    const jobId: Id<"jobs"> = await ctx.runMutation(
      internal.generateHelpers.createParallaxJob,
      {
        sceneId: args.sceneId,
        inputParams: {
          layerCount: args.layerCount,
          scenePrompt: args.scenePrompt,
          stylePack: project.stylePack || "pixel-art",
        },
      }
    );

    // Schedule the actual generation in the background - returns immediately
    await ctx.scheduler.runAfter(0, internal.generate.executeParallaxGeneration, {
      jobId,
      sceneId: args.sceneId,
      layerCount: args.layerCount,
      scenePrompt: args.scenePrompt,
      artStyle: args.artStyle || "pixel-art",
      deviceWidth: args.deviceWidth || 1080,
      deviceHeight: args.deviceHeight || 1920,
      stylePack: project.stylePack || "pixel-art",
    });

    return { jobId };
  },
});

// ── Background parallax generation worker ──

export const executeParallaxGeneration = internalAction({
  args: {
    jobId: v.id("jobs"),
    sceneId: v.id("parallaxScenes"),
    layerCount: v.number(),
    scenePrompt: v.string(),
    artStyle: v.string(),
    deviceWidth: v.number(),
    deviceHeight: v.number(),
    stylePack: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const sceneProvider = getSceneProvider();

      // Determine aspect ratio from device dimensions
      const ratio = args.deviceWidth / args.deviceHeight;
      let aspectRatio: string;
      if (ratio > 1.4) aspectRatio = "16:9";
      else if (ratio > 1.1) aspectRatio = "4:3";
      else if (ratio > 0.9) aspectRatio = "1:1";
      else if (ratio > 0.7) aspectRatio = "3:4";
      else aspectRatio = "9:16";

      const layers: Array<{
        layerIndex: number;
        depth: number;
        storageId: Id<"_storage">;
      }> = [];

      for (let i = 0; i < args.layerCount; i++) {
        // Check if job was cancelled before generating next layer
        const jobStatus = await ctx.runMutation(
          internal.generateHelpers.getJobStatus,
          { jobId: args.jobId }
        );
        if (jobStatus === "cancelled") {
          console.log(`[Parallax] Job ${args.jobId} cancelled by user, stopping at layer ${i}`);
          return;
        }

        const prompt = buildParallaxPrompt({
          scenePrompt: args.scenePrompt,
          layerIndex: i,
          totalLayers: args.layerCount,
          stylePack: args.stylePack,
          artStyle: args.artStyle as "pixel-art" | "realistic" | "cartoon" | "watercolor" | "custom",
        });

        console.log(`[Parallax] Layer ${i} prompt:`, prompt);

        const result = await sceneProvider.generateScene({
          prompt,
          aspectRatio,
        });

        if (result.output) {
          let outputUrl =
            typeof result.output === "string"
              ? result.output
              : result.output[0];

          // For non-sky layers (index > 0), run background removal
          // to get actual PNG transparency instead of white backgrounds
          if (i > 0) {
            try {
              console.log(`[Parallax] Running background removal on layer ${i}`);
              const bgRemover = getBGRemovalProvider();
              const bgResult = await bgRemover.removeBackground({ imageUrl: outputUrl });
              if (bgResult.output) {
                outputUrl = typeof bgResult.output === "string"
                  ? bgResult.output
                  : bgResult.output[0];
              }
            } catch (bgError) {
              console.warn(`[Parallax] Background removal failed for layer ${i}, using original:`, bgError);
            }
          }

          const layerResponse = await fetch(outputUrl);
          const layerBlob = await layerResponse.blob();
          const storageId = await ctx.storage.store(layerBlob);

          layers.push({
            layerIndex: i,
            depth: i / (args.layerCount - 1),
            storageId,
          });
        }

        const progress = Math.floor(((i + 1) / args.layerCount) * 90);
        await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
          jobId: args.jobId,
          progress,
          currentStep: `layer-${i}`,
          status: "processing",
        });

        await ctx.runMutation(internal.generateHelpers.createJobStep, {
          jobId: args.jobId,
          stepName: `layer-${i}`,
          stepOrder: i,
          status: "completed",
          provider: sceneProvider.name,
          modelId: sceneProvider.modelId,
          output: {
            layerIndex: i,
            depth: i / (args.layerCount - 1),
          },
        });
      }

      // Update scene with layer data
      await ctx.runMutation(api.parallaxScenes.updateLayers, {
        id: args.sceneId,
        layers: layers.map((l) => ({
          index: l.layerIndex,
          depth: l.depth,
          imageId: l.storageId,
        })),
      });

      await ctx.runMutation(internal.generateHelpers.completeJob, {
        jobId: args.jobId,
        result: {
          sceneId: args.sceneId,
          layers: layers.map((l) => ({
            layerIndex: l.layerIndex,
            depth: l.depth,
            status: "completed",
          })),
        },
      });

      // Schedule composite preview generation (non-critical)
      try {
        await ctx.scheduler.runAfter(0, internal.compositePreview.generateCompositePreview, {
          sceneId: args.sceneId,
        });
      } catch (previewError) {
        console.error("Failed to schedule composite preview:", previewError);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Parallax generation failed:", errorMessage);

      await ctx.runMutation(internal.generateHelpers.failJob, {
        jobId: args.jobId,
        error: errorMessage,
      });

      try {
        await ctx.runMutation(api.billing.refundCredits, {
          jobId: args.jobId,
          amount: args.layerCount,
        });
      } catch {
        // Best effort refund
      }
    }
  },
});

// ── Legacy blocking parallax generation (used by batchParallaxGeneration) ──

export const parallaxGeneration = action({
  args: {
    sceneId: v.id("parallaxScenes"),
    layerCount: v.number(),
    scenePrompt: v.string(),
    artStyle: v.optional(v.union(
      v.literal("pixel-art"),
      v.literal("realistic"),
      v.literal("cartoon"),
      v.literal("watercolor"),
      v.literal("custom")
    )),
    deviceWidth: v.optional(v.number()),
    deviceHeight: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ jobId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const scene = await ctx.runQuery(api.parallaxScenes.get, {
      id: args.sceneId,
    });
    if (!scene) throw new Error("Scene not found");

    const project = await ctx.runQuery(api.projects.get, {
      id: scene.projectId,
    });
    if (!project) throw new Error("Project not found");

    const totalCost = args.layerCount;
    await ctx.runMutation(api.billing.deductCredits, {
      amount: totalCost,
      description: `Parallax generation: ${args.layerCount} layers`,
    });

    const jobId: Id<"jobs"> = await ctx.runMutation(
      internal.generateHelpers.createParallaxJob,
      {
        sceneId: args.sceneId,
        inputParams: {
          layerCount: args.layerCount,
          scenePrompt: args.scenePrompt,
          stylePack: project.stylePack || "pixel-art",
        },
      }
    );

    try {
      const sceneProvider = getSceneProvider();

      const width = args.deviceWidth || 1080;
      const height = args.deviceHeight || 1920;
      const ratio = width / height;
      let aspectRatio: string;
      if (ratio > 1.4) aspectRatio = "16:9";
      else if (ratio > 1.1) aspectRatio = "4:3";
      else if (ratio > 0.9) aspectRatio = "1:1";
      else if (ratio > 0.7) aspectRatio = "3:4";
      else aspectRatio = "9:16";

      const layers: Array<{
        layerIndex: number;
        depth: number;
        storageId: Id<"_storage">;
      }> = [];

      for (let i = 0; i < args.layerCount; i++) {
        const prompt = buildParallaxPrompt({
          scenePrompt: args.scenePrompt,
          layerIndex: i,
          totalLayers: args.layerCount,
          stylePack: project.stylePack || "pixel-art",
          artStyle: args.artStyle || "pixel-art",
        });

        console.log(`[Parallax] Layer ${i} prompt:`, prompt);

        const result = await sceneProvider.generateScene({
          prompt,
          aspectRatio,
        });

        if (result.output) {
          let outputUrl =
            typeof result.output === "string"
              ? result.output
              : result.output[0];

          // For non-sky layers (index > 0), run background removal
          if (i > 0) {
            try {
              const bgRemover = getBGRemovalProvider();
              const bgResult = await bgRemover.removeBackground({ imageUrl: outputUrl });
              if (bgResult.output) {
                outputUrl = typeof bgResult.output === "string"
                  ? bgResult.output
                  : bgResult.output[0];
              }
            } catch (bgError) {
              console.warn(`[Parallax] Background removal failed for layer ${i}, using original:`, bgError);
            }
          }

          const layerResponse = await fetch(outputUrl);
          const layerBlob = await layerResponse.blob();
          const storageId = await ctx.storage.store(layerBlob);

          layers.push({
            layerIndex: i,
            depth: i / (args.layerCount - 1),
            storageId,
          });
        }

        const progress = Math.floor(((i + 1) / args.layerCount) * 90);
        await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
          jobId,
          progress,
          currentStep: `layer-${i}`,
          status: "processing",
        });

        await ctx.runMutation(internal.generateHelpers.createJobStep, {
          jobId,
          stepName: `layer-${i}`,
          stepOrder: i,
          status: "completed",
          provider: sceneProvider.name,
          modelId: sceneProvider.modelId,
          output: {
            layerIndex: i,
            depth: i / (args.layerCount - 1),
          },
        });
      }

      await ctx.runMutation(api.parallaxScenes.updateLayers, {
        id: args.sceneId,
        layers: layers.map((l) => ({
          index: l.layerIndex,
          depth: l.depth,
          imageId: l.storageId,
        })),
      });

      await ctx.runMutation(internal.generateHelpers.completeJob, {
        jobId,
        result: {
          sceneId: args.sceneId,
          layers: layers.map((l) => ({
            layerIndex: l.layerIndex,
            depth: l.depth,
            status: "completed",
          })),
        },
      });

      // Schedule composite preview (non-critical)
      try {
        await ctx.scheduler.runAfter(0, internal.compositePreview.generateCompositePreview, {
          sceneId: args.sceneId,
        });
      } catch (previewError) {
        console.error("Failed to schedule composite preview:", previewError);
      }

      return { jobId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await ctx.runMutation(internal.generateHelpers.failJob, {
        jobId,
        error: errorMessage,
      });

      try {
        await ctx.runMutation(api.billing.refundCredits, {
          jobId,
          amount: args.layerCount,
        });
      } catch {
        // Best effort refund
      }

      throw error;
    }
  },
});

export const parallaxFromImage = action({
  args: {
    sceneId: v.id("parallaxScenes"),
    imageStorageId: v.id("_storage"),
    layerCount: v.number(),
    deviceWidth: v.number(),
    deviceHeight: v.number(),
  },
  handler: async (ctx, args): Promise<{ jobId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Get scene data
    const scene = await ctx.runQuery(api.parallaxScenes.get, {
      id: args.sceneId,
    });
    if (!scene) throw new Error("Scene not found");

    // Deduct 1 credit for depth-based split
    await ctx.runMutation(api.billing.deductCredits, {
      amount: 1,
      description: `Parallax depth split: ${args.layerCount} layers from uploaded image`,
    });

    const jobId: Id<"jobs"> = await ctx.runMutation(
      internal.generateHelpers.createParallaxJob,
      {
        sceneId: args.sceneId,
        inputParams: {
          mode: "upload-split",
          layerCount: args.layerCount,
          deviceWidth: args.deviceWidth,
          deviceHeight: args.deviceHeight,
        },
      }
    );

    try {
      // Step 1: Get the uploaded image URL
      const imageUrl = await ctx.storage.getUrl(args.imageStorageId);
      if (!imageUrl) throw new Error("Could not get uploaded image URL");

      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: 10,
        currentStep: "depth-estimation",
        status: "processing",
      });

      // Step 2: Run depth estimation
      const depthProvider = getDepthProvider();
      const depthResult = await depthProvider.estimateDepth({
        imageUrl,
      });

      if (!depthResult.output) {
        throw new Error("Depth estimation failed: no output");
      }

      const depthMapUrl =
        typeof depthResult.output === "string"
          ? depthResult.output
          : depthResult.output[0];

      await ctx.runMutation(internal.generateHelpers.createJobStep, {
        jobId,
        stepName: "depth-estimation",
        stepOrder: 0,
        status: "completed",
        provider: depthProvider.name,
        modelId: depthProvider.modelId,
        durationMs: (depthResult.metrics?.predict_time || 0) * 1000,
      });

      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: 40,
        currentStep: "layer-splitting",
        status: "processing",
      });

      // Step 3: Store depth map for reference
      const depthResponse = await fetch(depthMapUrl);
      const depthBlob = await depthResponse.blob();
      const depthStorageId = await ctx.storage.store(depthBlob);

      // Note: Actual layer splitting based on depth thresholds would be done
      // client-side or with a canvas-capable service. For now, we store the
      // depth map and the original image, and let the client handle splitting.

      const layers: Array<{
        index: number;
        depth: number;
        imageId: Id<"_storage">;
      }> = [];

      // For MVP, we'll use the original image for all layers
      // A full implementation would threshold the depth map and mask the original
      for (let i = 0; i < args.layerCount; i++) {
        layers.push({
          index: i,
          depth: i / (args.layerCount - 1),
          imageId: args.imageStorageId, // Would be different for each layer after proper splitting
        });

        await ctx.runMutation(internal.generateHelpers.createJobStep, {
          jobId,
          stepName: `layer-${i}`,
          stepOrder: i + 1,
          status: "completed",
          durationMs: 0,
        });
      }

      await ctx.runMutation(internal.generateHelpers.updateJobProgress, {
        jobId,
        progress: 90,
        currentStep: "finalizing",
        status: "processing",
      });

      // Update scene with layer data and depth map
      await ctx.runMutation(api.parallaxScenes.updateLayers, {
        id: args.sceneId,
        layers,
        depthMapId: depthStorageId,
        sourceImageId: args.imageStorageId,
        mode: "upload-split",
        deviceWidth: args.deviceWidth,
        deviceHeight: args.deviceHeight,
      });

      await ctx.runMutation(internal.generateHelpers.completeJob, {
        jobId,
        result: {
          sceneId: args.sceneId,
          mode: "upload-split",
          layerCount: args.layerCount,
          depthMapId: depthStorageId,
        },
      });

      return { jobId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await ctx.runMutation(internal.generateHelpers.failJob, {
        jobId,
        error: errorMessage,
      });

      // Refund credit on failure
      try {
        await ctx.runMutation(api.billing.refundCredits, {
          jobId,
          amount: 1,
        });
      } catch {
        // Best effort refund
      }

      throw error;
    }
  },
});

// ── Text-to-Scenes Parsing ──────────────────────────────────────────────────

export const parseTextToScenes = action({
  args: {
    textDocumentId: v.id("textDocuments"),
    fileStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Update status to parsing
    await ctx.runMutation(api.textDocuments.updateStatus, {
      id: args.textDocumentId,
      status: "parsing",
    });

    try {
      // Get the file content from storage
      const fileUrl = await ctx.storage.getUrl(args.fileStorageId);
      if (!fileUrl) throw new Error("File not found in storage");

      const response = await fetch(fileUrl);
      const textContent = await response.text();

      // Use AI to parse text into scenes
      const replicateKey = process.env.REPLICATE_API_TOKEN;
      if (!replicateKey) {
        // Smart fallback: detect "SCENE:" delimiters first, then fall back to paragraph split
        let scenes: { name: string; description: string }[];

        const scenePattern = /^SCENE:\s*(.+)$/gm;
        const sceneMatches = [...textContent.matchAll(scenePattern)];

        if (sceneMatches.length >= 2) {
          // File uses "SCENE:" delimiters — split on them
          scenes = sceneMatches.slice(0, 10).map((match, i) => {
            const name = match[1].trim();
            const startIdx = (match.index ?? 0) + match[0].length;
            const endIdx = i < sceneMatches.length - 1
              ? sceneMatches[i + 1].index ?? textContent.length
              : textContent.length;
            const description = textContent.slice(startIdx, endIdx).trim().slice(0, 500);
            return { name, description };
          });
        } else {
          // Generic paragraph split
          const paragraphs = textContent
            .split(/\n\s*\n/)
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 20);

          scenes = paragraphs.slice(0, 10).map((p: string, i: number) => ({
            name: `Scene ${i + 1}`,
            description: p.slice(0, 500),
          }));
        }

        await ctx.runMutation(api.textDocuments.updateParsedScenes, {
          id: args.textDocumentId,
          parsedScenes: scenes,
        });

        return scenes;
      }

      // Use Replicate for AI parsing
      const Replicate = (await import("replicate")).default;
      const replicate = new Replicate({ auth: replicateKey });

      const prompt = `You are a scene parser for a parallax background generator. Given the following text, identify distinct visual scenes that could be turned into layered parallax backgrounds for a game.

For each scene, provide:
- "name": A short descriptive name (3-5 words)
- "description": A visual description suitable for generating a parallax background (focus on landscape elements, lighting, atmosphere, colors)

Return ONLY a valid JSON array. Maximum 10 scenes.

Text:
${textContent.slice(0, 4000)}`;

      const output = await replicate.run("meta/meta-llama-3-70b-instruct", {
        input: {
          prompt,
          max_tokens: 2000,
          temperature: 0.3,
        },
      });

      // Parse the AI response
      const outputText = Array.isArray(output) ? output.join("") : String(output);
      const jsonMatch = outputText.match(/\[[\s\S]*\]/);

      let scenes: { name: string; description: string }[];

      if (jsonMatch) {
        try {
          scenes = JSON.parse(jsonMatch[0]);
        } catch {
          // Fallback parsing
          scenes = textContent
            .split(/\n\s*\n/)
            .filter((p: string) => p.trim().length > 20)
            .slice(0, 10)
            .map((p: string, i: number) => ({
              name: `Scene ${i + 1}`,
              description: p.trim().slice(0, 500),
            }));
        }
      } else {
        scenes = textContent
          .split(/\n\s*\n/)
          .filter((p: string) => p.trim().length > 20)
          .slice(0, 10)
          .map((p: string, i: number) => ({
            name: `Scene ${i + 1}`,
            description: p.trim().slice(0, 500),
          }));
      }

      await ctx.runMutation(api.textDocuments.updateParsedScenes, {
        id: args.textDocumentId,
        parsedScenes: scenes,
      });

      return scenes;
    } catch (error) {
      await ctx.runMutation(api.textDocuments.updateStatus, {
        id: args.textDocumentId,
        status: "failed",
      });
      throw error;
    }
  },
});

export const batchParallaxGeneration = action({
  args: {
    textDocumentId: v.id("textDocuments"),
    projectId: v.id("projects"),
    scenes: v.array(v.object({
      name: v.string(),
      description: v.string(),
    })),
    layerCount: v.number(),
    deviceWidth: v.number(),
    deviceHeight: v.number(),
    orientation: v.string(),
    artStyle: v.optional(v.union(
      v.literal("pixel-art"),
      v.literal("realistic"),
      v.literal("cartoon"),
      v.literal("watercolor"),
      v.literal("custom")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await ctx.runMutation(api.textDocuments.updateStatus, {
      id: args.textDocumentId,
      status: "generating",
    });

    // Get project for stylePack
    const project = await ctx.runQuery(api.projects.get, {
      id: args.projectId,
    });
    if (!project) throw new Error("Project not found");

    const sceneIds: Id<"parallaxScenes">[] = [];

    // Determine dimensions
    const width = args.deviceWidth;
    const height = args.deviceHeight;

    // Create all scenes, deduct credits, and schedule background generation
    for (const scene of args.scenes) {
      // Create scene record
      const sceneId = await ctx.runMutation(api.parallaxScenes.create, {
        projectId: args.projectId,
        name: scene.name,
        layerCount: args.layerCount,
        scenePrompt: scene.description,
      });
      sceneIds.push(sceneId);

      // Deduct credits for this scene
      await ctx.runMutation(api.billing.deductCredits, {
        amount: args.layerCount,
        description: `Parallax generation: ${args.layerCount} layers for "${scene.name}"`,
      });

      // Create job record
      const jobId: Id<"jobs"> = await ctx.runMutation(
        internal.generateHelpers.createParallaxJob,
        {
          sceneId,
          inputParams: {
            layerCount: args.layerCount,
            scenePrompt: scene.description,
            stylePack: project.stylePack || "pixel-art",
          },
        }
      );

      // Schedule background generation (returns immediately)
      await ctx.scheduler.runAfter(0, internal.generate.executeParallaxGeneration, {
        jobId,
        sceneId,
        layerCount: args.layerCount,
        scenePrompt: scene.description,
        artStyle: args.artStyle || "pixel-art",
        deviceWidth: width,
        deviceHeight: height,
        stylePack: project.stylePack || "pixel-art",
      });

      console.log(`[Batch] Scheduled background generation for "${scene.name}" (job: ${jobId})`);
    }

    // Update text document with scene IDs (generation is in-progress, not complete yet)
    await ctx.runMutation(api.textDocuments.updateStatus, {
      id: args.textDocumentId,
      status: "completed",
      sceneIds,
    });

    return {
      sceneIds,
      scheduledCount: args.scenes.length,
    };
  },
});
