import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    creditsBalance: v.number(),
    subscriptionTier: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"]),

  projects: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    gameView: v.optional(v.union(
      v.literal("side-scroller"),
      v.literal("top-down-8dir"),
      v.literal("isometric-8dir")
    )),
    stylePack: v.optional(v.string()),
    frameSize: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_updatedAt", ["updatedAt"]),

  characters: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    name: v.string(),
    sourceImageId: v.optional(v.id("_storage")),
    cleanImageId: v.optional(v.id("_storage")),
    depthMapId: v.optional(v.id("_storage")),
    animalType: v.optional(v.string()),
    metadata: v.optional(v.any()),
    thumbnailUrl: v.optional(v.string()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"]),

  animations: defineTable({
    characterId: v.id("characters"),
    userId: v.string(),
    action: v.string(),
    direction: v.string(),
    frameCount: v.number(),
    fps: v.number(),
    loopEnforced: v.boolean(),
    status: v.string(),
    spriteSheetId: v.optional(v.id("_storage")),
    previewGifUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_characterId", ["characterId"])
    .index("by_userId", ["userId"]),

  frames: defineTable({
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
  })
    .index("by_animationId", ["animationId"])
    .index("by_animationId_frameIndex", ["animationId", "frameIndex"]),

  jobs: defineTable({
    userId: v.string(),
    jobType: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    progress: v.number(),
    currentStep: v.optional(v.string()),
    entityId: v.optional(v.string()),
    entityType: v.optional(v.string()),
    inputParams: v.optional(v.any()),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    creditsCharged: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"]),

  jobSteps: defineTable({
    jobId: v.id("jobs"),
    stepName: v.string(),
    stepOrder: v.number(),
    status: v.string(),
    provider: v.optional(v.string()),
    modelId: v.optional(v.string()),
    inputParams: v.optional(v.any()),
    output: v.optional(v.any()),
    durationMs: v.optional(v.number()),
  })
    .index("by_jobId", ["jobId"])
    .index("by_jobId_stepOrder", ["jobId", "stepOrder"]),

  exports: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    exportFormat: v.string(),
    fileId: v.optional(v.id("_storage")),
    metadataJson: v.optional(v.any()),
    status: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"]),

  creditTransactions: defineTable({
    userId: v.string(),
    amount: v.number(),
    balanceAfter: v.number(),
    transactionType: v.string(),
    stripePaymentId: v.optional(v.string()),
    jobId: v.optional(v.id("jobs")),
    description: v.optional(v.string()),
  })
    .index("by_userId", ["userId"]),

  stylePacks: defineTable({
    packId: v.string(),
    name: v.string(),
    description: v.string(),
    previewUrl: v.optional(v.string()),
    promptModifier: v.string(),
    img2imgStrength: v.number(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_packId", ["packId"])
    .index("by_isActive_sortOrder", ["isActive", "sortOrder"]),

  textDocuments: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    fileName: v.string(),
    fileId: v.id("_storage"),
    parsedScenes: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
    }))),
    status: v.string(),
    sceneIds: v.optional(v.array(v.id("parallaxScenes"))),
  })
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"]),

  parallaxScenes: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    name: v.string(),
    layerCount: v.number(),
    scenePrompt: v.optional(v.string()),
    layers: v.optional(v.any()),
    previewId: v.optional(v.id("_storage")),
    status: v.string(),
    jobId: v.optional(v.id("jobs")),
    // New fields for device configuration and modes
    deviceWidth: v.optional(v.number()),
    deviceHeight: v.optional(v.number()),
    orientation: v.optional(v.string()), // "portrait" | "landscape"
    mode: v.optional(v.string()), // "upload-split" | "text-to-layers"
    sourceImageId: v.optional(v.id("_storage")),
    depthMapId: v.optional(v.id("_storage")),
  })
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"]),
});
