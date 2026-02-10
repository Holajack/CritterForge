export interface DevicePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
}

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: "iphone-standard",
    label: "iPhone",
    width: 1170,
    height: 2532,
    orientation: "portrait",
  },
  {
    id: "iphone-pro-max",
    label: "iPhone Pro Max",
    width: 1290,
    height: 2796,
    orientation: "portrait",
  },
  {
    id: "ipad",
    label: "iPad",
    width: 2048,
    height: 2732,
    orientation: "portrait",
  },
  {
    id: "android-phone",
    label: "Android Phone",
    width: 1080,
    height: 2400,
    orientation: "portrait",
  },
  {
    id: "android-tablet",
    label: "Android Tablet",
    width: 1600,
    height: 2560,
    orientation: "portrait",
  },
  {
    id: "desktop-hd",
    label: "Desktop HD",
    width: 1920,
    height: 1080,
    orientation: "landscape",
  },
  {
    id: "desktop-4k",
    label: "Desktop 4K",
    width: 3840,
    height: 2160,
    orientation: "landscape",
  },
  {
    id: "custom",
    label: "Custom",
    width: 0,
    height: 0,
    orientation: "portrait",
  },
];

export function getDevicePreset(id: string): DevicePreset | undefined {
  return DEVICE_PRESETS.find((preset) => preset.id === id);
}

export function getDeviceDimensions(
  preset: DevicePreset,
  orientation: "portrait" | "landscape"
): { width: number; height: number } {
  if (preset.id === "custom") {
    return { width: preset.width, height: preset.height };
  }

  // If orientation matches preset default, return as-is
  if (orientation === preset.orientation) {
    return { width: preset.width, height: preset.height };
  }

  // Swap dimensions for opposite orientation
  return { width: preset.height, height: preset.width };
}

// Calculate scroll duration for parallax layers based on depth
// Follows the Triage app pattern: deeper layers scroll slower
export function calculateScrollDuration(
  depth: number,
  layerCount: number
): number {
  // Layer 0 (depth 0.0): static (no scroll)
  if (depth === 0) return 0;

  // Layer N (depth 1.0): fastest at 6000ms
  // Intermediate layers: interpolated, capped at 30000ms
  const baseDuration = 6000;
  const maxDuration = 30000;

  if (depth >= 1) return baseDuration;

  const duration = Math.min(baseDuration / depth, maxDuration);
  return Math.round(duration);
}

// Calculate layer height percentages based on Triage app pattern
export function calculateLayerHeights(
  layerCount: number
): { layerIndex: number; heightPercent: number }[] {
  const heights: { layerIndex: number; heightPercent: number }[] = [];

  for (let i = 0; i < layerCount; i++) {
    let heightPercent: number;

    if (i === 0) {
      // Far background (sky) - 35%
      heightPercent = 0.35;
    } else if (i === layerCount - 1) {
      // Foreground - 35%
      heightPercent = 0.35;
    } else {
      // Mid layers - 50%
      heightPercent = 0.5;
    }

    heights.push({ layerIndex: i, heightPercent });
  }

  return heights;
}

// Generate layer metadata for parallax export
export function generateLayerMetadata(
  layerCount: number,
  deviceWidth: number,
  deviceHeight: number,
  orientation: "portrait" | "landscape"
): Array<{
  index: number;
  name: string;
  depth: number;
  scrollDuration: number;
  heightPercent: number;
}> {
  const layerNames = [
    "sky",
    "mountains",
    "hills",
    "midground",
    "trees",
    "foreground",
    "ground",
    "close_foreground",
  ];

  const layers: Array<{
    index: number;
    name: string;
    depth: number;
    scrollDuration: number;
    heightPercent: number;
  }> = [];

  const heights = calculateLayerHeights(layerCount);

  for (let i = 0; i < layerCount; i++) {
    const depth = layerCount > 1 ? i / (layerCount - 1) : 0;
    const name = layerNames[Math.min(i, layerNames.length - 1)];
    const scrollDuration = calculateScrollDuration(depth, layerCount);
    const heightPercent = heights[i]?.heightPercent || 0.35;

    layers.push({
      index: i,
      name,
      depth,
      scrollDuration,
      heightPercent,
    });
  }

  return layers;
}
