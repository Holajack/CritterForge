import { STYLE_PACKS } from "./constants";
import {
  getLocomotionPhrase,
  getAntiHumanoidPhrase,
} from "./animalData";

const DIRECTION_PROMPTS: Record<string, string> = {
  right: "facing right, side view",
  left: "facing left, side view",
  up: "facing away, back view",
  down: "facing forward, front view",
  "up-right": "facing upper right, three-quarter back view",
  "up-left": "facing upper left, three-quarter back view",
  "down-right": "facing lower right, three-quarter front view",
  "down-left": "facing lower left, three-quarter front view",
};

const VIEW_PROMPTS: Record<string, string> = {
  "side-scroller":
    "2D flat side view, side-scrolling game perspective, NOT 3D, NOT isometric, flat 2D plane, horizontal movement only, platformer game style",
  "top-down-8dir":
    "top-down game perspective, bird's eye view, looking directly down, overhead view, NOT isometric, flat top-down view, RPG game style",
  "isometric-8dir":
    "isometric game perspective, 30-degree angle, dimetric projection, 2.5D view, strategy game style",
};

export function buildSpritePrompt(params: {
  animalType: string;
  action: string;
  direction: string;
  gameView: string;
  stylePack: string;
}): string {
  const styleData = STYLE_PACKS.find((s) => s.id === params.stylePack);
  const stylePrompt = styleData?.description || "pixel art game style";

  // Get animal-specific action phrase with locomotion awareness
  const actionPhrase = getLocomotionPhrase(params.animalType, params.action);

  // Get anti-humanoid enforcement based on animal type
  const antiHumanoid = getAntiHumanoidPhrase(params.animalType);

  // Get direction and view
  const dirPrompt = DIRECTION_PROMPTS[params.direction] || params.direction;
  const viewPrompt = VIEW_PROMPTS[params.gameView] || "";

  // CRITICAL: Anti-humanoid and action constraints MUST come FIRST for best model adherence
  // Models pay most attention to the beginning of prompts
  const promptParts = [
    // PRIORITY 1: Anti-humanoid enforcement (MOST IMPORTANT - put first)
    antiHumanoid,
    // PRIORITY 2: Specific action with body position
    `A realistic ${params.animalType} ${actionPhrase}`,
    // PRIORITY 3: View and direction constraints
    viewPrompt,
    dirPrompt,
    // PRIORITY 4: Style
    stylePrompt,
    // Technical requirements
    "game sprite animation frame",
    "centered composition",
    "consistent scale",
    "transparent background",
    "clean crisp edges",
    "single character only",
    "no text",
    "no watermarks",
    "no background elements",
  ];

  return promptParts.filter(Boolean).join(", ");
}

export function getStylePromptForPack(packId: string): string {
  const styleMap: Record<string, string> = {
    cozy: "warm soft pastel tones, gentle shading, cozy pixel art style, soft colors, friendly appearance",
    "retro-pixel":
      "16-bit pixel art, limited color palette, crisp pixelated edges, retro game style, classic SNES aesthetic",
    realistic:
      "realistic detailed texture, natural colors, wildlife illustration style, detailed fur or scales, natural lighting",
    "dark-fantasy":
      "gothic dark fantasy, mystical atmosphere, deep shadows, dramatic lighting, dark color palette",
    chibi:
      "chibi super-deformed style, cute large head, tiny body, kawaii, adorable proportions, big eyes",
    anime:
      "anime cel-shaded style, clean bold lines, expressive, Japanese animation style, vibrant colors",
    painterly:
      "oil painting brushstrokes, artistic texture, impressionist style, visible brush strokes, artistic rendering",
  };
  return styleMap[packId] || "game sprite pixel art style";
}

export function buildParallaxPrompt(params: {
  scenePrompt: string;
  layerIndex: number;
  totalLayers: number;
  stylePack: string;
  artStyle?: "pixel-art" | "realistic" | "cartoon" | "watercolor" | "custom";
}): string {
  const styleData = STYLE_PACKS.find((s) => s.id === params.stylePack);

  const artStyleDescriptions: Record<string, string> = {
    "pixel-art": "pixel art game style, retro 16-bit aesthetic",
    "realistic": "photorealistic, detailed textures, natural lighting, high definition",
    "cartoon": "cartoon art style, cel-shaded, vibrant colors, simplified shapes",
    "watercolor": "watercolor painting style, soft brush strokes, artistic, painterly",
    "custom": styleData?.description || "pixel art game style",
  };

  const artStyleDescription = artStyleDescriptions[params.artStyle || "pixel-art"];

  // Calculate normalized depth position (0 = furthest back, 1 = closest)
  const depthPosition = params.layerIndex / (params.totalLayers - 1);
  const isSkyLayer = params.layerIndex === 0;
  const isGroundLayer = params.layerIndex === params.totalLayers - 1;

  // Extract scene theme keywords for context (e.g. "desert sunset" -> desert, sunset)
  const sceneTheme = params.scenePrompt;

  if (isSkyLayer) {
    // Layer 0: Sky/atmosphere ONLY - fills the entire frame
    return [
      `Sky and atmosphere only for a ${sceneTheme} scene`,
      "ONLY sky, clouds, sun or moon, and atmospheric gradient",
      "fills the entire image completely with sky",
      "absolutely no ground, no terrain, no trees, no objects, no foreground elements",
      "just sky from top to bottom of the image",
      artStyleDescription,
      "game parallax background layer",
      "seamless horizontal tile",
      "high quality",
      "no characters",
      "no text",
    ].join(", ");
  }

  if (isGroundLayer) {
    // Last layer: Ground/terrain at the bottom only
    return [
      `ISOLATED game asset: ground and terrain only for a ${sceneTheme} scene`,
      "ground surface and path at the BOTTOM portion of the image only",
      "the top 60% of the image must be completely plain white empty background",
      "only terrain, ground texture, path, rocks, or small ground-level details at the bottom",
      "absolutely no sky, no mountains, no trees, no tall objects",
      "isolated game layer element on plain white background",
      "like a 2D game asset cutout",
      artStyleDescription,
      "clean edges",
      "no characters",
      "no text",
    ].join(", ");
  }

  // Middle layers: isolated elements at appropriate depth
  const layerDescriptions = getMiddleLayerDescription(
    params.layerIndex,
    params.totalLayers,
    sceneTheme
  );

  return [
    `ISOLATED game asset: ${layerDescriptions.element} for a ${sceneTheme} scene`,
    `only ${layerDescriptions.what}, nothing else`,
    "on a completely plain white background",
    "the element should be isolated like a 2D game sprite or cutout",
    `positioned in the ${layerDescriptions.position} of the image`,
    "absolutely no full scene, no complete landscape",
    `no ${layerDescriptions.exclude}`,
    "isolated single layer element for parallax scrolling",
    artStyleDescription,
    "clean edges against white background",
    "no characters",
    "no text",
  ].join(", ");
}

function getMiddleLayerDescription(
  layerIndex: number,
  totalLayers: number,
  sceneTheme: string
): { element: string; what: string; position: string; exclude: string } {
  // Normalize index to 0-1 range excluding first and last
  const innerIndex = layerIndex - 1;
  const innerTotal = totalLayers - 2;
  const normalizedDepth = innerTotal > 1 ? innerIndex / (innerTotal - 1) : 0.5;

  if (normalizedDepth < 0.25) {
    return {
      element: "distant mountains or hills silhouettes",
      what: "distant mountain or hill shapes",
      position: "lower half",
      exclude: "sky, ground, trees, foreground objects",
    };
  } else if (normalizedDepth < 0.5) {
    return {
      element: "mid-distance hills or landscape features",
      what: "rolling hills, distant vegetation clusters, or mid-range terrain features",
      position: "middle and lower area",
      exclude: "sky, close foreground, ground surface",
    };
  } else if (normalizedDepth < 0.75) {
    return {
      element: "trees, bushes, or structures",
      what: "trees, tall bushes, buildings, or vertical structures",
      position: "center to lower portion",
      exclude: "sky, distant mountains, ground surface",
    };
  } else {
    return {
      element: "close foreground vegetation or details",
      what: "close plants, grass, flowers, rocks, or foreground decorations",
      position: "lower third",
      exclude: "sky, distant scenery, ground terrain",
    };
  }
}

export function buildStyleTransferPrompt(
  animalType: string,
  stylePack: string
): string {
  const stylePrompt = getStylePromptForPack(stylePack);
  const antiHumanoid = getAntiHumanoidPhrase(animalType);

  // CRITICAL: Anti-humanoid FIRST for maximum model adherence
  return [
    antiHumanoid,
    `realistic ${animalType} animal`,
    stylePrompt,
    "game sprite character design",
    "natural animal body shape",
    "centered",
    "clean edges",
    "transparent background",
    "consistent character design",
    "ready for animation",
  ]
    .filter(Boolean)
    .join(", ");
}
