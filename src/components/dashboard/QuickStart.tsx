"use client";

import Link from "next/link";
import { FolderPlus, Layers, FileDown, Check } from "lucide-react";
import { AnimateIn } from "@/components/shared/AnimateIn";

interface QuickStartProps {
  hasProjects: boolean;
  hasScenes: boolean;
  hasExports: boolean;
}

const STEPS = [
  {
    key: "project",
    label: "Create a Project",
    description: "Set up your first game project to organize assets",
    icon: FolderPlus,
    href: "/dashboard/projects",
    checkKey: "hasProjects" as const,
  },
  {
    key: "scene",
    label: "Generate Scenes",
    description: "Use AI to create layered parallax backgrounds",
    icon: Layers,
    href: "/dashboard/projects",
    checkKey: "hasScenes" as const,
  },
  {
    key: "export",
    label: "Export Assets",
    description: "Download your scenes as sprite sheets or PSD files",
    icon: FileDown,
    href: "/dashboard/projects",
    checkKey: "hasExports" as const,
  },
];

export function QuickStart({ hasProjects, hasScenes, hasExports }: QuickStartProps) {
  if (hasProjects) return null;

  const checks = { hasProjects, hasScenes, hasExports };

  return (
    <AnimateIn variant="fade-up" delay={0.15}>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Getting Started
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = checks[step.checkKey];

            return (
              <Link
                key={step.key}
                href={step.href}
                className="group relative rounded-xl border border-dashed border-border/60 bg-card/50 p-5 transition-all hover:border-primary/30 hover:bg-card hover:shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{step.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </AnimateIn>
  );
}
