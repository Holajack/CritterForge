"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Sparkles, AlertCircle, XCircle, Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

type StatusFilter = "all" | "completed" | "failed" | "cancelled";

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    variant: "default" as const,
    className: "bg-moss/15 text-moss border-moss/20",
    icon: Sparkles,
  },
  failed: {
    label: "Failed",
    variant: "destructive" as const,
    className: "bg-destructive/15 text-destructive border-destructive/20",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground",
    icon: XCircle,
  },
  queued: {
    label: "Queued",
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    variant: "default" as const,
    className: "bg-primary/15 text-primary border-primary/20",
    icon: Sparkles,
  },
};

function formatDuration(startedAt?: number, completedAt?: number): string {
  if (!startedAt || !completedAt) return "-";
  const seconds = Math.round((completedAt - startedAt) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const jobs = useQuery(api.jobs.list, {});

  const filteredJobs =
    jobs?.filter((job) => filter === "all" || job.status === filter) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-6 py-6 md:py-10 space-y-6">
      <AnimateIn variant="fade-up">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Generation History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all your AI generation jobs and their results.
          </p>
        </div>
      </AnimateIn>

      <AnimateIn variant="fade-up" delay={0.05}>
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </AnimateIn>

      {jobs === undefined ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No history yet"
          description={
            filter === "all"
              ? "Your generation history will appear here once you start creating."
              : `No ${filter} jobs found.`
          }
        />
      ) : (
        <StaggerContainer className="space-y-2">
          {filteredJobs.map((job) => {
            const config =
              STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG] ??
              STATUS_CONFIG.queued;
            const StatusIcon = config.icon;

            return (
              <StaggerItem key={job._id}>
                <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3 transition-all hover:shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <StatusIcon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium capitalize truncate">
                      {job.jobType.replace(/-/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(job._creationTime, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    {job.creditsCharged > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Coins className="h-3 w-3" />
                        {job.creditsCharged}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(job.startedAt, job.completedAt)}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[11px] ${config.className}`}
                  >
                    {config.label}
                  </Badge>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
