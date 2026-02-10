"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ProjectGrid } from "@/components/dashboard/ProjectGrid";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";
import { Plus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DashboardPage() {
  const projects = useQuery(api.projects.list);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each project holds characters, animations, and exports for one game.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Button>
      </div>

      <ProjectGrid projects={projects} onCreateNew={() => setShowCreate(true)} />

      <CreateProjectDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
