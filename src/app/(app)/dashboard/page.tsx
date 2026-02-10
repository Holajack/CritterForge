"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ActiveJobs } from "@/components/dashboard/ActiveJobs";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickStart } from "@/components/dashboard/QuickStart";
import { ProjectGrid } from "@/components/dashboard/ProjectGrid";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { Plus, Image, Coins } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useUser();
  const overview = useQuery(api.dashboard.getOverview);
  const [showCreate, setShowCreate] = useState(false);

  const firstName = user?.firstName || "there";
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-6 py-6 md:py-10 space-y-8">
      {/* Welcome Header */}
      <AnimateIn variant="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreate(true)}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href="/gallery">
                <Image className="h-3.5 w-3.5" />
                Gallery
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href="/billing">
                <Coins className="h-3.5 w-3.5" />
                Credits
              </Link>
            </Button>
          </div>
        </div>
      </AnimateIn>

      {/* Stats */}
      <DashboardStats stats={overview?.stats ?? null} />

      {/* Quick Start (new users only) */}
      <QuickStart
        hasProjects={(overview?.stats.projectCount ?? 0) > 0}
        hasScenes={(overview?.stats.sceneCount ?? 0) > 0}
        hasExports={false}
      />

      {/* Active Jobs */}
      {overview?.activeJobs && (
        <ActiveJobs jobs={overview.activeJobs} />
      )}

      {/* Recent Projects */}
      <AnimateIn variant="fade-up" delay={0.15}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Projects
            </h2>
            {(overview?.recentProjects?.length ?? 0) > 0 && (
              <Link
                href="/dashboard/projects"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
              </Link>
            )}
          </div>
          <ProjectGrid
            projects={overview?.recentProjects}
            onCreateNew={() => setShowCreate(true)}
            limit={6}
          />
        </div>
      </AnimateIn>

      {/* Recent Activity */}
      {overview?.recentActivity && (
        <RecentActivity activity={overview.recentActivity} />
      )}

      <CreateProjectDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
