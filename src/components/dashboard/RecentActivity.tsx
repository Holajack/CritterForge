"use client";

import { formatDistanceToNow } from "date-fns";
import { Sparkles, Coins, FileDown, AlertCircle, RefreshCw } from "lucide-react";
import { AnimateIn } from "@/components/shared/AnimateIn";

interface ActivityItem {
  type: string;
  description: string;
  timestamp: number;
  creditsCharged: number;
}

interface RecentActivityProps {
  activity: ActivityItem[];
}

const ACTIVITY_CONFIG: Record<
  string,
  { icon: React.ElementType; colorClass: string }
> = {
  generation: { icon: Sparkles, colorClass: "text-primary bg-primary/10" },
  purchase: { icon: Coins, colorClass: "text-moss bg-moss/10" },
  deduction: { icon: FileDown, colorClass: "text-sky bg-sky/10" },
  refund: { icon: RefreshCw, colorClass: "text-muted-foreground bg-muted" },
  failure: { icon: AlertCircle, colorClass: "text-destructive bg-destructive/10" },
};

export function RecentActivity({ activity }: RecentActivityProps) {
  if (activity.length === 0) return null;

  return (
    <AnimateIn variant="fade-up" delay={0.2}>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Recent Activity
        </h2>
        <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40">
          {activity.map((item, index) => {
            const config = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.generation;
            const Icon = config.icon;

            return (
              <div
                key={`${item.timestamp}-${index}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.colorClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate capitalize">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </p>
                </div>
                {item.creditsCharged !== 0 && (
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      item.creditsCharged > 0
                        ? "text-moss"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.creditsCharged > 0 ? "+" : ""}
                    {item.creditsCharged}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AnimateIn>
  );
}
