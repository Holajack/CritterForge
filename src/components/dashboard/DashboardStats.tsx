"use client";

import Link from "next/link";
import { Folder, Layers, Coins, Sparkles } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";

interface DashboardStatsProps {
  stats: {
    projectCount: number;
    sceneCount: number;
    creditsBalance: number;
    totalGenerations: number;
  } | null;
}

const STAT_ITEMS = [
  {
    key: "projects",
    label: "Projects",
    icon: Folder,
    colorClass: "bg-primary/10 text-primary",
    getValue: (s: DashboardStatsProps["stats"]) => s?.projectCount ?? 0,
    href: "/dashboard/projects",
  },
  {
    key: "scenes",
    label: "Scenes",
    icon: Layers,
    colorClass: "bg-ember/10 text-ember",
    getValue: (s: DashboardStatsProps["stats"]) => s?.sceneCount ?? 0,
    href: "/dashboard/assets",
  },
  {
    key: "credits",
    label: "Credits",
    icon: Coins,
    colorClass: "bg-moss/10 text-moss",
    getValue: (s: DashboardStatsProps["stats"]) => s?.creditsBalance ?? 0,
    href: "/billing",
  },
  {
    key: "generations",
    label: "Generations",
    icon: Sparkles,
    colorClass: "bg-forge/10 text-forge",
    getValue: (s: DashboardStatsProps["stats"]) => s?.totalGenerations ?? 0,
    href: "/dashboard/history",
  },
];

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon;
        const value = item.getValue(stats);

        return (
          <StaggerItem key={item.key}>
            <Link
              href={item.href}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-primary/20"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.colorClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight">
                  {stats === null ? (
                    <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted" />
                  ) : (
                    value.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
