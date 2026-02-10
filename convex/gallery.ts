import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listPublic = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    const characters = await ctx.db
      .query("characters")
      .filter((q) => q.neq(q.field("thumbnailUrl"), undefined))
      .order("desc")
      .take(offset + limit);

    const pagedCharacters = characters.slice(offset, offset + limit);

    const enrichedCharacters = await Promise.all(
      pagedCharacters.map(async (character) => {
        const project = await ctx.db.get(character.projectId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", character.userId))
          .first();

        return {
          ...character,
          projectName: project?.name,
          creatorName: profile?.displayName || "Anonymous",
          creatorAvatar: profile?.avatarUrl,
        };
      })
    );

    return enrichedCharacters;
  },
});

export const publish = mutation({
  args: {
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    if (character.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    if (!character.thumbnailUrl) {
      throw new Error("Character must have a thumbnail to be published");
    }

    return { success: true, characterId: args.characterId };
  },
});
