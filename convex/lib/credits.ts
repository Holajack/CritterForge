export function calculateSpriteCost(actionCount: number, directionCount: number): number {
  return actionCount * directionCount * 2; // 2 credits per animation
}

export function calculateParallaxCost(layerCount: number): number {
  return 5; // flat rate
}

export function calculateRegenCost(frameCount: number): number {
  return Math.ceil(frameCount / 5); // 1 credit per 5 frames
}
