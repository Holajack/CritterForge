"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Layers, MoveVertical, Maximize2, SlidersHorizontal } from "lucide-react";

const LAYERS = [
  {
    name: "Sky / Background",
    depth: "0.0",
    color: "oklch(0.85 0.08 220)",
    borderColor: "border-sky/30",
    offset: 0,
    description: "Static backdrop with atmospheric depth",
  },
  {
    name: "Far Mountains",
    depth: "0.2",
    color: "oklch(0.75 0.06 200)",
    borderColor: "border-sky/20",
    offset: 1,
    description: "Slow-moving distant terrain layer",
  },
  {
    name: "Midground Trees",
    depth: "0.5",
    color: "oklch(0.65 0.12 155)",
    borderColor: "border-moss/30",
    offset: 2,
    description: "Medium parallax for environment detail",
  },
  {
    name: "Foreground / Ground",
    depth: "1.0",
    color: "oklch(0.55 0.14 35)",
    borderColor: "border-primary/30",
    offset: 3,
    description: "Full-speed layer where characters walk",
  },
];

const FEATURES = [
  { icon: Layers, label: "3-8 depth layers", description: "Configurable layer count" },
  { icon: MoveVertical, label: "Seamless tiling", description: "Horizontal loop-ready" },
  { icon: Maximize2, label: "Up to 4K wide", description: "High-res scene output" },
  { icon: SlidersHorizontal, label: "Speed ratios", description: "Per-layer scroll speed" },
];

export function ParallaxShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const layer0X = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const layer1X = useTransform(scrollYProgress, [0, 1], [0, -25]);
  const layer2X = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const layer3X = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const layerXValues = [layer0X, layer1X, layer2X, layer3X];

  return (
    <section id="parallax" className="border-t border-border/40 py-24 md:py-32" ref={containerRef}>
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn>
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Parallax scenes with real depth
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Describe a scene or upload a reference and ParallaxForge generates scrollable
              depth layers. Each layer tiles seamlessly for infinite side-scrolling worlds.
            </p>
          </div>
        </AnimateIn>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Visual layer demo */}
          <AnimateIn variant="fade-left">
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
              <div className="border-b border-border/40 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-chart-4/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-moss/60" />
                  <span className="ml-4 font-mono text-xs text-muted-foreground">
                    parallax_preview
                  </span>
                </div>
              </div>
              <div className="relative h-64 overflow-hidden bg-gradient-to-b from-sky/10 to-primary/5">
                {LAYERS.map((layer, i) => (
                  <motion.div
                    key={layer.name}
                    style={{ x: layerXValues[i] }}
                    className="absolute inset-x-0 rounded-sm"
                    aria-hidden
                  >
                    <div
                      className="mx-4 h-12 rounded-lg opacity-80"
                      style={{
                        backgroundColor: layer.color,
                        marginTop: `${20 + i * 52}px`,
                      }}
                    />
                  </motion.div>
                ))}
                <div className="absolute bottom-3 left-4 rounded-md bg-background/90 px-2.5 py-1 text-xs font-mono text-muted-foreground backdrop-blur">
                  scroll to see parallax
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Layer detail cards */}
          <AnimateIn variant="fade-right" delay={0.15}>
            <div className="space-y-3">
              {LAYERS.map((layer) => (
                <div
                  key={layer.name}
                  className={`flex items-center gap-4 rounded-xl border bg-card p-4 ${layer.borderColor}`}
                >
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg"
                    style={{ backgroundColor: layer.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{layer.name}</p>
                      <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        depth {layer.depth}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{layer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>

        {/* Feature pills */}
        <AnimateIn delay={0.2}>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.label} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-moss/10">
                    <Icon className="h-4 w-4 text-moss" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{feat.label}</p>
                    <p className="text-xs text-muted-foreground">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
