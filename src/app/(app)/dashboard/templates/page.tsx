"use client";

import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
import { LayoutTemplate } from "lucide-react";

const TEMPLATE_PREVIEWS = [
  { name: "Forest Adventure", gradient: "from-moss/30 to-emerald-600/10" },
  { name: "Cyberpunk City", gradient: "from-forge/30 to-violet-500/10" },
  { name: "Ocean Depths", gradient: "from-sky/30 to-blue-600/10" },
  { name: "Mountain Vista", gradient: "from-amber-500/20 to-ember/10" },
  { name: "Space Station", gradient: "from-slate-500/20 to-forge/10" },
  { name: "Medieval Castle", gradient: "from-ember/25 to-amber-700/10" },
];

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-5xl px-2 md:px-6 py-6 md:py-10 space-y-6">
      <AnimateIn variant="fade-up">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Templates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start projects faster with pre-built scene templates.
          </p>
        </div>
      </AnimateIn>

      <ComingSoon
        icon={LayoutTemplate}
        title="Scene Templates"
        description="Jump-start your projects with professionally designed scene templates. Choose from themed collections and customize them to fit your game's aesthetic."
      />

      {/* Preview cards to show what's coming */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_PREVIEWS.map((template) => (
          <StaggerItem key={template.name}>
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden opacity-50">
              <div
                className={`h-24 bg-gradient-to-br ${template.gradient} flex items-center justify-center`}
              >
                <LayoutTemplate className="h-6 w-6 text-foreground/10" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {template.name}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
