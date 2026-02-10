/**
 * Sprite sheet splitting and packing utilities.
 *
 * rd-animation outputs a grid PNG (e.g. 4 columns x N rows).
 * We split it into individual frames and generate atlas metadata.
 *
 * Convex actions run in Node.js, so we use raw pixel manipulation
 * with the canvas-compatible approach via ArrayBuffer.
 */

export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteAtlasMetadata {
  imageWidth: number;
  imageHeight: number;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  columns: number;
  rows: number;
  fps: number;
  frames: Array<{
    index: number;
    rect: FrameRect;
    pivot: { x: number; y: number };
  }>;
  animations: Record<
    string,
    {
      startFrame: number;
      endFrame: number;
      fps: number;
      loop: boolean;
    }
  >;
}

/**
 * Calculate frame grid dimensions from a spritesheet image size.
 * rd-animation typically outputs grids where each frame is square or
 * follows a known pattern based on the style parameter.
 */
export function calculateGridLayout(
  imageWidth: number,
  imageHeight: number,
  style: string
): { columns: number; rows: number; frameWidth: number; frameHeight: number } {
  // rd-animation grid layouts by style
  const layouts: Record<string, { columns: number; rows: number }> = {
    walking_and_idle: { columns: 4, rows: 2 },
    four_angle_walking: { columns: 4, rows: 4 },
    small_sprites: { columns: 4, rows: 4 },
    vfx: { columns: 4, rows: 2 },
  };

  const layout = layouts[style] || { columns: 4, rows: 2 };
  const frameWidth = Math.floor(imageWidth / layout.columns);
  const frameHeight = Math.floor(imageHeight / layout.rows);

  return {
    columns: layout.columns,
    rows: layout.rows,
    frameWidth,
    frameHeight,
  };
}

/**
 * Generate atlas metadata for a spritesheet.
 */
export function generateAtlasMetadata(params: {
  imageWidth: number;
  imageHeight: number;
  style: string;
  animationAction: string;
  fps?: number;
}): SpriteAtlasMetadata {
  const { columns, rows, frameWidth, frameHeight } = calculateGridLayout(
    params.imageWidth,
    params.imageHeight,
    params.style
  );

  const frameCount = columns * rows;
  const fps = params.fps || 8;

  const frames = Array.from({ length: frameCount }, (_, i) => ({
    index: i,
    rect: {
      x: (i % columns) * frameWidth,
      y: Math.floor(i / columns) * frameHeight,
      width: frameWidth,
      height: frameHeight,
    },
    pivot: { x: 0.5, y: 1.0 }, // bottom-center pivot
  }));

  // Build animation entries based on style
  const animations: SpriteAtlasMetadata["animations"] = {};

  if (params.style === "walking_and_idle") {
    // Row 0: walk (4 frames), Row 1: idle (4 frames)
    animations["walk"] = { startFrame: 0, endFrame: 3, fps, loop: true };
    animations["idle"] = { startFrame: 4, endFrame: 7, fps, loop: true };
  } else if (params.style === "four_angle_walking") {
    // 4 rows of 4 frames, each row a direction: down, left, right, up
    animations["walk_down"] = { startFrame: 0, endFrame: 3, fps, loop: true };
    animations["walk_left"] = { startFrame: 4, endFrame: 7, fps, loop: true };
    animations["walk_right"] = {
      startFrame: 8,
      endFrame: 11,
      fps,
      loop: true,
    };
    animations["walk_up"] = {
      startFrame: 12,
      endFrame: 15,
      fps,
      loop: true,
    };
  } else {
    // Generic: all frames as one animation
    animations[params.animationAction] = {
      startFrame: 0,
      endFrame: frameCount - 1,
      fps,
      loop: true,
    };
  }

  return {
    imageWidth: params.imageWidth,
    imageHeight: params.imageHeight,
    frameWidth,
    frameHeight,
    frameCount,
    columns,
    rows,
    fps,
    frames,
    animations,
  };
}

/**
 * Generate Unity-compatible atlas JSON (.json metadata file).
 */
export function generateUnityAtlas(
  metadata: SpriteAtlasMetadata,
  textureName: string
): object {
  return {
    frames: metadata.frames.map((f) => ({
      filename: `${textureName}_${String(f.index).padStart(2, "0")}`,
      frame: { x: f.rect.x, y: f.rect.y, w: f.rect.width, h: f.rect.height },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: f.rect.width,
        h: f.rect.height,
      },
      sourceSize: { w: f.rect.width, h: f.rect.height },
      pivot: f.pivot,
    })),
    meta: {
      app: "ParallaxForge",
      version: "1.0",
      image: `${textureName}.png`,
      format: "RGBA8888",
      size: { w: metadata.imageWidth, h: metadata.imageHeight },
      scale: "1",
    },
  };
}

/**
 * Generate Godot-compatible SpriteFrames resource (.tres format).
 */
export function generateGodotResource(
  metadata: SpriteAtlasMetadata,
  textureName: string
): string {
  const lines: string[] = [
    `[gd_resource type="SpriteFrames" format=3]`,
    ``,
    `[ext_resource type="Texture2D" path="res://${textureName}.png" id="1"]`,
    ``,
  ];

  const animEntries: string[] = [];
  for (const [name, anim] of Object.entries(metadata.animations)) {
    const frameEntries: string[] = [];
    for (let i = anim.startFrame; i <= anim.endFrame; i++) {
      const f = metadata.frames[i];
      frameEntries.push(
        `{ "texture": ExtResource("1"), "duration": 1.0, "region": Rect2(${f.rect.x}, ${f.rect.y}, ${f.rect.width}, ${f.rect.height}) }`
      );
    }
    animEntries.push(
      `{ "name": "${name}", "speed": ${anim.fps}.0, "loop": ${anim.loop}, "frames": [${frameEntries.join(", ")}] }`
    );
  }

  lines.push(`[resource]`);
  lines.push(`animations = [${animEntries.join(", ")}]`);

  return lines.join("\n");
}
