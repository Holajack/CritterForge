"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ProjectGrid } from "@/components/dashboard/ProjectGrid";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AnimateIn } from "@/components/shared/AnimateIn";

export default function ProjectsPage() {
  const projects = useQuery(api.projects.list);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-6 py-6 md:py-10">
      <AnimateIn variant="fade-up">
        <div className="mb-6 md:mb-10 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Projects
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Each project holds characters, animations, and exports for one
              game.
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        </div>
      </AnimateIn>

      <ProjectGrid projects={projects} onCreateNew={() => setShowCreate(true)} />

      <CreateProjectDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
