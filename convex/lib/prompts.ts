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
  const depthLabels = [
    "far background sky layer, static, no movement",
    "distant background mountains or hills layer",
    "mid background landscape elements layer",
    "midground trees or structures layer",
    "near midground details layer",
    "foreground ground and path layer",
    "close foreground elements layer",
    "very close foreground details layer",
  ];
  const depthLabel =
    depthLabels[Math.min(params.layerIndex, depthLabels.length - 1)];
  const styleData = STYLE_PACKS.find((s) => s.id === params.stylePack);

  // Map art style to descriptive text
  const artStyleDescriptions: Record<string, string> = {
    "pixel-art": "pixel art game style, retro 16-bit aesthetic",
    "realistic": "photorealistic, detailed textures, natural lighting, high definition",
    "cartoon": "cartoon art style, cel-shaded, vibrant colors, simplified shapes",
    "watercolor": "watercolor painting style, soft brush strokes, artistic, painterly",
    "custom": styleData?.description || "pixel art game style",
  };

  const artStyleDescription = artStyleDescriptions[params.artStyle || "pixel-art"];

  // Determine if this is a sky/background layer (first 2 layers) or foreground (rest)
  const isSkyLayer = params.layerIndex < 2;
  const isForegroundLayer = params.layerIndex >= params.totalLayers - 3;

  const basePromptParts = [
    params.scenePrompt,
    depthLabel,
    artStyleDescription,
    "game background art",
  ];

  // Add layer-specific optimizations
  if (isSkyLayer) {
    // Sky/background layers: simple, clean, full coverage
    basePromptParts.push(
      "seamless horizontal gradient",
      "clean flat background",
      "simple atmospheric layer",
      "no complex details"
    );
  } else if (isForegroundLayer) {
    // Foreground layers: isolated elements, transparent backgrounds
    basePromptParts.push(
      "isolated elements on transparent background",
      "no ground plane",
      "floating in space",
      "clean cutout style",
      "separated objects",
      "transparent behind elements"
    );
  } else {
    // Mid-layer: balanced approach
    basePromptParts.push(
      "transparent areas where appropriate",
      "layered depth"
    );
  }

  // Common quality enhancements
  basePromptParts.push(
    "parallax game background",
    "seamless horizontal tile",
    "tileable left to right",
    "seamless loop ready",
    "clean edges",
    "no characters",
    "environment only",
    "high quality",
    "crisp details"
  );

  return basePromptParts.filter(Boolean).join(", ");
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
