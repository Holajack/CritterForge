import Replicate from "replicate";

export interface ModelPrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string | string[] | null;
  error?: string;
  metrics?: { predict_time?: number };
}

export interface ModelProvider {
  readonly name: string;
  readonly modelId: string;
  readonly costPerRun: number;
  predict(input: Record<string, unknown>): Promise<ModelPrediction>;
}

export interface SpriteSheetProvider extends ModelProvider {
  generateSpriteSheet(params: {
    prompt: string;
    imageUrl?: string;
    style?: string;
  }): Promise<ModelPrediction>;
}

export interface BackgroundRemovalProvider extends ModelProvider {
  removeBackground(params: { imageUrl: string }): Promise<ModelPrediction>;
}

export interface DepthEstimationProvider extends ModelProvider {
  estimateDepth(params: { imageUrl: string }): Promise<ModelPrediction>;
}

export interface ImageToImageProvider extends ModelProvider {
  transform(params: {
    imageUrl: string;
    prompt: string;
    strength?: number;
  }): Promise<ModelPrediction>;
}

export interface InpaintingProvider extends ModelProvider {
  inpaint(params: {
    imageUrl: string;
    maskUrl: string;
    prompt: string;
  }): Promise<ModelPrediction>;
}

export interface UpscalingProvider extends ModelProvider {
  upscale(params: {
    imageUrl: string;
    scale?: number;
  }): Promise<ModelPrediction>;
}

export interface SceneGenerationProvider extends ModelProvider {
  generateScene(params: {
    prompt: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
  }): Promise<ModelPrediction>;
}

function getReplicateClient(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      "REPLICATE_API_TOKEN not set. Run: npx convex env set REPLICATE_API_TOKEN <your-token>"
    );
  }
  return new Replicate({ auth: token });
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 5,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (attempt === maxAttempts) throw error;
      // Respect Replicate's retry_after for 429 rate limits
      let delay = baseDelayMs * Math.pow(2, attempt - 1);
      const err = error as { response?: { status?: number; headers?: { get?: (key: string) => string | null } }; status?: number };
      if (err?.response?.status === 429 || err?.status === 429) {
        const retryAfter = err?.response?.headers?.get?.("retry-after");
        if (retryAfter) {
          delay = Math.max(delay, parseInt(retryAfter, 10) * 1000);
        } else {
          // Default to 10s for rate limits if no header
          delay = Math.max(delay, 10000);
        }
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

function toUrl(item: unknown): string {
  if (typeof item === "string") return item;
  if (item instanceof URL) return item.href;
  // Replicate SDK 1.x FileOutput: has .url() method and toString()
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    if (typeof obj.url === "function") return String((obj.url as () => string)());
    if ("href" in obj) return String(obj.href);
    if ("url" in obj) return String(obj.url);
  }
  return String(item);
}

function normalizeOutput(raw: unknown): string | string[] | null {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const urls = raw.map(toUrl);
    return urls.length === 1 ? urls[0] : urls;
  }
  if (raw && typeof raw === "object") return toUrl(raw);
  return null;
}

// ── Sprite Sheet Provider (retro-diffusion/rd-animation) ──

class ReplicateSpriteProvider implements SpriteSheetProvider {
  readonly name = "Retro Diffusion Animation";
  readonly modelId = "retro-diffusion/rd-animation";
  readonly costPerRun = 1;

  async predict(input: Record<string, unknown>): Promise<ModelPrediction> {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    const output = await withRetry(() =>
      replicate.run(this.modelId as `${string}/${string}`, { input })
    );

    return {
      id: `rd-${Date.now()}`,
      status: "succeeded",
      output: normalizeOutput(output),
      metrics: { predict_time: (Date.now() - startTime) / 1000 },
    };
  }

  async generateSpriteSheet(params: {
    prompt: string;
    imageUrl?: string;
    style?: string;
  }): Promise<ModelPrediction> {
    const input: Record<string, unknown> = {
      prompt: params.prompt,
      style: params.style || "walking_and_idle",
    };
    if (params.imageUrl) {
      input.input_image = params.imageUrl;
    }
    return this.predict(input);
  }
}

// ── Background Removal Provider (cjwbw/rembg) ──
// Fast background removal with NVIDIA L40S GPU, ~5s runtime

class ReplicateBGRemovalProvider implements BackgroundRemovalProvider {
  readonly name = "Rembg Background Remover";
  readonly modelId = "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";
  readonly costPerRun = 0;

  async predict(input: Record<string, unknown>): Promise<ModelPrediction> {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    const output = await withRetry(() =>
      replicate.run(this.modelId as `${string}/${string}`, { input })
    );

    return {
      id: `rmbg-${Date.now()}`,
      status: "succeeded",
      output: normalizeOutput(output),
      metrics: { predict_time: (Date.now() - startTime) / 1000 },
    };
  }

  async removeBackground(params: { imageUrl: string }): Promise<ModelPrediction> {
    return this.predict({
      image: params.imageUrl,
    });
  }
}

// ── Depth Estimation Provider ──

class ReplicateDepthProvider implements DepthEstimationProvider {
  readonly name = "Depth Anything V2";
  readonly modelId = "chenxwh/depth-anything-v2";
  readonly costPerRun = 0;

  async predict(input: Record<string, unknown>): Promise<ModelPrediction> {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    const output = await withRetry(() =>
      replicate.run(this.modelId as `${string}/${string}`, { input })
    );

    return {
      id: `depth-${Date.now()}`,
      status: "succeeded",
      output: normalizeOutput(output),
      metrics: { predict_time: (Date.now() - startTime) / 1000 },
    };
  }

  async estimateDepth(params: { imageUrl: string }): Promise<ModelPrediction> {
    return this.predict({ image: params.imageUrl });
  }
}

// ── Retro Diffusion Plus (Style Transfer for Pixel Art) ──
// Purpose-built for pixel art style transfer, ~$0.05/run

class ReplicateRDPlusProvider implements ImageToImageProvider {
  readonly name = "Retro Diffusion Plus";
  readonly modelId = "retro-diffusion/rd-plus";
  readonly costPerRun = 1;

  async predict(input: Record<string, unknown>): Promise<ModelPrediction> {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    const output = await withRetry(() =>
      replicate.run(this.modelId as `${string}/${string}`, { input })
    );

    return {
      id: `rdplus-${Date.now()}`,
      status: "succeeded",
      output: normalizeOutput(output),
      metrics: { predict_time: (Date.now() - startTime) / 1000 },
    };
  }

  async transform(params: {
    imageUrl: string;
    prompt: string;
    strength?: number;
  }): Promise<ModelPrediction> {
    return this.predict({
      input_image: params.imageUrl,
      prompt: params.prompt,
      strength: params.strength ?? 0.5,
      style: "character_turnaround", // Valid rd-plus style for character sprites
      remove_bg: true, // Ensure transparent background
    });
  }
}

// ── SDXL Image-to-Image (Fallback/Alternative Style Transfer) ──

class ReplicateSDXLImg2ImgProvider implements ImageToImageProvider {
  readonly name = "SDXL Img2Img";
  readonly modelId =
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
  readonly costPerRun = 1;

  async predict(input: Record<string, unknown>): Promise<ModelPrediction> {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    const output = await withRetry(() =>
      replicate.run(this.modelId as `${string}/${string}`, { input })
    );

    return {
      id: `sdxl-${Date.now()}`,
      status: "succeeded",
      output: normalizeOutput(output),
      metrics: { predict_time: (Date.now() - startTime) / 1000 },
    };
  }

  async transform(params: {
    imageUrl: string;
    prompt: string;
    strength?: number;
  }): Promise<ModelPrediction> {
    return this.predict({
      image: params.imageUrl,
      prompt: params.prompt,
      prompt_strength: params.strength ?? 0.6,
    });
  }
}

// ── Upscaling Provider (Real-ESRGAN for pixel art) ──
// Upscales small sprites to larger sizes while preserving pixel art quality

class ReplicateUpscalingProvider implements UpscalingProvider {
  readonly name = "Real-ESRGAN Upscaler";
  readonly modelId = "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa";
  readonly costPerRun = 0;

  async predict(input: Record<string, unknown>): Promise<ModelPrediction> {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    const output = await withRetry(() =>
      replicate.run(this.modelId as `${string}/${string}`, { input })
    );

    return {
      id: `upscale-${Date.now()}`,
      status: "succeeded",
      output: normalizeOutput(output),
      metrics: { predict_time: (Date.now() - startTime) / 1000 },
    };
  }

  async upscale(params: {
    imageUrl: string;
    scale?: number;
  }): Promise<ModelPrediction> {
    return this.predict({
      image: params.imageUrl,
      scale: params.scale ?? 4, // Default 4x upscale
      face_enhance: false, // Not needed for sprites
    });
  }
}

// ── Inpainting Provider ──

class ReplicateInpaintingProvider implements InpaintingProvider {
  readonly name = "SDXL Inpainting";
  readonly modelId = "lucataco/sdxl-inpainting";
  readonly costPerRun = 1;

  async predict(input: Record<string, unknown>): Promise<ModelPrediction> {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    const output = await withRetry(() =>
      replicate.run(this.modelId as `${string}/${string}`, { input })
    );

    return {
      id: `inpaint-${Date.now()}`,
      status: "succeeded",
      output: normalizeOutput(output),
      metrics: { predict_time: (Date.now() - startTime) / 1000 },
    };
  }

  async inpaint(params: {
    imageUrl: string;
    maskUrl: string;
    prompt: string;
  }): Promise<ModelPrediction> {
    return this.predict({
      image: params.imageUrl,
      mask: params.maskUrl,
      prompt: params.prompt,
    });
  }
}

// ── Scene Generation Provider (Flux Schnell for landscapes/backgrounds) ──

class ReplicateSceneProvider implements SceneGenerationProvider {
  readonly name = "Flux Schnell";
  readonly modelId = "black-forest-labs/flux-schnell";
  readonly costPerRun = 1;

  async predict(input: Record<string, unknown>): Promise<ModelPrediction> {
    const replicate = getReplicateClient();
    const startTime = Date.now();

    const output = await withRetry(() =>
      replicate.run(this.modelId as `${string}/${string}`, { input })
    );

    return {
      id: `flux-${Date.now()}`,
      status: "succeeded",
      output: normalizeOutput(output),
      metrics: { predict_time: (Date.now() - startTime) / 1000 },
    };
  }

  async generateScene(params: {
    prompt: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
  }): Promise<ModelPrediction> {
    const input: Record<string, unknown> = {
      prompt: params.prompt,
      num_outputs: 1,
      output_format: "png",
    };
    if (params.aspectRatio) {
      input.aspect_ratio = params.aspectRatio;
    }
    return this.predict(input);
  }
}

// ── Provider registry ──

export const providers = {
  sprite: { rdAnimation: new ReplicateSpriteProvider() },
  scene: { fluxSchnell: new ReplicateSceneProvider() },
  bgRemoval: { bgRemover: new ReplicateBGRemovalProvider() },
  depth: { depthAnythingV2: new ReplicateDepthProvider() },
  img2img: {
    rdPlus: new ReplicateRDPlusProvider(),
    sdxl: new ReplicateSDXLImg2ImgProvider(),
  },
  inpainting: { sdxlInpaint: new ReplicateInpaintingProvider() },
  upscaling: { realEsrgan: new ReplicateUpscalingProvider() },
} as const;

// Primary getters - use recommended providers
export function getSpriteProvider(): SpriteSheetProvider {
  return providers.sprite.rdAnimation;
}

export function getBGRemovalProvider(): BackgroundRemovalProvider {
  return providers.bgRemoval.bgRemover;
}

export function getDepthProvider(): DepthEstimationProvider {
  return providers.depth.depthAnythingV2;
}

export function getImg2ImgProvider(): ImageToImageProvider {
  // Use rd-plus by default for pixel art style transfer
  return providers.img2img.rdPlus;
}

export function getSDXLImg2ImgProvider(): ImageToImageProvider {
  // Fallback SDXL provider for non-pixel art styles
  return providers.img2img.sdxl;
}

export function getInpaintingProvider(): InpaintingProvider {
  return providers.inpainting.sdxlInpaint;
}

export function getUpscalingProvider(): UpscalingProvider {
  return providers.upscaling.realEsrgan;
}

export function getSceneProvider(): SceneGenerationProvider {
  return providers.scene.fluxSchnell;
}
