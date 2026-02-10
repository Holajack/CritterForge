"use client";

import { Upload, Brain, SlidersHorizontal, Download } from "lucide-react";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";

const STEPS = [
  {
    number: "01",
    icon: Upload,
    title: "Upload a text file",
    description:
      "Drop in a script, story outline, or scene list. Any .txt, .md, or .json file works.",
    accent: "bg-primary/10 text-primary",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI parses your scenes",
    description:
      "ParallaxForge reads your content, identifies distinct scenes, and generates a description for each parallax background.",
    accent: "bg-ember/10 text-ember",
  },
  {
    number: "03",
    icon: SlidersHorizontal,
    title: "Configure & generate",
    description:
      "Choose device size, layer count, and orientation. Generate all scenes in one batch.",
    accent: "bg-moss/10 text-moss",
  },
  {
    number: "04",
    icon: Download,
    title: "Download your layers",
    description:
      "Get layered PNGs with depth metadata and scroll speeds. Drop into Unity, Godot, or any engine.",
    accent: "bg-sky/10 text-sky",
  },
];

export function DemoSection() {
  return (
    <section id="how-it-works" className="border-t border-border/40 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn>
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Four steps to parallax scenes
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              No manual layer separation. No hiring an artist for each background.
            </p>
          </div>
        </AnimateIn>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.number}>
                <div className="relative flex flex-col rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-primary/20 hover:shadow-sm">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border lg:block" />
                  )}
                  <div className="mb-5 flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${step.accent}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Output preview */}
        <AnimateIn delay={0.2}>
          <div className="mt-20 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
            <div className="border-b border-border/40 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-chart-4/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-moss/60" />
                <span className="ml-4 font-mono text-xs text-muted-foreground">
                  forest_scene_layers.zip &mdash; 4 layers
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: "Sky", depth: 0, color: "#1a1a2e" },
                  { name: "Mountains", depth: 0.3, color: "#16213e" },
                  { name: "Trees", depth: 0.6, color: "#0f3460" },
                  { name: "Ground", depth: 1.0, color: "#533483" },
                ].map((layer) => (
                  <div key={layer.name} className="space-y-2">
                    <div
                      className="aspect-video rounded-lg"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium">{layer.name}</p>
                      <p className="text-xs text-muted-foreground">depth: {layer.depth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 px-6 py-3">
              <span className="font-mono text-xs text-muted-foreground">
                4 layers &middot; 1920&times;1080 &middot; seamless tiling
              </span>
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Ready to export
              </span>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
