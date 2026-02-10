import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const stylePacks = await ctx.db
      .query("stylePacks")
      .withIndex("by_isActive_sortOrder", (q) => q.eq("isActive", true))
      .collect();

    return stylePacks.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const get = query({
  args: { packId: v.string() },
  handler: async (ctx, args) => {
    const stylePack = await ctx.db
      .query("stylePacks")
      .withIndex("by_packId", (q) => q.eq("packId", args.packId))
      .first();

    if (!stylePack) {
      throw new Error("Style pack not found");
    }

    return stylePack;
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const existingPacks = await ctx.db.query("stylePacks").collect();
    if (existingPacks.length > 0) {
      throw new Error("Style packs already seeded");
    }

    const defaultPacks = [
      {
        packId: "cozy",
        name: "Cozy",
        description: "Warm and inviting with soft colors and rounded shapes",
        promptModifier:
          "warm soft lighting, pastel palette, rounded shapes, cute proportions",
        img2imgStrength: 0.7,
        isActive: true,
        sortOrder: 1,
      },
      {
        packId: "retro-pixel",
        name: "Retro Pixel",
        description: "Classic pixel art style with limited colors",
        promptModifier:
          "pixel art style, limited color palette, crisp edges, 16-bit era",
        img2imgStrength: 0.8,
        isActive: true,
        sortOrder: 2,
      },
      {
        packId: "realistic",
        name: "Realistic",
        description: "Natural and detailed animal anatomy",
        promptModifier:
          "realistic animal anatomy, natural lighting, detailed fur/feathers",
        img2imgStrength: 0.5,
        isActive: true,
        sortOrder: 3,
      },
      {
        packId: "dark-fantasy",
        name: "Dark Fantasy",
        description: "Mysterious and gothic with glowing effects",
        promptModifier:
          "dark moody atmosphere, glowing eyes, mystical aura, gothic",
        img2imgStrength: 0.75,
        isActive: true,
        sortOrder: 4,
      },
      {
        packId: "chibi",
        name: "Chibi",
        description: "Super deformed with large heads and tiny bodies",
        promptModifier:
          "super deformed proportions, large head, small body, kawaii",
        img2imgStrength: 0.8,
        isActive: true,
        sortOrder: 5,
      },
      {
        packId: "anime",
        name: "Anime",
        description: "Japanese animation style with cel shading",
        promptModifier:
          "anime art style, cel shading, expressive eyes, dynamic poses",
        img2imgStrength: 0.7,
        isActive: true,
        sortOrder: 6,
      },
      {
        packId: "painterly",
        name: "Painterly",
        description: "Oil painting style with visible brushstrokes",
        promptModifier:
          "oil painting style, visible brushstrokes, rich textures, artistic",
        img2imgStrength: 0.6,
        isActive: true,
        sortOrder: 7,
      },
    ];

    for (const pack of defaultPacks) {
      await ctx.db.insert("stylePacks", pack);
    }

    return { message: "Style packs seeded successfully", count: defaultPacks.length };
  },
});
