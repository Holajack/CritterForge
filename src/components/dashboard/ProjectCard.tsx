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
    updatedAt?: number;
    latestPreviewUrl?: string | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/project/${project._id}`}
        className="group relative flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg"
      >
        {/* Thumbnail / Preview */}
        <div className="relative h-28 w-full bg-muted/30">
          {project.latestPreviewUrl ? (
            <img
              src={project.latestPreviewUrl}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
              <span className="text-3xl font-bold text-primary/20">
                {project.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Folder className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold leading-tight line-clamp-1">
                {project.name}
              </h3>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          </div>

          {project.description && (
            <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Badge variant="secondary" className="text-xs font-normal gap-1">
              <Layers className="h-3 w-3" />
              {project.sceneCount ?? 0}{" "}
              {(project.sceneCount ?? 0) === 1 ? "scene" : "scenes"}
            </Badge>
            <p className="text-xs text-muted-foreground/60">
              {formatDistanceToNow(
                project.updatedAt ?? project._creationTime,
                { addSuffix: true }
              )}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
