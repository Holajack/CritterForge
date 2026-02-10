"use client";

import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import { Gamepad2, Smartphone, Video } from "lucide-react";

const AUDIENCES = [
  {
    icon: Gamepad2,
    title: "Indie Game Developers",
    description:
      "Ship your game without waiting weeks for background art. Generate complete parallax scenes from simple text descriptions in minutes.",
    benefit: "Cut background production time by 90%",
    accent: "bg-primary/10 text-primary border-primary/20",
  },
  {
    icon: Video,
    title: "Content Creators",
    description:
      "Create stunning parallax backgrounds for videos, streams, and animations. Batch generate multiple scene variations to match any mood.",
    benefit: "Unlimited creative possibilities",
    accent: "bg-ember/10 text-ember border-ember/20",
  },
  {
    icon: Smartphone,
    title: "App Developers",
    description:
      "No art skills required. Describe your app's background needs and get professional parallax scenes optimized for any screen size.",
    benefit: "Start with 5 free credits",
    accent: "bg-moss/10 text-moss border-moss/20",
  },
];

export function TargetAudience() {
  return (
    <section className="border-t border-border/40 bg-muted/20 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateIn>
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Built for game makers at every level
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Whether you are shipping your first jam entry or managing a studio pipeline,
              ParallaxForge fits your workflow.
            </p>
          </div>
        </AnimateIn>

        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((audience) => {
            const Icon = audience.icon;
            return (
              <StaggerItem key={audience.title}>
                <div className={`flex h-full flex-col rounded-2xl border bg-card p-8 transition-all hover:shadow-md ${audience.accent}`}>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-background">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold">{audience.title}</h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {audience.description}
                  </p>
                  <div className="rounded-lg bg-background/80 px-4 py-2.5">
                    <p className="text-sm font-medium">{audience.benefit}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
