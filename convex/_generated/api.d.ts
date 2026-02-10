/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as animations from "../animations.js";
import type * as billing from "../billing.js";
import type * as characters from "../characters.js";
import type * as compositePreview from "../compositePreview.js";
import type * as exports from "../exports.js";
import type * as frames from "../frames.js";
import type * as gallery from "../gallery.js";
import type * as generate from "../generate.js";
import type * as generateHelpers from "../generateHelpers.js";
import type * as http from "../http.js";
import type * as jobSteps from "../jobSteps.js";
import type * as jobs from "../jobs.js";
import type * as lib_animalData from "../lib/animalData.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_credits from "../lib/credits.js";
import type * as lib_prompts from "../lib/prompts.js";
import type * as lib_providers from "../lib/providers.js";
import type * as lib_spritePacker from "../lib/spritePacker.js";
import type * as parallaxScenes from "../parallaxScenes.js";
import type * as projects from "../projects.js";
import type * as storage from "../storage.js";
import type * as stripe from "../stripe.js";
import type * as stripeHelpers from "../stripeHelpers.js";
import type * as stylePacks from "../stylePacks.js";
import type * as textDocuments from "../textDocuments.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  animations: typeof animations;
  billing: typeof billing;
  characters: typeof characters;
  compositePreview: typeof compositePreview;
  exports: typeof exports;
  frames: typeof frames;
  gallery: typeof gallery;
  generate: typeof generate;
  generateHelpers: typeof generateHelpers;
  http: typeof http;
  jobSteps: typeof jobSteps;
  jobs: typeof jobs;
  "lib/animalData": typeof lib_animalData;
  "lib/constants": typeof lib_constants;
  "lib/credits": typeof lib_credits;
  "lib/prompts": typeof lib_prompts;
  "lib/providers": typeof lib_providers;
  "lib/spritePacker": typeof lib_spritePacker;
  parallaxScenes: typeof parallaxScenes;
  projects: typeof projects;
  storage: typeof storage;
  stripe: typeof stripe;
  stripeHelpers: typeof stripeHelpers;
  stylePacks: typeof stylePacks;
  textDocuments: typeof textDocuments;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
