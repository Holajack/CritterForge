"use client";

import { AnimateIn } from "@/components/shared/AnimateIn";
import { Users, Download, Star, Gamepad2 } from "lucide-react";

const STATS = [
  { icon: Users, value: "2,400+", label: "Game developers" },
  { icon: Download, value: "18K+", label: "Sprites generated" },
  { icon: Star, value: "4.8/5", label: "Average rating" },
  { icon: Gamepad2, value: "120+", label: "Games shipped" },
];

export function SocialProofBar() {
  return (
    <section className="border-t border-border/40 bg-muted/30">
      <AnimateIn variant="fade-in">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
