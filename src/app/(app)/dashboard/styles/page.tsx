"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paintbrush, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const STYLE_GRADIENTS: Record<string, string> = {
  cozy: "from-ember/20 to-ember/5",
  "retro-pixel": "from-forge/20 to-forge/5",
  realistic: "from-moss/20 to-moss/5",
  "dark-fantasy": "from-forge/25 to-purple-500/5",
  chibi: "from-sky/20 to-sky/5",
  anime: "from-sky/20 to-primary/5",
  painterly: "from-ember/15 to-amber-500/5",
};

const STYLE_ACCENT: Record<string, string> = {
  cozy: "text-ember",
  "retro-pixel": "text-forge",
  realistic: "text-moss",
  "dark-fantasy": "text-forge",
  chibi: "text-sky",
  anime: "text-sky",
  painterly: "text-ember",
};

export default function StylesPage() {
  const stylePacks = useQuery(api.stylePacks.list);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (packId: string) => {
    navigator.clipboard.writeText(packId);
    setCopiedId(packId);
    toast.success("Style pack ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-6 py-6 md:py-10 space-y-6">
      <AnimateIn variant="fade-up">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Style Packs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse art styles to transform your parallax scenes and characters.
          </p>
        </div>
      </AnimateIn>

      {stylePacks === undefined ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : stylePacks.length === 0 ? (
        <EmptyState
          icon={Paintbrush}
          title="No style packs available"
          description="Style packs haven't been configured yet."
        />
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stylePacks.map((pack) => {
            const gradient =
              STYLE_GRADIENTS[pack.packId] ?? "from-primary/20 to-primary/5";
            const accent = STYLE_ACCENT[pack.packId] ?? "text-primary";

            return (
              <StaggerItem key={pack._id}>
                <div className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                  {/* Gradient header */}
                  <div
                    className={`h-20 bg-gradient-to-br ${gradient} flex items-center justify-center`}
                  >
                    <Paintbrush className={`h-8 w-8 ${accent} opacity-40`} />
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{pack.name}</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        Strength: {Math.round(pack.img2imgStrength * 100)}%
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pack.description}
                    </p>

                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                        {pack.promptModifier}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => handleCopy(pack.packId)}
                    >
                      {copiedId === pack.packId ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Style ID
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
