import { query } from "./_generated/server";
import { v } from "convex/values";

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    // Fetch all data in parallel
    const [projects, allScenes, profile, allJobs] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("parallaxScenes")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("jobs")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .collect(),
    ]);

    // Stats
    const completedJobs = allJobs.filter((j) => j.status === "completed");
    const stats = {
      projectCount: projects.length,
      sceneCount: allScenes.length,
      creditsBalance: profile?.creditsBalance ?? 0,
      totalGenerations: completedJobs.length,
    };

    // Active jobs (queued or processing)
    const activeJobs = allJobs
      .filter((j) => j.status === "queued" || j.status === "processing")
      .slice(0, 5);

    // Recent projects (last 6) with scene counts and latest preview
    const sortedProjects = projects.sort(
      (a, b) => b._creationTime - a._creationTime
    );
    const recentProjects = await Promise.all(
      sortedProjects.slice(0, 6).map(async (project) => {
        const scenes = allScenes.filter(
          (s) => s.projectId === project._id
        );
        const completedScenes = scenes
          .filter((s) => s.status === "completed" && s.previewId)
          .sort((a, b) => b._creationTime - a._creationTime);

        let latestPreviewUrl: string | null = null;
        if (completedScenes.length > 0 && completedScenes[0].previewId) {
          latestPreviewUrl = await ctx.storage.getUrl(
            completedScenes[0].previewId
          );
        }

        return {
          _id: project._id,
          name: project.name,
          description: project.description,
          sceneCount: scenes.length,
          _creationTime: project._creationTime,
          updatedAt: project.updatedAt,
          latestPreviewUrl,
        };
      })
    );

    // Recent activity: merge recent jobs and credit transactions
    const recentJobs = allJobs
      .filter((j) => j.status !== "queued" && j.status !== "processing")
      .slice(0, 8);

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(8);

    const recentActivity = [
      ...recentJobs.map((job) => ({
        type: job.status === "completed" ? "generation" : "failure",
        description:
          job.status === "completed"
            ? `${job.jobType} completed`
            : `${job.jobType} failed`,
        timestamp: job.completedAt ?? job._creationTime,
        creditsCharged: job.creditsCharged,
      })),
      ...transactions.map((tx) => ({
        type:
          tx.transactionType === "purchase"
            ? "purchase"
            : tx.transactionType === "refund"
              ? "refund"
              : "deduction",
        description: tx.description ?? tx.transactionType,
        timestamp: tx._creationTime,
        creditsCharged: tx.amount,
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);

    return {
      stats,
      activeJobs,
      recentProjects,
      recentActivity,
    };
  },
});

export const listAllScenes = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let scenes = await ctx.db
      .query("parallaxScenes")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    if (args.projectId) {
      scenes = scenes.filter((s) => s.projectId === args.projectId);
    }

    // Enrich with project names and preview URLs
    const enriched = await Promise.all(
      scenes.map(async (scene) => {
        const project = await ctx.db.get(scene.projectId);
        let previewUrl: string | null = null;
        if (scene.previewId) {
          previewUrl = await ctx.storage.getUrl(scene.previewId);
        }

        return {
          _id: scene._id,
          name: scene.name,
          status: scene.status,
          layerCount: scene.layerCount,
          mode: scene.mode,
          projectId: scene.projectId,
          projectName: project?.name ?? "Unknown",
          previewUrl,
          _creationTime: scene._creationTime,
        };
      })
    );

    return enriched;
  },
});

export const listAllCharacters = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let characters = await ctx.db
      .query("characters")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    if (args.projectId) {
      characters = characters.filter((c) => c.projectId === args.projectId);
    }

    const enriched = await Promise.all(
      characters.map(async (char) => {
        const project = await ctx.db.get(char.projectId);
        let thumbnailUrl = char.thumbnailUrl ?? null;
        if (!thumbnailUrl && char.sourceImageId) {
          thumbnailUrl = await ctx.storage.getUrl(char.sourceImageId);
        }

        return {
          _id: char._id,
          name: char.name,
          animalType: char.animalType,
          projectId: char.projectId,
          projectName: project?.name ?? "Unknown",
          thumbnailUrl,
          _creationTime: char._creationTime,
        };
      })
    );

    return enriched;
  },
});
