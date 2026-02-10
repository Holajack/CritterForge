"use client";

import { motion } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { FolderOpen } from "lucide-react";

interface ProjectGridProps {
  projects: any[] | undefined;
  onCreateNew: () => void;
}

export function ProjectGrid({ projects, onCreateNew }: ProjectGridProps) {
  if (projects === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first project to start generating sprites from animal photos."
          actionLabel="Create Project"
          onAction={onCreateNew}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.06 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {projects.map((project) => (
        <motion.div
          key={project._id}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </motion.div>
  );
}
