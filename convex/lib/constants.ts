export const ANIMATION_ACTIONS = [
  { id: "idle", label: "Idle Breathing", icon: "Wind" },
  { id: "sit", label: "Sit", icon: "Armchair" },
  { id: "lie-down", label: "Lie Down", icon: "BedSingle" },
  { id: "sleep", label: "Sleep Loop", icon: "Moon" },
  { id: "walk", label: "Walk", icon: "Footprints" },
  { id: "run", label: "Run", icon: "Zap" },
  { id: "jump", label: "Jump / Land", icon: "ArrowUp" },
  { id: "hit-react", label: "Hit React", icon: "ShieldAlert" },
  { id: "death", label: "Death", icon: "Skull" },
  { id: "swim", label: "Swim", icon: "Waves" },
  { id: "fly", label: "Fly", icon: "Bird" },
] as const;

export const DIRECTIONS = [
  { id: "right", label: "Right", angle: 0 },
  { id: "down-right", label: "Down-Right", angle: 45 },
  { id: "down", label: "Down", angle: 90 },
  { id: "down-left", label: "Down-Left", angle: 135 },
  { id: "left", label: "Left", angle: 180 },
  { id: "up-left", label: "Up-Left", angle: 225 },
  { id: "up", label: "Up", angle: 270 },
  { id: "up-right", label: "Up-Right", angle: 315 },
] as const;

export const GAME_VIEWS = [
  { id: "side-scroller", label: "Side Scroller", directions: ["right", "left"] },
  { id: "top-down-8dir", label: "Top-Down (8-Dir)", directions: ["right","down-right","down","down-left","left","up-left","up","up-right"] },
  { id: "isometric-8dir", label: "Isometric (8-Dir)", directions: ["right","down-right","down","down-left","left","up-left","up","up-right"] },
] as const;

export const STYLE_PACKS = [
  { id: "cozy", label: "Cozy", color: "#F5E6CC", description: "Warm, soft, pastel tones" },
  { id: "retro-pixel", label: "Retro Pixel", color: "#4A7C59", description: "Classic 16-bit pixel art" },
  { id: "realistic", label: "Realistic Wildlife", color: "#8B7355", description: "Natural, detailed style" },
  { id: "dark-fantasy", label: "Dark Fantasy", color: "#2D1B4E", description: "Gothic, mystical atmosphere" },
  { id: "chibi", label: "Chibi", color: "#FFB7C5", description: "Cute, super-deformed" },
  { id: "anime", label: "Anime", color: "#5B8CFF", description: "Cel-shaded, expressive" },
  { id: "painterly", label: "Painterly", color: "#C4956A", description: "Oil painting brushstrokes" },
] as const;

export const FRAME_SIZES = [
  { id: "64", label: "64x64", width: 64, height: 64 },
  { id: "128", label: "128x128", width: 128, height: 128 },
  { id: "256", label: "256x256", width: 256, height: 256 },
  { id: "512", label: "512x512", width: 512, height: 512 },
] as const;

export const CREDIT_COSTS = {
  bgRemoval: 0,
  styleTransfer: 1,
  singleAnimation: 2,
  eightDirSet: 12,
  fullCharacter: 15,
  parallaxScene: 5,
  frameRegen: 1,
  export: 0,
} as const;

export const CREDIT_PACKS = [
  { id: "starter", name: "Starter", price: 900, credits: 15 },
  { id: "standard", name: "Standard", price: 1900, credits: 40 },
  { id: "pro", name: "Pro", price: 4900, credits: 120 },
  { id: "studio", name: "Studio", price: 9900, credits: 280 },
] as const;

export type AnimationAction = typeof ANIMATION_ACTIONS[number]["id"];
export type Direction = typeof DIRECTIONS[number]["id"];
export type GameView = typeof GAME_VIEWS[number]["id"];
export type StylePack = typeof STYLE_PACKS[number]["id"];
