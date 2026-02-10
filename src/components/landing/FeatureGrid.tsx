"use client";

import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import {
  FileText,
  Sparkles,
  Layers,
  Paintbrush,
  Infinity,
  FileDown,
  Gauge,
  Monitor,
  Boxes,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Text File Parsing",
    description:
      "Paste or upload a text description of your scene. The AI intelligently parses it into distinct depth layers.",
    accent: "bg-primary/10 text-primary",
    size: "large",
  },
  {
    icon: Layers,
    title: "AI Scene Detection",
    description:
      "Automatically separates your scene into 3-8 depth layers based on foreground, midground, and background elements.",
    accent: "bg-moss/10 text-moss",
    size: "large",
  },
  {
    icon: Infinity,
    title: "Seamless Tiling",
    description:
      "Every layer tiles horizontally with no visible seams for infinite scrolling backgrounds.",
    accent: "bg-ember/10 text-ember",
    size: "small",
  },
  {
    icon: Gauge,
    title: "Custom Scroll Speeds",
    description:
      "Each depth layer includes recommended parallax scroll speed metadata.",
    accent: "bg-sky/10 text-sky",
    size: "small",
  },
  {
    icon: Paintbrush,
    title: "7 Art Styles",
    description:
      "Cozy pixel, retro 16-bit, realistic, dark fantasy, chibi, anime cel, painterly.",
    accent: "bg-primary/10 text-primary",
    size: "small",
  },
  {
    icon: Sparkles,
    title: "Batch Generation",
    description:
      "Generate multiple scene variations at once. Perfect for creating diverse level backgrounds.",
    accent: "bg-ember/10 text-ember",
    size: "small",
  },
  {
    icon: Monitor,
    title: "Multi-Device Support",
    description:
      "Export at any resolution. Optimized for mobile, desktop, and high-DPI displays.",
    accent: "bg-moss/10 text-moss",
    size: "small",
  },
  {
    icon: Boxes,
    title: "Layer Customization",
    description:
      "Regenerate or adjust individual depth layers without redoing the entire scene.",
    accent: "bg-sky/10 text-sky",
    size: "small",
  },
  {
    icon: FileDown,
    title: "Engine-Ready Export",
    description:
      "Download layered PNGs with depth metadata and parallax speeds for Unity, Godot, or any engine.",
    accent: "bg-primary/10 text-primary",
    size: "small",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="relative border-t border-border/40 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn>
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything between your idea and your game
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Describe once. ParallaxForge handles AI scene parsing, depth layer separation,
              seamless tiling, parallax speed calculation, and engine-ready export.
            </p>
          </div>
        </AnimateIn>

        <StaggerContainer className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isLarge = feature.size === "large";
            return (
              <StaggerItem
                key={feature.title}
                className={isLarge ? "md:row-span-2" : ""}
              >
                <div
                  className={`group flex h-full flex-col rounded-xl border border-border/60 bg-card transition-all hover:border-primary/20 hover:shadow-sm ${
                    isLarge ? "p-8" : "p-6"
                  }`}
                >
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`mb-2 font-semibold ${isLarge ? "text-lg" : "text-base"}`}>
                    {feature.title}
                  </h3>
                  <p className={`leading-relaxed text-muted-foreground ${isLarge ? "text-sm" : "text-sm"}`}>
                    {feature.description}
                  </p>
                  {isLarge && (
                    <div className="mt-6 flex-1 rounded-lg bg-muted/40 p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-md"
                            style={{
                              backgroundColor: feature.title.includes("Text")
                                ? `oklch(${0.7 + i * 0.03} 0.1 ${25 + i * 15})`
                                : `oklch(${0.75 + i * 0.02} 0.08 ${155 + i * 20})`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
