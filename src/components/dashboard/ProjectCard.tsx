"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Folder, ChevronRight, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description?: string;
    sceneCount?: number;
    _creationTime: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Link
        href={`/project/${project._id}`}
        className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Folder className="h-4 w-4 text-primary" />
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
        </div>

        <h3 className="mb-1 text-sm font-semibold leading-tight line-clamp-1">
          {project.name}
        </h3>
        {project.description && (
          <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          <Badge variant="secondary" className="text-xs font-normal gap-1">
            <Layers className="h-3 w-3" />
            {project.sceneCount ?? 0} {(project.sceneCount ?? 0) === 1 ? "scene" : "scenes"}
          </Badge>
        </div>

        <p className="mt-3 text-xs text-muted-foreground/60">
          {formatDistanceToNow(project._creationTime, { addSuffix: true })}
        </p>
      </Link>
    </motion.div>
  );
}
